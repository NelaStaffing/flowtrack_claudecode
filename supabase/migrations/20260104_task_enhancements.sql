-- ============================================================
-- TASK TABLE ENHANCEMENTS
-- Add fields needed for AI task wizard
-- ============================================================

-- Add estimated_hours column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);

-- Add tags array column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add parent_task_id for subtasks (if not exists)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Add index for parent_task_id
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Add index for tags (for searching)
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Comment on columns
COMMENT ON COLUMN tasks.estimated_hours IS 'Estimated hours to complete the task';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN tasks.parent_task_id IS 'Reference to parent task if this is a subtask';
