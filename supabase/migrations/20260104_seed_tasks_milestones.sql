-- ============================================================
-- SEED DATA: Tasks and Milestones for Testing
-- ============================================================
-- This creates sample tasks and milestones for an existing project
-- Update the project_id and user IDs to match your database

-- First, let's get a project ID (replace with your actual project ID)
-- You can find it by running: SELECT id, name FROM projects LIMIT 1;

DO $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_milestone_1 UUID;
  v_milestone_2 UUID;
  v_milestone_3 UUID;
  v_task_1 UUID;
  v_task_2 UUID;
BEGIN
  -- Get the first project (replace with specific project if needed)
  SELECT id INTO v_project_id FROM projects LIMIT 1;

  -- Get the first user (replace with specific user if needed)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Check if we have a project
  IF v_project_id IS NULL THEN
    RAISE NOTICE 'No projects found. Please create a project first.';
    RETURN;
  END IF;

  -- ============================================================
  -- CREATE MILESTONES
  -- ============================================================

  -- Milestone 1: Testing & UAT (Feb 5)
  INSERT INTO milestones (name, description, project_id, due_date, status, created_by)
  VALUES (
    'Testing & UAT',
    'Complete testing and user acceptance testing phase',
    v_project_id,
    '2024-02-05',
    'active',
    v_user_id
  )
  RETURNING id INTO v_milestone_1;

  -- Milestone 2: Form Build Complete (Feb 15)
  INSERT INTO milestones (name, description, project_id, due_date, status, created_by)
  VALUES (
    'Form Build Complete',
    'All forms implemented and validated',
    v_project_id,
    '2024-02-15',
    'active',
    v_user_id
  )
  RETURNING id INTO v_milestone_2;

  -- Milestone 3: Automation Pipeline (Feb 28)
  INSERT INTO milestones (name, description, project_id, due_date, status, created_by)
  VALUES (
    'Automation Pipeline',
    'Complete automation setup with Make.com integration',
    v_project_id,
    '2024-02-28',
    'planning',
    v_user_id
  )
  RETURNING id INTO v_milestone_3;

  RAISE NOTICE 'Created 3 milestones';

  -- ============================================================
  -- CREATE TASKS
  -- ============================================================

  -- Task 1: Finalize form fields (DONE)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_2,
    'Finalize form fields',
    'Complete all form field validations and requirements lock',
    'done',
    'high',
    '2024-01-11',
    3.5,
    ARRAY['forms', 'frontend'],
    v_user_id,
    v_user_id
  )
  RETURNING id INTO v_task_1;

  -- Add subtask to Task 1
  INSERT INTO tasks (
    project_id, parent_task_id, title, status, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_task_1,
    'Add validation rules',
    'done',
    v_user_id,
    v_user_id
  );

  INSERT INTO tasks (
    project_id, parent_task_id, title, status, created_by
  )
  VALUES (
    v_project_id,
    v_task_1,
    'Lock requirements document',
    'done',
    v_user_id
  );

  -- Task 2: Confirm image specs (DONE)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_2,
    'Confirm image specs',
    'Verify image upload specifications and size limits',
    'done',
    'high',
    '2024-01-12',
    2.0,
    ARRAY['design', 'frontend'],
    v_user_id,
    v_user_id
  );

  -- Task 3: Map Airtable schema (DONE)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_3,
    'Map Airtable schema',
    'Create complete schema mapping for Airtable integration',
    'done',
    'medium',
    '2024-01-14',
    4.0,
    ARRAY['integration', 'backend'],
    v_user_id,
    v_user_id
  );

  -- Task 4: Build Tally form (DONE)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_2,
    'Build Tally form',
    'Implement complete Tally form with all fields',
    'done',
    'high',
    '2024-01-17',
    5.0,
    ARRAY['forms', 'frontend'],
    v_user_id,
    v_user_id
  );

  -- Task 5: Add conditional logic (IN PROGRESS)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_2,
    'Add conditional logic',
    'Implement form conditional logic based on user selections',
    'in_progress',
    'high',
    '2024-01-20',
    6.0,
    ARRAY['forms', 'frontend', 'logic'],
    v_user_id,
    v_user_id
  )
  RETURNING id INTO v_task_2;

  -- Add subtasks to conditional logic
  INSERT INTO tasks (
    project_id, parent_task_id, title, status, created_by
  )
  VALUES (
    v_project_id,
    v_task_2,
    'Map field dependencies',
    'in_progress',
    v_user_id
  );

  INSERT INTO tasks (
    project_id, parent_task_id, title, status, created_by
  )
  VALUES (
    v_project_id,
    v_task_2,
    'Test all conditional paths',
    'to_do',
    v_user_id
  );

  -- Task 6: Configure uploads (TO DO)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_2,
    'Configure uploads',
    'Set up file upload handling and storage configuration',
    'to_do',
    'medium',
    '2024-01-21',
    3.0,
    ARRAY['backend', 'storage'],
    v_user_id,
    v_user_id
  );

  -- Task 7: Set up Make.com (TO DO)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by, assigned_to
  )
  VALUES (
    v_project_id,
    v_milestone_3,
    'Set up Make.com',
    'Link automation scenario and configure webhooks',
    'to_do',
    'high',
    '2024-01-25',
    4.5,
    ARRAY['integration', 'automation', 'make'],
    v_user_id,
    v_user_id
  );

  -- Task 8: Configure Cloudinary (TO DO)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by
  )
  VALUES (
    v_project_id,
    v_milestone_3,
    'Configure Cloudinary',
    'Set up Cloudinary for image optimization and CDN',
    'to_do',
    'medium',
    '2024-01-27',
    2.5,
    ARRAY['integration', 'cdn', 'images'],
    v_user_id
  );

  -- Task 9: API integration testing (TO DO)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by
  )
  VALUES (
    v_project_id,
    v_milestone_1,
    'API integration testing',
    'End-to-end testing of all API integrations',
    'to_do',
    'high',
    '2024-02-01',
    8.0,
    ARRAY['testing', 'qa', 'integration'],
    v_user_id
  );

  -- Task 10: Performance optimization (TO DO)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by
  )
  VALUES (
    v_project_id,
    v_milestone_1,
    'Performance optimization',
    'Optimize form loading and submission performance',
    'to_do',
    'medium',
    '2024-02-03',
    5.0,
    ARRAY['performance', 'optimization'],
    v_user_id
  );

  -- Task 11: User documentation (TO DO)
  INSERT INTO tasks (
    project_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by
  )
  VALUES (
    v_project_id,
    'Create user documentation',
    'Write comprehensive user guides and documentation',
    'to_do',
    'low',
    '2024-02-10',
    6.0,
    ARRAY['documentation', 'training'],
    v_user_id
  );

  -- Task 12: Security audit (BLOCKED)
  INSERT INTO tasks (
    project_id, milestone_id, title, description, status, priority,
    due_date, estimated_hours, tags, created_by
  )
  VALUES (
    v_project_id,
    v_milestone_1,
    'Security audit',
    'Complete security review and penetration testing',
    'blocked',
    'high',
    '2024-02-08',
    10.0,
    ARRAY['security', 'testing', 'urgent'],
    v_user_id
  );

  RAISE NOTICE 'Created 12 tasks with various statuses, priorities, and tags';
  RAISE NOTICE 'Project ID: %', v_project_id;
  RAISE NOTICE 'Seed data created successfully!';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating seed data: %', SQLERRM;
END $$;

-- Query to verify the seed data
SELECT
  t.title,
  t.status,
  t.priority,
  t.due_date,
  m.name as milestone,
  COALESCE(array_length(t.tags, 1), 0) as tag_count
FROM tasks t
LEFT JOIN milestones m ON t.milestone_id = m.id
ORDER BY t.due_date NULLS LAST, t.created_at DESC
LIMIT 20;
