# ✅ CHECKLIST DE INSTALAÇÃO

Marque cada item conforme for completando!

---

## 📋 PRÉ-REQUISITOS

- [ ] Node.js instalado (https://nodejs.org)
  - Verificar: `node --version` no terminal
- [ ] Git instalado (https://git-scm.com)
  - Verificar: `git --version`
- [ ] Conta GitHub criada (https://github.com)
- [ ] Visual Studio Code instalado (opcional mas recomendado)

---

## 🗄️ CONFIGURAÇÃO SUPABASE

### Criar Projeto
- [ ] Acessei https://supabase.com
- [ ] Fiz login com GitHub
- [ ] Cliquei em "New Project"
- [ ] Nome do projeto: `valorant-hub-pt`
- [ ] Anotei a senha da database (IMPORTANTE! ⚠️)
- [ ] Selecionei região: Europe West (London)
- [ ] Cliquei em "Create new project"
- [ ] Aguardei ~2 minutos até ficar pronto

### Criar Tabelas
- [ ] Acessei "SQL Editor" no menu lateral
- [ ] Cliquei em "New query"
- [ ] Colei o conteúdo do arquivo `supabase-setup.sql`
- [ ] Cliquei em "Run"
- [ ] Vi mensagem de sucesso ✅

### Copiar Credenciais
- [ ] Cliquei em "Project Settings" (ícone engrenagem)
- [ ] Cliquei em "API"
- [ ] Copiei `Project URL` → Colei em algum lugar seguro
- [ ] Copiei `anon public key` → Colei em algum lugar seguro

---

## 💻 CONFIGURAÇÃO LOCAL

### Preparar Projeto
- [ ] Extraí a pasta `valorant-hub-completo`
- [ ] Abri a pasta no Visual Studio Code (ou editor de texto)
- [ ] Abri o terminal integrado (Ctrl + ' ou View → Terminal)

### Configurar Variáveis de Ambiente
- [ ] Renomeei `.env.example` para `.env.local`
- [ ] Abri `.env.local`
- [ ] Colei `VITE_SUPABASE_URL=` + minha URL do Supabase
- [ ] Colei `VITE_SUPABASE_ANON_KEY=` + minha chave pública
- [ ] Salvei o arquivo

### Instalar Dependências
- [ ] No terminal, executei: `npm install`
- [ ] Aguardei instalação completa (pode demorar 1-3 minutos)
- [ ] Não vi erros críticos

### Testar Localmente
- [ ] Executei: `npm run dev`
- [ ] Vi mensagem: "Local: http://localhost:5173"
- [ ] Abri http://localhost:5173 no navegador
- [ ] Site carregou corretamente ✅

### Testar Funcionalidades
- [ ] Cliquei em "Register"
- [ ] Criei uma conta de teste
- [ ] Consegui fazer login
- [ ] Perfil apareceu corretamente
- [ ] Entrei na fila
- [ ] Tudo funcionando! 🎉

---

## 🌐 PUBLICAR ONLINE (VERCEL)

### Preparar Repositório Git
- [ ] No terminal (pasta do projeto), executei:
```bash
git init
git add .
git commit -m "Initial commit"
```
- [ ] Criei novo repositório no GitHub
  - GitHub → Repositories → New
  - Nome: `valorant-hub-pt`
  - Público ou Privado (sua escolha)
- [ ] Copiei URL do repositório (ex: https://github.com/usuario/valorant-hub-pt.git)
- [ ] No terminal, executei:
```bash
git remote add origin SEU-URL-AQUI
git branch -M main
git push -u origin main
```
- [ ] Código foi enviado para GitHub ✅

### Deploy na Vercel
- [ ] Acessei https://vercel.com
- [ ] Fiz login com GitHub
- [ ] Cliquei em "Add New..." → "Project"
- [ ] Selecionei meu repositório `valorant-hub-pt`
- [ ] Cliquei em "Import"

### Configurar Variáveis de Ambiente
- [ ] Na tela de configuração, cliquei em "Environment Variables"
- [ ] Adicionei:
  - Name: `VITE_SUPABASE_URL`
  - Value: Minha URL do Supabase
  - Environment: Production (e Development se quiser)
- [ ] Cliquei em "Add"
- [ ] Adicionei:
  - Name: `VITE_SUPABASE_ANON_KEY`
  - Value: Minha chave pública
  - Environment: Production (e Development se quiser)
- [ ] Cliquei em "Add"

### Deploy
- [ ] Cliquei em "Deploy"
- [ ] Aguardei ~2 minutos
- [ ] Vi "Congratulations! 🎉"
- [ ] Cliquei no link gerado (ex: https://meu-projeto.vercel.app)
- [ ] Site carregou online! 🚀

### Testar Online
- [ ] Acessei o link do Vercel
- [ ] Criei uma conta nova
- [ ] Fiz login
- [ ] Testei funcionalidades básicas
- [ ] Tudo funcionando online! ✅

---

## 🎮 JOGAR COM AMIGOS

- [ ] Copiei o link do site (https://meu-projeto.vercel.app)
- [ ] Enviei para amigos
- [ ] Cada amigo criou sua conta
- [ ] Todos entraram na fila
- [ ] Partida iniciou quando tínhamos 10 players! 🎉

---

## 🔧 MANUTENÇÃO

### Fazer Update no Código
- [ ] Editei arquivos localmente
- [ ] No terminal:
```bash
git add .
git commit -m "Descrição das mudanças"
git push
```
- [ ] Vercel automaticamente fez redeploy
- [ ] Mudanças apareceram online em ~2 minutos

### Verificar Usuários no Supabase
- [ ] Acessei Supabase Dashboard
- [ ] Table Editor → users
- [ ] Vi todos os usuários cadastrados

### Fazer Backup
- [ ] Supabase → Database → Backups
- [ ] Create backup
- [ ] Download quando necessário

---

## 🎯 RESULTADOS FINAIS

- [ ] ✅ Site funcionando localmente
- [ ] ✅ Site publicado online
- [ ] ✅ Base de dados configurada
- [ ] ✅ Sistema de registro/login funcional
- [ ] ✅ Amigos conseguem criar conta
- [ ] ✅ Sistema de fila funcionando
- [ ] ✅ Partidas acontecendo
- [ ] ✅ Tudo 100% GRÁTIS!

---

## 📊 ESTATÍSTICAS

**Tempo total estimado:**
- Supabase: 5-7 minutos
- Configuração local: 3-5 minutos
- Deploy Vercel: 3-5 minutos
- **Total: 15-20 minutos** ⏱️

**Custo:**
- **0€ / mês** 💰

**Capacidade:**
- ~100-500 usuários ativos simultâneos
- ~50.000 requisições/mês
- 500MB de dados
- Mais que suficiente para começar!

---

## 🆘 SE ALGO DEU ERRADO

- [ ] Li o `FAQ.md` para problemas comuns
- [ ] Verifiquei `.env.local` está correto
- [ ] Testei `npm install` novamente
- [ ] Reiniciei o servidor (`Ctrl+C` depois `npm run dev`)
- [ ] Verifiquei console do navegador (F12) para erros

---

## 🎉 PARABÉNS!

Se você chegou aqui e marcou tudo, seu HUB-PT está:
- ✅ Funcionando
- ✅ Online
- ✅ Pronto para jogar

**Bom jogo! 🎮🇵🇹**
