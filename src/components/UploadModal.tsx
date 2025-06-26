import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { readFileAsText } from '../utils/fileUtils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, content: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('text/') && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setError('Please select a text file (.txt, .md, or other plain text files)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const content = await readFileAsText(file);
      const title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      onUpload(title, content);
      onClose();
    } catch (err) {
      setError('Failed to read file. Please try again.');
      console.error('File reading error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="animate-spin mx-auto mb-4">
                <Upload size={48} className="text-blue-500" />
              </div>
            ) : error ? (
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            ) : (
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            )}

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Uploading...' : 'Upload a text file'}
            </h3>

            {error ? (
              <p className="text-red-600 mb-4">{error}</p>
            ) : (
              <p className="text-gray-600 mb-4">
                Drag and drop a file here, or click to select
              </p>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Processing...' : 'Choose File'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Plain text files (.txt)</li>
              <li>Markdown files (.md)</li>
              <li>Other text-based files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};