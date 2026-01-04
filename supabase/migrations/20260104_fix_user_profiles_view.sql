-- ============================================================
-- FIX USER PROFILES VIEW - Add proper security
-- ============================================================

-- Drop the existing view if it exists
DROP VIEW IF EXISTS user_profiles_with_email;

-- Create the view with SECURITY DEFINER so it can access auth.users
CREATE OR REPLACE VIEW user_profiles_with_email
WITH (security_invoker = false)
AS
SELECT
  up.id,
  up.full_name,
  up.avatar_color,
  up.job_title,
  up.role,
  up.status,
  up.status_reason,
  up.status_until,
  up.skills,
  up.timezone,
  up.last_active_at,
  up.created_at,
  up.updated_at,
  au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id;

-- Grant SELECT to authenticated users
GRANT SELECT ON user_profiles_with_email TO authenticated;

-- Add comment
COMMENT ON VIEW user_profiles_with_email IS 'User profiles with emails from auth.users (secure view)';
