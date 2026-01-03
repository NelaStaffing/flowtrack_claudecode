-- ============================================================
-- CLIENTS & STAKEHOLDERS MIGRATION
-- Created: 2026-01-02
-- Description: Tables for managing clients and stakeholders
-- ============================================================

-- ============================================================
-- CLIENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(10) DEFAULT '🏢',
  logo_color VARCHAR(20) DEFAULT '#7C3AED',
  industry VARCHAR(100),
  website VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- Address
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_zip VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'USA',

  -- Billing
  billing_type VARCHAR(50) DEFAULT 'Net 30',
  billing_currency VARCHAR(10) DEFAULT 'USD',
  tax_id VARCHAR(100),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Cached Stats
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 100,

  -- Timestamps
  client_since DATE DEFAULT CURRENT_DATE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ============================================================
-- STAKEHOLDERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Basic Info
  full_name VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(20) DEFAULT '#7C3AED',
  job_title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  timezone VARCHAR(50) DEFAULT 'EST (UTC-5)',
  status VARCHAR(20) DEFAULT 'active',

  -- Communication Preferences
  preferred_contact VARCHAR(20) DEFAULT 'email',
  communication_style VARCHAR(20) DEFAULT 'direct',
  best_time_to_reach VARCHAR(100),
  response_time VARCHAR(20) DEFAULT 'moderate',
  avg_response_hours DECIMAL(5, 2) DEFAULT 24,

  -- Availability
  availability VARCHAR(20) DEFAULT 'moderate',
  availability_notes TEXT,
  busy_days TEXT[] DEFAULT '{}',
  preferred_meeting_days TEXT[] DEFAULT '{}',
  meeting_preference VARCHAR(20) DEFAULT '30min',

  -- Decision Making
  decision_authority VARCHAR(20) DEFAULT 'medium',
  approval_required BOOLEAN DEFAULT FALSE,
  approval_areas TEXT[] DEFAULT '{}',
  escalation_contact VARCHAR(255),

  -- Working Style (JSONB)
  working_style JSONB DEFAULT '{
    "needsContext": false,
    "prefersAsync": false,
    "detailOriented": false,
    "quickDecisions": false
  }',

  -- Stats
  total_interactions INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  avg_meeting_rating DECIMAL(3, 2) DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  important_notes TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholders_org_id ON stakeholders(org_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_client_id ON stakeholders(client_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_availability ON stakeholders(availability);
CREATE INDEX IF NOT EXISTS idx_stakeholders_response_time ON stakeholders(response_time);
CREATE INDEX IF NOT EXISTS idx_stakeholders_decision_authority ON stakeholders(decision_authority);

-- ============================================================
-- STAKEHOLDER INTERACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS stakeholder_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  user_id UUID,
  project_id UUID,

  -- Interaction Details
  interaction_type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Timestamps
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholder_interactions_stakeholder_id ON stakeholder_interactions(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_interactions_date ON stakeholder_interactions(interaction_date DESC);

-- ============================================================
-- CLIENT CONTACTS TABLE (simple contacts without full profile)
-- ============================================================

CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  full_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),

  is_primary BOOLEAN DEFAULT FALSE,
  is_billing_contact BOOLEAN DEFAULT FALSE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);

-- Only one primary contact per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_contacts_unique_primary
  ON client_contacts(client_id)
  WHERE is_primary = TRUE;

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON stakeholders;
CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_contacts_updated_at ON client_contacts;
CREATE TRIGGER update_client_contacts_updated_at
  BEFORE UPDATE ON client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- UPDATE STAKEHOLDER STATS AFTER INTERACTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_stakeholder_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stakeholders
  SET
    total_interactions = (SELECT COUNT(*) FROM stakeholder_interactions WHERE stakeholder_id = NEW.stakeholder_id),
    meetings_held = (SELECT COUNT(*) FROM stakeholder_interactions WHERE stakeholder_id = NEW.stakeholder_id AND interaction_type = 'meeting'),
    avg_meeting_rating = (SELECT COALESCE(AVG(rating), 0) FROM stakeholder_interactions WHERE stakeholder_id = NEW.stakeholder_id AND rating IS NOT NULL),
    last_interaction_at = NEW.interaction_date
  WHERE id = NEW.stakeholder_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_interaction_insert ON stakeholder_interactions;
CREATE TRIGGER after_interaction_insert
  AFTER INSERT ON stakeholder_interactions
  FOR EACH ROW EXECUTE FUNCTION update_stakeholder_stats();

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (Basic - you may need to adjust based on your auth setup)
-- ============================================================

-- Clients policies (assuming users have org_id in their JWT)
DROP POLICY IF EXISTS "Users can view clients in their org" ON clients;
CREATE POLICY "Users can view clients in their org" ON clients
  FOR SELECT USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can insert clients in their org" ON clients;
CREATE POLICY "Users can insert clients in their org" ON clients
  FOR INSERT WITH CHECK (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can update clients in their org" ON clients;
CREATE POLICY "Users can update clients in their org" ON clients
  FOR UPDATE USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can delete clients in their org" ON clients;
CREATE POLICY "Users can delete clients in their org" ON clients
  FOR DELETE USING (true);  -- Update with proper auth check

-- Stakeholders policies
DROP POLICY IF EXISTS "Users can view stakeholders in their org" ON stakeholders;
CREATE POLICY "Users can view stakeholders in their org" ON stakeholders
  FOR SELECT USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can insert stakeholders in their org" ON stakeholders;
CREATE POLICY "Users can insert stakeholders in their org" ON stakeholders
  FOR INSERT WITH CHECK (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can update stakeholders in their org" ON stakeholders;
CREATE POLICY "Users can update stakeholders in their org" ON stakeholders
  FOR UPDATE USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can delete stakeholders in their org" ON stakeholders;
CREATE POLICY "Users can delete stakeholders in their org" ON stakeholders
  FOR DELETE USING (true);  -- Update with proper auth check

-- Stakeholder Interactions policies
DROP POLICY IF EXISTS "Users can view interactions" ON stakeholder_interactions;
CREATE POLICY "Users can view interactions" ON stakeholder_interactions
  FOR SELECT USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can insert interactions" ON stakeholder_interactions;
CREATE POLICY "Users can insert interactions" ON stakeholder_interactions
  FOR INSERT WITH CHECK (true);  -- Update with proper auth check

-- Client Contacts policies
DROP POLICY IF EXISTS "Users can view client contacts" ON client_contacts;
CREATE POLICY "Users can view client contacts" ON client_contacts
  FOR SELECT USING (true);  -- Update with proper auth check

DROP POLICY IF EXISTS "Users can manage client contacts" ON client_contacts;
CREATE POLICY "Users can manage client contacts" ON client_contacts
  FOR ALL USING (true);  -- Update with proper auth check
