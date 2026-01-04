-- ============================================================
-- USER PROFILES VIEW WITH EMAIL
-- Creates a view that safely exposes user emails with profiles
-- ============================================================

-- Create a view that joins user_profiles with auth.users (server-side)
CREATE OR REPLACE VIEW user_profiles_with_email AS
SELECT
  up.*,
  au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id;

-- Grant access to the view
GRANT SELECT ON user_profiles_with_email TO authenticated;

-- Enable RLS on the view
ALTER VIEW user_profiles_with_email SET (security_invoker = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view all profiles with email" ON user_profiles_with_email
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
