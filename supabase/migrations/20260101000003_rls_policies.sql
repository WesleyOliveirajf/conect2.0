-- ============================================================
-- Migration 003 — RLS e Políticas de Acesso
-- ============================================================
-- Estratégia de acesso:
--
--  employees     → leitura pública (anon), escrita apenas service_role
--  announcements → leitura pública (anon), escrita apenas service_role
--  hr_questions  → INSERT público anônimo, leitura/update apenas service_role
--
-- O service_role é usado pelo backend Go (SUPABASE_SERVICE_KEY)
-- A chave anon é usada pelo frontend React (VITE_SUPABASE_ANON_KEY)
-- ============================================================

-- -------------------------------------------------------
-- Habilitar RLS em todas as tabelas
-- -------------------------------------------------------
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_questions  ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Revogar permissões padrão do public (defesa em profundidade)
-- -------------------------------------------------------
REVOKE ALL ON public.employees     FROM PUBLIC;
REVOKE ALL ON public.announcements FROM PUBLIC;
REVOKE ALL ON public.hr_questions  FROM PUBLIC;

-- -------------------------------------------------------
-- Conceder acesso às roles Supabase padrão
-- -------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees     TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_questions  TO anon, authenticated, service_role;

-- -------------------------------------------------------
-- Políticas: employees
-- Qualquer pessoa pode ler; apenas service_role pode escrever
-- -------------------------------------------------------
DROP POLICY IF EXISTS "employees_select_public" ON public.employees;
CREATE POLICY "employees_select_public"
  ON public.employees
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "employees_write_service_role" ON public.employees;
CREATE POLICY "employees_write_service_role"
  ON public.employees
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- Políticas: announcements
-- Qualquer pessoa pode ler; apenas service_role pode escrever
-- -------------------------------------------------------
DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
CREATE POLICY "announcements_select_public"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "announcements_write_service_role" ON public.announcements;
CREATE POLICY "announcements_write_service_role"
  ON public.announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- Políticas: hr_questions
-- Qualquer pessoa pode inserir (enviar pergunta anônima)
-- Apenas service_role pode ler e atualizar status
-- -------------------------------------------------------
DROP POLICY IF EXISTS "hr_questions_insert_public" ON public.hr_questions;
CREATE POLICY "hr_questions_insert_public"
  ON public.hr_questions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "hr_questions_service_role" ON public.hr_questions;
CREATE POLICY "hr_questions_service_role"
  ON public.hr_questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
