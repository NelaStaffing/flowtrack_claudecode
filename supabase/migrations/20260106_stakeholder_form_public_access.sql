-- Add RLS policy to allow public stakeholder creation from form invitations
-- This allows unauthenticated users to create stakeholder profiles when filling out the invitation form

-- Allow public insertion of stakeholders when created_by is NULL (from public form)
CREATE POLICY "Public can create stakeholders from form invitations"
  ON stakeholders
  FOR INSERT
  WITH CHECK (created_by IS NULL);

-- Also need to allow public client creation for the same reason
CREATE POLICY "Public can create clients from stakeholder forms"
  ON clients
  FOR INSERT
  WITH CHECK (created_by IS NULL);
