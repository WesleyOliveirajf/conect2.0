-- ============================================================
--  CONECT 2.0 — Schema Completo do Supabase
--  Projeto: duduzwnyqeuedbaqnbsh
-- ============================================================
--  Cole TODO este arquivo no SQL Editor do Supabase Dashboard:
--  https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql/new
--
--  Este script é idempotente: pode ser executado várias vezes
--  sem duplicar dados ou gerar erros.
-- ============================================================


-- ============================================================
-- PARTE 1 — Extensões
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ============================================================
-- PARTE 2 — Tabelas
-- ============================================================

-- ------------------------------------------------------------
-- 2.1  employees
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  extension   TEXT        NOT NULL,
  email       TEXT,
  department  TEXT        NOT NULL,
  lunch_time  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.employees             IS 'Diretório de funcionários da TORP';
COMMENT ON COLUMN public.employees.extension   IS 'Ramal telefônico (ex: 4722)';
COMMENT ON COLUMN public.employees.lunch_time  IS 'Horário de almoço (ex: 12:00-13:00)';

-- ------------------------------------------------------------
-- 2.2  announcements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  priority    TEXT        NOT NULL DEFAULT 'baixa'
                            CHECK (priority IN ('alta', 'média', 'baixa')),
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.announcements           IS 'Comunicados internos da TORP';
COMMENT ON COLUMN public.announcements.priority  IS 'alta | média | baixa';
COMMENT ON COLUMN public.announcements.image_url IS 'URL da imagem no Storage';

-- ------------------------------------------------------------
-- 2.3  hr_questions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hr_questions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  question    TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'nova'
                            CHECK (status IN ('nova', 'visualizada', 'resolvida')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.hr_questions        IS 'Perguntas anônimas enviadas ao RH';
COMMENT ON COLUMN public.hr_questions.status IS 'nova | visualizada | resolvida';


-- ============================================================
-- PARTE 3 — Trigger updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_employees_updated_at     ON public.employees;
DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
DROP TRIGGER IF EXISTS trg_hr_questions_updated_at  ON public.hr_questions;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hr_questions_updated_at
  BEFORE UPDATE ON public.hr_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- PARTE 4 — Índices de Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_employees_department
  ON public.employees (department);

CREATE INDEX IF NOT EXISTS idx_employees_name_trgm
  ON public.employees USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_employees_extension
  ON public.employees (extension);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at
  ON public.announcements (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_priority
  ON public.announcements (priority);

CREATE INDEX IF NOT EXISTS idx_announcements_date
  ON public.announcements (date DESC);

CREATE INDEX IF NOT EXISTS idx_hr_questions_status
  ON public.hr_questions (status);

CREATE INDEX IF NOT EXISTS idx_hr_questions_created_at
  ON public.hr_questions (created_at DESC);


-- ============================================================
-- PARTE 5 — RLS (Row Level Security)
-- ============================================================

-- Habilitar RLS
ALTER TABLE public.employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_questions  ENABLE ROW LEVEL SECURITY;

-- Revogar permissões brutas do PUBLIC
REVOKE ALL ON public.employees     FROM PUBLIC;
REVOKE ALL ON public.announcements FROM PUBLIC;
REVOKE ALL ON public.hr_questions  FROM PUBLIC;

-- Conceder às roles Supabase
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees     TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_questions  TO anon, authenticated, service_role;

-- -------------------------------------------------------
-- Políticas: employees
-- -------------------------------------------------------
DROP POLICY IF EXISTS "employees_select_public"       ON public.employees;
DROP POLICY IF EXISTS "employees_write_service_role"  ON public.employees;

-- Leitura pública (frontend React usa chave anon)
CREATE POLICY "employees_select_public"
  ON public.employees
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Escrita exclusiva do backend Go (service_role)
CREATE POLICY "employees_write_service_role"
  ON public.employees
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- Políticas: announcements
-- -------------------------------------------------------
DROP POLICY IF EXISTS "announcements_select_public"      ON public.announcements;
DROP POLICY IF EXISTS "announcements_write_service_role" ON public.announcements;

CREATE POLICY "announcements_select_public"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "announcements_write_service_role"
  ON public.announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- Políticas: hr_questions
-- -------------------------------------------------------
DROP POLICY IF EXISTS "hr_questions_insert_public"  ON public.hr_questions;
DROP POLICY IF EXISTS "hr_questions_service_role"   ON public.hr_questions;

-- Qualquer pessoa pode enviar uma pergunta
CREATE POLICY "hr_questions_insert_public"
  ON public.hr_questions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas service_role (admin) lê e atualiza status
CREATE POLICY "hr_questions_service_role"
  ON public.hr_questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- PARTE 6 — Storage: bucket announcement-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage
DROP POLICY IF EXISTS "public read announcement images"           ON storage.objects;
DROP POLICY IF EXISTS "service role upload announcement images"   ON storage.objects;
DROP POLICY IF EXISTS "service role update announcement images"   ON storage.objects;
DROP POLICY IF EXISTS "service role delete announcement images"   ON storage.objects;

CREATE POLICY "public read announcement images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'announcement-images');

CREATE POLICY "service role upload announcement images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'announcement-images');

CREATE POLICY "service role update announcement images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'announcement-images');

CREATE POLICY "service role delete announcement images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'announcement-images');


-- ============================================================
-- PARTE 7 — Verificação final
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('employees','announcements','hr_questions')
  LOOP
    RAISE NOTICE '✅ Tabela criada/verificada: %', tbl;
  END LOOP;
END $$;
