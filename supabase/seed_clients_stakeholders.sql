-- ============================================================
-- SAMPLE DATA FOR CLIENTS & STAKEHOLDERS
-- ============================================================
-- NOTE: This will use the current authenticated user's ID as created_by
-- Make sure you're logged in when running this seed file
-- ============================================================

DO $$
DECLARE
  current_user_id UUID := auth.uid();  -- Gets the current user's ID

  -- Client IDs
  acme_id UUID;
  techstart_id UUID;
  global_retail_id UUID;
  healthplus_id UUID;
BEGIN

-- ============================================================
-- INSERT CLIENTS
-- ============================================================

-- 1. Acme Corporation
INSERT INTO clients (
  id, created_by, name, logo, logo_color, industry, website, status,
  address_street, address_city, address_state, address_zip,
  billing_type, billing_currency, tax_id,
  tags, notes,
  total_revenue, total_projects, active_projects, health_score,
  client_since
) VALUES (
  gen_random_uuid(), current_user_id,
  'Acme Corporation', '🏢', '#7C3AED', 'Technology', 'https://acme.example.com', 'active',
  '123 Tech Street', 'San Francisco', 'CA', '94105',
  'Net 30', 'USD', 'TAX-123456',
  ARRAY['Enterprise', 'Tech', 'Priority'],
  'Major enterprise client with ongoing projects',
  45000, 3, 1, 92,
  '2024-01-15'
)
RETURNING id INTO acme_id;

-- 2. TechStart Inc.
INSERT INTO clients (
  id, created_by, name, logo, logo_color, industry, website, status,
  address_city, address_state,
  billing_type, billing_currency,
  tags,
  total_revenue, total_projects, active_projects, health_score,
  client_since
) VALUES (
  gen_random_uuid(), current_user_id,
  'TechStart Inc.', '🚀', '#10B981', 'SaaS', 'https://techstart.io', 'active',
  'Austin', 'TX',
  'Net 15', 'USD',
  ARRAY['Startup', 'Priority'],
  28000, 2, 1, 85,
  '2024-03-20'
)
RETURNING id INTO techstart_id;

-- 3. Global Retail Co.
INSERT INTO clients (
  id, created_by, name, logo, logo_color, industry, website, status,
  address_street, address_city, address_state, address_zip,
  billing_type, billing_currency,
  tags,
  total_revenue, total_projects, active_projects, health_score,
  client_since
) VALUES (
  gen_random_uuid(), current_user_id,
  'Global Retail Co.', '🛒', '#F59E0B', 'E-commerce', 'https://globalretail.com', 'active',
  '456 Commerce Ave', 'New York', 'NY', '10001',
  'Net 45', 'USD',
  ARRAY['Enterprise', 'Long-term'],
  82000, 5, 2, 78,
  '2023-11-10'
)
RETURNING id INTO global_retail_id;

-- 4. HealthPlus Medical
INSERT INTO clients (
  id, created_by, name, logo, logo_color, industry, website, status,
  address_city, address_state,
  billing_type, billing_currency,
  tags,
  total_revenue, total_projects, active_projects, health_score,
  client_since
) VALUES (
  gen_random_uuid(), current_user_id,
  'HealthPlus Medical', '🏥', '#EC4899', 'Healthcare', 'https://healthplus.medical', 'inactive',
  'Boston', 'MA',
  'Net 60', 'USD',
  ARRAY['Healthcare'],
  35000, 2, 0, 65,
  '2023-08-05'
)
RETURNING id INTO healthplus_id;

-- ============================================================
-- INSERT CLIENT CONTACTS
-- ============================================================

-- Acme Corporation - Primary Contact
INSERT INTO client_contacts (client_id, full_name, job_title, email, phone, is_primary) VALUES
(acme_id, 'John Smith', 'CTO', 'john.smith@acme.example.com', '+1 (555) 123-4567', TRUE);

-- TechStart Inc. - Primary Contact
INSERT INTO client_contacts (client_id, full_name, job_title, email, phone, is_primary) VALUES
(techstart_id, 'Emily Davis', 'CEO', 'emily@techstart.io', '+1 (555) 234-5678', TRUE);

