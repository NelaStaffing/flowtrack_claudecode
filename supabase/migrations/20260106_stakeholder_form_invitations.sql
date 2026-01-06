-- Create stakeholder_form_invitations table
-- This table stores invitations sent to stakeholders to fill out their own information

CREATE TABLE IF NOT EXISTS stakeholder_form_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT now(),
  submitted_at timestamp with time zone,
  stakeholder_id uuid REFERENCES stakeholders(id) ON DELETE SET NULL,

  -- Ensure unique pending invitations per email
  CONSTRAINT unique_pending_email UNIQUE (email)
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_stakeholder_invitations_token ON stakeholder_form_invitations(token);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_stakeholder_invitations_email ON stakeholder_form_invitations(email);

-- Create index for project_id lookups
CREATE INDEX IF NOT EXISTS idx_stakeholder_invitations_project ON stakeholder_form_invitations(project_id);

-- Enable Row Level Security
ALTER TABLE stakeholder_form_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they created
CREATE POLICY "Users can view their own stakeholder invitations"
  ON stakeholder_form_invitations
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can create invitations
CREATE POLICY "Users can create stakeholder invitations"
  ON stakeholder_form_invitations
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Public access to view invitation by token (for form page)
CREATE POLICY "Anyone can view invitation by valid token"
  ON stakeholder_form_invitations
  FOR SELECT
  USING (
    token IS NOT NULL
    AND expires_at > now()
    AND submitted_at IS NULL
  );

-- Policy: Public can update invitation when submitting form
CREATE POLICY "Anyone can submit invitation form"
  ON stakeholder_form_invitations
  FOR UPDATE
  USING (
    token IS NOT NULL
    AND expires_at > now()
    AND submitted_at IS NULL
  )
  WITH CHECK (
    submitted_at IS NOT NULL
    AND stakeholder_id IS NOT NULL
  );

-- Add comment
COMMENT ON TABLE stakeholder_form_invitations IS 'Stores stakeholder form invitations sent via email. Recipients fill out a form that auto-creates their stakeholder profile.';
