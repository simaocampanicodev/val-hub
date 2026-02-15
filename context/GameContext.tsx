import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, MatchState, MatchPhase, GameRole, GameMap, MatchRecord, ThemeMode, PlayerSnapshot, MatchScore, ChatMessage, Report, Quest, UserQuest, QuestType, FriendRequest } from '../types';
import { INITIAL_POINTS, MAPS, MATCH_FOUND_SOUND, QUEST_POOL } from '../constants';
import { generateBot, calculatePoints, calculateLevel, getLevelProgress } from '../services/gameService';
import { auth, logoutUser } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// ⭐ NOVO: Imports do Firestore para persistência
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firestore';
import { 
  registerUser as registerUserInDb, 
  updateUserProfile as updateUserInDb
} from '../services/authService';

interface RegisterData {
  email: string;
  username: string;
  primaryRole: GameRole;
  secondaryRole: GameRole;
  topAgents: string[];
}

interface GameContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  completeRegistration: (data: RegisterData) => Promise<void>;
  logout: () => void;
  currentUser: User;
  pendingAuthUser: FirebaseUser | null;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  linkRiotAccount: (riotId: string, riotTag: string) => void;
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

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [pendingAuthUser, setPendingAuthUser] = useState<FirebaseUser | null>(null);
  
  const [queue, setQueue] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  // Admin Logic
  const isAdmin = currentUser.username === 'txger.';

  const allUsersRef = useRef<User[]>([]);
  
  // Sync ref with state
  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  // ⭐ NOVO: Realtime Listener para carregar todos os usuários do Firestore
  useEffect(() => {
    console.log('🔥 Iniciando listener de usuários do Firestore...');
    
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, orderBy('points', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`🔥 Firestore atualizado! Total de usuários: ${snapshot.size}`);
      
      const users: User[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          id: docSnap.id,
          username: data.username,
          email: data.email,
          points: data.points || INITIAL_POINTS,
          xp: data.xp || 0,
          level: data.level || 1,
          reputation: data.reputation || 10,
          wins: data.wins || 0,
          losses: data.losses || 0,
          winstreak: data.winstreak || 0,
          primaryRole: data.primary_role as GameRole,
          secondaryRole: data.secondary_role as GameRole,
          topAgents: data.top_agents || [],
          isBot: false,
          activeQuests: data.active_quests || [],
          friends: data.friends || [],
          friendRequests: data.friend_requests || [],
          avatarUrl: data.avatarUrl,
          riotId: data.riotId,
          riotTag: data.riotTag,
          lastDailyQuestGeneration: data.lastDailyQuestGeneration,
          lastMonthlyQuestGeneration: data.lastMonthlyQuestGeneration,
          lastPointsChange: data.lastPointsChange
        });
      });
      
      setAllUsers(users);
      console.log('✅ Usuários carregados do Firestore:', users.map(u => u.username));
    }, (error) => {
      console.error('❌ Erro ao carregar usuários do Firestore:', error);
    });

    return () => {
      console.log('🚪 Desconectando listener de usuários');
      unsubscribe();
    };
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('🔑 Firebase user detectado:', firebaseUser.email);
        
        // Pequeno delay para garantir que allUsers foi carregado
        const checkUser = () => {
          const existingUser = allUsersRef.current.find(u => u.email === firebaseUser.email);
          
          if (existingUser) {
            console.log('✅ Usuário encontrado no Firestore:', existingUser.username);
            const { level } = getLevelProgress(existingUser.xp || 0);
            setCurrentUser({
              ...existingUser,
              activeQuests: existingUser.activeQuests || [],
              friends: existingUser.friends || [],
              friendRequests: existingUser.friendRequests || [],
              xp: existingUser.xp || 0,
              level: level
            });
            setIsAuthenticated(true);
            setPendingAuthUser(null);
          } else {
            console.log('⚠️  Usuário não encontrado no Firestore, aguardando registro...');
            setPendingAuthUser(firebaseUser);
            setIsAuthenticated(false);
          }
        };

        // Tentar imediatamente ou esperar se allUsers ainda está vazio
        if (allUsersRef.current.length > 0) {
          checkUser();
        } else {
          console.log('⏳ Aguardando carregamento de usuários...');
          setTimeout(checkUser, 1000);
        }
      } else {
        console.log('🚪 Usuário não autenticado');
        setIsAuthenticated(false);
        setPendingAuthUser(null);
        setCurrentUser(initialUser);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Generate Quests on Load/Date Change
  useEffect(() => {
    if (isAuthenticated && !currentUser.isBot && !currentUser.id.startsWith('guest-') && currentUser.username !== 'Guest') {
      generateQuestsIfNeeded();
      if (currentUser.username && currentUser.topAgents.length === 3 && currentUser.riotId) {
        processQuestProgress('COMPLETE_PROFILE', 1, 1);
      }
    }
  }, [isAuthenticated, currentUser.id, currentUser.riotId]);

  // Watch Ready Players & Auto Start Draft
  useEffect(() => {
    if (matchState?.phase === MatchPhase.READY_CHECK) {
      const totalNeeded = matchState.players.length;
      const currentReady = matchState.readyPlayers.length;
      
      if (currentReady >= totalNeeded) {
        const timer = setTimeout(() => {
          initializeDraft(matchState.players);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [matchState?.readyPlayers.length, matchState?.phase]);

  const generateQuestsIfNeeded = (forceReset: boolean = false) => {
    const today = new Date().setHours(0,0,0,0);
    let currentQuests = currentUser.activeQuests || [];
    let updates: Partial<User> = {};
    let hasUpdates = false;

    // Daily Reset
    const hasDailyQuests = currentQuests.some(uq => QUEST_POOL.find(q => q.id === uq.questId)?.category === 'DAILY');
    const needsDailyReset = forceReset || !hasDailyQuests || (currentUser.lastDailyQuestGeneration && currentUser.lastDailyQuestGeneration < today);

    if (needsDailyReset) {
      currentQuests = currentQuests.filter(uq => QUEST_POOL.find(q => q.id === uq.questId)?.category !== 'DAILY');
      const newDailies = QUEST_POOL.filter(q => q.category === 'DAILY').map(q => ({
        questId: q.id, progress: 0, completed: false, claimed: false
      }));
      currentQuests = [...currentQuests, ...newDailies];
      updates.lastDailyQuestGeneration = Date.now();
      hasUpdates = true;
    }

    // Monthly Reset
    const hasMonthlyQuests = currentQuests.some(uq => QUEST_POOL.find(q => q.id === uq.questId)?.category === 'MONTHLY');
    if (forceReset || !hasMonthlyQuests) {
      currentQuests = currentQuests.filter(uq => QUEST_POOL.find(q => q.id === uq.questId)?.category !== 'MONTHLY');
      const newMonthlies = QUEST_POOL.filter(q => q.category === 'MONTHLY').map(q => ({
        questId: q.id, progress: 0, completed: false, claimed: false
      }));
      currentQuests = [...currentQuests, ...newMonthlies];
      updates.lastMonthlyQuestGeneration = Date.now();
      hasUpdates = true;
    }

    // Unique Quests
    const uniques = QUEST_POOL.filter(q => q.category === 'UNIQUE');
    uniques.forEach(q => {
      if (!currentQuests.find(uq => uq.questId === q.id)) {
        currentQuests.push({ questId: q.id, progress: 0, completed: false, claimed: false });
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      const newUserState = { ...currentUser, activeQuests: currentQuests, ...updates };
      setCurrentUser(newUserState);
      // ⭐ NOVO: Salvar no Firestore
      updateProfile({ activeQuests: currentQuests, ...updates });
    }
  };

  const resetDailyQuests = () => generateQuestsIfNeeded(true);

  const processQuestProgress = (type: QuestType, amount: number = 1, forceValue: number | null = null) => {
    setCurrentUser(prev => {
      if (!prev.activeQuests) return prev;
      const updatedQuests = prev.activeQuests.map(uq => {
        const questDef = QUEST_POOL.find(q => q.id === uq.questId);
        if (!questDef || questDef.type !== type || uq.completed) return uq;
        let newProgress = forceValue !== null ? forceValue : uq.progress + amount;
        if (newProgress > questDef.target) newProgress = questDef.target;
        return { ...uq, progress: newProgress, completed: newProgress >= questDef.target };
      });
      
      // ⭐ NOVO: Salvar no Firestore
      updateProfile({ activeQuests: updatedQuests });
      
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

      const newState = {
        ...prev,
        xp: newXp,
        level: newLevel,
        activeQuests: prev.activeQuests.map(q => q.questId === questId ? { ...q, claimed: true } : q)
      };
      
      if (newLevel > prev.level) {
        newState.activeQuests = newState.activeQuests.map(uq => {
          const qDef = QUEST_POOL.find(q => q.id === uq.questId);
          if (!qDef || qDef.type !== 'REACH_LEVEL' || uq.completed) return uq;
          const completed = newLevel >= qDef.target;
          return { ...uq, progress: Math.min(newLevel, qDef.target), completed };
        });
      }
      
      // ⭐ NOVO: Salvar no Firestore
      updateProfile({ 
        xp: newXp, 
        level: newLevel, 
        activeQuests: newState.activeQuests 
      });
      
      return newState;
    });
  };

  const sendFriendRequest = async (toId: string) => {
    if (toId === currentUser.id || currentUser.friends.includes(toId)) return;
    const targetUser = allUsers.find(u => u.id === toId);
    if (!targetUser || targetUser.friendRequests.some(r => r.fromId === currentUser.id)) return;
    
    const newRequest: FriendRequest = { fromId: currentUser.id, toId, timestamp: Date.now() };
    
    try {
      // ⭐ NOVO: Atualizar no Firestore
      const targetRef = doc(db, COLLECTIONS.USERS, toId);
      await updateDoc(targetRef, {
        friend_requests: [...targetUser.friendRequests, newRequest]
      });
      alert(`Friend request sent to ${targetUser.username}`);
      console.log('✅ Friend request enviado!');
    } catch (error) {
      console.error('❌ Erro ao enviar friend request:', error);
    }
  };

  const acceptFriendRequest = async (fromId: string) => {
    const newFriends = [...currentUser.friends, fromId];
    const newRequests = currentUser.friendRequests.filter(r => r.fromId !== fromId);
    
    const fromUser = allUsers.find(u => u.id === fromId);
    if (!fromUser) return;
    
    try {
      // ⭐ NOVO: Atualizar ambos usuários no Firestore
      const currentUserRef = doc(db, COLLECTIONS.USERS, currentUser.id);
      const fromUserRef = doc(db, COLLECTIONS.USERS, fromId);
      
      await updateDoc(currentUserRef, {
        friends: newFriends,
        friend_requests: newRequests
      });
      
      await updateDoc(fromUserRef, {
        friends: [...fromUser.friends, currentUser.id]
      });
      
      console.log('✅ Friend request aceito!');
      processQuestProgress('ADD_FRIEND', 1);
    } catch (error) {
      console.error('❌ Erro ao aceitar friend request:', error);
    }
  };

  const rejectFriendRequest = async (fromId: string) => {
    const newRequests = currentUser.friendRequests.filter(r => r.fromId !== fromId);
    
    try {
      const userRef = doc(db, COLLECTIONS.USERS, currentUser.id);
      await updateDoc(userRef, {
        friend_requests: newRequests
      });
      console.log('✅ Friend request rejeitado');
    } catch (error) {
      console.error('❌ Erro ao rejeitar friend request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm("Remove friend?")) return;
    
    const newFriends = currentUser.friends.filter(f => f !== friendId);
    const friend = allUsers.find(u => u.id === friendId);
    if (!friend) return;
    
    try {
      const currentUserRef = doc(db, COLLECTIONS.USERS, currentUser.id);
      const friendRef = doc(db, COLLECTIONS.USERS, friendId);
      
      await updateDoc(currentUserRef, {
        friends: newFriends
      });
      
      await updateDoc(friendRef, {
        friends: friend.friends.filter(f => f !== currentUser.id)
      });
      
      console.log('✅ Friend removido');
    } catch (error) {
      console.error('❌ Erro ao remover friend:', error);
    }
  };

  // ⭐ NOVO: Função de registro que salva no Firestore
  const completeRegistration = async (data: RegisterData) => {
    if (allUsers.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      alert("Username already taken!"); 
      return;
    }
    
    console.log('📝 Registrando novo usuário no Firestore...');
    
    const result = await registerUserInDb({
      email: data.email,
      password: 'firebase-auth-managed',
      username: data.username,
      primaryRole: data.primaryRole,
      secondaryRole: data.secondaryRole,
      topAgents: data.topAgents
    });
    
    if (result.success && result.user) {
      console.log('✅ Usuário registrado com sucesso no Firestore!', result.user.username);
      // O listener onSnapshot vai pegar automaticamente e atualizar allUsers
    } else {
      console.error('❌ Erro ao registrar usuário:', result.error);
      alert(result.error || 'Failed to create account');
    }
  };

  // ⭐ NOVO: Função de logout
  const logout = () => {
    console.log('🚪 Logout...');
    logoutUser();
    setIsAuthenticated(false);
    setQueue(prev => prev.filter(u => u.id !== currentUser.id));
    setMatchState(null);
    setViewProfileId(null);
    setCurrentUser(initialUser);
    setPendingAuthUser(null);
  };

  // ⭐ NOVO: Função de atualização que salva no Firestore
  const updateProfile = async (updates: Partial<User>) => {
    console.log('💾 Atualizando perfil no Firestore...', Object.keys(updates));
    
    try {
      const success = await updateUserInDb(currentUser.id, updates);
      
      if (success) {
        console.log('✅ Perfil atualizado no Firestore!');
        // Atualizar estado local também
        setCurrentUser(prev => ({ ...prev, ...updates }));
      } else {
        console.error('❌ Erro ao atualizar perfil no Firestore');
      }
    } catch (error) {
      console.error('❌ Exceção ao atualizar perfil:', error);
    }
  };

  const linkRiotAccount = (riotId: string, riotTag: string) => {
    updateProfile({ riotId, riotTag });
    processQuestProgress('COMPLETE_PROFILE', 1, 1);
    alert("Riot Account linked successfully!");
  };

  const toggleTheme = () => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  
  const resetSeason = async () => {
    if (!isAdmin) return;
    console.log('🔄 Resetting season...');
    
    // ⭐ NOVO: Resetar todos os usuários no Firestore
    const updates = allUsers.map(u => ({
      id: u.id,
      points: 1000,
      wins: 0,
      losses: 0,
      winstreak: 0
    }));
    
    for (const update of updates) {
      const userRef = doc(db, COLLECTIONS.USERS, update.id);
      await updateDoc(userRef, {
        points: update.points,
        wins: update.wins,
        losses: update.losses,
        winstreak: update.winstreak
      });
    }
    
    alert("Season Reset!");
  };

  // [CONTINUA NA PARTE 2...]
  // [CONTINUAÇÃO DA PARTE 1...]

  const joinQueue = () => {
    if (!currentUser.riotId || !currentUser.riotTag) { 
      alert("Please link your Riot Account first!"); 
      return; 
    }
    if (!queue.find(u => u.id === currentUser.id)) {
      const newQueue = [...queue, currentUser];
      setQueue(newQueue);
      console.log(`🎮 ${currentUser.username} entrou na queue (${newQueue.length}/10)`);
      if (newQueue.length >= 10) {
        console.log('⚡ 10 jogadores! Iniciando ready check...');
        triggerReadyCheck(newQueue.slice(0, 10));
      }
    }
  };

  const leaveQueue = () => {
    setQueue(prev => prev.filter(u => u.id !== currentUser.id));
    console.log(`🚪 ${currentUser.username} saiu da queue`);
  };
  
  const testFillQueue = () => {
    const botsNeeded = 10 - queue.length;
    const newBots: User[] = [];
    for (let i = 0; i < botsNeeded; i++) {
      const bot = generateBot(`test-${Date.now()}-${i}`);
      bot.riotId = bot.username.split('#')[0]; 
      bot.riotTag = 'BOT';
      newBots.push(bot);
    }
    setAllUsers(prev => [...prev, ...newBots]);
    const finalQueue = [...queue, ...newBots];
    setQueue(finalQueue);
    console.log(`🤖 ${botsNeeded} bots adicionados à queue`);
    if (finalQueue.length >= 10) triggerReadyCheck(finalQueue.slice(0, 10));
  };

  const triggerReadyCheck = (players: User[]) => {
    new Audio(MATCH_FOUND_SOUND).play().catch(() => {});
    setQueue([]); 

    const botIds = players.filter(p => p.isBot).map(p => p.id);

    setMatchState({
      id: `match-${Date.now()}`, 
      phase: MatchPhase.READY_CHECK, 
      players, 
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
      readyPlayers: botIds,
      readyExpiresAt: Date.now() + 60000, 
      chat: []
    });
    
    console.log('🔔 Ready check iniciado! Jogadores:', players.map(p => p.username));
  };

  const acceptMatch = () => {
    if (!matchState || matchState.phase !== MatchPhase.READY_CHECK || matchState.readyPlayers.includes(currentUser.id)) return;
    setMatchState(prev => prev ? ({ ...prev, readyPlayers: [...prev.readyPlayers, currentUser.id] }) : null);
    console.log(`✅ ${currentUser.username} aceitou a match (${matchState.readyPlayers.length + 1}/${matchState.players.length})`);
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
        captainA, 
        captainB, 
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
          text: 'Draft started. Captains will pick teams.', 
          timestamp: Date.now(), 
          isSystem: true 
        }] 
      };
    });
    
    console.log('🎯 Draft iniciado! Capitães:', captainA.username, 'vs', captainB.username);
  };

  const sendChatMessage = (text: string) => {
    if (!matchState || !text.trim()) return;
    const message: ChatMessage = { 
      id: `msg-${Date.now()}`, 
      senderId: currentUser.id, 
      senderName: currentUser.username, 
      text: text.trim(), 
      timestamp: Date.now() 
    };
    setMatchState(prev => prev ? ({ ...prev, chat: [...prev.chat, message] }) : null);
  };

  // BOT ACTIONS
  const handleBotAction = useCallback(() => {
    if (!matchState) return;

    const isTeamA = matchState.turn === 'A';
    const currentCaptain = isTeamA ? matchState.captainA : matchState.captainB;
    
    if (!currentCaptain || !currentCaptain.isBot) return;

    if (matchState.phase === MatchPhase.DRAFT) {
      const pickable = matchState.remainingPool;
      if (pickable.length > 0) {
        const randomPlayer = pickable[Math.floor(Math.random() * pickable.length)];
        draftPlayer(randomPlayer);
      }
    } else if (matchState.phase === MatchPhase.VETO) {
      const bannable = matchState.remainingMaps;
      if (bannable.length > 0) {
        const randomMap = bannable[Math.floor(Math.random() * bannable.length)];
        vetoMap(randomMap);
      }
    }
  }, [matchState]);

  const draftPlayer = (player: User) => {
    if (!matchState) return;
    const isTeamA = matchState.turn === 'A';
    
    setMatchState(prev => {
      if (!prev) return null;
      const newTeamA = isTeamA ? [...prev.teamA, player] : prev.teamA;
      const newTeamB = !isTeamA ? [...prev.teamB, player] : prev.teamB;
      const newPool = prev.remainingPool.filter(p => p.id !== player.id);
      const newPhase = newPool.length === 0 ? MatchPhase.VETO : MatchPhase.DRAFT;
      
      return { 
        ...prev, 
        teamA: newTeamA, 
        teamB: newTeamB, 
        remainingPool: newPool, 
        turn: isTeamA ? 'B' : 'A', 
        phase: newPhase,
        chat: [...prev.chat, { 
          id: `sys-draft-${Date.now()}`, 
          senderId: 'system', 
          senderName: 'System', 
          text: `${player.username} drafted to Team ${isTeamA ? 'A' : 'B'}`, 
          timestamp: Date.now(), 
          isSystem: true 
        }] 
      };
    });
    
    console.log(`👥 ${player.username} foi draftado para Team ${isTeamA ? 'A' : 'B'}`);
  };

  useEffect(() => {
    if (matchState?.phase === MatchPhase.DRAFT && matchState.remainingPool.length === 0) {
      setMatchState(prev => prev ? ({ ...prev, phase: MatchPhase.VETO, turn: 'A' }) : null);
      console.log('🗺️ Draft completo! Iniciando veto de mapas...');
    }
  }, [matchState?.remainingPool.length]);

  const vetoMap = (map: GameMap) => {
    if (!matchState) return;
    
    setMatchState(prev => {
      if (!prev) return null;
      const newMaps = prev.remainingMaps.filter(m => m !== map);
      
      if (newMaps.length === 1) {
        // Último mapa = mapa escolhido
        console.log(`🗺️ Mapa selecionado: ${newMaps[0]}`);
        return { 
          ...prev, 
          remainingMaps: newMaps, 
          selectedMap: newMaps[0], 
          phase: MatchPhase.LIVE, 
          startTime: Date.now(), 
          chat: [
            ...prev.chat, 
            { 
              id: `sys-veto-${Date.now()}`, 
              senderId: 'system', 
              senderName: 'System', 
              text: `Map ${map} banned.`, 
              timestamp: Date.now(), 
              isSystem: true 
            },
            { 
              id: `sys-live-${Date.now()}`, 
              senderId: 'system', 
              senderName: 'System', 
              text: `Match is now LIVE on ${newMaps[0]}!`, 
              timestamp: Date.now(), 
              isSystem: true 
            }
          ] 
        };
      }
      
      return { 
        ...prev, 
        remainingMaps: newMaps, 
        turn: prev.turn === 'A' ? 'B' : 'A', 
        chat: [...prev.chat, { 
          id: `sys-veto-${Date.now()}`, 
          senderId: 'system', 
          senderName: 'System', 
          text: `Map ${map} banned.`, 
          timestamp: Date.now(), 
          isSystem: true 
        }] 
      };
    });
  };

  const forceTimePass = () => {
    if (matchState?.phase === MatchPhase.LIVE && matchState.startTime) {
      setMatchState({ ...matchState, startTime: Date.now() - (21 * 60 * 1000) });
      console.log('⏩ Tempo forçado!');
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
    
    if (isTeamA || forcedReport) newReportA = reportData; 
    if (isTeamB || forcedReport) newReportB = reportData;
    
    setMatchState(prev => prev ? ({ ...prev, reportA: newReportA, reportB: newReportB }) : null);
    
    console.log(`📊 Resultado reportado: ${scoreA}-${scoreB}`);
    
    if (newReportA && newReportB) {
      if (newReportA.scoreA === newReportB.scoreA && newReportA.scoreB === newReportB.scoreB) {
        finalizeMatch(newReportA); 
        return { success: true };
      } else { 
        console.log('⚠️ Scores não coincidem!');
        return { success: false, message: "Scores do not match. Please coordinate with the other team." }; 
      }
    }
    
    return { success: true, message: "Score report submitted. Waiting for other team..." };
  };

  const finalizeMatch = (finalScore: MatchScore) => {
    const winner = finalScore.scoreA > finalScore.scoreB ? 'A' : 'B';
    const scoreString = `${finalScore.scoreA}-${finalScore.scoreB}`;
    
    console.log(`🏆 Match finalizada! Vencedor: Team ${winner} (${scoreString})`);
    
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
    
    // ⭐ NOVO: Atualizar pontos de todos os jogadores no Firestore
    const updatePromises: Promise<any>[] = [];
    
    winningTeam.forEach(winnerUser => {
      const u = allUsers.find(user => user.id === winnerUser.id);
      if (!u) return;
      
      const newPoints = calculatePoints(u.points, true, u.winstreak + 1);
      const pointsChange = newPoints - u.points;
      
      console.log(`✅ ${u.username}: ${u.points} → ${newPoints} (+${pointsChange})`);
      
      const userRef = doc(db, COLLECTIONS.USERS, u.id);
      updatePromises.push(
        updateDoc(userRef, {
          points: newPoints,
          lastPointsChange: pointsChange,
          wins: u.wins + 1,
          winstreak: u.winstreak + 1
        })
      );
      
      if (u.id === currentUser.id) { 
        processQuestProgress('PLAY_MATCHES', 1); 
        processQuestProgress('WIN_MATCHES', 1); 
        processQuestProgress('GET_WINSTREAK', 0, u.winstreak + 1); 
      }
    });
    
    losingTeam.forEach(loserUser => {
      const u = allUsers.find(user => user.id === loserUser.id);
      if (!u) return;
      
      const newPoints = calculatePoints(u.points, false, 0);
      const pointsChange = newPoints - u.points;
      
      console.log(`❌ ${u.username}: ${u.points} → ${newPoints} (${pointsChange})`);
      
      const userRef = doc(db, COLLECTIONS.USERS, u.id);
      updatePromises.push(
        updateDoc(userRef, {
          points: newPoints,
          lastPointsChange: pointsChange,
          losses: u.losses + 1,
          winstreak: 0
        })
      );
      
      if (u.id === currentUser.id) { 
        processQuestProgress('PLAY_MATCHES', 1); 
      }
    });
    
    // Executar todas as atualizações
    Promise.all(updatePromises)
      .then(() => console.log('✅ Todos os pontos atualizados no Firestore!'))
      .catch(error => console.error('❌ Erro ao atualizar pontos:', error));
  };

  const submitReport = (targetUserId: string, reason: string) => {
    setReports(prev => [...prev, { 
      id: `rep-${Date.now()}`, 
      reporter: currentUser.username, 
      reportedUser: allUsers.find(u => u.id === targetUserId)?.username || 'Unknown', 
      reason, 
      timestamp: Date.now() 
    }]);
    console.log(`🚨 Report enviado: ${targetUserId} - ${reason}`);
  };

  const commendPlayer = (targetUserId: string) => {
    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!targetUser) return;
    
    const userRef = doc(db, COLLECTIONS.USERS, targetUserId);
    updateDoc(userRef, {
      reputation: (targetUser.reputation || 0) + 1
    }).then(() => {
      console.log(`👍 Commend enviado para ${targetUser.username}`);
      processQuestProgress('GIVE_COMMENDS', 1);
    }).catch(error => {
      console.error('❌ Erro ao enviar commend:', error);
    });
  };

  const resetMatch = () => {
    setMatchState(null);
    console.log('🔄 Match resetada');
  };

  return (
    <GameContext.Provider value={{
      isAuthenticated, 
      isAdmin, 
      completeRegistration, 
      logout,
      currentUser, 
      pendingAuthUser, 
      updateProfile, 
      linkRiotAccount, 
      queue, 
      joinQueue, 
      leaveQueue, 
      testFillQueue,
      matchState, 
      acceptMatch, 
      draftPlayer, 
      vetoMap, 
      reportResult, 
      sendChatMessage,
      matchHistory, 
      allUsers, 
      reports, 
      submitReport, 
      commendPlayer, 
      resetMatch, 
      forceTimePass, 
      resetSeason,
      themeMode, 
      toggleTheme, 
      handleBotAction,
      viewProfileId, 
      setViewProfileId, 
      claimQuestReward, 
      resetDailyQuests,
      sendFriendRequest, 
      acceptFriendRequest, 
      rejectFriendRequest, 
      removeFriend
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
