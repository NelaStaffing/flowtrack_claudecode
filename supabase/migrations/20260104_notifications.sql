-- ============================================================
-- NOTIFICATIONS SYSTEM MIGRATION
-- ============================================================

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,

  -- Notification Details
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'task_assigned',
    'task_updated',
    'task_completed',
    'task_comment',
    'project_created',
    'project_updated',
    'blocker_created',
    'blocker_resolved',
    'deadline_approaching',
    'team_invite',
    'mention',
    'document_shared'
  )),

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- Related Entities (optional, depending on notification type)
  project_id UUID REFERENCES projects ON DELETE CASCADE,
  task_id UUID REFERENCES tasks ON DELETE CASCADE,
  blocker_id UUID REFERENCES blockers ON DELETE CASCADE,
  document_id UUID REFERENCES knowledge_base ON DELETE CASCADE,

  -- Actor (who triggered the notification)
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL,

  -- Action URL (where to navigate when clicked)
  action_url VARCHAR(500),

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_task_id UUID DEFAULT NULL,
  p_blocker_id UUID DEFAULT NULL,
  p_document_id UUID DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_action_url VARCHAR(500) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    project_id,
    task_id,
    blocker_id,
    document_id,
    actor_id,
    action_url
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_project_id,
    p_task_id,
    p_blocker_id,
    p_document_id,
    p_actor_id,
    p_action_url
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS FOR AUTO-NOTIFICATIONS
-- ============================================================

-- Notify when a task is assigned
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if assigned_to changed and is not null
  IF NEW.assigned_to IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'task_assigned',
      'New task assigned to you',
      'You have been assigned to: ' || NEW.title,
      NEW.project_id,
      NEW.id,
      NULL,
      NULL,
      NEW.created_by,
      '/tasks/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_task_assigned ON tasks;
CREATE TRIGGER trigger_notify_task_assigned
  AFTER INSERT OR UPDATE OF assigned_to ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();

-- Notify when a blocker is created for a project
CREATE OR REPLACE FUNCTION notify_blocker_created()
RETURNS TRIGGER AS $$
DECLARE
  v_project_owner UUID;
BEGIN
  -- Get project owner and notify them
  SELECT created_by INTO v_project_owner
  FROM projects
  WHERE id = NEW.project_id;

  IF v_project_owner IS NOT NULL AND v_project_owner != NEW.created_by THEN
    PERFORM create_notification(
      v_project_owner,
      'blocker_created',
      'New blocker reported',
      'A blocker has been reported on your project: ' || NEW.title,
      NEW.project_id,
      NULL,
      NEW.id,
      NULL,
      NEW.created_by,
      '/blockers'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_blocker_created ON blockers;
CREATE TRIGGER trigger_notify_blocker_created
  AFTER INSERT ON blockers
  FOR EACH ROW
  EXECUTE FUNCTION notify_blocker_created();

-- Notify when a blocker is resolved
CREATE OR REPLACE FUNCTION notify_blocker_resolved()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status changed to resolved
  IF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
    -- Notify the creator of the blocker
    IF NEW.created_by != NEW.owner_id THEN
      PERFORM create_notification(
        NEW.created_by,
        'blocker_resolved',
        'Blocker resolved',
        'Your blocker has been resolved: ' || NEW.title,
        NEW.project_id,
        NULL,
        NEW.id,
        NULL,
        NEW.owner_id,
        '/blockers'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_blocker_resolved ON blockers;
CREATE TRIGGER trigger_notify_blocker_resolved
  AFTER UPDATE OF status ON blockers
  FOR EACH ROW
  EXECUTE FUNCTION notify_blocker_resolved();
