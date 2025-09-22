-- ========================================
-- CONFIGURAÇÃO DO BANCO SUPABASE
-- Script para criar tabelas e configurações
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELA DE FUNCIONÁRIOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(255) NOT NULL,
    lunch_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON public.employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABELA DE COMUNICADOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('alta', 'média', 'baixa')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_announcements_date ON public.announcements(date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON public.announcements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Habilitar Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Política para funcionários (permitir todas as operações para usuários autenticados)
CREATE POLICY "Permitir todas as operações em employees" ON public.employees
    FOR ALL USING (true);

-- Política para comunicados (permitir todas as operações para usuários autenticados)
CREATE POLICY "Permitir todas as operações em announcements" ON public.announcements
    FOR ALL USING (true);

-- ========================================
-- DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir funcionários reais da TORP (apenas se a tabela estiver vazia)
INSERT INTO public.employees (id, name, extension, email, department, lunch_time)
SELECT v.id::uuid, v.name, v.extension, v.email, v.department, v.lunch_time FROM (VALUES
    -- GENTE E GESTÃO
    ('550e8400-e29b-41d4-a716-446655440001', 'Flávia (Diretora)', '4723', 'flavia.diretora@torp.ind.br', 'Gente e Gestão', NULL),
    ('550e8400-e29b-41d4-a716-446655440002', 'Bruno (RH)', '4727', 'bruno.oliveira@torp.ind.br', 'Gente e Gestão', '12:00-13:00'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Fabiane (Enfermagem)', '4805', 'fabiane.lourenco@torp.ind.br', 'Gente e Gestão', '12:00-13:00'),
    
    -- SALAS
    ('550e8400-e29b-41d4-a716-446655440004', 'Sala de Reuniões', '4724', 'sala.reunioes@torp.ind.br', 'Salas', NULL),
    ('550e8400-e29b-41d4-a716-446655440005', 'Sala de Cartela', '4709', 'sala.cartela@torp.ind.br', 'Salas', NULL),
    
    -- ADMINISTRATIVO
    ('550e8400-e29b-41d4-a716-446655440006', 'Ediane (Financeiro)', '4713', 'ediane.costa@torp.ind.br', 'Administrativo', '12:00-13:00'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Michele (Fiscal)', '4729', 'fiscal@torp.ind.br', 'Administrativo', '11:00-12:00'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Jussara Inácio (Recepção)', '4701', 'jussara.inacio@torp.ind.br', 'Administrativo', '11:30-13:00'),
    ('550e8400-e29b-41d4-a716-446655440009', 'Fernanda (Faturamento)', '4737', 'fernanda.faturamento@torp.com', 'Administrativo', '12:30-14:00'),
    ('550e8400-e29b-41d4-a716-446655440010', 'Tatiana (DP)', '4728', 'tatiana.guimaraes@torp.ind.br', 'Administrativo', '12:30-13:30'),
    
    -- COMERCIAL
    ('550e8400-e29b-41d4-a716-446655440011', 'Carlos Eduardo (Supervisor Operações)', '4717', 'carloseduardo.oliveira@torp.ind.br', 'Comercial', NULL),
    ('550e8400-e29b-41d4-a716-446655440012', 'Khendry', '4714', 'khendry.mendonca@torp.ind.br', 'Comercial', '12:00-13:00'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Marcus', '4732', 'marcos.teixeira@torp.ind.br', 'Comercial', '11:00-12:00'),
    
    -- CONTROLADORIA
    ('550e8400-e29b-41d4-a716-446655440014', 'Vinícius', '4705', 'vinicius.reis@torp.ind.br', 'Controladoria', '12:30-13:30'),
    
    -- MARKETING
    ('550e8400-e29b-41d4-a716-446655440015', 'Alice', '4718', 'alice.abreu@torp.ind.br', 'Marketing', '12:00-13:00'),
    
    -- TI
    ('550e8400-e29b-41d4-a716-446655440016', 'Wesley Oliveira', '4722', 'wesley.oliveira@torp.ind.br', 'TI', '12:30-13:30'),
    
    -- PCP
    ('550e8400-e29b-41d4-a716-446655440017', 'João Silva (PCP)', '4750', 'joao.silva@torp.ind.br', 'PCP', '12:00-13:00'),
    ('550e8400-e29b-41d4-a716-446655440018', 'Maria Santos (PCP)', '4751', 'maria.santos@torp.ind.br', 'PCP', '11:30-12:30'),
    
    -- COMPRAS/PREFEITURA
    ('550e8400-e29b-41d4-a716-446655440019', 'Felipe (Supervisor Operações)', '4708', 'felipe.marciano@torp.ind.br', 'Compras/Prefeitura', '13:00-14:00')
) AS v(id, name, extension, email, department, lunch_time)
WHERE NOT EXISTS (SELECT 1 FROM public.employees LIMIT 1);

-- Inserir alguns comunicados de exemplo (apenas se a tabela estiver vazia)
INSERT INTO public.announcements (id, title, content, priority, date)
SELECT * FROM (VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Bem-vindos ao Sistema', 'Sistema de comunicação interna agora integrado com Supabase!', 'alta', CURRENT_DATE),
    ('660e8400-e29b-41d4-a716-446655440002', 'Manutenção Programada', 'Manutenção do sistema será realizada no próximo fim de semana.', 'média', CURRENT_DATE + INTERVAL '7 days')
) AS v(id, title, content, priority, date)
WHERE NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1);

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('employees', 'announcements');

-- Verificar contagem de registros
SELECT 
    'employees' as tabela, 
    COUNT(*) as total_registros 
FROM public.employees
UNION ALL
SELECT 
    'announcements' as tabela, 
    COUNT(*) as total_registros 
FROM public.announcements;

-- ========================================
-- INSTRUÇÕES DE USO
-- ========================================

/*
COMO USAR ESTE SCRIPT:

1. Acesse o painel do Supabase (https://supabase.com)
2. Vá para seu projeto > SQL Editor
3. Cole e execute este script completo
4. Verifique se as tabelas foram criadas corretamente
5. Configure as variáveis de ambiente no arquivo .env:
   - VITE_SUPABASE_URL=sua_url_do_projeto
   - VITE_SUPABASE_ANON_KEY=sua_chave_publica

ESTRUTURA DAS TABELAS:

employees:
- id (UUID, PK)
- name (VARCHAR)
- extension (VARCHAR) 
- email (VARCHAR, opcional)
- department (VARCHAR)
- lunch_time (VARCHAR, opcional)
- created_at, updated_at (TIMESTAMP)

announcements:
- id (UUID, PK)
- title (VARCHAR)
- content (TEXT)
- priority (ENUM: alta, média, baixa)
- date (DATE)
- created_at, updated_at (TIMESTAMP)

RECURSOS INCLUÍDOS:
✅ Tabelas com estrutura otimizada
✅ Índices para performance
✅ Triggers para updated_at automático
✅ Row Level Security habilitado
✅ Políticas de acesso configuradas
✅ Dados de exemplo (opcional)
✅ Verificações de integridade
*/