-- Global Retail Co. - Primary Contact
INSERT INTO client_contacts (client_id, full_name, job_title, email, phone, is_primary) VALUES
(global_retail_id, 'Maria Garcia', 'Digital Director', 'maria.garcia@globalretail.com', '+1 (555) 345-6789', TRUE);

-- HealthPlus Medical - Primary Contact
INSERT INTO client_contacts (client_id, full_name, job_title, email, phone, is_primary) VALUES
(healthplus_id, 'Dr. James Wilson', 'CMO', 'j.wilson@healthplus.medical', '+1 (555) 456-7890', TRUE);

-- ============================================================
-- INSERT STAKEHOLDERS
-- ============================================================

-- 1. John Smith (Acme - CTO)
INSERT INTO stakeholders (
  created_by, client_id, full_name, avatar_color, job_title, email, phone, timezone,
  preferred_contact, communication_style, best_time_to_reach,
  response_time, avg_response_hours,
  availability, availability_notes, busy_days, preferred_meeting_days, meeting_preference,
  decision_authority, approval_required, approval_areas,
  working_style,
  tags, notes, important_notes,
  total_interactions, meetings_held, avg_meeting_rating,
  last_interaction_at
) VALUES (
  current_user_id, acme_id,
  'John Smith', '#7C3AED', 'CTO', 'john.smith@acme.example.com', '+1 (555) 123-4567', 'PST (UTC-8)',
  'slack', 'direct', '10am - 4pm PST',
  'fast', 1.5,
  'high', 'Very responsive on Slack. Avoid Mondays (all-day meetings)', ARRAY['Monday'], ARRAY['Tuesday', 'Wednesday', 'Thursday'], '30min',
  'high', TRUE, ARRAY['Technical decisions', 'Architecture', 'Budget over $10k'],
  '{"needsContext": false, "prefersAsync": true, "detailOriented": false, "quickDecisions": true}',
  ARRAY['Quick decisions', 'Prefers async', 'Detail oriented'],
  'Prefers Slack threads over email. Always come prepared with options, not problems.',
  ARRAY['Always come prepared with options, not just problems', 'Prefers Slack threads over email chains', 'Book meetings at least 2 days in advance'],
  47, 12, 4.5,
  NOW() - INTERVAL '2 hours'
);

-- 2. Sarah Johnson (Acme - PM)
INSERT INTO stakeholders (
  created_by, client_id, full_name, avatar_color, job_title, email, phone, timezone,
  preferred_contact, communication_style, best_time_to_reach,
  response_time, avg_response_hours,
  availability, busy_days, preferred_meeting_days, meeting_preference,
  decision_authority,
  working_style,
  tags,
  total_interactions, meetings_held, avg_meeting_rating,
  last_interaction_at
) VALUES (
  current_user_id, acme_id,
  'Sarah Johnson', '#3B82F6', 'Project Manager', 'sarah.j@acme.example.com', '+1 (555) 123-4568', 'EST (UTC-5)',
  'email', 'detailed', '9am - 5pm EST',
  'moderate', 8,
  'moderate', ARRAY['Friday'], ARRAY['Monday', 'Tuesday', 'Wednesday'], '45min',
  'medium',
  '{"needsContext": true, "prefersAsync": false, "detailOriented": true, "quickDecisions": false}',
  ARRAY['Needs context', 'Detail oriented'],
  35, 8, 4.2,
  NOW() - INTERVAL '1 day'
);

-- 3. Emily Davis (TechStart - CEO)
INSERT INTO stakeholders (
  created_by, client_id, full_name, avatar_color, job_title, email, phone, timezone,
  preferred_contact, communication_style, best_time_to_reach,
  response_time, avg_response_hours,
  availability, availability_notes, busy_days, preferred_meeting_days, meeting_preference,
  decision_authority, approval_required,
  working_style,
  tags,
  total_interactions, meetings_held, avg_meeting_rating,
  last_interaction_at
) VALUES (
  current_user_id, techstart_id,
  'Emily Davis', '#10B981', 'CEO', 'emily@techstart.io', '+1 (555) 234-5678', 'CST (UTC-6)',
  'video', 'direct', '2pm - 6pm CST',
  'fast', 2,
  'limited', 'Very busy, prefers video calls for important decisions', ARRAY['Monday', 'Friday'], ARRAY['Tuesday', 'Thursday'], '30min',
  'high', TRUE,
  '{"needsContext": false, "prefersAsync": false, "detailOriented": false, "quickDecisions": true}',
  ARRAY['Quick decisions', 'Visual learner'],
  23, 15, 4.8,
  NOW() - INTERVAL '3 hours'
);

