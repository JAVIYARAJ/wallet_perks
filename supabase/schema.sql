-- =============================================================================
-- WALLETPERKS FULL DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PUBLIC PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('merchant', 'customer', 'admin')),
  business_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure business_id column exists if table was created previously without it
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS business_id UUID;

-- 2. BUSINESSES TABLE (Merchants)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  legal_name TEXT,
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL,
  website TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  rejection_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure latitude, longitude, and rejection_reason columns exist if table was created previously
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add Foreign Key for business_id in profiles after businesses table exists
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_business,
  ADD CONSTRAINT fk_profiles_business 
  FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;

-- 3. INDUSTRIES / BUSINESS CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Supported Business Categories
INSERT INTO public.industries (slug, label, icon_name, description, display_order)
VALUES
  ('coffee-cafe', 'Coffee & Cafe', 'Coffee', 'Cafes, specialty coffee shops, and bakeries', 1),
  ('retail-boutique', 'Retail & Boutique', 'ShoppingBag', 'Clothing boutiques, gift shops, and specialty retail', 2),
  ('fitness-studio', 'Fitness & Studio', 'Dumbbell', 'Gyms, yoga studios, and fitness centers', 3),
  ('salon-spa', 'Salon & Spa', 'Scissors', 'Hair salons, barbershops, nail & day spas', 4),
  ('restaurant-bar', 'Restaurant & Bar', 'Utensils', 'Casual dining, bars, food trucks, and bistros', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- AUTOMATIC TRIGGER: Sync auth.users to public.profiles upon registration
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Businesses Policies
DROP POLICY IF EXISTS "Allow public business applications" ON public.businesses;
CREATE POLICY "Allow public business applications" 
  ON public.businesses FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow merchants to view own business" ON public.businesses;
CREATE POLICY "Allow merchants to view own business" 
  ON public.businesses FOR SELECT 
  USING (owner_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Industries Policies
DROP POLICY IF EXISTS "Allow public read of active industries" ON public.industries;
CREATE POLICY "Allow public read of active industries" 
  ON public.industries FOR SELECT 
  USING (is_active = true);

-- =============================================================================
-- 4. BUSINESS BRANCHES TABLE (Multi-Branch Outlets)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.business_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  branch_code TEXT,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  manager_name TEXT,
  manager_phone TEXT,
  is_main_branch BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for Business Branches
CREATE INDEX IF NOT EXISTS idx_business_branches_business_id ON public.business_branches(business_id);
CREATE INDEX IF NOT EXISTS idx_business_branches_active ON public.business_branches(is_active);

-- Enable RLS for Business Branches
ALTER TABLE public.business_branches ENABLE ROW LEVEL SECURITY;

-- Business Branches Policies
DROP POLICY IF EXISTS "Allow public read active branches" ON public.business_branches;
CREATE POLICY "Allow public read active branches" 
  ON public.business_branches FOR SELECT 
  USING (
    is_active = true 
    AND business_id IN (SELECT id FROM public.businesses WHERE status = 'approved')
  );

DROP POLICY IF EXISTS "Allow merchants & admins to manage business branches" ON public.business_branches;
CREATE POLICY "Allow merchants & admins to manage business branches" 
  ON public.business_branches FOR ALL 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    ) 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );
