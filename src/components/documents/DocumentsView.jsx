import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import TaskDocEditor from './TaskDocEditor';
import NewDocumentModal from './NewDocumentModal';

const DocumentsView = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, recent, my-docs, templates
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [docsResult, projectsResult] = await Promise.all([
      supabaseHelpers.getDocuments(),
      supabaseHelpers.getProjects(),
    ]);

    console.log('Documents result:', docsResult);
    console.log('Projects result:', projectsResult);

    if (docsResult.data) setDocuments(docsResult.data);
    if (projectsResult.data) setProjects(projectsResult.data);
    setLoading(false);
  };

  const handleDocumentCreated = async (newDoc) => {
    await loadData();
    setShowNewDocModal(false);
    // Open the new document in the editor
    setSelectedDoc(newDoc);
    setShowEditor(true);
  };

  const handleDocumentUpdated = async () => {
    await loadData();
  };

  const handleOpenDocument = (doc) => {
    setSelectedDoc(doc);
    setShowEditor(true);
  };

  // Filter documents based on active tab
  const getFilteredDocuments = () => {
    let filtered = documents;

    // Apply tab filter
    switch (filterTab) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(
          (doc) => new Date(doc.created_at) >= oneWeekAgo
        );
        break;
      case 'my-docs':
        filtered = filtered.filter((doc) => doc.created_by === user?.id);
        break;
      case 'templates':
        // Templates are handled separately
        return [];
      default:
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredDocuments = getFilteredDocuments();

  // Calculate stats
  const stats = {
    total: documents.length,
    thisWeek: documents.filter((doc) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(doc.created_at) >= oneWeekAgo;
    }).length,
    completed: documents.filter((doc) => {
      const checklist = doc.metadata?.checklist || [];
      if (checklist.length === 0) return false;
      return checklist.every((item) => item.done);
    }).length,
    withResearch: documents.filter(
      (doc) => doc.metadata?.research && doc.metadata.research.length > 0
    ).length,
  };

  // Group documents by project for sidebar
  const documentsByProject = projects.map((project) => ({
    ...project,
    count: documents.filter((doc) => doc.project_id === project.id).length,
  }));

  // Recent updates
  const recentUpdates = [...documents]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 4);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📄</div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          </div>
          <button
            onClick={() => setShowNewDocModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            + New Document
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'recent', 'my-docs', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTab === tab
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'all' && 'All'}
                {tab === 'recent' && 'Recent'}
                {tab === 'my-docs' && 'My Docs'}
                {tab === 'templates' && 'Templates'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon="📄" value={stats.total} label="Total Documents" />
          <StatCard icon="📝" value={stats.thisWeek} label="Created This Week" />
          <StatCard icon="✓" value={stats.completed} label="Completed" />
          <StatCard icon="🔍" value={stats.withResearch} label="With Research" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Main Content Area (2/3 width) */}
          <div className="col-span-8 overflow-y-auto">
            {filterTab === 'templates' ? (
              <TemplatesGrid />
            ) : (
              <DocumentsList
                documents={filteredDocuments}
                onOpenDocument={handleOpenDocument}
                loading={loading}
              />
            )}
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="col-span-4 space-y-4 overflow-y-auto">
            <ProjectsPanel projects={documentsByProject} />
            <QuickStartPanel onUseTemplate={() => setShowNewDocModal(true)} />
            <RecentUpdatesPanel
              documents={recentUpdates}
              onOpenDocument={handleOpenDocument}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewDocModal && (
        <NewDocumentModal
          onClose={() => setShowNewDocModal(false)}
          onDocumentCreated={handleDocumentCreated}
          projects={projects}
        />
      )}

      {showEditor && selectedDoc && (
        <TaskDocEditor
          document={selectedDoc}
          onClose={() => {
            setShowEditor(false);
            setSelectedDoc(null);
          }}
          onUpdate={handleDocumentUpdated}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  </div>
);

// Documents List Component
const DocumentsList = ({ documents, onOpenDocument, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-500">
            Create your first document to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onClick={() => onOpenDocument(doc)}
        />
      ))}
    </div>
  );
};

