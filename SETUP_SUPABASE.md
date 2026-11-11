# 🚀 Guia Completo - Configuração do Supabase

## 📋 **Passo a Passo para Criar o Banco de Dados**

### **1. Criar Conta e Projeto no Supabase**

1. **Acesse** [supabase.com](https://supabase.com)
2. **Faça login** ou crie uma conta gratuita
3. **Clique em "New Project"**
4. **Configure o projeto:**
   - **Nome:** `connect-employee-system`
   - **Organização:** Escolha sua organização
   - **Região:** `South America (São Paulo)` (mais próxima do Brasil)
   - **Senha do banco:** Crie uma senha forte e anote-a
5. **Aguarde** a inicialização (2-3 minutos)

### **2. Executar Script SQL**

1. **No painel do Supabase**, clique em **"SQL Editor"** (lateral esquerda)
2. **Clique em "New Query"**
3. **Copie TODO o conteúdo** do arquivo `supabase-setup.sql`
4. **Cole no editor** SQL
5. **Clique em "Run"** para executar
6. **Verifique** se apareceu "Success" e as tabelas foram criadas

### **3. Obter Credenciais**

1. **Vá para Settings > API** (lateral esquerda)
2. **Copie os valores:**
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **Anon key** (chave pública longa)

### **4. Configurar Variáveis de Ambiente**

1. **Abra o arquivo `.env`** na raiz do projeto
2. **Substitua os valores:**
   ```env
   VITE_SUPABASE_URL=https://sua-url-aqui.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
3. **Salve o arquivo**

### **5. Testar Conexão**

1. **Execute o projeto:**
   ```bash
   npm run dev
   ```
2. **Acesse** `http://localhost:8080`
3. **Vá para "Funcionários"** e teste adicionar um funcionário
4. **Verifique no Supabase** se os dados aparecem na tabela `employees`

## ✅ **Verificações Importantes**

### **Tabelas Criadas:**
- ✅ `employees` (funcionários)
- ✅ `announcements` (comunicados)

### **Recursos Configurados:**
- ✅ **Índices** para performance
- ✅ **Triggers** para `updated_at` automático
- ✅ **Row Level Security** habilitado
- ✅ **Políticas de acesso** configuradas
- ✅ **Dados de exemplo** inseridos

### **Funcionalidades Ativas:**
- 🔄 **Sincronização automática** entre navegadores
- 💾 **Backup local** (funciona offline)
- ⚡ **Atualizações em tempo real**
- 🔒 **Segurança** com RLS

## 🛠️ **Solução de Problemas**

### **Erro de Conexão:**
- Verifique se as URLs estão corretas no `.env`
- Confirme se o projeto Supabase está ativo
- Teste as credenciais no painel do Supabase

### **Tabelas não Criadas:**
- Execute o script SQL novamente
- Verifique se não há erros no SQL Editor
- Confirme se as extensões foram habilitadas

### **Dados não Sincronizam:**
- Verifique o console do navegador (F12)
- Confirme se as políticas RLS estão ativas
- Teste com dados simples primeiro

## 📞 **Suporte**

Se encontrar problemas:
1. **Verifique o console** do navegador (F12)
2. **Consulte os logs** do Supabase
3. **Teste as credenciais** manualmente
4. **Execute o script SQL** novamente se necessário

---

**🎉 Após seguir estes passos, seu sistema estará totalmente integrado com Supabase!**