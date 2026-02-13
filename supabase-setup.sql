-- ==================================================
-- SUPABASE - SQL PARA CRIAR TABELAS
-- ==================================================
-- Cole este código no SQL Editor do Supabase
-- Menu: SQL Editor → New Query → Cole e clique "Run"
-- ==================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  points INTEGER DEFAULT 1000,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  reputation INTEGER DEFAULT 10,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  winstreak INTEGER DEFAULT 0,
  primary_role TEXT NOT NULL,
  secondary_role TEXT NOT NULL,
  top_agents JSONB DEFAULT '[]'::jsonb,
  active_quests JSONB DEFAULT '[]'::jsonb,
  friends JSONB DEFAULT '[]'::jsonb,
  friend_requests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Partidas
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a JSONB NOT NULL,
  team_b JSONB NOT NULL,
  map TEXT,
  score_a INTEGER,
  score_b INTEGER,
  winner TEXT,
  match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fila (Opcional - pode usar realtime)
CREATE TABLE IF NOT EXISTS queue (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date DESC);

-- Habilitar Row Level Security (RLS) - Segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessidade)
-- ATENÇÃO: Estas políticas permitem leitura pública. 
-- Para produção, considere restringir conforme suas regras de negócio.

CREATE POLICY "Permitir leitura pública de usuários" 
ON users FOR SELECT 
USING (true);

CREATE POLICY "Permitir leitura pública de partidas" 
ON matches FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de usuários" 
ON users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização do próprio perfil" 
ON users FOR UPDATE 
USING (true);

CREATE POLICY "Permitir inserção de partidas" 
ON matches FOR INSERT 
WITH CHECK (true);

-- ==================================================
-- PRONTO! Tabelas criadas com sucesso ✅
-- ==================================================
-- Próximo passo: Copiar as credenciais do projeto
-- Settings → API → Project URL e anon key
-- ==================================================
