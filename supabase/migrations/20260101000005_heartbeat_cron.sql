-- ============================================================
--  CONECT 2.0 — Heartbeat: mantém o Supabase ativo
--  Projeto: duduzwnyqeuedbaqnbsh
-- ============================================================
--  Cole TODO este arquivo no SQL Editor do Supabase Dashboard:
--  https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql/new
--
--  O que faz:
--   1. Cria a tabela `heartbeat` para registrar batidas de vida
--   2. Ativa a extensão pg_cron (já disponível no Supabase)
--   3. Agenda um job que insere uma linha a cada 3 dias
--   4. Mantém apenas os últimos 100 registros (limpeza automática)
--   5. Expõe RLS: apenas service_role lê/escreve
-- ============================================================


-- ============================================================
-- PARTE 1 — Extensão pg_cron
-- ============================================================
-- Já vem instalada no Supabase; só precisa ser habilitada no schema cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Garantir que o cron possa rodar no schema public
GRANT USAGE ON SCHEMA cron TO postgres;


-- ============================================================
-- PARTE 2 — Tabela heartbeat
-- ============================================================
CREATE TABLE IF NOT EXISTS public.heartbeat (
  id          BIGSERIAL   PRIMARY KEY,
  beat_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Números correntes no momento da batida
  seq_number  BIGINT      NOT NULL,   -- número sequencial acumulado
  db_now      TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- timestamp do banco
  notes       TEXT                    -- observações opcionais
);

COMMENT ON TABLE  public.heartbeat            IS 'Registro de atividade periódica — mantém o projeto Supabase ativo';
COMMENT ON COLUMN public.heartbeat.seq_number IS 'Número corrente acumulado (incrementado a cada batida)';
COMMENT ON COLUMN public.heartbeat.beat_at    IS 'Momento em que a batida foi registrada';

-- Índice para buscas por data
CREATE INDEX IF NOT EXISTS idx_heartbeat_beat_at
  ON public.heartbeat (beat_at DESC);


-- ============================================================
-- PARTE 3 — RLS
-- ============================================================
ALTER TABLE public.heartbeat ENABLE ROW LEVEL SECURITY;

-- Apenas service_role acessa (não precisa ficar exposto ao frontend)
DROP POLICY IF EXISTS "heartbeat_service_role" ON public.heartbeat;
CREATE POLICY "heartbeat_service_role"
  ON public.heartbeat
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Leitura pública opcional (útil para monitoramento)
DROP POLICY IF EXISTS "heartbeat_select_public" ON public.heartbeat;
CREATE POLICY "heartbeat_select_public"
  ON public.heartbeat
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ============================================================
-- PARTE 4 — Função que executa a batida
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_heartbeat()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_seq BIGINT;
BEGIN
  -- Pegar o próximo número sequencial (último + 1, ou 1 se vazio)
  SELECT COALESCE(MAX(seq_number), 0) + 1
    INTO v_seq
    FROM public.heartbeat;

  -- Inserir nova batida com número corrente
  INSERT INTO public.heartbeat (seq_number, db_now, notes)
  VALUES (
    v_seq,
    NOW(),
    'cron automático — batida ' || v_seq::text || ' em ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI:SS')
  );

  -- Limpeza: manter apenas os últimos 100 registros
  DELETE FROM public.heartbeat
  WHERE id IN (
    SELECT id FROM public.heartbeat
    ORDER BY beat_at DESC
    OFFSET 100
  );
END;
$$;


-- ============================================================
-- PARTE 5 — Job pg_cron: executa a cada 3 dias às 03:00 UTC
-- ============================================================
-- Remove job anterior (se existir) para evitar duplicatas
SELECT cron.unschedule('conect2-heartbeat')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'conect2-heartbeat'
);

-- Agenda: 0 3 */3 * *
--   minuto=0, hora=3, a cada 3 dias, qualquer mês, qualquer dia da semana
SELECT cron.schedule(
  'conect2-heartbeat',         -- nome único do job
  '0 3 */3 * *',               -- a cada 3 dias às 03:00 UTC
  'SELECT public.fn_heartbeat();'
);


-- ============================================================
-- PARTE 6 — Inserção imediata (primeira batida agora)
-- ============================================================
SELECT public.fn_heartbeat();


-- ============================================================
-- PARTE 7 — Verificação
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela heartbeat criada';
  RAISE NOTICE '✅ Função fn_heartbeat criada';
  RAISE NOTICE '✅ Job cron "conect2-heartbeat" agendado (0 3 */3 * *)';
  RAISE NOTICE '✅ Primeira batida registrada';
END $$;

-- Ver o job agendado
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'conect2-heartbeat';

-- Ver o primeiro registro
SELECT id, seq_number, beat_at, notes
FROM public.heartbeat
ORDER BY beat_at DESC
LIMIT 5;
