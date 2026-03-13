-- Table: scandent_payments
-- Stores all payment records from Flow.cl for server-side premium verification.
-- Created: 2026-03-13

CREATE TABLE IF NOT EXISTS scandent_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_order    TEXT NOT NULL UNIQUE,
  flow_order        TEXT,
  amount            INTEGER NOT NULL,
  email             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  plan              TEXT,
  token             TEXT,
  flow_raw          JSONB,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup by commerce_order (used by verify-payment)
CREATE INDEX IF NOT EXISTS idx_scandent_payments_commerce_order
  ON scandent_payments (commerce_order);

-- Index for dashboard queries by email
CREATE INDEX IF NOT EXISTS idx_scandent_payments_email
  ON scandent_payments (email);

-- RLS: Enable row-level security
ALTER TABLE scandent_payments ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (Edge Functions use service role key)
-- No anon or authenticated read — payments are private
CREATE POLICY "service_role_all" ON scandent_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE scandent_payments IS
  'SCANDENT payment records from Flow.cl. Used for server-side premium verification.';
