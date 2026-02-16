

export enum GameRole {
  DUELIST = 'Duelist',
  INITIATOR = 'Initiator',
  CONTROLLER = 'Controller',
  SENTINEL = 'Sentinel',
  FLEX = 'Flex'
}

export enum GameMap {
  ASCENT = 'Ascent',
  BIND = 'Bind',
  HAVEN = 'Haven',
  SPLIT = 'Split',
  LOTUS = 'Lotus',
  SUNSET = 'Sunset',
  PEARL = 'Pearl',
  ICEBOX = 'Icebox',
  BREEZE = 'Breeze',
  FRACTURE = 'Fracture',
  ABYSS = 'Abyss'
}

export type QuestType = 'PLAY_MATCHES' | 'WIN_MATCHES' | 'GIVE_COMMENDS' | 'GET_WINSTREAK' | 'ADD_FRIEND' | 'COMPLETE_PROFILE' | 'REACH_LEVEL';
export type QuestCategory = 'DAILY' | 'MONTHLY' | 'UNIQUE';

export interface Quest {
  id: string;
  type: QuestType;
  category: QuestCategory;
  description: string;
  target: number;
  xpReward: number; // XP instead of points
}

export interface UserQuest {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface FriendRequest {
    fromId: string;
    toId: string;
    timestamp: number;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  avatarUrl?: string;
  riotId?: string; // Player Name
  riotTag?: string; // #EUW
  points: number; // MMR
  lastPointsChange?: number; // To track how much was gained/lost in last game
  xp: number; // Experience for Leveling
  level: number;
  reputation: number;
  wins: number;
  losses: number;
  winstreak: number;
  primaryRole: GameRole;
  secondaryRole: GameRole;
  topAgents: string[];
  isBot?: boolean;
  
  // Social
  friends: string[]; // List of User IDs
  friendRequests: FriendRequest[];

  // Quests
  activeQuests: UserQuest[];
  /** User IDs already counted for ADD_FRIEND quest (so re-adding same person does not count again) */
  friendQuestCountedIds?: string[];
  lastDailyQuestGeneration?: number;
  lastMonthlyQuestGeneration?: number;
}

export interface Report {
  id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  timestamp: number;
}

export enum MatchPhase {
  QUEUE = 'QUEUE',
  READY_CHECK = 'READY_CHECK',
  DRAFT = 'DRAFT',
  VETO = 'VETO',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED'
}

export interface MatchScore {
  scoreA: number;
  scoreB: number;
}

export interface PlayerReport {
  playerId: string;
  playerName: string;
  scoreA: number;
  scoreB: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface MatchState {
  id: string;
  phase: MatchPhase;
  players: User[]; 
  captainA: User | null;
  captainB: User | null;
  teamA: User[];
  teamB: User[];
  turn: 'A' | 'B'; 
  remainingPool: User[]; 
  remainingMaps: GameMap[];
  selectedMap: GameMap | null;
  startTime: number | null; 
  resultReported: boolean;
  winner: 'A' | 'B' | null;
  reportA: MatchScore | null; 
  reportB: MatchScore | null;
  playerReports: PlayerReport[]; // ⭐ NOVO: Lista de reports de todos os jogadores
  readyPlayers: string[]; 
  readyExpiresAt?: number;
  chat: ChatMessage[];
}

export interface PlayerSnapshot {
  id: string;
  username: string;
  avatarUrl?: string;
  role: GameRole;
}

export interface MatchRecord {
  id: string;
  date: number;
  map: GameMap;
  captainA: string;
  captainB: string;
  winner: 'A' | 'B';
  teamAIds: string[];
  teamBIds: string[];
  teamASnapshot: PlayerSnapshot[]; 
  teamBSnapshot: PlayerSnapshot[]; 
  score: string;
}

export type ThemeMode = 'dark' | 'light';