-- 4. Maria Garcia (Global Retail - Digital Director)
INSERT INTO stakeholders (
  created_by, client_id, full_name, avatar_color, job_title, email, phone, timezone,
  preferred_contact, communication_style, best_time_to_reach,
  response_time, avg_response_hours,
  availability, availability_notes, busy_days, preferred_meeting_days, meeting_preference,
  decision_authority,
  working_style,
  tags, important_notes,
  total_interactions, meetings_held, avg_meeting_rating,
  last_interaction_at
) VALUES (
  current_user_id, global_retail_id,
  'Maria Garcia', '#F59E0B', 'Digital Director', 'maria.garcia@globalretail.com', '+1 (555) 345-6789', 'EST (UTC-5)',
  'email', 'formal', 'Afternoons only',
  'slow', 36,
  'very-limited', 'Very limited availability. Requires formal communication.', ARRAY['Monday', 'Tuesday', 'Friday'], ARRAY['Wednesday'], '1hour',
  'medium',
  '{"needsContext": true, "prefersAsync": true, "detailOriented": true, "quickDecisions": false}',
  ARRAY['Formal communication', 'Needs context'],
  ARRAY['Requires formal email communication only', 'CC her assistant on all correspondence', 'Needs 1 week notice for meetings'],
  28, 6, 3.8,
  NOW() - INTERVAL '2 days'
);

-- 5. Mike Chen (Acme - Engineering Lead)
INSERT INTO stakeholders (
  created_by, client_id, full_name, avatar_color, job_title, email, phone, timezone,
  preferred_contact, communication_style, best_time_to_reach,
  response_time, avg_response_hours,
  availability, preferred_meeting_days, meeting_preference,
  decision_authority,
  working_style,
  tags,
  total_interactions, meetings_held, avg_meeting_rating,
  last_interaction_at
) VALUES (
  current_user_id, acme_id,
  'Mike Chen', '#06B6D4', 'Engineering Lead', 'mike.chen@acme.example.com', '+1 (555) 123-4569', 'PST (UTC-8)',
  'slack', 'direct', 'Anytime',
  'fast', 0.5,
  'high', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '15min',
  'low',
  '{"needsContext": false, "prefersAsync": true, "detailOriented": false, "quickDecisions": true}',
  ARRAY['Quick decisions', 'Technical expert'],
  62, 18, 4.6,
  NOW() - INTERVAL '30 minutes'
);

-- ============================================================
-- INSERT SAMPLE STAKEHOLDER INTERACTIONS
-- ============================================================

-- Sample interactions for John Smith
INSERT INTO stakeholder_interactions (stakeholder_id, interaction_type, title, duration_minutes, rating, interaction_date)
SELECT s.id, 'meeting', 'Requirements Review Call', 30, 5, NOW() - INTERVAL '2 hours'
FROM stakeholders s WHERE s.full_name = 'John Smith';

INSERT INTO stakeholder_interactions (stakeholder_id, interaction_type, title, interaction_date)
SELECT s.id, 'email', 'Follow-up on timeline changes', NOW() - INTERVAL '1 day'
FROM stakeholders s WHERE s.full_name = 'John Smith';

INSERT INTO stakeholder_interactions (stakeholder_id, interaction_type, title, interaction_date)
SELECT s.id, 'slack', 'Quick question about API specs', NOW() - INTERVAL '2 days'
FROM stakeholders s WHERE s.full_name = 'John Smith';

INSERT INTO stakeholder_interactions (stakeholder_id, interaction_type, title, duration_minutes, rating, interaction_date)
SELECT s.id, 'meeting', 'Sprint Planning', 45, 4, NOW() - INTERVAL '1 week'
FROM stakeholders s WHERE s.full_name = 'John Smith';

END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- After running this seed file, verify with these queries:

-- SELECT * FROM clients ORDER BY name;
-- SELECT * FROM stakeholders ORDER BY full_name;
-- SELECT * FROM client_contacts;
-- SELECT * FROM stakeholder_interactions ORDER BY interaction_date DESC;
