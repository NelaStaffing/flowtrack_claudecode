-- ============================================================
-- FIX TASK STATUS CONSTRAINT
-- Update to accept common status values
-- ============================================================

-- Drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add new constraint with proper status values
-- Using underscores to match common conventions: to_do, in_progress, done, blocked, cancelled
ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('to_do', 'in_progress', 'done', 'blocked', 'cancelled', 'on_hold'));

-- Add comment explaining valid values
COMMENT ON COLUMN tasks.status IS 'Task status: to_do, in_progress, done, blocked, cancelled, on_hold';
