# 📁 ESTRUTURA DO PROJETO

## 📂 Visão Geral

```
valorant-hub-completo/
├── 📄 Arquivos de Configuração
├── 📁 components/ (Interface do usuário)
├── 📁 context/ (Estado global da aplicação)
├── 📁 services/ (Lógica de negócio)
├── 📁 lib/ (Bibliotecas e configurações)
└── 📚 Documentação
```

---

## 📄 ARQUIVOS DE CONFIGURAÇÃO

### **package.json**
- Configuração do projeto Node.js
- Lista de dependências (bibliotecas necessárias)
- Scripts de comando (`npm run dev`, `npm run build`)

### **tsconfig.json**
- Configuração do TypeScript
- Define como o código TypeScript será compilado
- Não precisa mexer!

### **vite.config.ts**
- Configuração do Vite (ferramenta de build)
- Define porta do servidor (5173)
- Hot reload durante desenvolvimento

### **.env.local** (você cria este)
- Variáveis de ambiente (secretas!)
- **NUNCA** faça commit no Git
- Contém credenciais do Supabase

### **.env.example**
- Template para o .env.local
- Mostra quais variáveis são necessárias
- Pode fazer commit (sem valores reais)

### **.gitignore**
- Lista arquivos que o Git deve ignorar
- Inclui node_modules, .env.local, dist
- Evita commitar dados sensíveis

---

## 📁 COMPONENTES (components/)

### **Auth.tsx**
- Tela de Login e Registro
- Formulários de autenticação
- Validação de dados

### **Layout.tsx**
- Layout principal do site
- Header, Sidebar, Footer
- Navegação entre páginas

### **Queue.tsx**
- Tela da Fila de Matchmaking
- Mostra jogadores aguardando
- Botão de entrar/sair da fila

### **MatchInterface.tsx**
- Interface da partida
- Draft de players
- Ban de mapas
- Chat
- Sistema de votação de resultados

### **Profile.tsx**
- Perfil do usuário
- Estatísticas pessoais
- Edição de preferências

### **Leaderboard.tsx**
- Ranking global
- Lista de top players
- Ordenação por pontos

### **MatchHistory.tsx**
- Histórico de partidas
- Resultado de jogos anteriores
- Estatísticas

### **Quests.tsx / QuestsView.tsx**
- Sistema de missões diárias
- Recompensas
- Progresso

### **FriendsView.tsx**
- Lista de amigos
- Solicitações pendentes
- Sistema social

### **AdminReports.tsx**
- Painel administrativo
- Gerenciar reports
- Moderação

### **ui/Button.tsx & ui/Card.tsx**
- Componentes reutilizáveis
- Botões e cards estilizados
- Design system

---

## 🧠 CONTEXTO (context/)

### **GameContext.tsx**
- **CÉREBRO DA APLICAÇÃO**
- Gerencia estado global:
  - Usuário logado
  - Fila de matchmaking
  - Estado da partida
  - Histórico
  - Leaderboard
- Funções principais:
  - `login()` - Fazer login
  - `register()` - Criar conta
  - `joinQueue()` - Entrar na fila
  - `acceptMatch()` - Aceitar partida
  - `reportResult()` - Reportar resultado

---

## 🔧 SERVIÇOS (services/)

### **gameService.ts**
- Lógica do jogo
- Cálculo de ranks
- Sistema de XP e níveis
- Geração de bots
- Cálculo de pontos

### **authService.ts** ⭐ NOVO
- Integração com Supabase
- Funções de autenticação:
  - `registerUser()` - Criar conta na DB
  - `loginUser()` - Verificar credenciais
  - `updateUserProfile()` - Atualizar dados
  - `getAllUsers()` - Buscar usuários
  - `saveMatch()` - Salvar partida
  - `getMatchHistory()` - Buscar histórico

---

## 📚 BIBLIOTECAS (lib/)

### **supabase.ts** ⭐ NOVO
- Cliente Supabase
- Configuração de conexão
- Tipos TypeScript para banco de dados
- Exporta `supabase` para usar em todo projeto

---

## 📄 ARQUIVOS PRINCIPAIS

### **index.html**
- Estrutura HTML base
- Ponto de entrada do app
- Carrega o React

### **index.tsx**
- Bootstrap do React
- Renderiza o App
- Configura providers

### **App.tsx**
- Componente principal
- Roteamento de páginas
- Lógica de autenticação

