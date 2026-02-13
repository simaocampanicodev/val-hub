# 🆘 FAQ & RESOLUÇÃO DE PROBLEMAS

## ❓ Perguntas Frequentes

### **1. É realmente 100% grátis?**
✅ SIM! 
- **Supabase**: Grátis até 500MB de dados (suficiente para milhares de usuários)
- **Vercel**: Grátis para projetos pessoais (100GB bandwidth/mês)
- Total: **0€/mês**

---

### **2. Quantos jogadores podem usar ao mesmo tempo?**
- **Supabase Free**: Até 50.000 requisições/mês
- Para um hub com 100 jogadores ativos: **mais que suficiente**
- Se crescer muito, pode fazer upgrade depois

---

### **3. Os dados são seguros?**
✅ SIM!
- Senhas criptografadas com bcrypt (impossível descriptografar)
- HTTPS em todas as conexões
- Base de dados com Row Level Security
- Supabase é enterprise-grade (usado por empresas grandes)

---

### **4. Posso usar com amigos de outros países?**
✅ SIM! 
- O site funciona em qualquer lugar do mundo
- Latência depende da região do servidor Supabase que escolher
- Recomendado: Europe West (London) para Portugal

---

### **5. E se eu quiser adicionar mais features?**
✅ O código está todo disponível!
- Você pode adicionar o que quiser
- Sistema modular e bem organizado
- Documentação no código

---

### **6. Preciso saber programar?**
- Para **usar**: NÃO
- Para **instalar**: Basta seguir o guia (copiar/colar)
- Para **modificar**: Sim, precisa saber React/TypeScript

---

## 🐛 Problemas Comuns e Soluções

### **ERRO: "Cannot find module 'react'"**

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
```

---

### **ERRO: "Supabase client not initialized"**

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se `.env.local` existe
2. Verifique se as credenciais estão corretas:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```
3. **IMPORTANTE:** Reinicie o servidor depois de mudar `.env.local`:
```bash
# Parar: Ctrl+C
npm run dev
```

---

### **ERRO: "Port 5173 is already in use"**

**Causa:** Outra aplicação usando a mesma porta

**Solução 1:** Fechar a outra aplicação

**Solução 2:** Mudar a porta em `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000, // ou qualquer outra porta
    host: '0.0.0.0',
  }
})
```

---

### **ERRO: "Failed to fetch" ao fazer login**

**Causa:** Supabase não está respondendo

**Soluções:**
1. Verifique se o projeto no Supabase está ativo (não pausado)
2. Verifique internet
3. Teste a URL do Supabase no navegador (deve retornar JSON)
4. Verifique console do navegador (F12) para erro específico

---

### **ERRO: "Duplicate key value violates unique constraint"**

**Causa:** Email ou username já existe no banco

**Solução:** 
- Use outro email/username
- Ou limpe a tabela no Supabase: SQL Editor → `DELETE FROM users;`

---

### **Site não carrega no Vercel (404)**

**Causas possíveis:**

**1. Build falhou**
- Vá em Vercel Dashboard → Seu projeto → "Deployments"
- Clique no último deploy e veja os logs
- Se houver erro, corrija e faça novo deploy

**2. Variáveis de ambiente não configuradas**
- Vercel → Settings → Environment Variables
- Adicione:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Após adicionar, faça **Redeploy**

**3. Build command errado**
- Vercel → Settings → Build & Development Settings
- Build Command: `npm run build`
- Output Directory: `dist`

---

### **Usuários não aparecem no Leaderboard**

**Causa:** Tabela vazia ou erro ao buscar

**Soluções:**
1. Verifique se há usuários na tabela:
   - Supabase → Table Editor → users
2. Verifique console do navegador (F12) para erros
3. Teste criar uma conta nova

---

### **Login não funciona mas registro funciona**

**Causa:** Provável erro de senha

**Solução:**
- Crie uma conta nova
- Se persistir, verifique console (F12)
- Verifique se `bcryptjs` está instalado:
```bash
npm list bcryptjs
```

---

### **Build dá erro: "bcryptjs not found"**

**Causa:** Dependência não instalada

**Solução:**
```bash
npm install bcryptjs @types/bcryptjs --save
```

---

### **TypeScript errors durante build**

**Solução:**
```bash
# Limpar cache
rm -rf node_modules
rm package-lock.json
npm install

# Se persistir, limpar build
rm -rf dist
npm run build
```

---

## 🔧 Comandos Úteis de Debug

### **Ver logs do Supabase:**
```javascript
// Adicione no código (temporário)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### **Testar conexão Supabase:**
```javascript
// Em authService.ts, adicione no início de loginUser:
console.log('Tentando login com:', email);
const result = await supabase.from('users').select('*').eq('email', email);
console.log('Resultado:', result);
```

### **Ver todas as variáveis de ambiente:**
```javascript
console.log(import.meta.env);
```

---

## 📊 Monitoramento no Supabase

### **Ver quantos usuários você tem:**
1. Supabase Dashboard
2. Table Editor
3. Tabela `users`
4. Mostra total de linhas no topo

### **Ver uso de recursos:**
1. Project Settings
2. Usage
3. Vê quantos MB usou, requisições, etc.

### **Fazer backup:**
1. Database
2. Backups
3. "Create backup"
4. Download quando quiser

---

## 🚨 Suporte

### **Problemas com Supabase:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### **Problemas com Vercel:**
- Docs: https://vercel.com/docs
- Forum: https://github.com/vercel/vercel/discussions

### **Problemas com React/Vite:**
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

---

## 💡 Dicas de Otimização

### **1. Performance:**
- Use índices no Supabase (já criados no SQL)
- Limite queries com `.limit(100)`
- Use paginação para listas grandes

### **2. Segurança:**
- Nunca commite `.env.local` no Git
- Use RLS (Row Level Security) no Supabase
- Valide inputs no frontend E backend

### **3. Escalabilidade:**
- Se ficar lento, considere Redis para cache
- Use Supabase Realtime para atualizações live
- Considere CDN para assets estáticos

---

## 📞 Ainda com problemas?

1. Leia novamente o `GUIA_RAPIDO.md`
2. Verifique `MUDANCAS.md` para entender o sistema
3. Teste cada etapa uma por uma
4. Use console do navegador (F12) para ver erros
5. Verifique logs do Vercel se o problema for no deploy

---

**Boa sorte! 🚀🇵🇹**
