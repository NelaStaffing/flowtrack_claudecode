-- ============================================================
-- Fix Milestone Update RLS Policy
-- ============================================================
-- The previous policy only allowed users to update milestones they created,
-- which prevented team members from editing milestones in their projects.
-- This migration updates the policy to allow any authenticated user to update
-- milestones (similar to how tasks work where assigned users can also update).

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update their milestones" ON milestones;

-- Create a more permissive policy that allows authenticated users to update milestones
-- This matches the tasks table pattern where both creators and assigned users can update
CREATE POLICY "Users can update milestones" ON milestones
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
