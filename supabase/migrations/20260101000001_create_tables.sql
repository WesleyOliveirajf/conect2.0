-- ============================================================
-- Migration 001 — Tabelas principais do Conect 2.0
-- Projeto: duduzwnyqeuedbaqnbsh
-- ============================================================
-- Execute no SQL Editor do Supabase Dashboard:
-- https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql/new
-- ============================================================

-- -------------------------------------------------------
-- Extensões necessárias
-- -------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- para buscas fuzzy eficientes

-- -------------------------------------------------------
-- Tabela: employees (funcionários)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  extension   TEXT NOT NULL,
  email       TEXT,
  department  TEXT NOT NULL,
  lunch_time  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.employees               IS 'Diretório de funcionários da TORP';
COMMENT ON COLUMN public.employees.id            IS 'Identificador único UUID';
COMMENT ON COLUMN public.employees.name          IS 'Nome completo do funcionário';
COMMENT ON COLUMN public.employees.extension     IS 'Ramal telefônico (ex: 4722)';
COMMENT ON COLUMN public.employees.email         IS 'E-mail corporativo (nullable)';
COMMENT ON COLUMN public.employees.department    IS 'Departamento/setor';
COMMENT ON COLUMN public.employees.lunch_time    IS 'Horário de almoço (ex: 12:00-13:00)';

-- -------------------------------------------------------
-- Tabela: announcements (comunicados)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'baixa'
                CHECK (priority IN ('alta', 'média', 'baixa')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.announcements            IS 'Comunicados internos da TORP';
COMMENT ON COLUMN public.announcements.priority   IS 'Prioridade: alta | média | baixa';
COMMENT ON COLUMN public.announcements.image_url  IS 'URL da imagem no Storage bucket announcement-images';

-- -------------------------------------------------------
-- Tabela: hr_questions (perguntas para o RH)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hr_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  question    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'nova'
                CHECK (status IN ('nova', 'visualizada', 'resolvida')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.hr_questions         IS 'Perguntas anônimas enviadas ao RH';
COMMENT ON COLUMN public.hr_questions.status  IS 'Status: nova | visualizada | resolvida';

-- -------------------------------------------------------
-- Trigger: atualiza updated_at automaticamente
-- -------------------------------------------------------
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

CREATE OR REPLACE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_hr_questions_updated_at
  BEFORE UPDATE ON public.hr_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
