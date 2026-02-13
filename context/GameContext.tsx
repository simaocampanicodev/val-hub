
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, MatchState, MatchPhase, GameRole, GameMap, MatchRecord, ThemeMode, PlayerSnapshot, MatchScore, ChatMessage, Report, Quest, UserQuest, QuestType, FriendRequest } from '../types';
import { INITIAL_POINTS, MAPS, MATCH_FOUND_SOUND, QUEST_POOL } from '../constants';
import { generateBot, calculatePoints, calculateLevel, getLevelProgress } from '../services/gameService';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  primaryRole: GameRole;
  secondaryRole: GameRole;
  topAgents: string[];
}

interface GameContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (data: RegisterData) => void;
  currentUser: User;
  updateProfile: (updates: Partial<User>) => void;
  queue: User[];
  joinQueue: () => void;
  leaveQueue: () => void;
  testFillQueue: () => void;
  matchState: MatchState | null;
  acceptMatch: () => void;
  draftPlayer: (player: User) => void;
  vetoMap: (map: GameMap) => void;
  reportResult: (scoreA: number, scoreB: number) => { success: boolean, message?: string };
  sendChatMessage: (text: string) => void;
  matchHistory: MatchRecord[];
  allUsers: User[];
  reports: Report[]; 
  submitReport: (targetUserId: string, reason: string) => void;
  commendPlayer: (targetUserId: string) => void;
  resetMatch: () => void;
  forceTimePass: () => void;
  resetSeason: () => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  handleBotAction: () => void;
  viewProfileId: string | null;
  setViewProfileId: (id: string | null) => void;
  claimQuestReward: (questId: string) => void;
  resetDailyQuests: () => void;
  sendFriendRequest: (toId: string) => void;
  acceptFriendRequest: (fromId: string) => void;
  rejectFriendRequest: (fromId: string) => void;
  removeFriend: (friendId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialUser: User = {
  id: 'user-1',
  username: 'Guest',
  points: INITIAL_POINTS,
  xp: 0,
  level: 1,
  reputation: 10,
  wins: 0,
  losses: 0,
  winstreak: 0,
  primaryRole: GameRole.DUELIST,
  secondaryRole: GameRole.FLEX,
  topAgents: ['Jett', 'Reyna', 'Raze'],
  isBot: false,
  activeQuests: [],
  friends: [],
  friendRequests: []
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [queue, setQueue] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  const isAdmin = currentUser.username === 'txger.';

  useEffect(() => {
    if (isAuthenticated) {
        setAllUsers(prev => {
            if (!prev.find(u => u.id === currentUser.id)) return [...prev, currentUser];
            return prev.map(u => u.id === currentUser.id ? currentUser : u);
        });
    }
  }, [currentUser, isAuthenticated]);

  // Generate Quests on Load/Date Change
  useEffect(() => {
      if (isAuthenticated) {
          generateQuestsIfNeeded();
          
          // Check for unique profile quest
          if (currentUser.username && currentUser.topAgents.length === 3) {
              processQuestProgress('COMPLETE_PROFILE', 1, 1);
          }
      }
  }, [isAuthenticated, currentUser.id]);

  const generateQuestsIfNeeded = (forceReset: boolean = false) => {
      const today = new Date().setHours(0,0,0,0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let currentQuests = currentUser.activeQuests || [];
      let updates: Partial<User> = {};
      let hasUpdates = false;

      // --- 1. DAILY QUESTS RESET ---
      const hasDailyQuests = currentQuests.some(uq => {
          const qDef = QUEST_POOL.find(q => q.id === uq.questId);
          return qDef?.category === 'DAILY';
      });

      const needsDailyReset = forceReset || !hasDailyQuests || (currentUser.lastDailyQuestGeneration && currentUser.lastDailyQuestGeneration < today);

      if (needsDailyReset) {
          // Remove old dailies
          currentQuests = currentQuests.filter(uq => {
              const qDef = QUEST_POOL.find(q => q.id === uq.questId);
              return qDef?.category !== 'DAILY';
          });

          // Add new dailies (All Daily Type quests from Pool)
          const dailies = QUEST_POOL.filter(q => q.category === 'DAILY');
          const newDailies = dailies.map(q => ({
              questId: q.id,
              progress: 0,
              completed: false,
              claimed: false
          }));
          currentQuests = [...currentQuests, ...newDailies];
          
          updates.lastDailyQuestGeneration = Date.now();
          hasUpdates = true;
      }

      // --- 2. MONTHLY QUESTS RESET ---
      const hasMonthlyQuests = currentQuests.some(uq => {
          const qDef = QUEST_POOL.find(q => q.id === uq.questId);
          return qDef?.category === 'MONTHLY';
      });

      let lastMonthGenDate = currentUser.lastMonthlyQuestGeneration ? new Date(currentUser.lastMonthlyQuestGeneration) : null;
      const isDifferentMonth = !lastMonthGenDate || lastMonthGenDate.getMonth() !== currentMonth || lastMonthGenDate.getFullYear() !== currentYear;

      const needsMonthlyReset = forceReset || !hasMonthlyQuests || isDifferentMonth;

      if (needsMonthlyReset) {
           // Remove old monthlies
           currentQuests = currentQuests.filter(uq => {
              const qDef = QUEST_POOL.find(q => q.id === uq.questId);
              return qDef?.category !== 'MONTHLY';
          });

          // Add new monthlies
          const monthlies = QUEST_POOL.filter(q => q.category === 'MONTHLY');
          const newMonthlies = monthlies.map(q => ({
              questId: q.id,
              progress: 0,
              completed: false,
              claimed: false
          }));
          currentQuests = [...currentQuests, ...newMonthlies];

          updates.lastMonthlyQuestGeneration = Date.now();
          hasUpdates = true;
      }

      // --- 3. UNIQUE QUESTS (Add if missing) ---
      const uniques = QUEST_POOL.filter(q => q.category === 'UNIQUE');
      let addedUnique = false;
      uniques.forEach(q => {
          if (!currentQuests.find(uq => uq.questId === q.id)) {
              currentQuests.push({
                  questId: q.id,
                  progress: 0,
                  completed: false,
                  claimed: false
              });
              addedUnique = true;
          }
      });
      if(addedUnique) hasUpdates = true;

      if (hasUpdates) {
          setCurrentUser(prev => ({
              ...prev,
              activeQuests: currentQuests,
              ...updates
          }));
      }
  };

  const resetDailyQuests = () => {
      // Force reset both daily and monthly for testing/admin purposes
      generateQuestsIfNeeded(true);
  };

  const processQuestProgress = (type: QuestType, amount: number = 1, forceValue: number | null = null) => {
      setCurrentUser(prev => {
          const updatedQuests = prev.activeQuests.map(uq => {
              const questDef = QUEST_POOL.find(q => q.id === uq.questId);
              if (!questDef || questDef.type !== type || uq.completed) return uq;

              let newProgress = uq.progress;
              if (forceValue !== null) {
                   newProgress = forceValue;
              } else {
                   newProgress += amount;
              }

              // Cap progress at target
              if (newProgress > questDef.target) newProgress = questDef.target;

              const isCompleted = newProgress >= questDef.target;
              
              return {
                  ...uq,
                  progress: newProgress,
                  completed: isCompleted
              };
          });

          return { ...prev, activeQuests: updatedQuests };
      });
  };

  const claimQuestReward = (questId: string) => {
      setCurrentUser(prev => {
          const quest = prev.activeQuests.find(q => q.questId === questId);
          const questDef = QUEST_POOL.find(q => q.id === questId);
          
          if (!quest || !quest.completed || quest.claimed || !questDef) return prev;

          const newXp = (prev.xp || 0) + questDef.xpReward;
          const { level: newLevel } = getLevelProgress(newXp);

          // Return state immediately
          const newState = {
              ...prev,
              xp: newXp,
              level: newLevel,
              activeQuests: prev.activeQuests.map(q => q.questId === questId ? { ...q, claimed: true } : q)
          };

          if (newLevel > prev.level) {
               // Logic from processQuestProgress manually applied to newState for leveling up
               const levelUpdatedQuests = newState.activeQuests.map(uq => {
                  const qDef = QUEST_POOL.find(q => q.id === uq.questId);
                  if (!qDef || qDef.type !== 'REACH_LEVEL' || uq.completed) return uq;

                  let newProgress = newLevel;
                  if (newProgress > qDef.target) newProgress = qDef.target;
                  const isCompleted = newProgress >= qDef.target;

                  return { ...uq, progress: newProgress, completed: isCompleted };
               });
               newState.activeQuests = levelUpdatedQuests;
          }

          return newState;
      });
  };

  // --- FRIENDS LOGIC ---

  const sendFriendRequest = (toId: string) => {
      if (toId === currentUser.id) return;
      if (currentUser.friends.includes(toId)) return;
      
      const targetUser = allUsers.find(u => u.id === toId);
      if (!targetUser) return;
      
      // Check if already requested
      if (targetUser.friendRequests.some(r => r.fromId === currentUser.id)) return;

      const newRequest: FriendRequest = {
          fromId: currentUser.id,
          toId: toId,
          timestamp: Date.now()
      };

      setAllUsers(prev => prev.map(u => {
          if (u.id === toId) {
              return { ...u, friendRequests: [...u.friendRequests, newRequest] };
          }
          return u;
      }));

      // Update local state if needed (though allUsers sync handles it)
      alert(`Friend request sent to ${targetUser.username}`);
  };

  const acceptFriendRequest = (fromId: string) => {
      setAllUsers(prev => prev.map(u => {
          // Update Current User (Receiver)
          if (u.id === currentUser.id) {
              return {
                  ...u,
                  friends: [...u.friends, fromId],
                  friendRequests: u.friendRequests.filter(r => r.fromId !== fromId)
              };
          }
          // Update Sender
          if (u.id === fromId) {
              return {
                  ...u,
                  friends: [...u.friends, currentUser.id]
              };
          }
          return u;
      }));

      // Sync Current User immediately
      setCurrentUser(prev => ({
          ...prev,
          friends: [...prev.friends, fromId],
          friendRequests: prev.friendRequests.filter(r => r.fromId !== fromId)
      }));

      processQuestProgress('ADD_FRIEND', 1);
  };

  const rejectFriendRequest = (fromId: string) => {
      setAllUsers(prev => prev.map(u => {
          if (u.id === currentUser.id) {
              return {
                  ...u,
                  friendRequests: u.friendRequests.filter(r => r.fromId !== fromId)
              };
          }
          return u;
      }));
      
      setCurrentUser(prev => ({
          ...prev,
          friendRequests: prev.friendRequests.filter(r => r.fromId !== fromId)
      }));
  };

  const removeFriend = (friendId: string) => {
      if (!confirm("Remove friend?")) return;
      
      setAllUsers(prev => prev.map(u => {
           if (u.id === currentUser.id) {
               return { ...u, friends: u.friends.filter(f => f !== friendId) };
           }
           if (u.id === friendId) {
               return { ...u, friends: u.friends.filter(f => f !== currentUser.id) };
           }
           return u;
      }));

      setCurrentUser(prev => ({
          ...prev,
          friends: prev.friends.filter(f => f !== friendId)
      }));
  };


  // Ready Check Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (matchState?.phase === MatchPhase.READY_CHECK && matchState.readyExpiresAt) {
        interval = setInterval(() => {
            if (Date.now() > matchState.readyExpiresAt!) {
                // Time expired, find who didn't accept
                const readyIds = matchState.readyPlayers;
                const unreadyPlayers = matchState.players.filter(p => !readyIds.includes(p.id));
                const readyPlayersList = matchState.players.filter(p => readyIds.includes(p.id));

                setMatchState(null);
                setQueue(readyPlayersList);
                console.log("Match cancelled. Unready players:", unreadyPlayers.map(u => u.username));
            } else {
                // Bot Auto-Accept logic (After 1 second tick)
                const unreadyBots = matchState.players.filter(p => p.isBot && !matchState.readyPlayers.includes(p.id));
                if (unreadyBots.length > 0) {
                     // Bots accept immediately
                     const botIds = unreadyBots.map(b => b.id);
                     setMatchState(prev => prev ? ({ ...prev, readyPlayers: [...prev.readyPlayers, ...botIds] }) : null);
                }
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchState]);

  // Transition from Ready Check to Draft
  useEffect(() => {
      if (matchState?.phase === MatchPhase.READY_CHECK && matchState.readyPlayers.length === 10) {
          initializeDraft(matchState.players);
      }
  }, [matchState?.readyPlayers.length, matchState?.phase]);


  const login = (email: string, password: string) => {
    let user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
        alert("User not found.");
        return;
    }
    if (user.password !== password) {
        alert("Invalid password.");
        return;
    }
    
    // Ensure level is calculated from XP upon login
    const { level } = getLevelProgress(user.xp || 0);
    
    setCurrentUser({
        ...user,
        activeQuests: user.activeQuests || [],
        friends: user.friends || [],
        friendRequests: user.friendRequests || [],
        xp: user.xp || 0,
        level: level
    });
    setIsAuthenticated(true);
  };

  const register = (data: RegisterData) => {
    if (allUsers.find(u => u.email?.toLowerCase() === data.email.toLowerCase())) {
        alert("Email already registered.");
        return;
    }
    if (allUsers.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        alert("Username taken. Please choose another.");
        return;
    }
    const newUser: User = {
        ...initialUser,
        id: `user-${Date.now()}`,
        email: data.email,
        password: data.password,
        username: data.username,
        primaryRole: data.primaryRole,
        secondaryRole: data.secondaryRole,
        topAgents: data.topAgents
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setQueue(prev => prev.filter(u => u.id !== currentUser.id));
    setMatchState(null);
    setViewProfileId(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const resetSeason = () => {
      // 1. Update All Users
      const resetUsers = allUsers.map(u => ({ 
          ...u, 
          points: 1000,
          wins: 0,
          losses: 0,
          winstreak: 0
      }));
      setAllUsers(resetUsers);
      
      // 2. Find and update the current user from that reset list to ensure sync
      const updatedCurrentUser = resetUsers.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser);
      } else {
          // Fallback if not found (shouldn't happen)
          setCurrentUser(prev => ({ 
            ...prev, 
            points: 1000,
            wins: 0,
            losses: 0,
            winstreak: 0
          }));
      }

      alert("Season Reset! Stats cleared and MMR set to 1000.");
  };

  const joinQueue = () => {
    if (!queue.find(u => u.id === currentUser.id)) {
      const newQueue = [...queue, currentUser];
      setQueue(newQueue);
      checkQueueFull(newQueue);
    }
  };

  const leaveQueue = () => {
    setQueue(prev => prev.filter(u => u.id !== currentUser.id));
  };

  const testFillQueue = () => {
    const botsNeeded = 10 - queue.length;
    const newBots: User[] = [];
    for (let i = 0; i < botsNeeded; i++) {
      const bot = generateBot(`test-${Date.now()}-${i}`);
      newBots.push(bot);
    }
    setAllUsers(prev => [...prev, ...newBots]);
    const finalQueue = [...queue, ...newBots];
    setQueue(finalQueue);
    
    if (finalQueue.length >= 10) {
        triggerReadyCheck(finalQueue.slice(0, 10));
    }
  };

  const checkQueueFull = (currentQueue: User[]) => {
    if (currentQueue.length >= 10) {
      triggerReadyCheck(currentQueue.slice(0, 10));
    }
  };

  const playMatchFoundSound = () => {
      const audio = new Audio(MATCH_FOUND_SOUND);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio autoplay blocked", e));
  };

  const triggerReadyCheck = (players: User[]) => {
      playMatchFoundSound();
      setQueue([]); 
      
      setMatchState({
          id: `match-${Date.now()}`,
          phase: MatchPhase.READY_CHECK,
          players: players,
          captainA: null,
          captainB: null,
          teamA: [],
          teamB: [],
          turn: 'A',
          remainingPool: [],
          remainingMaps: [],
          selectedMap: null,
          startTime: null,
          resultReported: false,
          winner: null,
          reportA: null,
          reportB: null,
          readyPlayers: [],
          readyExpiresAt: Date.now() + 60000, 
          chat: []
      });
  };

  const acceptMatch = () => {
      if (!matchState || matchState.phase !== MatchPhase.READY_CHECK) return;
      if (matchState.readyPlayers.includes(currentUser.id)) return;
      
      setMatchState(prev => prev ? ({
          ...prev,
          readyPlayers: [...prev.readyPlayers, currentUser.id]
      }) : null);
  };

  const initializeDraft = (players: User[]) => {
    let sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const captainA = sortedPlayers[0];
    const captainB = sortedPlayers[1];
    const pool = sortedPlayers.slice(2);

    setMatchState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            phase: MatchPhase.DRAFT,
            captainA: captainA,
            captainB: captainB,
            teamA: [captainA],
            teamB: [captainB],
            turn: 'B', 
            remainingPool: pool,
            remainingMaps: [...MAPS],
            readyPlayers: [], 
            chat: [{
                id: 'sys-start', 
                senderId: 'system', 
                senderName: 'System', 
                text: 'Draft started. Captains, pick your teams.', 
                timestamp: Date.now(), 
                isSystem: true
            }]
        };
    });
  };

  const sendChatMessage = (text: string) => {
      if (!matchState || !text.trim()) return;
      const msg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.username,
          text: text.trim(),
          timestamp: Date.now()
      };
      setMatchState(prev => prev ? ({ ...prev, chat: [...prev.chat, msg] }) : null);
  };

  const handleBotAction = () => {
    if (!matchState) return;
    const currentCaptain = matchState.turn === 'A' ? matchState.captainA : matchState.captainB;
    if (!currentCaptain || currentCaptain.id === currentUser.id) return; 

    if (matchState.phase === MatchPhase.DRAFT) {
        const randomPlayer = matchState.remainingPool[Math.floor(Math.random() * matchState.remainingPool.length)];
        if (randomPlayer) draftPlayer(randomPlayer);
    } else if (matchState.phase === MatchPhase.VETO) {
        const randomMap = matchState.remainingMaps[Math.floor(Math.random() * matchState.remainingMaps.length)];
        if (randomMap) vetoMap(randomMap);
    }
  };

  const draftPlayer = (player: User) => {
    if (!matchState) return;
    const isTeamA = matchState.turn === 'A';
    
    const sysMsg: ChatMessage = {
        id: `sys-draft-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `${player.username} drafted to Team ${isTeamA ? matchState.captainA?.username : matchState.captainB?.username}`,
        timestamp: Date.now(),
        isSystem: true
    };

    setMatchState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        teamA: isTeamA ? [...prev.teamA, player] : prev.teamA,
        teamB: !isTeamA ? [...prev.teamB, player] : prev.teamB,
        remainingPool: prev.remainingPool.filter(p => p.id !== player.id),
        turn: isTeamA ? 'B' : 'A',
        phase: prev.remainingPool.length === 1 ? MatchPhase.VETO : MatchPhase.DRAFT,
        chat: [...prev.chat, sysMsg]
      };
    });
  };

  useEffect(() => {
    if (matchState?.phase === MatchPhase.DRAFT && matchState.remainingPool.length === 0) {
       setMatchState(prev => prev ? ({ ...prev, phase: MatchPhase.VETO, turn: 'A' }) : null);
    }
  }, [matchState?.remainingPool.length]);

  const vetoMap = (map: GameMap) => {
    if (!matchState) return;
    
    const sysMsg: ChatMessage = {
        id: `sys-veto-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `Map ${map} banned.`,
        timestamp: Date.now(),
        isSystem: true
    };

    setMatchState(prev => {
      if (!prev) return null;
      const newMaps = prev.remainingMaps.filter(m => m !== map);
      
      if (newMaps.length === 1) {
        
        return {
          ...prev,
          remainingMaps: newMaps,
          selectedMap: newMaps[0],
          phase: MatchPhase.LIVE,
          startTime: Date.now(),
          chat: [...prev.chat, sysMsg, {
              id: `sys-live-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              text: `Match Live on ${newMaps[0]}! Good luck.`,
              timestamp: Date.now(),
              isSystem: true
          }]
        };
      }
      return {
        ...prev,
        remainingMaps: newMaps,
        turn: prev.turn === 'A' ? 'B' : 'A',
        chat: [...prev.chat, sysMsg]
      };
    });
  };

  const forceTimePass = () => {
    if (matchState?.phase === MatchPhase.LIVE && matchState.startTime) {
      setMatchState({ ...matchState, startTime: Date.now() - (21 * 60 * 1000) });
    }
  };

  const reportResult = (scoreA: number, scoreB: number) => {
    if (!matchState) return { success: false };
    const isTeamA = matchState.teamA.some(u => u.id === currentUser.id);
    const isTeamB = matchState.teamB.some(u => u.id === currentUser.id);
    const forcedReport = isAdmin && !isTeamA && !isTeamB;

    let newReportA = matchState.reportA;
    let newReportB = matchState.reportB;
    const reportData = { scoreA, scoreB };

    if (isTeamA) newReportA = reportData;
    if (isTeamB) newReportB = reportData;
    if (isTeamA) newReportB = reportData; 
    if (isTeamB) newReportA = reportData;
    if (forcedReport) { newReportA = reportData; newReportB = reportData; }

    setMatchState(prev => prev ? ({ ...prev, reportA: newReportA, reportB: newReportB }) : null);

    if (newReportA && newReportB) {
        if (newReportA.scoreA === newReportB.scoreA && newReportA.scoreB === newReportB.scoreB) {
            finalizeMatch(newReportA);
            return { success: true };
        } else {
             return { success: false, message: "Scores do not match opponent's report!" };
        }
    }
    return { success: true, message: "Report submitted. Waiting for confirmation." };
  };

  const finalizeMatch = (finalScore: MatchScore) => {
    const winner = finalScore.scoreA > finalScore.scoreB ? 'A' : 'B';
    const scoreString = `${finalScore.scoreA}-${finalScore.scoreB}`;

    setMatchState(prev => prev ? ({ ...prev, phase: MatchPhase.FINISHED, winner: winner, resultReported: true }) : null);

    const winningTeam = winner === 'A' ? matchState?.teamA : matchState?.teamB;
    const losingTeam = winner === 'A' ? matchState?.teamB : matchState?.teamA;
    if (!winningTeam || !losingTeam || !matchState) return;

    const mapUserToSnapshot = (u: User): PlayerSnapshot => ({
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        role: u.primaryRole
    });

    const record: MatchRecord = {
        id: matchState.id,
        date: Date.now(),
        map: matchState.selectedMap!,
        captainA: matchState.captainA!.username,
        captainB: matchState.captainB!.username,
        winner: winner,
        teamAIds: matchState.teamA.map(u => u.id),
        teamBIds: matchState.teamB.map(u => u.id),
        teamASnapshot: matchState.teamA.map(mapUserToSnapshot),
        teamBSnapshot: matchState.teamB.map(mapUserToSnapshot),
        score: scoreString
    };
    setMatchHistory(prev => [record, ...prev]);

    const updatedUsers = [...allUsers];
    winningTeam.forEach(winnerUser => {
      const userIndex = updatedUsers.findIndex(u => u.id === winnerUser.id);
      if (userIndex > -1) {
        const u = updatedUsers[userIndex];
        const newPoints = calculatePoints(u.points, true, u.winstreak + 1);
        updatedUsers[userIndex] = { ...u, points: newPoints, wins: u.wins + 1, winstreak: u.winstreak + 1 };
        
        // --- QUEST LOGIC FOR WINNERS ---
        if (u.id === currentUser.id) {
            processQuestProgress('PLAY_MATCHES', 1);
            processQuestProgress('WIN_MATCHES', 1);
            processQuestProgress('GET_WINSTREAK', 0, u.winstreak + 1); // Check total streak
        }
      }
    });
    losingTeam.forEach(loserUser => {
      const userIndex = updatedUsers.findIndex(u => u.id === loserUser.id);
      if (userIndex > -1) {
        const u = updatedUsers[userIndex];
        const newPoints = calculatePoints(u.points, false, 0);
        updatedUsers[userIndex] = { ...u, points: newPoints, losses: u.losses + 1, winstreak: 0 };

        // --- QUEST LOGIC FOR LOSERS ---
        if (u.id === currentUser.id) {
            processQuestProgress('PLAY_MATCHES', 1);
        }
      }
    });

    setAllUsers(updatedUsers);
    
    // Sync current user if stats changed
    const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedCurrentUser) setCurrentUser(prev => ({ 
        ...prev, 
        points: updatedCurrentUser.points, 
        wins: updatedCurrentUser.wins,
        losses: updatedCurrentUser.losses,
        winstreak: updatedCurrentUser.winstreak 
        // ActiveQuests are handled via processQuestProgress state updates above, but strictly we should merge here if not async issues.
        // For simplicity, processQuestProgress updates state directly.
    }));
  };

  const submitReport = (targetUserId: string, reason: string) => {
      const newReport: Report = {
          id: `rep-${Date.now()}`,
          reporter: currentUser.username,
          reportedUser: allUsers.find(u => u.id === targetUserId)?.username || 'Unknown',
          reason,
          timestamp: Date.now()
      };
      setReports(prev => [...prev, newReport]);
  };

  const commendPlayer = (targetUserId: string) => {
      setAllUsers(prev => prev.map(u => {
          if (u.id === targetUserId) {
              return { ...u, reputation: (u.reputation || 0) + 1 };
          }
          return u;
      }));
      // Quest Logic: Give Commend
      processQuestProgress('GIVE_COMMENDS', 1);
  };

  const resetMatch = () => {
    setMatchState(null);
  };

  return (
    <GameContext.Provider value={{
      isAuthenticated, isAdmin, login, logout, register,
      currentUser, updateProfile, queue, joinQueue, leaveQueue, testFillQueue,
      matchState, acceptMatch, draftPlayer, vetoMap, reportResult, sendChatMessage,
      matchHistory, allUsers, reports, submitReport, commendPlayer, resetMatch, forceTimePass, resetSeason,
      themeMode, toggleTheme, handleBotAction,
      viewProfileId, setViewProfileId, claimQuestReward, resetDailyQuests,
      sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
