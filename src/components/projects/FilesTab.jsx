import React, { useState, useMemo } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import FileUploadModal from './FileUploadModal';

const FilesTab = ({ projectId, files = [], onFileUploaded, onFileDeleted }) => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Categories
  const categories = [
    { id: 'all', label: 'All Files', icon: '📁' },
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'meetings', label: 'Meetings', icon: '📅' },
  ];

  // Filter files by category
  const filteredFiles = selectedCategory === 'all'
    ? files
    : files.filter(f => f.category === selectedCategory);

  // Group files by folder
  const folders = useMemo(() => {
    const folderMap = new Map();
    files.forEach(file => {
      const folder = file.category || 'uncategorized';
      if (!folderMap.has(folder)) {
        folderMap.set(folder, []);
      }
      folderMap.get(folder).push(file);
    });
    return Array.from(folderMap.entries()).map(([name, items]) => ({
      name,
      count: items.length,
      icon: categories.find(c => c.id === name)?.icon || '📁',
    }));
  }, [files]);

  // Calculate storage stats
  const storageStats = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
    const byType = {
      documents: 0,
      images: 0,
      archives: 0,
      other: 0,
    };

    files.forEach(file => {
      const ext = file.title?.split('.').pop()?.toLowerCase();
      if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
        byType.documents += file.file_size || 0;
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        byType.images += file.file_size || 0;
      } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        byType.archives += file.file_size || 0;
      } else {
        byType.other += file.file_size || 0;
      }
    });

    return { total: totalSize, byType };
  }, [files]);

  // Recent uploads (last 4)
  const recentUploads = useMemo(() => {
    return [...files]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [files]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getFileIcon = (fileTitle) => {
    const ext = fileTitle?.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: '📕',
      doc: '📘',
      docx: '📘',
      txt: '📄',
      md: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      svg: '🖼️',
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      csv: '📊',
      xlsx: '📊',
      xls: '📊',
      fig: '🎨',
      psd: '🎨',
    };
    return icons[ext] || '📄';
  };

  const getFileColor = (fileTitle) => {
    const ext = fileTitle?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'bg-red-50';
    if (['doc', 'docx'].includes(ext)) return 'bg-blue-50';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'bg-blue-100';
    if (['zip', 'rar', '7z'].includes(ext)) return 'bg-yellow-50';
    if (['fig', 'psd'].includes(ext)) return 'bg-purple-50';
    if (['csv', 'xlsx'].includes(ext)) return 'bg-green-50';
    return 'bg-gray-50';
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* View Toggle and Filters */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ▦ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ☰ List
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>📤</span>
            <span>Upload Files</span>
          </button>
        </div>

        {/* Folders Section */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
            <div className="grid grid-cols-4 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.name}
                  onClick={() => setSelectedCategory(folder.name)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-xl">
                      {folder.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">{folder.name}</h4>
                      <p className="text-sm text-gray-500">{folder.count} files</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Files</h3>
            <span className="text-sm text-gray-500">{filteredFiles.length} files</span>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
              <p className="text-gray-500 mb-4">
                {selectedCategory === 'all'
                  ? 'Upload your first file to get started'
                  : `No ${selectedCategory} files uploaded yet`}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upload Files
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* File Preview */}
                  <div className={`h-32 flex items-center justify-center ${getFileColor(file.title)}`}>
                    <div className="text-5xl">{getFileIcon(file.title)}</div>
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 truncate mb-2">{file.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(file.created_at)}</span>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${getFileColor(file.title)}`}>
                    <span className="text-xl">{getFileIcon(file.title)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{file.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(file.created_at)}</p>
                  </div>
                  <span className="text-sm text-gray-500">{formatFileSize(file.file_size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* Storage Used */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Storage Used</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatFileSize(storageStats.total)}
                </span>
                <span className="text-sm text-gray-500">of 1 GB</span>
                <span className="text-sm text-purple-600 font-medium ml-auto">
                  {((storageStats.total / (1024 * 1024 * 1024)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((storageStats.total / (1024 * 1024 * 1024)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Documents</span>
                </div>
                <span className="font-medium text-gray-900">{formatFileSize(storageStats.byType.documents)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-600">Images</span>
                </div>
                <span className="font-medium text-gray-900">{formatFileSize(storageStats.byType.images)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-gray-600">Archives</span>
                </div>
                <span className="font-medium text-gray-900">{formatFileSize(storageStats.byType.archives)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Uploads</h3>
          <div className="space-y-3">
            {recentUploads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No uploads yet</p>
            ) : (
              recentUploads.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${getFileColor(file.title)}`}>
                    <span className="text-sm">{getFileIcon(file.title)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(file.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-lg">📤</span>
              <span>Upload Files</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-lg">📁</span>
              <span>Create Folder</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-lg">🔗</span>
              <span>Link from Drive</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-lg">⬇️</span>
              <span>Download All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          projectId={projectId}
          onClose={() => setShowUploadModal(false)}
          onFileUploaded={onFileUploaded}
        />
      )}
    </div>
  );
};

export default FilesTab;
