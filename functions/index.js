const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: applyMatchResults
 * Trigger: onUpdate active_matches/{matchId}
 * Conditions: after.resultReported == true && after.resultProcessed != true
 * Action: apply playerPointsChanges to corresponding users (idempotent), then set resultProcessed = true
 */
exports.applyMatchResults = functions.firestore
  .document('active_matches/{matchId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    const matchId = context.params.matchId;

    // Only act when resultReported toggles to true and resultProcessed not yet done
    if (!after.resultReported) return null;
    if (after.resultProcessed) {
      console.log(`match ${matchId} already processed`);
      return null;
    }

    const changes = Array.isArray(after.playerPointsChanges) ? after.playerPointsChanges : [];
    if (changes.length === 0) {
      console.log(`match ${matchId} has no playerPointsChanges — marking processed`);
      await change.after.ref.update({ resultProcessed: true });
      return null;
    }

    console.log(`Processing match ${matchId} — applying ${changes.length} player point changes`);

    // Apply each player's change in its own transaction (idempotent)
    const tasks = changes.map((c) => {
      return db.runTransaction(async (tx) => {
        const userRef = db.doc(`users/${c.playerId}`);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          console.warn(`User ${c.playerId} not found — skipping`);
          return;
        }
        const user = userSnap.data() || {};

        // Detect if this change was already applied using lastPointsChange + points value
        const alreadyApplied = (user.lastPointsChange === c.pointsChange) && (user.points === c.newTotal);
        if (alreadyApplied) {
          console.log(`User ${c.playerId} already updated — skipping`);
          return;
        }

        const newPoints = (typeof c.newTotal === 'number') ? c.newTotal : ((user.points || 0) + (c.pointsChange || 0));
        const lastPointsChange = (typeof c.pointsChange === 'number') ? c.pointsChange : 0;
        const wins = (user.wins || 0) + (c.isWinner ? 1 : 0);
        const losses = (user.losses || 0) + (c.isWinner ? 0 : 1);
        const winstreak = c.isWinner ? ((user.winstreak || 0) + 1) : 0;

        console.log(`Updating user ${c.playerId}: points ${user.points} -> ${newPoints}, lastChange ${lastPointsChange}`);

        tx.update(userRef, {
          points: newPoints,
          lastPointsChange: lastPointsChange,
          wins: wins,
          losses: losses,
          winstreak: winstreak
        });
      });
    });

    try {
      await Promise.all(tasks);
      // Mark match as processed
      await change.after.ref.update({ resultProcessed: true, processedAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`Match ${matchId} processed successfully`);
    } catch (err) {
      console.error('Error processing match results:', err);
      // Don't mark processed — will retry on next update/trigger
      throw err;
    }

    return null;
  });