### **types.ts**
- Definições de tipos TypeScript
- Interfaces (User, Match, etc.)
- Enums (GameRole, GameMap, etc.)

### **constants.ts**
- Constantes do jogo
- Ranks
- Agentes
- Mapas
- Pontos iniciais

### **metadata.json**
- Metadados do projeto
- Nome, descrição, versão

---

## 📚 DOCUMENTAÇÃO

### **README_COMPLETO.md**
- Guia completo de instalação
- Passo a passo detalhado
- Todas as informações

### **GUIA_RAPIDO.md**
- Versão resumida
- 10 minutos de setup
- Apenas o essencial

### **FAQ.md**
- Perguntas frequentes
- Solução de problemas
- Troubleshooting

### **CHECKLIST.md**
- Lista de tarefas
- Marcar o progresso
- Não esquecer nenhum passo

### **MUDANCAS.md**
- O que mudou na integração
- Como migrar do localStorage
- Arquivos novos

### **ESTRUTURA.md** (este arquivo)
- Explica cada arquivo
- Organização do projeto
- Referência rápida

### **supabase-setup.sql**
- Script SQL para Supabase
- Criar todas as tabelas
- Copiar e colar no SQL Editor

---

## 🔄 FLUXO DE DADOS

```
1. Usuário interage → Component
2. Component chama → GameContext
3. GameContext chama → authService
4. authService chama → Supabase
5. Supabase retorna dados
6. authService processa
7. GameContext atualiza estado
8. Component re-renderiza
9. Usuário vê resultado
```

### Exemplo: Login

```
1. Auth.tsx (formulário)
   ↓
2. GameContext.login()
   ↓
3. authService.loginUser()
   ↓
4. supabase.from('users').select()
   ↓
5. Verifica senha com bcrypt
   ↓
6. Retorna User ou erro
   ↓
7. GameContext atualiza currentUser
   ↓
8. App.tsx redireciona para Home
```

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

### **Produção:**
- `react` - Framework UI
- `react-dom` - React para web
- `lucide-react` - Ícones
- `@supabase/supabase-js` - Cliente Supabase
- `bcryptjs` - Criptografia de senhas

### **Desenvolvimento:**
- `vite` - Build tool
- `typescript` - Tipagem estática
- `@vitejs/plugin-react` - Plugin React para Vite
- `@types/*` - Tipos TypeScript

---

## 🎨 DESIGN PATTERNS

### **Context Pattern**
- Estado global com React Context
- Evita prop drilling
- Um único source of truth

### **Service Layer**
- Lógica de negócio separada
- Fácil de testar
- Reutilizável

### **Component Composition**
- Componentes pequenos e focados
- Reutilizáveis
- Fácil de manter

---

## 🚀 COMO ADICIONAR FEATURES

### 1. Nova tela/página:
- Criar componente em `components/`
- Adicionar rota em `App.tsx`
- Usar `GameContext` para dados

### 2. Nova funcionalidade:
- Adicionar função em `GameContext.tsx`
- Se precisar DB, usar `authService.ts`
- Se precisar lógica, usar `gameService.ts`

### 3. Novo tipo de dados:
- Adicionar interface em `types.ts`
- Criar tabela no Supabase (se persistente)
- Atualizar `lib/supabase.ts` com tipos

---

## 📊 TAMANHO DO PROJETO

```
Total de arquivos: ~30
Linhas de código: ~5.000
Tamanho build: ~500KB (minificado)
Tamanho node_modules: ~200MB
```

---

## 🔐 SEGURANÇA

### **Criptografia:**
- Senhas: bcrypt (irreversível)
- Comunicação: HTTPS
- Tokens: JWT do Supabase

### **Validação:**
- Frontend: Formulários
- Backend: Supabase RLS
- Inputs: Sanitização

### **Boas Práticas:**
- .env.local não vai pro Git
- Senhas nunca em plain text
- APIs keys apenas no servidor

---

## 💡 DICAS

### **Para Ler o Código:**
1. Comece pelo `App.tsx`
2. Depois `GameContext.tsx`
3. Então os components
4. Por último, services

### **Para Modificar:**
1. Sempre teste local primeiro
2. Use console.log para debug
3. Leia os tipos em `types.ts`
4. Siga o padrão existente

### **Para Deploy:**
1. Build local: `npm run build`
2. Teste: `npm run preview`
3. Se funcionar, faça git push
4. Vercel faz deploy automaticamente

---

**Qualquer dúvida, leia a documentação específica de cada arquivo! 📖**
