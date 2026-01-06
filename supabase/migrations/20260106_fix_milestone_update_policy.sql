-- ============================================================
-- Fix Milestone Update RLS Policy
-- ============================================================
-- The previous policy only allowed users to update milestones they created.
-- This migration updates the policy with role-based access control:
-- - Admins can update any milestone
-- - Regular users can only update milestones they created

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update their milestones" ON milestones;

-- Create role-based policy for milestone updates
CREATE POLICY "Users can update milestones" ON milestones
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      -- Admins can update any milestone
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
      OR
      -- Regular users can only update milestones they created
      created_by = auth.uid()
    )
  );
