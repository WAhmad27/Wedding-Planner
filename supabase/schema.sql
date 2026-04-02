-- ============================================================
-- Wedding Planner - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weddings
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Wedding',
  bride_name TEXT,
  groom_name TEXT,
  wedding_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mehndi', 'nikkah', 'barat', 'walima', 'other')),
  name TEXT NOT NULL,
  date DATE,
  time TIME,
  venue TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  side TEXT NOT NULL DEFAULT 'mutual' CHECK (side IN ('bride', 'groom', 'mutual')),
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest ↔ Event assignments
CREATE TABLE IF NOT EXISTS guest_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  table_number INTEGER,
  UNIQUE(guest_id, event_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Weddings: owner only
CREATE POLICY "Owners can manage their wedding"
  ON weddings FOR ALL USING (auth.uid() = owner_id);

-- Events: via wedding ownership
CREATE POLICY "Users can manage events of their wedding"
  ON events FOR ALL USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = events.wedding_id
        AND weddings.owner_id = auth.uid()
    )
  );

-- Guests: via wedding ownership
CREATE POLICY "Users can manage guests of their wedding"
  ON guests FOR ALL USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
        AND weddings.owner_id = auth.uid()
    )
  );

-- Guest events: via guest → wedding ownership
CREATE POLICY "Users can manage guest events of their wedding"
  ON guest_events FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guests
      JOIN weddings ON weddings.id = guests.wedding_id
      WHERE guests.id = guest_events.guest_id
        AND weddings.owner_id = auth.uid()
    )
  );

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
