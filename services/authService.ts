import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import { User, GameRole } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  primaryRole: GameRole;
  secondaryRole: GameRole;
  topAgents: string[];
}

// Registrar novo usuário
export const registerUser = async (data: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingEmail) {
      return { success: false, error: 'Email já está em uso' };
    }

    // Verificar se username já existe
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .single();

    if (existingUsername) {
      return { success: false, error: 'Nome de usuário já está em uso' };
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        username: data.username,
        password_hash: passwordHash,
        primary_role: data.primaryRole,
        secondary_role: data.secondaryRole,
        top_agents: data.topAgents,
        points: 1000,
        xp: 0,
        level: 1,
        reputation: 10,
        wins: 0,
        losses: 0,
        winstreak: 0,
        active_quests: [],
        friends: [],
        friend_requests: []
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, error: 'Erro ao criar conta' };
    }

    const user: User = {
      id: newUser.id,
      username: newUser.username,
      points: newUser.points,
      xp: newUser.xp,
      level: newUser.level,
      reputation: newUser.reputation,
      wins: newUser.wins,
      losses: newUser.losses,
      winstreak: newUser.winstreak,
      primaryRole: newUser.primary_role as GameRole,
      secondaryRole: newUser.secondary_role as GameRole,
      topAgents: newUser.top_agents,
      isBot: false,
      activeQuests: newUser.active_quests || [],
      friends: newUser.friends || [],
      friendRequests: newUser.friend_requests || []
    };

    return { success: true, user };
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return { success: false, error: 'Erro ao criar conta' };
  }
};

// Login
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !userData) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    const user: User = {
      id: userData.id,
      username: userData.username,
      points: userData.points,
      xp: userData.xp,
      level: userData.level,
      reputation: userData.reputation,
      wins: userData.wins,
      losses: userData.losses,
      winstreak: userData.winstreak,
      primaryRole: userData.primary_role as GameRole,
      secondaryRole: userData.secondary_role as GameRole,
      topAgents: userData.top_agents,
      isBot: false,
      activeQuests: userData.active_quests || [],
      friends: userData.friends || [],
      friendRequests: userData.friend_requests || []
    };

    return { success: true, user };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
};

// Atualizar perfil
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.points !== undefined) dbUpdates.points = updates.points;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.reputation !== undefined) dbUpdates.reputation = updates.reputation;
    if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
    if (updates.losses !== undefined) dbUpdates.losses = updates.losses;
    if (updates.winstreak !== undefined) dbUpdates.winstreak = updates.winstreak;
    if (updates.primaryRole !== undefined) dbUpdates.primary_role = updates.primaryRole;
    if (updates.secondaryRole !== undefined) dbUpdates.secondary_role = updates.secondaryRole;
    if (updates.topAgents !== undefined) dbUpdates.top_agents = updates.topAgents;
    if (updates.activeQuests !== undefined) dbUpdates.active_quests = updates.activeQuests;
    if (updates.friends !== undefined) dbUpdates.friends = updates.friends;
    if (updates.friendRequests !== undefined) dbUpdates.friend_requests = updates.friendRequests;

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return false;
  }
};

// Buscar todos os usuários (para leaderboard)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('points', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return data.map(u => ({
      id: u.id,
      username: u.username,
      points: u.points,
      xp: u.xp,
      level: u.level,
      reputation: u.reputation,
      wins: u.wins,
      losses: u.losses,
      winstreak: u.winstreak,
      primaryRole: u.primary_role as GameRole,
      secondaryRole: u.secondary_role as GameRole,
      topAgents: u.top_agents,
      isBot: false,
      activeQuests: u.active_quests || [],
      friends: u.friends || [],
      friendRequests: u.friend_requests || []
    }));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

// Salvar partida no histórico
export const saveMatch = async (matchData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('matches')
      .insert({
        team_a: matchData.teamA,
        team_b: matchData.teamB,
        map: matchData.map,
        score_a: matchData.scoreA,
        score_b: matchData.scoreB,
        winner: matchData.winner
      });

    if (error) {
      console.error('Erro ao salvar partida:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar partida:', error);
    return false;
  }
};

// Buscar histórico de partidas
export const getMatchHistory = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
};
