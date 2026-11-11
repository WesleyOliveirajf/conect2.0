-- ========================================
-- MIGRAÇÃO: TORNAR EMAIL OPCIONAL E PERMITIR DUPLICADOS
-- ========================================

-- Script para atualizar a tabela employees existente
-- Remover restrições UNIQUE e NOT NULL do campo email

BEGIN;

-- 1. Remover a restrição UNIQUE do email (se existir)
DO $$ 
BEGIN
    -- Buscar e remover constraint UNIQUE do email
    PERFORM 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%email%' 
    AND table_name = 'employees' 
    AND constraint_type = 'UNIQUE';
    
    IF FOUND THEN
        -- Remover constraint encontrada
        EXECUTE 'ALTER TABLE public.employees DROP CONSTRAINT ' || (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%email%' 
            AND table_name = 'employees' 
            AND constraint_type = 'UNIQUE'
            LIMIT 1
        );
        RAISE NOTICE 'Constraint UNIQUE do email removida com sucesso';
    ELSE
        RAISE NOTICE 'Nenhuma constraint UNIQUE encontrada para email';
    END IF;
END $$;

-- 2. Tornar o campo email opcional (remover NOT NULL)
ALTER TABLE public.employees ALTER COLUMN email DROP NOT NULL;

-- 3. Atualizar campos de email vazios para NULL (opcional)
UPDATE public.employees 
SET email = NULL 
WHERE email = '' OR email = 'xxx';

COMMIT;

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND table_schema = 'public'
AND column_name = 'email';

-- Verificar constraints restantes
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'employees' 
AND table_schema = 'public';

-- Verificar funcionários com email NULL ou duplicado
SELECT 
    COUNT(*) as total_funcionarios,
    COUNT(email) as funcionarios_com_email,
    COUNT(*) - COUNT(email) as funcionarios_sem_email
FROM public.employees;

RAISE NOTICE '✅ Migração concluída com sucesso!';
RAISE NOTICE '📧 Campo email agora é opcional e permite duplicados';