// Document Card Component
const DocumentCard = ({ document, onClick }) => {
  const getDocTypeIcon = (type) => {
    const icons = {
      'task-doc': '📋',
      standalone: '📄',
      meeting: '📝',
      research: '🔍',
      guide: '📖',
    };
    return icons[type] || '📄';
  };

  const hasNotes = document.content && document.content.trim().length > 0;
  const researchCount = document.metadata?.research?.length || 0;
  const checklistItems = document.metadata?.checklist || [];
  const checklistCompleted = checklistItems.filter((item) => item.done).length;
  const checklistTotal = checklistItems.length;

  const isInProgress =
    checklistTotal > 0 && checklistCompleted < checklistTotal;

  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">{document.icon || getDocTypeIcon(document.doc_type)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-500">
              {document.projects?.name}
              {document.task_id && ' › Task'}
            </p>
          </div>
        </div>
        {isInProgress && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
            In Progress
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {hasNotes && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
              📝 Notes
            </span>
          )}
          {researchCount > 0 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
              🔍 {researchCount}
            </span>
          )}
          {checklistTotal > 0 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
              ☑ {checklistCompleted}/{checklistTotal}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          Updated {getRelativeTime(document.updated_at)}
        </span>
      </div>
    </div>
  );
};

// Templates Grid Component
const TemplatesGrid = () => {
  const templates = [
    {
      icon: '📝',
      name: 'Meeting Notes',
      description: 'Capture meeting outcomes and action items',
    },
    {
      icon: '🏗️',
      name: 'Technical Decision',
      description: 'Document architecture and technical decisions',
    },
    {
      icon: '🔍',
      name: 'Research Summary',
      description: 'Compile research findings and sources',
    },
    {
      icon: '🚀',
      name: 'Project Kickoff',
      description: 'Start projects with clear goals and scope',
    },
    {
      icon: '📋',
      name: 'Client Requirements',
      description: 'Gather and track client needs and specs',
    },
    {
      icon: '🐛',
      name: 'Bug Investigation',
      description: 'Track bug research, reproduction, and fixes',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.name}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-4xl mb-3 text-center">{template.icon}</div>
          <h3 className="font-semibold text-gray-900 text-center mb-2">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            {template.description}
          </p>
          <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium">
            Use Template
          </button>
        </div>
      ))}
    </div>
  );
};

// Projects Panel Component
const ProjectsPanel = ({ projects }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <h3 className="font-semibold text-gray-900 mb-3">By Project</h3>
    <div className="space-y-2">
      {projects.slice(0, 5).map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{project.icon}</span>
            <span className="text-sm text-gray-700">{project.name}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.count}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Quick Start Panel Component
const QuickStartPanel = ({ onUseTemplate }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <h3 className="font-semibold text-gray-900 mb-3">Quick Start</h3>
    <div className="space-y-2">
      {['📝 Meeting Notes', '🏗️ Technical Decision', '🔍 Research Summary'].map(
        (template) => (
          <button
            key={template}
            onClick={onUseTemplate}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
          >
            {template}
          </button>
        )
      )}
      <button
        onClick={onUseTemplate}
        className="w-full text-center px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded font-medium"
      >
        View All Templates
      </button>
    </div>
  </div>
);

// Recent Updates Panel Component
const RecentUpdatesPanel = ({ documents, onOpenDocument }) => {
  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffHours = Math.floor((now - then) / 3600000);
    const diffDays = Math.floor((now - then) / 86400000);

    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Recent Updates</h3>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onOpenDocument(doc)}
            className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm">{doc.icon}</span>
              <span className="text-sm text-gray-700 truncate">
                {truncate(doc.title, 20)}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {getRelativeTime(doc.updated_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;
