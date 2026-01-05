import React, { useState, useRef } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const FileUploadModal = ({ projectId, onClose, onFileUploaded }) => {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('requirements');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'meetings', label: 'Meetings', icon: '📅' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null,
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
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
      csv: '📊',
      xlsx: '📊',
      fig: '🎨',
    };
    return icons[ext] || '📄';
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    const uploadPromises = files.map(async (fileItem) => {
      if (fileItem.status !== 'pending') return;

      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        // Upload file
        const { data, error } = await supabaseHelpers.uploadFile(
          projectId,
          fileItem.file,
          category
        );

        if (error) throw error;

        // Update status to success
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f
        ));

        // Notify parent component
        if (onFileUploaded && data) {
          onFileUploaded(data);
        }

        return { success: true, data };
      } catch (error) {
        console.error('Upload error:', error);

        // Update status to error
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id
            ? { ...f, status: 'error', error: error.message || 'Upload failed' }
            : f
        ));

        return { success: false, error };
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);

    // Check if all uploads were successful
    const allSuccess = files.every(f => f.status === 'success' || f.status === 'error');
    if (allSuccess) {
      const hasErrors = files.some(f => f.status === 'error');
      if (!hasErrors) {
        // All successful, close modal
        setTimeout(() => onClose(), 1000);
      }
    }
  };

  const hasFiles = files.length > 0;
  const hasErrors = files.some(f => f.status === 'error');
  const allUploaded = files.length > 0 && files.every(f => f.status === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Upload Files</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select files or drag and drop them here
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  disabled={uploading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    category === cat.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Area */}
          {!hasFiles && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-6xl mb-4">📤</div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: PDF, DOC, images, archives, and more
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* File List */}
          {hasFiles && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Files to upload ({files.length})
                </h4>
                {!uploading && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Add more
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    fileItem.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : fileItem.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* File Icon */}
                  <div className="text-3xl">{getFileIcon(fileItem.name)}</div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileItem.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.size)}
                    </p>

                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {fileItem.status === 'error' && fileItem.error && (
                      <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileItem.status === 'pending' && !uploading && (
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    )}
                    {fileItem.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {fileItem.status === 'success' && (
                      <span className="text-green-600 text-xl">✓</span>
                    )}
                    {fileItem.status === 'error' && (
                      <span className="text-red-600 text-xl">✕</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allUploaded ? 'Close' : 'Cancel'}
          </button>

          {hasFiles && !allUploaded && (
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Upload {files.length} {files.length === 1 ? 'File' : 'Files'}</span>
                </>
              )}
            </button>
          )}

          {hasErrors && (
            <button
              onClick={uploadFiles}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Retry Failed Uploads
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
