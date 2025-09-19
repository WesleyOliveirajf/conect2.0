# 🚀 Instruções para Configurar o Banco Supabase

## ✅ Status Atual
- ✅ Projeto criado: `funcionarios-comunicados`
- ✅ ID do projeto: `duduzwnyqeuedbaqnbsh`
- ✅ URL configurada no .env: `https://duduzwnyqeuedbaqnbsh.supabase.co`
- ✅ Chave anon configurada no .env

## 📋 Próximos Passos

### 1. Acessar o Painel do Supabase
Acesse: https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh

### 2. Executar o Script SQL
1. No painel, vá para **SQL Editor** (ícone de código no menu lateral)
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-setup.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar

### 3. Verificar Tabelas Criadas
Após executar o SQL, verifique se as tabelas foram criadas:
- Vá para **Table Editor** no menu lateral
- Você deve ver as tabelas:
  - `employees` (funcionários)
  - `announcements` (comunicados)

### 4. Testar a Aplicação
Após criar as tabelas, a aplicação estará pronta para:
- ✅ Sincronização em tempo real entre navegadores
- ✅ Armazenamento persistente no Supabase
- ✅ Backup automático dos dados

## 🔧 Recursos Configurados

### Tabela `employees`
- ID único, nome, email, departamento, cargo
- Índices para performance
- Trigger para atualização automática de `updated_at`
- RLS (Row Level Security) habilitado

### Tabela `announcements`
- ID único, título, conteúdo, prioridade, datas
- Índices para performance
- Trigger para atualização automática de `updated_at`
- RLS (Row Level Security) habilitado

### Sincronização em Tempo Real
- Habilitada para ambas as tabelas
- Mudanças são propagadas instantaneamente
- Funciona entre múltiplos navegadores/dispositivos

## 🧪 Como Testar

1. Abra a aplicação em dois navegadores diferentes
2. Faça alterações em um navegador
3. Observe as mudanças aparecerem automaticamente no outro
4. Os dados agora são persistentes e não se perdem ao recarregar

## 📞 Suporte
Se houver problemas, verifique:
- Console do navegador para erros
- Logs do Supabase no painel
- Configurações de RLS se necessário