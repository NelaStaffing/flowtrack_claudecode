-- ============================================================
-- TASKS TABLE RLS POLICIES
-- ============================================================

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all tasks
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Users can create tasks
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );

-- Policy: Users can update tasks they created or are assigned to
CREATE POLICY "Users can update their tasks" ON tasks
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (created_by = auth.uid() OR assigned_to = auth.uid())
  );

-- Policy: Users can delete tasks they created
CREATE POLICY "Users can delete their tasks" ON tasks
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );

-- ============================================================
-- MILESTONES TABLE RLS POLICIES (if not already set)
-- ============================================================

-- Enable RLS on milestones table
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all milestones
CREATE POLICY "Users can view all milestones" ON milestones
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Users can create milestones
CREATE POLICY "Users can create milestones" ON milestones
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );

-- Policy: Users can update milestones they created
CREATE POLICY "Users can update their milestones" ON milestones
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );

-- Policy: Users can delete milestones they created
CREATE POLICY "Users can delete their milestones" ON milestones
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );
