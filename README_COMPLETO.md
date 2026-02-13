# 🎮 HUB-PT - Valorant Hub Português

Sistema de matchmaking 5v5 para a comunidade portuguesa de Valorant.

## 🚀 Como Configurar e Testar com Amigos

### **PASSO 1: Configurar Base de Dados (Supabase)**

#### 1.1 Criar Conta e Projeto
1. Acesse: https://supabase.com
2. Clique em "Start your project" e faça login com GitHub
3. Clique em "New Project"
4. Preencha:
   - Name: `valorant-hub-pt`
   - Database Password: **ANOTE ESTA SENHA!** ⚠️
   - Region: Europe West (London)
5. Clique em "Create new project" (aguarde ~2 minutos)

#### 1.2 Criar Tabelas
1. No painel Supabase, clique em "SQL Editor" (menu lateral)
2. Clique em "New query"
3. Cole o código abaixo e clique em "Run":

```sql
-- Tabela de Usuários
CREATE TABLE users (
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
  top_agents JSONB DEFAULT '[]',
  active_quests JSONB DEFAULT '[]',
  friends JSONB DEFAULT '[]',
  friend_requests JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Partidas
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a JSONB NOT NULL,
  team_b JSONB NOT NULL,
  map TEXT,
  score_a INTEGER,
  score_b INTEGER,
  winner TEXT,
  match_date TIMESTAMP DEFAULT NOW()
);

-- Tabela de Fila
CREATE TABLE queue (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Índices para performance
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
```

#### 1.3 Pegar Credenciais
1. Clique em "Project Settings" (ícone engrenagem)
2. Clique em "API"
3. **Anote**:
   - `Project URL` (ex: https://xxxxx.supabase.co)
   - `anon/public key` (chave longa começando com "eyJ...")

---

### **PASSO 2: Configurar o Projeto Localmente**

#### 2.1 Instalar Node.js
Se não tiver instalado:
- Windows/Mac: https://nodejs.org (versão LTS)
- Verificar: `node --version` no terminal

#### 2.2 Configurar Variáveis de Ambiente
1. Renomeie `.env.example` para `.env.local`
2. Abra `.env.local` e cole suas credenciais do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

#### 2.3 Instalar Dependências
Abra o terminal na pasta do projeto:
```bash
npm install
```

#### 2.4 Rodar Localmente
```bash
npm run dev
```

Acesse: http://localhost:5173

---

### **PASSO 3: Publicar Online (Vercel) - GRÁTIS**

#### 3.1 Preparar para Deploy
1. Crie conta no GitHub: https://github.com
2. Instale Git: https://git-scm.com/downloads
3. No terminal, na pasta do projeto:
```bash
git init
git add .
git commit -m "Initial commit"
```

4. Crie um repositório no GitHub (público ou privado)
5. Siga as instruções para fazer push:
```bash
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

#### 3.2 Deploy na Vercel
1. Acesse: https://vercel.com
2. Clique em "Sign Up" e faça login com GitHub
3. Clique em "Add New..." → "Project"
4. Selecione seu repositório
5. Em "Environment Variables", adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave pública
6. Clique em "Deploy"

**Pronto! Seu site estará online em ~2 minutos!** 🎉

URL será algo como: `https://seu-projeto.vercel.app`

---

### **PASSO 4: Compartilhar com Amigos**

Envie o link da Vercel para seus amigos:
- Eles podem criar conta
- Fazer login
- Entrar na fila
- Jogar 5v5!

---

## 🔧 Comandos Úteis

```bash
npm run dev     # Rodar localmente
npm run build   # Criar build de produção
npm run preview # Testar build local
```

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module 'bcryptjs'"
```bash
npm install
```

### Erro: Supabase connection failed
Verifique se as variáveis em `.env.local` estão corretas.

### Porta já em uso
Mude no `vite.config.ts`:
```typescript
server: { port: 3001 }
```

---

## 📝 Features

✅ Registro e Login com base de dados real  
✅ Sistema de fila 5v5  
✅ Matchmaking automático  
✅ Sistema de ELO/Rankings  
✅ Histórico de partidas  
✅ Sistema de quests  
✅ Sistema de amigos  
✅ Leaderboard  
✅ Modo escuro/claro  

---

## 🎨 Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Auth**: bcryptjs

---

**100% Gratuito!** 🚀🇵🇹
