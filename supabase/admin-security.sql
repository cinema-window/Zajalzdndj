-- ====================================================================
-- REDOS / CINEMA WINDOW ADMIN - SUPABASE SECURITY & RLS POLICIES
-- File: supabase/admin-security.sql
-- Description: Hardens Supabase Auth & DB against Admin Role Escalation.
-- ====================================================================

-- 1. Create helper function to safely check if auth.uid() has 'admin' role in users_profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Prevent normal users from modifying their own 'role' column on UPDATE
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is NOT an admin or service_role, prevent role modification
  IF (OLD.role IS DISTINCT FROM NEW.role) THEN
    IF NOT public.is_admin() AND (auth.role() IS DISTINCT FROM 'service_role') THEN
      RAISE EXCEPTION 'غير مصرح لك بتغيير صلاحيات الحساب (Role Escalation Prevented)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users_profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.users_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Signup Trigger: Strictly default all new auth users to 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, username, email, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1), 'مستخدم'),
    COALESCE(NEW.email, ''),
    'user', -- Always 'user'. Client metadata role is IGNORED to prevent escalation
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Enable RLS on all tables
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for users_profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users_profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON public.users_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users_profiles;
CREATE POLICY "Users can update own profile"
  ON public.users_profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all profiles" ON public.users_profiles;
CREATE POLICY "Admins manage all profiles"
  ON public.users_profiles FOR ALL
  USING (public.is_admin());

-- 6. RLS Policies for MOVIES
DROP POLICY IF EXISTS "Public read movies" ON public.movies;
CREATE POLICY "Public read movies" ON public.movies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write movies" ON public.movies;
CREATE POLICY "Admin write movies" ON public.movies FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 7. RLS Policies for EPISODES
DROP POLICY IF EXISTS "Public read episodes" ON public.episodes;
CREATE POLICY "Public read episodes" ON public.episodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write episodes" ON public.episodes;
CREATE POLICY "Admin write episodes" ON public.episodes FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 8. RLS Policies for CATEGORIES
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
CREATE POLICY "Admin write categories" ON public.categories FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 9. Secure SQL to promote the initial Admin User (run in Supabase SQL Editor):
-- UPDATE public.users_profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';
