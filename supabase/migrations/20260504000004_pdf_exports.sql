-- ============================================================
-- 04_pdf_exports.sql
-- Historial de reportes PDF generados por administradores
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pdf_exports (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_nombre      text        NOT NULL,
  filter_status     text        CHECK (filter_status IN ('pending', 'confirmed', 'rejected')),
  reservation_count int         NOT NULL DEFAULT 0,
  confirmed_count   int         NOT NULL DEFAULT 0,
  revenue           numeric     NOT NULL DEFAULT 0,
  generated_at      timestamptz NOT NULL DEFAULT now(),
  generated_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pdf_exports_event_id     ON public.pdf_exports(event_id);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_generated_at ON public.pdf_exports(generated_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.pdf_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pdf_exports_select_admin" ON public.pdf_exports
  FOR SELECT USING (public.is_admin());

CREATE POLICY "pdf_exports_insert_admin" ON public.pdf_exports
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "pdf_exports_delete_admin" ON public.pdf_exports
  FOR DELETE USING (public.is_admin());
