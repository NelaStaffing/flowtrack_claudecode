import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';

const ReportBlockerModal = ({ onClose, onBlockerCreated, projects }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    severity: 'medium',
    blockerType: 'client-dependency',
    impact: '',
  });

  const blockerTypes = [
    { value: 'client-dependency', label: 'Client dependency' },
    { value: 'technical-issue', label: 'Technical issue' },
    { value: 'resource-constraint', label: 'Resource constraint' },
    { value: 'external-dependency', label: 'External dependency' },
    { value: 'unclear-requirements', label: 'Unclear requirements' },
    { value: 'integration-setup', label: 'Integration setup' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.projectId) {
      alert('Please fill in all required fields');
      return;
    }

    const newBlocker = {
      title: formData.title,
      description: formData.description,
      project_id: formData.projectId,
      severity: formData.severity,
      blocker_type: formData.blockerType,
      impact: formData.impact,
      status: 'active',
      created_by: user.id,
      blocking_task_count: 0,
    };

    const { error } = await supabaseHelpers.createBlocker(newBlocker);

    if (error) {
      console.error('Error creating blocker:', error);
      alert('Failed to create blocker');
      return;
    }

    onBlockerCreated();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Report Blocker</h2>
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
                placeholder="e.g., Waiting on API credentials from client"
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
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Blocker Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blocker Type
              </label>
              <select
                value={formData.blockerType}
                onChange={(e) =>
                  setFormData({ ...formData, blockerType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {blockerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Severity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['high', 'medium', 'low'].map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity })}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.severity === severity
                        ? severity === 'high'
                          ? 'border-red-600 bg-red-50'
                          : severity === 'medium'
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                        severity === 'high'
                          ? 'bg-red-500'
                          : severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {severity}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Provide details about the blocker..."
              />
            </div>

            {/* Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact
              </label>
              <input
                type="text"
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Blocking Automation Pipeline milestone"
              />
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
            Report Blocker
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportBlockerModal;
