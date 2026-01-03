import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ClientDetailDrawer from './ClientDetailDrawer';
import AddClientModal from './AddClientModal';

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabaseHelpers.getClients();
    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  const handleClientCreated = (newClient) => {
    setClients([newClient, ...clients]);
    setShowAddModal(false);
    setSelectedClient(newClient);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    setSelectedClient(updatedClient);
  };

  const handleClientDeleted = (clientId) => {
    setClients(clients.filter((c) => c.id !== clientId));
    setSelectedClient(null);
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesStatus =
      filterStatus === 'all' ||
      client.status === filterStatus;

    const matchesSearch =
      !searchQuery ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
    avgHealthScore: clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + (c.health_score || 0), 0) / clients.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your client relationships and contacts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <span>+</span>
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl">
                🏢
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">
                ✓
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-xs text-gray-600">Active Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                💰
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(stats.totalRevenue / 1000).toFixed(0)}k
                </div>
                <div className="text-xs text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xl">
                ❤️
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgHealthScore}%</div>
                <div className="text-xs text-gray-600">Avg Health Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    filterStatus === 'inactive'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {filteredClients.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first client'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Add Client
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <ClientsGrid clients={filteredClients} onSelectClient={setSelectedClient} />
        ) : (
          <ClientsList clients={filteredClients} onSelectClient={setSelectedClient} />
        )}
      </div>

      {/* Client Detail Drawer */}
      {selectedClient && (
        <ClientDetailDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdate={handleClientUpdated}
          onDelete={handleClientDeleted}
        />
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onClientCreated={handleClientCreated}
        />
      )}
    </div>
  );
}

// Grid View Component
function ClientsGrid({ clients, onSelectClient }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} onClick={() => onSelectClient(client)} />
      ))}
    </div>
  );
}

// Client Card Component
function ClientCard({ client, onClick }) {
  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow text-left w-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${client.logo_color}20` }}
            >
              {client.logo}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              <p className="text-xs text-gray-500">{client.industry}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              client.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {client.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{client.active_projects}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{client.total_projects}</div>
            <div className="text-xs text-gray-600">Projects</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              ${(client.total_revenue / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Health Score</span>
          <span className="text-sm font-semibold text-gray-900">{client.health_score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getHealthColor(client.health_score)}`}
            style={{ width: `${client.health_score}%` }}
          ></div>
        </div>
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {client.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Client since {new Date(client.client_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          <span>Last: {client.last_activity_at ? getRelativeTime(client.last_activity_at) : 'Never'}</span>
        </div>
      </div>
    </button>
  );
}

// List View Component
function ClientsList({ clients, onSelectClient }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Projects
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Health
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${client.logo_color}20` }}
                  >
                    {client.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.industry}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {client.active_projects} / {client.total_projects}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  ${(client.total_revenue / 1000).toFixed(0)}k
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        client.health_score >= 80
                          ? 'bg-green-500'
                          : client.health_score >= 60
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${client.health_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{client.health_score}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {client.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-600">→</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function
function getRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}
