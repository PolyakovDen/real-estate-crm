CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select" ON public.activity_log
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "activity_insert" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow profiles to be read by all authenticated users (for team page)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow managers/admins to update profiles (role changes)
DROP POLICY IF EXISTS "profiles_update_role" ON public.profiles;
CREATE POLICY "profiles_update_role" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('manager', 'admin'))
  WITH CHECK (public.current_user_role() IN ('manager', 'admin'));
