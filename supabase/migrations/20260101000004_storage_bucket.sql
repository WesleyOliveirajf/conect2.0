-- ============================================================
-- Migration 004 — Storage Bucket: announcement-images
-- ============================================================

-- Criar bucket público para imagens dos comunicados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true,                          -- público: URLs acessíveis sem autenticação
  5242880,                       -- limite: 5 MB por arquivo
  ARRAY['image/jpeg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -------------------------------------------------------
-- Políticas de Storage
-- -------------------------------------------------------

-- Leitura pública (qualquer um pode ver imagens)
DROP POLICY IF EXISTS "public read announcement images" ON storage.objects;
CREATE POLICY "public read announcement images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'announcement-images');

-- Upload permitido apenas ao service_role (backend Go / admin)
DROP POLICY IF EXISTS "service role upload announcement images" ON storage.objects;
CREATE POLICY "service role upload announcement images"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'announcement-images');

-- Update (upsert) permitido apenas ao service_role
DROP POLICY IF EXISTS "service role update announcement images" ON storage.objects;
CREATE POLICY "service role update announcement images"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'announcement-images');

-- Delete permitido apenas ao service_role
DROP POLICY IF EXISTS "service role delete announcement images" ON storage.objects;
CREATE POLICY "service role delete announcement images"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'announcement-images');
