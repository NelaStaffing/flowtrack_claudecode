import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

export default function ClientDetailDrawer({ client, onClose, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(client);

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContacts();
    }
  }, [activeTab, client.id]);

  const loadContacts = async () => {
    const { data } = await supabaseHelpers.getClientContacts(client.id);
    if (data) setContacts(data);
  };

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabaseHelpers.updateClient(client.id, formData);
    if (!error && data) {
      onUpdate(data[0]);
      setEditMode(false);
    }
    setLoading(false);
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this client?')) return;
    const { data, error } = await supabaseHelpers.updateClient(client.id, { status: 'archived' });
    if (!error) {
      onDelete(client.id);
    }
  };

  const tabs = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'contacts', label: '👥 Contacts' },
    { id: 'projects', label: '📁 Projects' },
    { id: 'billing', label: '💳 Billing' },
    { id: 'notes', label: '📝 Notes' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-[700px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${client.logo_color}20` }}
              >
                {client.logo}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                <p className="text-gray-600">
                  {client.industry} · Client since {new Date(client.client_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {client.status}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab client={client} />}
          {activeTab === 'contacts' && <ContactsTab contacts={contacts} onRefresh={loadContacts} clientId={client.id} />}
          {activeTab === 'projects' && <ProjectsTab client={client} />}
          {activeTab === 'billing' && <BillingTab client={client} />}
          {activeTab === 'notes' && <NotesTab client={client} onUpdate={onUpdate} />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleArchive}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            🗑 Archive Client
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ client }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{client.total_projects}</div>
          <div className="text-xs text-gray-600">Projects</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{client.active_projects}</div>
          <div className="text-xs text-gray-600">Active</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">${(client.total_revenue / 1000).toFixed(0)}k</div>
          <div className="text-xs text-gray-600">Revenue</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{client.health_score}%</div>
          <div className="text-xs text-gray-600">Health</div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="space-y-3">
          {client.website && (
            <div>
              <div className="text-xs text-gray-500">Website</div>
              <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                {client.website}
              </a>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500">Industry</div>
            <div className="text-gray-900">{client.industry || 'Not specified'}</div>
          </div>
          {client.address_street && (
            <div>
              <div className="text-xs text-gray-500">Address</div>
              <div className="text-gray-900">
                {client.address_street}<br />
                {client.address_city}, {client.address_state} {client.address_zip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsTab({ contacts, onRefresh, clientId }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Contacts ({contacts.length})</h3>
        <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
          + Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contacts yet
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                    {contact.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{contact.full_name}</span>
                      {contact.is_primary && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{contact.job_title}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-purple-600">📧</button>
                  <button className="text-gray-400 hover:text-purple-600">📞</button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">{contact.email}</div>
                <div className="text-gray-600">{contact.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ client }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Projects ({client.total_projects})</h3>
        <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
          + New Project
        </button>
      </div>
      <div className="text-center py-8 text-gray-500">
        Projects feature coming soon
      </div>
    </div>
  );
}

function BillingTab({ client }) {
  return (
    <div className="space-y-6">
      {/* Billing Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Billing Information</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500">Payment Terms</div>
            <div className="text-gray-900">{client.billing_type || 'Net 30'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Currency</div>
            <div className="text-gray-900">{client.billing_currency || 'USD'}</div>
          </div>
          {client.tax_id && (
            <div>
              <div className="text-xs text-gray-500">Tax ID</div>
              <div className="text-gray-900">{client.tax_id}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500">Total Billed</div>
            <div className="text-gray-900 font-semibold">${client.total_revenue?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesTab({ client, onUpdate }) {
  const [notes, setNotes] = useState(client.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { data } = await supabaseHelpers.updateClient(client.id, { notes });
    if (data) {
      onUpdate(data[0]);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this client..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Notes'}
      </button>
    </div>
  );
}
