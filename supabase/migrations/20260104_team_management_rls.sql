-- Enable RLS on team management tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON invitations;

-- ============================================================
-- USER_PROFILES POLICIES
-- ============================================================

-- Anyone can view all user profiles (for team member lists, etc.)
CREATE POLICY "Anyone can view all profiles" ON user_profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-create user profile on signup (INSERT policy)
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- INVITATIONS POLICIES
-- ============================================================

-- All authenticated users can view invitations (needed to see pending invites)
CREATE POLICY "Authenticated users can view invitations" ON invitations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- All authenticated users can create invitations (we'll check admin in application)
-- This is a temporary policy - in production you'd want stricter RLS
CREATE POLICY "Authenticated users can create invitations" ON invitations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    invited_by = auth.uid()
  );

-- All authenticated users can update invitations (for resend/revoke)
CREATE POLICY "Authenticated users can update invitations" ON invitations
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- All authenticated users can delete invitations
CREATE POLICY "Authenticated users can delete invitations" ON invitations
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
