-- ============================================================
-- Migration 002 — Índices de performance
-- ============================================================

-- employees: busca por departamento e nome
CREATE INDEX IF NOT EXISTS idx_employees_department
  ON public.employees (department);

CREATE INDEX IF NOT EXISTS idx_employees_name_trgm
  ON public.employees USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_employees_extension
  ON public.employees (extension);

-- announcements: listagem por data e prioridade
CREATE INDEX IF NOT EXISTS idx_announcements_created_at
  ON public.announcements (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_priority
  ON public.announcements (priority);

CREATE INDEX IF NOT EXISTS idx_announcements_date
  ON public.announcements (date DESC);

-- hr_questions: listagem por status e data
CREATE INDEX IF NOT EXISTS idx_hr_questions_status
  ON public.hr_questions (status);

CREATE INDEX IF NOT EXISTS idx_hr_questions_created_at
  ON public.hr_questions (created_at DESC);
