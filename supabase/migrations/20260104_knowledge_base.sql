-- ============================================================
-- KNOWLEDGE BASE (DOCUMENTS) MIGRATION
-- ============================================================

-- ============================================================
-- KNOWLEDGE BASE TABLE (Documents)
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- NULL for standalone docs

  -- Content
  title VARCHAR(500) NOT NULL,
  content TEXT, -- Markdown/HTML content for notes
  doc_type VARCHAR(50) DEFAULT 'standalone', -- 'task-doc', 'standalone', 'meeting', 'research', 'guide'
  icon VARCHAR(10) DEFAULT '📄',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- Stores research items, checklist, etc.

  -- Authorship
  last_edited_by UUID REFERENCES auth.users,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_by ON knowledge_base(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_project ON knowledge_base(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_task ON knowledge_base(task_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON knowledge_base(doc_type);

-- Full text search on title and content
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- ============================================================
-- DOCUMENT TEMPLATES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users, -- NULL for system templates

  -- Template Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📄',
  category VARCHAR(50), -- 'meeting', 'technical', 'research', 'project', 'bug'

  -- Template Content
  default_content TEXT, -- Pre-filled content structure
  default_metadata JSONB DEFAULT '{}', -- Pre-filled checklist, etc.

  -- Flags
  is_system BOOLEAN DEFAULT FALSE, -- System templates vs user-created
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON document_templates(created_by);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Knowledge Base Policies
DROP POLICY IF EXISTS "Users can view their own documents" ON knowledge_base;
CREATE POLICY "Users can view their own documents"
  ON knowledge_base FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create documents" ON knowledge_base;
CREATE POLICY "Users can create documents"
  ON knowledge_base FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own documents" ON knowledge_base;
CREATE POLICY "Users can update their own documents"
  ON knowledge_base FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own documents" ON knowledge_base;
CREATE POLICY "Users can delete their own documents"
  ON knowledge_base FOR DELETE
  USING (created_by = auth.uid());

-- Document Templates Policies (system templates are readable by all)
DROP POLICY IF EXISTS "Users can view templates" ON document_templates;
CREATE POLICY "Users can view templates"
  ON document_templates FOR SELECT
  USING (is_system = true OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create their own templates" ON document_templates;
CREATE POLICY "Users can create their own templates"
  ON document_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own templates" ON document_templates;
CREATE POLICY "Users can update their own templates"
  ON document_templates FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own templates" ON document_templates;
CREATE POLICY "Users can delete their own templates"
  ON document_templates FOR DELETE
  USING (created_by = auth.uid());
