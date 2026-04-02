-- ============================================================
-- Wedding Planner - Phase 2 Schema
-- Run this in the Supabase SQL Editor (after schema.sql)
-- ============================================================

-- Budget (one per wedding)
CREATE TABLE IF NOT EXISTS budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'venue', 'catering', 'decoration', 'photography',
    'clothing', 'jewelry', 'transport', 'entertainment', 'other'
  )),
  description TEXT NOT NULL,
  vendor_name TEXT,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  expense_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'venue', 'catering', 'decoration', 'photography',
    'clothing', 'jewelry', 'transport', 'entertainment', 'other'
  )),
  phone TEXT,
  email TEXT,
  service_description TEXT,
  total_cost NUMERIC(12, 2),
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their wedding budget"
  ON budget FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can manage their wedding expenses"
  ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = expenses.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can manage their wedding vendors"
  ON vendors FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = vendors.wedding_id AND weddings.owner_id = auth.uid())
  );
