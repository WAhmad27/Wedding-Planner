-- ============================================================
-- Wedding Planner - Phase 3 Schema
-- Run this in the Supabase SQL Editor (after schema_phase2.sql)
-- ============================================================

-- ============================================================
-- 1. Add RSVP token to guests
-- ============================================================
ALTER TABLE guests ADD COLUMN IF NOT EXISTS rsvp_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Backfill existing guests
UPDATE guests SET rsvp_token = gen_random_uuid() WHERE rsvp_token IS NULL;

-- ============================================================
-- 2. Checklist tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'booking', 'paperwork', 'shopping', 'clothing',
    'catering', 'venue', 'photography', 'decor', 'other'
  )),
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Notes
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_notes_updated_at();

-- ============================================================
-- 4. Collaborators
-- ============================================================
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'co-planner' CHECK (role IN ('co-planner', 'vendor', 'view-only')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, invited_email)
);

-- ============================================================
-- 5. Helper: can this user access a wedding?
-- ============================================================
CREATE OR REPLACE FUNCTION can_access_wedding(wid UUID)
RETURNS BOOLEAN AS $$
  SELECT
    EXISTS (SELECT 1 FROM weddings WHERE id = wid AND owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE wedding_id = wid
        AND user_id = auth.uid()
        AND status = 'accepted'
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 6. RLS for new tables
-- ============================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks of their wedding"
  ON tasks FOR ALL USING (can_access_wedding(wedding_id));

CREATE POLICY "Users can manage notes of their wedding"
  ON notes FOR ALL USING (can_access_wedding(wedding_id));

-- Only owners manage collaborators
CREATE POLICY "Owners can manage collaborators"
  ON collaborators FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = collaborators.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Collaborators can see their own invite
CREATE POLICY "Collaborators can view their own invite"
  ON collaborators FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- 7. Update existing RLS policies to allow collaborators
-- ============================================================

-- Events
DROP POLICY IF EXISTS "Users can manage events of their wedding" ON events;
CREATE POLICY "Users can manage events of their wedding"
  ON events FOR ALL USING (can_access_wedding(wedding_id));

-- Guests
DROP POLICY IF EXISTS "Users can manage guests of their wedding" ON guests;
CREATE POLICY "Users can manage guests of their wedding"
  ON guests FOR ALL USING (can_access_wedding(wedding_id));

-- Expenses
DROP POLICY IF EXISTS "Users can manage their wedding expenses" ON expenses;
CREATE POLICY "Users can manage their wedding expenses"
  ON expenses FOR ALL USING (can_access_wedding(wedding_id));

-- Budget
DROP POLICY IF EXISTS "Users can manage their wedding budget" ON budget;
CREATE POLICY "Users can manage their wedding budget"
  ON budget FOR ALL USING (can_access_wedding(wedding_id));

-- Vendors
DROP POLICY IF EXISTS "Users can manage their wedding vendors" ON vendors;
CREATE POLICY "Users can manage their wedding vendors"
  ON vendors FOR ALL USING (can_access_wedding(wedding_id));

-- Guest events
DROP POLICY IF EXISTS "Users can manage guest events of their wedding" ON guest_events;
CREATE POLICY "Users can manage guest events of their wedding"
  ON guest_events FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guests WHERE guests.id = guest_events.guest_id
        AND can_access_wedding(guests.wedding_id)
    )
  );

-- Weddings: collaborators can read (not write) the wedding row
DROP POLICY IF EXISTS "Owners can manage their wedding" ON weddings;
CREATE POLICY "Owners can manage their wedding"
  ON weddings FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Collaborators can view wedding"
  ON weddings FOR SELECT USING (can_access_wedding(id));

-- ============================================================
-- 8. Public RSVP: allow anonymous read/update via token
-- ============================================================
CREATE POLICY "Public RSVP read by token"
  ON guests FOR SELECT USING (rsvp_token IS NOT NULL);

CREATE POLICY "Public RSVP update by token"
  ON guests FOR UPDATE USING (rsvp_token IS NOT NULL)
  WITH CHECK (rsvp_token IS NOT NULL);

-- ============================================================
-- 9. Trigger: auto-link collaborator when invited email signs up
-- ============================================================
CREATE OR REPLACE FUNCTION link_collaborator_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.collaborators
  SET user_id = NEW.id, status = 'accepted'
  WHERE invited_email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_collaborator_signup ON auth.users;
CREATE TRIGGER on_collaborator_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION link_collaborator_on_signup();
