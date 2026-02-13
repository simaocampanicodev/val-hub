import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          password_hash: string;
          points: number;
          xp: number;
          level: number;
          reputation: number;
          wins: number;
          losses: number;
          winstreak: number;
          primary_role: string;
          secondary_role: string;
          top_agents: string[];
          active_quests: any[];
          friends: string[];
          friend_requests: any[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          team_a: any;
          team_b: any;
          map: string;
          score_a: number | null;
          score_b: number | null;
          winner: string | null;
          match_date: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'match_date'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
    };
  };
}
