# 🚀 Configuração para Deploy na Vercel - Connect10

## 📋 Configurações do Projeto na Vercel

### **Nome do Projeto:** `connect10`

### **Configurações de Build:**
```
Framework Preset: Vite
Build Command: npm run build:prod
Output Directory: dist
Install Command: npm ci
Node.js Version: 18.x
```

### **Variáveis de Ambiente Obrigatórias:**

Copie e configure estas variáveis no painel da Vercel:

```env
# ========================================
# CONFIGURAÇÕES DE SEGURANÇA (OBRIGATÓRIAS)
# ========================================
VITE_ADMIN_PASSWORD=q1w2e3r4Q1@
VITE_ENCRYPTION_SALT=TORP_SECURE_SALT_2025_PROD

# ========================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ========================================
VITE_APP_NAME=Torp Huddle Space
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://connect10.vercel.app

# ========================================
# CONFIGURAÇÕES PWA
# ========================================
VITE_PWA_SHORT_NAME=Connect10
VITE_PWA_DESCRIPTION=Espaço para unir, informar e transformar a equipe TORP
VITE_PWA_THEME_COLOR=#1a365d
VITE_PWA_BACKGROUND_COLOR=#ffffff

# ========================================
# SUPABASE (USAR SUAS CREDENCIAIS REAIS)
# ========================================
VITE_SUPABASE_URL=https://duduzwnyqeuedbaqnbsh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZHV6d255cWV1ZWRiYXFuYnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzczMjksImV4cCI6MjA3Mzg1MzMyOX0.AZAff6_lSH12UnFrZvMNOFGprCAJR50-81MD8m48W6M

# ========================================
# IA/CHATBOT (OPCIONAL - CONFIGURE SE QUISER CHATBOT)
# ========================================
VITE_GROQ_API_KEY=sua_chave_groq_aqui

# ========================================
# RAG (OPCIONAL - PARA BUSCA INTELIGENTE)
# ========================================
VITE_RAG_WEBSITE_URL=https://connect10.vercel.app
VITE_RAG_MAX_PAGES=20

# ========================================
# CONFIGURAÇÕES DE PRODUÇÃO
# ========================================
VITE_DEBUG_MODE=false
VITE_CACHE_DURATION=86400000
VITE_CACHE_VERSION=1
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOGIN_BLOCK_DURATION=15
VITE_SESSION_DURATION=30
VITE_SESSION_WARNING_TIME=5
```

## 🔧 Passo a Passo para Deploy

### 1. **Acesse a Vercel:**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com GitHub

### 2. **Criar Projeto:**
   - Clique em "New Project"
   - Selecione o repositório `WesleyOliveirajf/conect2.0`
   - Configure o nome como: **connect10**

### 3. **Configurar Build:**
   ```
   Framework Preset: Vite
   Build Command: npm run build:prod
   Output Directory: dist
   Install Command: npm ci
   ```

### 4. **Adicionar Variáveis de Ambiente:**
   - Vá para "Settings" > "Environment Variables"
   - Adicione TODAS as variáveis listadas acima
   - **IMPORTANTE:** Use suas credenciais reais do Supabase

### 5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar

## 🌐 URLs Esperadas

Após o deploy:
- **Produção:** `https://connect10.vercel.app`
- **Preview:** URLs automáticas para cada commit

## ✅ Checklist de Verificação

- [ ] Nome do projeto: `connect10`
- [ ] Build command: `npm run build:prod`
- [ ] Output directory: `dist`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Credenciais do Supabase corretas
- [ ] Deploy realizado com sucesso

## 🔒 Segurança

- ✅ Senhas e chaves estão nas variáveis de ambiente
- ✅ Headers de segurança configurados no vercel.json
- ✅ CSP (Content Security Policy) implementado
- ✅ Criptografia de dados sensíveis

## 📱 PWA

O projeto será automaticamente um PWA após o deploy:
- ✅ Service Worker configurado
- ✅ Manifest.json otimizado
- ✅ Ícones para todas as resoluções
- ✅ Instalável em dispositivos móveis