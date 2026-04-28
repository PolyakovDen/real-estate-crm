-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- PROFILES
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'manager', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE property_type AS ENUM (
  'apartment', 'house', 'commercial', 'land', 'garage', 'room'
);

CREATE TYPE deal_type AS ENUM (
  'sale', 'rent_long', 'rent_short', 'rent_daily'
);

CREATE TYPE property_status AS ENUM (
  'draft', 'active', 'reserved', 'sold', 'rented', 'archived', 'withdrawn'
);

CREATE TYPE listing_type AS ENUM (
  'exclusive', 'non_exclusive', 'info'
);

CREATE TYPE condition_type AS ENUM (
  'new_building', 'after_repair', 'designer', 'lived', 'needs_repair', 'shell'
);

-- ==========================================
-- PROPERTIES
-- ==========================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  agent_id UUID NOT NULL REFERENCES public.profiles(id),
  property_type property_type NOT NULL,
  deal_type deal_type NOT NULL,
  status property_status NOT NULL DEFAULT 'draft',
  listing_type listing_type NOT NULL DEFAULT 'non_exclusive',
  title TEXT NOT NULL,
  description TEXT,
  region TEXT,
  city TEXT NOT NULL,
  district TEXT,
  street TEXT,
  building_number TEXT,
  apartment_number TEXT,
  location GEOGRAPHY(POINT, 4326),
  full_address TEXT,
  total_area NUMERIC(10, 2),
  living_area NUMERIC(10, 2),
  kitchen_area NUMERIC(10, 2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'UAH')),
  price_per_sqm NUMERIC(10, 2) GENERATED ALWAYS AS (
    CASE WHEN total_area > 0 THEN price / total_area ELSE NULL END
  ) STORED,
  condition condition_type,
  year_built INTEGER,
  building_type TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  owner_name TEXT,
  owner_phone TEXT,
  owner_notes TEXT,
  exclusive_until DATE,
  commission_percent NUMERIC(5, 2),
  commission_amount NUMERIC(15, 2),
  external_listings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_agent ON public.properties(agent_id);
CREATE INDEX idx_properties_type ON public.properties(property_type, deal_type);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties USING GIST(location);
CREATE INDEX idx_properties_attributes ON public.properties USING GIN(attributes);
CREATE INDEX idx_properties_amenities ON public.properties USING GIN(amenities);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- PROPERTY PHOTOS
-- ==========================================
CREATE TABLE public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  is_floor_plan BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_property ON public.property_photos(property_id, sort_order);

CREATE UNIQUE INDEX idx_photos_one_cover
  ON public.property_photos(property_id)
  WHERE is_cover = TRUE;

-- ==========================================
-- PRICE HISTORY
-- ==========================================
CREATE TABLE public.property_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  old_price NUMERIC(15, 2),
  new_price NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_property ON public.property_price_history(property_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.price IS DISTINCT FROM NEW.price) THEN
    INSERT INTO public.property_price_history (
      property_id, old_price, new_price, currency, changed_by
    ) VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.price END,
      NEW.price,
      NEW.currency,
      NEW.agent_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER properties_price_history
  AFTER INSERT OR UPDATE OF price ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.log_price_change();

-- ==========================================
-- RLS POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_price_history ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin');

-- PROPERTIES policies
CREATE POLICY "properties_select" ON public.properties
  FOR SELECT TO authenticated
  USING (
    agent_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

CREATE POLICY "properties_insert" ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      agent_id = auth.uid()
      OR public.current_user_role() IN ('manager', 'admin')
    )
  );

CREATE POLICY "properties_update" ON public.properties
  FOR UPDATE TO authenticated
  USING (
    agent_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

CREATE POLICY "properties_delete" ON public.properties
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('manager', 'admin'));

-- PROPERTY PHOTOS policies
CREATE POLICY "photos_select" ON public.property_photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id
      AND (p.agent_id = auth.uid() OR public.current_user_role() IN ('manager', 'admin'))
    )
  );

CREATE POLICY "photos_insert" ON public.property_photos
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id
      AND (p.agent_id = auth.uid() OR public.current_user_role() IN ('manager', 'admin'))
    )
  );

CREATE POLICY "photos_delete" ON public.property_photos
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

-- STORAGE policies (run separately in Supabase SQL Editor)
-- CREATE POLICY "photos_storage_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'property-photos');
-- CREATE POLICY "photos_storage_insert" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'property-photos');
-- CREATE POLICY "photos_storage_delete" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (
--     bucket_id = 'property-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
