-- ============================================================
-- SEED SYSTEM DOCUMENT TEMPLATES
-- ============================================================

-- Delete existing system templates to avoid duplicates
DELETE FROM document_templates WHERE is_system = TRUE;

-- Insert system templates
INSERT INTO document_templates (name, description, icon, category, is_system, default_content) VALUES
('Meeting Notes', 'Capture meeting outcomes and action items', '📝', 'meeting', TRUE,
'## Meeting Notes

**Date:** [Date]
**Attendees:** [Names]

### Agenda
-

### Discussion Points
-

### Decisions Made
-

### Action Items
- [ ]

### Next Steps
- '),

('Technical Decision Record', 'Document architecture and technical decisions', '🏗️', 'technical', TRUE,
'## Technical Decision Record

**Decision:** [Brief description]
**Date:** [Date]
**Status:** Proposed | Accepted | Deprecated

### Context
[What is the issue that we''re seeing that motivates this decision?]

### Options Considered
1. **Option A:**
2. **Option B:**
3. **Option C:**

### Decision
[What is the change that we''re proposing and/or doing?]

### Consequences
[What becomes easier or more difficult to do because of this change?]'),

('Research Summary', 'Compile research findings and sources', '🔍', 'research', TRUE,
'## Research Summary

**Topic:** [Research topic]
**Date:** [Date]

### Objective
[What are we trying to learn or solve?]

### Key Findings
1.
2.
3.

### Sources
-

### Recommendations
-

### Open Questions
- '),

('Project Kickoff', 'Start projects with clear goals and scope', '🚀', 'project', TRUE,
'## Project Kickoff

**Project:** [Name]
**Client:** [Client name]
**Start Date:** [Date]

### Project Overview
[Brief description of the project]

### Goals & Objectives
1.
2.
3.

### Scope
**In Scope:**
-

**Out of Scope:**
-

### Key Stakeholders
| Name | Role | Contact |
|------|------|---------|
| | | |

### Timeline
- **Phase 1:**
- **Phase 2:**
- **Launch:**

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| | | |'),

('Client Requirements', 'Gather and track client needs and specs', '📋', 'requirements', TRUE,
'## Client Requirements

**Project:** [Name]
**Client:** [Client name]
**Last Updated:** [Date]

### Functional Requirements
- [ ]
- [ ]
- [ ]

### Non-Functional Requirements
- [ ] Performance:
- [ ] Security:
- [ ] Accessibility:

### User Stories
**As a** [user type]
**I want to** [action]
**So that** [benefit]

### Acceptance Criteria
- [ ]
- [ ]

### Open Questions
- '),

('Bug Investigation', 'Track bug research, reproduction, and fixes', '🐛', 'bug', TRUE,
'## Bug Investigation

**Bug ID:** [ID]
**Reported:** [Date]
**Severity:** Low | Medium | High | Critical

### Description
[What is happening?]

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
[What should happen?]

### Actual Behavior
[What is happening instead?]

### Environment
- Browser:
- OS:
- Version:

### Investigation Notes
-

### Root Cause
[What is causing this?]

### Fix
[How was it fixed?]');
