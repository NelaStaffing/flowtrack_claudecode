-- ============================================================
-- ADD created_by COLUMNS TO TASKS AND MILESTONES
-- ============================================================

-- Add created_by to tasks table if not exists
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users ON DELETE SET NULL;

-- Add created_by to milestones table if not exists
ALTER TABLE milestones
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_milestones_created_by ON milestones(created_by);

-- Add comments
COMMENT ON COLUMN tasks.created_by IS 'User who created this task';
COMMENT ON COLUMN milestones.created_by IS 'User who created this milestone';
