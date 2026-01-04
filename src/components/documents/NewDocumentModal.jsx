import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';

const NewDocumentModal = ({ onClose, onDocumentCreated, projects }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    docType: 'standalone',
    title: '',
    projectId: '',
    templateId: '',
    icon: '📄',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabaseHelpers.getDocumentTemplates();
    if (data) {
      setTemplates(data);
    }
  };

  const docTypes = [
    {
      id: 'standalone',
      icon: '📄',
      label: 'Standalone',
      description: 'General document',
    },
    {
      id: 'meeting',
      icon: '📝',
      label: 'Meeting Notes',
      description: 'Meeting documentation',
    },
    {
      id: 'research',
      icon: '🔍',
      label: 'Research',
      description: 'Research compilation',
    },
    {
      id: 'guide',
      icon: '📖',
      label: 'Guide',
      description: 'How-to guide',
    },
  ];

  const handleDocTypeChange = (type) => {
    const selectedType = docTypes.find((t) => t.id === type);
    setFormData({
      ...formData,
      docType: type,
      icon: selectedType?.icon || '📄',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.projectId) {
      alert('Please fill in all required fields');
      return;
    }

    // Get template content if selected
    let templateContent = '';
    let templateMetadata = {};

    if (formData.templateId) {
      const template = templates.find((t) => t.id === formData.templateId);
      if (template) {
        templateContent = template.default_content || '';
        templateMetadata = template.default_metadata || {};
      }
    }

    const newDocument = {
      title: formData.title,
      doc_type: formData.docType,
      icon: formData.icon,
      project_id: formData.projectId,
      content: templateContent,
      metadata: templateMetadata,
      created_by: user.id,
      last_edited_by: user.id,
    };

    const { data, error } = await supabaseHelpers.createDocument(newDocument);

    if (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document');
      return;
    }

    onDocumentCreated(data[0]);
  };

  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Create New Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Document Type
              </label>
              <div className="grid grid-cols-4 gap-3">
                {docTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleDocTypeChange(type.id)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.docType === type.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter document title..."
                required
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={formData.templateId}
                onChange={(e) =>
                  setFormData({ ...formData, templateId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Blank</option>
                {Object.entries(templatesByCategory).map(
                  ([category, categoryTemplates]) => (
                    <optgroup key={category} label={category.toUpperCase()}>
                      {categoryTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.icon} {template.name}
                        </option>
                      ))}
                    </optgroup>
                  )
                )}
              </select>
              {formData.templateId && (
                <p className="text-sm text-gray-500 mt-2">
                  {
                    templates.find((t) => t.id === formData.templateId)
                      ?.description
                  }
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentModal;
