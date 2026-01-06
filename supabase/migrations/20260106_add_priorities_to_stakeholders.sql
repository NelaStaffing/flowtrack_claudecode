-- Add priorities column to stakeholders table
-- This stores the stakeholder's primary concerns and priorities for AI insights

ALTER TABLE stakeholders
ADD COLUMN IF NOT EXISTS priorities TEXT;

COMMENT ON COLUMN stakeholders.priorities IS 'Stakeholder primary concerns and priorities (e.g., timeline adherence, budget control, quality standards)';
