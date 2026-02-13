# 🎯 GUIA RÁPIDO - HUB-PT Valorant

## ✅ O QUE VOCÊ PRECISA (TUDO GRÁTIS!)

1. **Node.js** - https://nodejs.org (versão LTS)
2. **Conta GitHub** - https://github.com
3. **Conta Supabase** - https://supabase.com (base de dados)
4. **Conta Vercel** - https://vercel.com (hospedagem)

---

## 🚀 INSTALAÇÃO RÁPIDA (10 MINUTOS)

### **1️⃣ CONFIGURAR SUPABASE (5 min)**

1. Entre em https://supabase.com → "Start your project"
2. Login com GitHub
3. "New Project" → Nome: `valorant-hub-pt`
4. **Anote a senha da base de dados!** ⚠️
5. Escolha região: Europe West (London)
6. Aguarde 2 minutos
7. Menu lateral → "SQL Editor" → "New query"
8. Cole este código e clique "Run":

```sql
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

CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
```

9. "Project Settings" → "API" → **Copie**:
   - Project URL
   - anon public key

---

### **2️⃣ CONFIGURAR PROJETO LOCAL (3 min)**

1. Extraia a pasta do projeto
2. Renomeie `.env.example` para `.env.local`
3. Abra `.env.local` e cole:
```
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

4. Abra terminal na pasta do projeto:
```bash
npm install
npm run dev
```

5. Abra: http://localhost:5173

**TESTANDO LOCAL:**
- ✅ Crie uma conta
- ✅ Faça login
- ✅ Entre na fila
- ✅ Funciona!

---

### **3️⃣ PUBLICAR ONLINE (2 min)**

**Opção A - Vercel (Mais Fácil):**

1. https://vercel.com → Login com GitHub
2. "Add New" → "Project"
3. "Import Git Repository" → Cole a URL do seu GitHub repo
   - Se não tiver: crie repo no GitHub primeiro
4. Adicione Environment Variables:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua chave
5. "Deploy"

**Seu site estará online em: `https://seu-projeto.vercel.app`**

---

**Opção B - Netlify:**

1. https://netlify.com → Login
2. "Add new site" → "Import from Git"
3. Conecte GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment Variables (mesmo do Vercel)
6. Deploy

---

## 📱 COMO USAR COM AMIGOS

1. Envie o link do site para amigos
2. Cada um cria sua conta
3. Todos entram na fila
4. Quando tiver 10 players → partida começa!
5. Draft, ban de mapas, jogo!

---

## ⚙️ FUNCIONALIDADES

✅ Registro e login com email  
✅ Sistema de ranking (ELO)  
✅ Fila automática 5v5  
✅ Draft de players  
✅ Ban de mapas  
✅ Histórico de partidas  
✅ Sistema de quests diárias  
✅ Sistema de amigos  
✅ Leaderboard global  
✅ Perfil personalizado  
✅ Modo escuro/claro  

---

## 🆘 PROBLEMAS?

**"Cannot find module"**
```bash
npm install
```

**"Supabase error"**
→ Verifique se as credenciais em `.env.local` estão corretas

**"Port already in use"**
→ Mude a porta em `vite.config.ts`:
```typescript
server: { port: 3001 }
```

**Site não aparece no Vercel**
→ Verifique se adicionou as Environment Variables

---

## 📊 CUSTOS

- ✅ Supabase: **GRÁTIS** até 500MB storage
- ✅ Vercel: **GRÁTIS** para projetos pessoais
- ✅ Total: **0€ / mês**

---

## 🎮 BOM JOGO!

Qualquer dúvida, olhe o `README_COMPLETO.md` para mais detalhes.

**Made with ❤️ in Portugal 🇵🇹**
