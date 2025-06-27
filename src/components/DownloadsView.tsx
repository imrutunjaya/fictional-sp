import React, { useState } from 'react';
import { 
  Download, 
  Star, 
  Search,
  Folder,
  ArrowLeft
} from 'lucide-react';
import { Note, ReadingSettings } from '../types';
import { downloadNote } from '../utils/fileUtils';

interface DownloadsViewProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onDownloadNote: (note: Note) => void;
  onToggleStar: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  settings: ReadingSettings;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  notes,
  onSelectNote,
  onDownloadNote,
  onToggleStar,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  settings,
}) => {
  const [downloadingNotes, setDownloadingNotes] = useState<Set<string>>(new Set());

  const handleDownload = async (note: Note, format: 'txt' | 'md' | 'json' | 'pdf') => {
    setDownloadingNotes(prev => new Set([...prev, note.id]));
    
    // Simulate download delay
    setTimeout(() => {
      downloadNote(note, format);
      setDownloadingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.id);
        return newSet;
      });
    }, 1000);
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900',
  };

  return (
    <div className={`flex-1 ${themeClasses[settings.theme]} transition-colors duration-200`}>
      {/* Header */}
      <div className="sticky top-0 border-b border-opacity-20 backdrop-blur-sm bg-opacity-90 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 
            className="text-3xl font-bold"
            style={{ 
              fontSize: `${settings.fontSize + 12}px`,
              fontFamily: settings.fontFamily 
            }}
          >
            Downloads
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white bg-opacity-50"
              style={{ 
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily 
              }}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white bg-opacity-50"
            style={{ 
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily 
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-6">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <Download size={64} className="mx-auto mb-4 opacity-30" />
            <h3 
              className="text-xl font-medium mb-2 opacity-70"
              style={{ 
                fontSize: `${settings.fontSize + 4}px`,
                fontFamily: settings.fontFamily 
              }}
            >
              {searchQuery ? 'No notes found' : 'No notes to download'}
            </h3>
            <p 
              className="opacity-50"
              style={{ 
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily 
              }}
            >
              {searchQuery ? 'Try adjusting your search terms' : 'Create some notes first'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white bg-opacity-50 border border-gray-200 border-opacity-30 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleStar(note.id)}
                      className={`p-1 rounded transition-colors ${
                        note.isStarred 
                          ? 'text-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star size={18} className={note.isStarred ? 'fill-current' : ''} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold truncate"
                        style={{ 
                          fontSize: `${settings.fontSize + 1}px`,
                          fontFamily: settings.fontFamily 
                        }}
                      >
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Folder size={14} className="opacity-50" />
                        <span 
                          className="text-sm opacity-70"
                          style={{ fontFamily: settings.fontFamily }}
                        >
                          {note.category}
                        </span>
                        <span className="text-sm opacity-50">•</span>
                        <span 
                          className="text-sm opacity-50"
                          style={{ fontFamily: settings.fontFamily }}
                        >
                          {note.content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {downloadingNotes.has(note.id) ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span 
                          className="text-sm"
                          style={{ fontFamily: settings.fontFamily }}
                        >
                          Downloading...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(note, 'md')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          style={{ 
                            fontSize: `${settings.fontSize - 2}px`,
                            fontFamily: settings.fontFamily 
                          }}
                        >
                          <Download size={14} />
                          MD
                        </button>
                        <button
                          onClick={() => handleDownload(note, 'txt')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          style={{ 
                            fontSize: `${settings.fontSize - 2}px`,
                            fontFamily: settings.fontFamily 
                          }}
                        >
                          <Download size={14} />
                          TXT
                        </button>
                        <button
                          onClick={() => handleDownload(note, 'json')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          style={{ 
                            fontSize: `${settings.fontSize - 2}px`,
                            fontFamily: settings.fontFamily 
                          }}
                        >
                          <Download size={14} />
                          JSON
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};