import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';

const TaskDocEditor = ({ document, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [title, setTitle] = useState(document.title || '');
  const [content, setContent] = useState(document.content || '');
  const [metadata, setMetadata] = useState(document.metadata || {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, metadata]);

  const handleAutoSave = async () => {
    if (!document.id) return;

    setIsSaving(true);
    const updates = {
      title,
      content,
      metadata,
      last_edited_by: user.id,
    };

    const { error } = await supabaseHelpers.updateDocument(document.id, updates);

    if (!error) {
      setLastSaved(new Date());
      onUpdate();
    }
    setIsSaving(false);
  };

  const handleManualSave = async () => {
    await handleAutoSave();
  };

  // Research management
  const addResearch = (research) => {
    const newResearch = {
      id: crypto.randomUUID(),
      ...research,
      addedAt: new Date().toISOString(),
    };

    setMetadata((prev) => ({
      ...prev,
      research: [...(prev.research || []), newResearch],
    }));
  };

  const deleteResearch = (id) => {
    setMetadata((prev) => ({
      ...prev,
      research: (prev.research || []).filter((item) => item.id !== id),
    }));
  };

  // Checklist management
  const addChecklistItem = (text) => {
    const newItem = {
      id: crypto.randomUUID(),
      text,
      done: false,
    };

    setMetadata((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem],
    }));
  };

  const toggleChecklistItem = (id) => {
    setMetadata((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const deleteChecklistItem = (id) => {
    setMetadata((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((item) => item.id !== id),
    }));
  };

  const research = metadata.research || [];
  const checklist = metadata.checklist || [];

  const hasNotes = content && content.trim().length > 0;
  const researchCount = research.length;
  const checklistCompleted = checklist.filter((item) => item.done).length;
  const checklistTotal = checklist.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{document.icon || '📄'}</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-xl font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 px-0"
                placeholder="Untitled Document"
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          {document.task_id && (
            <p className="text-sm text-gray-500 ml-11">
              Linked to: {document.projects?.name} › Task
            </p>
          )}
          <div className="flex items-center justify-between ml-11 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving && <span>Saving...</span>}
              {!isSaving && lastSaved && (
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> Auto-saved
                </span>
              )}
            </div>
            <button
              onClick={handleManualSave}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 px-6 pt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'notes'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Notes {hasNotes && <span className="ml-1">•</span>}
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'research'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 Research {researchCount > 0 && `(${researchCount})`}
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'checklist'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ☑ Checklist{' '}
            {checklistTotal > 0 && `(${checklistCompleted}/${checklistTotal})`}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'notes' && (
            <NotesTab content={content} setContent={setContent} />
          )}
          {activeTab === 'research' && (
            <ResearchTab
              research={research}
              onAddResearch={addResearch}
              onDeleteResearch={deleteResearch}
            />
          )}
          {activeTab === 'checklist' && (
            <ChecklistTab
              checklist={checklist}
              onAddItem={addChecklistItem}
              onToggleItem={toggleChecklistItem}
              onDeleteItem={deleteChecklistItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Notes Tab Component
const NotesTab = ({ content, setContent }) => {
  const textareaRef = useRef(null);

  const applyFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'h1':
        newText = `# ${selectedText}`;
        break;
      case 'h2':
        newText = `## ${selectedText}`;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
  };

  const insertTemplate = (template) => {
    const templates = {
      meeting: `## Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n\n### Discussion\n- \n\n### Action Items\n- [ ] \n`,
      decision: `## Decision\n\n**Context:**\n\n**Options:**\n1. \n2. \n\n**Chosen:**\n\n**Rationale:**\n`,
      feedback: `## Client Feedback\n\n**Date:** ${new Date().toLocaleDateString()}\n**Client:** \n\n**Feedback:**\n- \n\n**Action Items:**\n- \n`,
      bug: `## Bug Report\n\n**Description:**\n\n**Steps to Reproduce:**\n1. \n2. \n\n**Expected:**\n\n**Actual:**\n`,
      observations: `## Observations\n\n**Date:** ${new Date().toLocaleDateString()}\n\n**What I noticed:**\n- \n\n**Questions:**\n- \n`,
    };

    setContent(content + '\n\n' + templates[template]);
  };

  return (
    <div className="space-y-4">
      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyFormatting('bold')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => applyFormatting('h1')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => applyFormatting('h2')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => applyFormatting('code')}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 font-mono"
            title="Code"
          >
            {'</>'}
          </button>
        </div>
        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1">
          ✨ AI Assist
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
        placeholder="Start typing your notes here..."
      />

      {/* Quick Templates */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Quick Templates:
        </p>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'meeting', label: '📝 Meeting Notes' },
            { id: 'decision', label: '🏗️ Technical Decision' },
            { id: 'feedback', label: '💬 Client Feedback' },
            { id: 'bug', label: '🐛 Bug Report' },
            { id: 'observations', label: '👁 Observations' },
          ].map((template) => (
            <button
              key={template.id}
              onClick={() => insertTemplate(template.id)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Character Count */}
      <div className="text-right text-xs text-gray-500">
        {content.length} characters
      </div>
    </div>
  );
};

// Research Tab Component
const ResearchTab = ({ research, onAddResearch, onDeleteResearch }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAddResearch(formData);
    setFormData({ title: '', url: '', notes: '' });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffDays = Math.floor((now - then) / 86400000);

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Add Research Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Add Research</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Research item title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="2"
              placeholder="Additional notes about this resource..."
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add Research
          </button>
        </form>
      </div>

      {/* Research Items */}
      {research.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Saved Research ({research.length})
          </h3>
          {research.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg">🔗</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline break-all"
                      >
                        {item.url}
                      </a>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Added {getRelativeTime(item.addedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteResearch(item.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            No research added yet
          </h3>
          <p className="text-sm text-gray-500">
            Add links, resources, and references
          </p>
        </div>
      )}
    </div>
  );
};

// Checklist Tab Component
const ChecklistTab = ({ checklist, onAddItem, onToggleItem, onDeleteItem }) => {
  const [newItemText, setNewItemText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    onAddItem(newItemText);
    setNewItemText('');
  };

  const completed = checklist.filter((item) => item.done).length;
  const total = checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completed} of {total} complete
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      {checklist.length > 0 ? (
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggleItem(item.id)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span
                className={`flex-1 ${
                  item.done
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">☑</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            No checklist items yet
          </h3>
          <p className="text-sm text-gray-500">
            Add items to track documentation progress
          </p>
        </div>
      )}

      {/* Add Item Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="+ Add checklist item..."
        />
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default TaskDocEditor;
