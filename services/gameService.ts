
import { User, GameRole } from '../types';
import { RANK_THRESHOLDS, AGENTS } from '../constants';

/**
 * Returns rank info by points. If leaderboardPosition is 1, 2, or 3 and points >= 2001, returns "Top 3" (Level 10).
 */
export const getRankInfo = (points: number, leaderboardPosition?: number) => {
  const isTop3 = leaderboardPosition != null && leaderboardPosition >= 1 && leaderboardPosition <= 3;
  if (isTop3 && points >= 2001) {
    const top3Rank = RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
    return {
      ...top3Rank,
      name: 'Top 3',
      min: top3Rank.min,
      max: top3Rank.max || Infinity
    };
  }
  let rank = RANK_THRESHOLDS[0];
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= RANK_THRESHOLDS[i].min) {
      rank = RANK_THRESHOLDS[i];
      break;
    }
  }
  // Level 10 "Top 3" is positional only; by points we show Radiant for 2001+
  if (rank.level === 10 && !isTop3) {
    rank = RANK_THRESHOLDS[RANK_THRESHOLDS.length - 2]; // Radiant (level 9)
  }
  return {
    ...rank,
    min: rank.min,
    max: rank.max || Infinity
  };
};

/**
 * Calculates Level, Current XP in level, and Max XP for next level based on Total XP.
 * Progression:
 * Lvl 1 -> 2: 300 XP
 * Lvl 2 -> 3: 400 XP
 * Lvl 3 -> 4: 500 XP
 * (Increases by 100 XP each level)
 */
export const getLevelProgress = (totalXP: number) => {
    let level = 1;
    let xpAccumulator = 0;
    let xpForNextLevel = 300; // Starting requirement (Level 1 to 2)

    while (true) {
        // If we don't have enough XP to finish this level, we are currently AT this level
        if (totalXP < xpAccumulator + xpForNextLevel) {
            return {
                level,
                currentLevelXP: totalXP - xpAccumulator,
                xpForNextLevel
            };
        }

        // Advance to next level simulation
        xpAccumulator += xpForNextLevel;
        level++;
        xpForNextLevel += 100; // Increase difficulty per level
    }
};

export const calculateLevel = (xp: number) => {
    return getLevelProgress(xp).level;
};

export const generateBot = (id: string, basePoints: number = 1000): User => {
  const names = ['TenZ', 'Demon1', 'Aspas', 'Boaster', 'FNS', 'ScreaM', 'Tarik', 'Kyedae', 'Shroud', 'Mixwell', 'cNed', 'Derke'];
  const randomName = names[Math.floor(Math.random() * names.length)] + `#BOT${Math.floor(Math.random() * 99)}`;
  const randomRole = [GameRole.DUELIST, GameRole.INITIATOR, GameRole.CONTROLLER, GameRole.SENTINEL][Math.floor(Math.random() * 4)];
  
  // Pick 3 random agents
  const shuffledAgents = [...AGENTS].sort(() => 0.5 - Math.random());

  return {
    id: `bot-${id}`,
    username: randomName,
    points: basePoints + Math.floor(Math.random() * 400) - 200,
    xp: 0,
    level: 1,
    reputation: Math.floor(Math.random() * 50),
    wins: Math.floor(Math.random() * 20),
    losses: Math.floor(Math.random() * 20),
    winstreak: Math.floor(Math.random() * 3),
    primaryRole: randomRole,
    secondaryRole: GameRole.FLEX,
    topAgents: shuffledAgents.slice(0, 3),
    isBot: true,
    activeQuests: [],
    friends: [],
    friendRequests: []
  };
};

/** ELO-style expected score (0–1) vs opponent average. */
function expectedScore(myPoints: number, opponentAvgPoints: number): number {
  const diff = (opponentAvgPoints - myPoints) / 400;
  return 1 / (1 + Math.pow(10, diff));
}

/**
 * Faceit-inspired MMR change: integers only, no decimals.
 * - Underdog (lower MMR) gains more on win, loses less on loss.
 * - Winstreak gives extra points on win (capped).
 * - K = 40 so an even game gives ~+20 / -20; underdog gains more, favourite less.
 * @param currentPoints Current MMR (integer).
 * @param isWin Whether the player won.
 * @param streak Current winstreak (before this game); used only for wins.
 * @param opponentTeamAvgPoints Average MMR of the opposing team (for underdog bonus). If omitted, uses flat base.
 */
export const calculatePoints = (
  currentPoints: number,
  isWin: boolean,
  streak: number,
  opponentTeamAvgPoints?: number
): number => {
  const K = 40; // even game → ~+20 win / -20 loss
  const myPoints = Math.round(currentPoints);
  const result = isWin ? 1 : 0;

  let pointsChange: number;
  if (opponentTeamAvgPoints != null && Number.isFinite(opponentTeamAvgPoints)) {
    const oppAvg = Math.round(opponentTeamAvgPoints);
    const expected = expectedScore(myPoints, oppAvg);
    pointsChange = Math.round(K * (result - expected));
  } else {
    const baseChange = 20;
    pointsChange = isWin ? baseChange : -baseChange;
  }

  const streakBonus = isWin ? Math.min(Math.max(0, Math.floor(streak)), 10) : 0;
  const totalChange = pointsChange + streakBonus;
  const newPoints = Math.max(0, myPoints + totalChange);
  return Math.round(newPoints);
};
