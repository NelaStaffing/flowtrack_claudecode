import React, { useState } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const BlockerDetailDrawer = ({ blocker, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: blocker.title || '',
    description: blocker.description || '',
    severity: blocker.severity || 'medium',
    source: blocker.source || 'other',
    impact: blocker.impact || '',
    status: blocker.status || 'active',
    resolution: blocker.resolution || '',
  });

  const handleSave = async () => {
    const updates = {
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      source: formData.source,
      impact: formData.impact,
      status: formData.status,
      resolution: formData.resolution,
    };

    const { error } = await supabaseHelpers.updateBlocker(blocker.id, updates);

    if (error) {
      console.error('Error updating blocker:', error);
      alert('Failed to update blocker');
      return;
    }

    setIsEditing(false);
    onUpdate();
  };

  const handleResolve = async () => {
    if (!formData.resolution.trim()) {
      alert('Please provide a resolution description');
      return;
    }

    const updates = {
      status: 'resolved',
      resolution: formData.resolution,
      resolved_at: new Date().toISOString(),
    };

    const { error } = await supabaseHelpers.updateBlocker(blocker.id, updates);

    if (error) {
      console.error('Error resolving blocker:', error);
      alert('Failed to resolve blocker');
      return;
    }

    onUpdate();
    onClose();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-emerald-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getAge = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const sourceTypes = [
    { value: 'client-dependency', label: 'Client dependency' },
    { value: 'technical-issue', label: 'Technical issue' },
    { value: 'resource-constraint', label: 'Resource constraint' },
    { value: 'external-dependency', label: 'External dependency' },
    { value: 'unclear-requirements', label: 'Unclear requirements' },
    { value: 'integration-setup', label: 'Integration setup' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-[700px] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full text-xl font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">
                  {blocker.title}
                </h2>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span
                  className={`${getSeverityColor(
                    formData.severity
                  )} w-2 h-2 rounded-full`}
                />
                <span>{blocker.projects?.name}</span>
                <span>•</span>
                <span>{formData.source.replace('-', ' ')}</span>
                <span>•</span>
                <span>{getAge(blocker.created_at)} old</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl ml-4"
            >
              ✕
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Edit
                </button>
                {formData.status === 'active' && (
                  <button
                    onClick={() => {
                      // Show resolution section
                      document.getElementById('resolution-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Mark as Resolved
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            {isEditing ? (
              <div className="flex gap-3">
                {['high', 'medium', 'low'].map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setFormData({ ...formData, severity })}
                    className={`px-4 py-2 border-2 rounded-lg capitalize ${
                      formData.severity === severity
                        ? severity === 'high'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : severity === 'medium'
                          ? 'border-amber-600 bg-amber-50 text-amber-700'
                          : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-lg capitalize font-medium ${
                  formData.severity === 'high'
                    ? 'bg-red-100 text-red-700'
                    : formData.severity === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {formData.severity}
              </span>
            )}
          </div>

          {/* Blocker Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blocker Source
            </label>
            {isEditing ? (
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {sourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">
                {sourceTypes.find((t) => t.value === formData.source)
                  ?.label || formData.source}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="4"
              />
            ) : (
              <p className="text-gray-900">
                {formData.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Impact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-900">
                {formData.impact || 'No impact specified'}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <span
              className={`inline-block px-3 py-1 rounded-lg font-medium ${
                formData.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {formData.status === 'resolved' ? 'Resolved' : 'Active'}
            </span>
          </div>

          {/* Resolution Section */}
          {formData.status === 'active' && (
            <div id="resolution-section" className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-900 mb-3">
                Resolve Blocker
              </h3>
              <textarea
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg mb-3"
                rows="3"
                placeholder="Describe how this blocker was resolved..."
              />
              <button
                onClick={handleResolve}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirm Resolution
              </button>
            </div>
          )}

          {/* Resolution (if resolved) */}
          {formData.status === 'resolved' && formData.resolution && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-gray-900">{formData.resolution}</p>
                {blocker.resolved_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Resolved on {new Date(blocker.resolved_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(blocker.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">
                  {new Date(blocker.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockerDetailDrawer;
