-- ============================================================
-- Migration 006 — Escrita restrita a administradores (Supabase Auth)
-- ============================================================
-- Admin = usuário autenticado com app_metadata.role = 'admin'.
-- app_metadata só pode ser alterado via painel/SQL/service_role,
-- nunca pelo próprio usuário (diferente de user_metadata).
--
-- Para promover um usuário (após criá-lo em Authentication > Users):
--   UPDATE auth.users
--   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   WHERE email = 'admin@empresa.com';
-- O usuário precisa fazer login de novo para receber o novo claim no JWT.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- employees ---------------------------------------------------
DROP POLICY IF EXISTS "employees_write_admin" ON public.employees;
CREATE POLICY "employees_write_admin"
  ON public.employees
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- announcements -----------------------------------------------
DROP POLICY IF EXISTS "announcements_write_admin" ON public.announcements;
CREATE POLICY "announcements_write_admin"
  ON public.announcements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- hr_questions: qualquer um envia; só admin lê/atualiza/remove --
DROP POLICY IF EXISTS "hr_questions_admin" ON public.hr_questions;
CREATE POLICY "hr_questions_admin"
  ON public.hr_questions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- storage: imagens de comunicados -----------------------------
DROP POLICY IF EXISTS "admin upload announcement images" ON storage.objects;
CREATE POLICY "admin upload announcement images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'announcement-images' AND public.is_admin());

DROP POLICY IF EXISTS "admin update announcement images" ON storage.objects;
CREATE POLICY "admin update announcement images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'announcement-images' AND public.is_admin());

DROP POLICY IF EXISTS "admin delete announcement images" ON storage.objects;
CREATE POLICY "admin delete announcement images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'announcement-images' AND public.is_admin());
