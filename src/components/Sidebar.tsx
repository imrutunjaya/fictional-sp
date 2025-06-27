import React from 'react';
import { 
  Search, 
  Plus, 
  Star, 
  Folder, 
  Settings, 
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  File
} from 'lucide-react';
import { Note, ReadingSettings } from '../types';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpload: () => void;
  onDownloadAll: () => void;
  onSettings: () => void;
  onShowDownloadsList: () => void;
  readingSettings: ReadingSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  collapsed,
  onToggleCollapse,
  onUpload,
  onDownloadAll,
  onSettings,
  onShowDownloadsList,
  readingSettings,
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const themeClasses = {
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-800 text-gray-100 border-gray-700',
    sepia: 'bg-amber-50 text-amber-900 border-amber-200',
  };

  const sidebarTheme = themeClasses[readingSettings.theme];

  return (
    <div className={`${sidebarTheme} border-r flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-opacity-20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <h1 
                className="text-xl font-semibold"
                style={{ 
                  fontSize: `${readingSettings.fontSize + 4}px`,
                  fontFamily: readingSettings.fontFamily 
                }}
              >
                Notes
              </h1>
              <button
                onClick={onShowDownloadsList}
                className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
                title="Downloads"
              >
                <Download size={18} />
              </button>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        {!collapsed && (
          <>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white bg-opacity-50"
                style={{ 
                  fontSize: `${readingSettings.fontSize - 2}px`,
                  fontFamily: readingSettings.fontFamily 
                }}
              />
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={onCreateNote}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                style={{ 
                  fontSize: `${readingSettings.fontSize - 2}px`,
                  fontFamily: readingSettings.fontFamily 
                }}
              >
                <Plus size={16} />
                New Note
              </button>
              <button
                onClick={onUpload}
                className="p-2 bg-gray-200 bg-opacity-50 hover:bg-gray-300 hover:bg-opacity-50 rounded-lg transition-colors"
                title="Upload File"
              >
                <Upload size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Categories */}
      {!collapsed && (
        <div className="p-4 border-b border-opacity-20">
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 bg-opacity-50 text-blue-700'
                    : 'hover:bg-gray-200 hover:bg-opacity-20'
                }`}
                style={{ 
                  fontSize: `${readingSettings.fontSize - 2}px`,
                  fontFamily: readingSettings.fontFamily 
                }}
              >
                {category === 'All' && <Folder size={16} />}
                {category === 'Starred' && <Star size={16} />}
                {category !== 'All' && category !== 'Starred' && <Folder size={16} />}
                <span className="font-medium">{category}</span>
                <span className="ml-auto text-sm opacity-70">
                  {category === 'All' ? notes.length : 
                   category === 'Starred' ? notes.filter(n => n.isStarred).length :
                   notes.filter(n => n.category === category).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {collapsed ? (
          <div className="p-2 space-y-2">
            {notes.slice(0, 10).map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full p-2 rounded-lg transition-colors ${
                  selectedNoteId === note.id
                    ? 'bg-blue-100 bg-opacity-50'
                    : 'hover:bg-gray-200 hover:bg-opacity-20'
                }`}
                title={note.title}
              >
                <File size={20} />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedNoteId === note.id
                    ? 'bg-blue-100 bg-opacity-50 border-blue-200 border-opacity-50'
                    : 'hover:bg-gray-100 hover:bg-opacity-20 border-transparent'
                } border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium truncate"
                      style={{ 
                        fontSize: `${readingSettings.fontSize}px`,
                        fontFamily: readingSettings.fontFamily 
                      }}
                    >
                      {note.title}
                    </h3>
                    <p 
                      className="opacity-70 mt-1 line-clamp-2"
                      style={{ 
                        fontSize: `${readingSettings.fontSize - 2}px`,
                        fontFamily: readingSettings.fontFamily,
                        lineHeight: readingSettings.lineHeight 
                      }}
                    >
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span 
                        className="text-xs opacity-50"
                        style={{ fontFamily: readingSettings.fontFamily }}
                      >
                        {formatDate(note.updatedAt)}
                      </span>
                      {note.isStarred && (
                        <Star size={12} className="text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {notes.length === 0 && (
              <div className="text-center py-8 opacity-50">
                <File size={48} className="mx-auto mb-4 opacity-30" />
                <p style={{ fontFamily: readingSettings.fontFamily }}>No notes found</p>
                <p 
                  className="text-sm"
                  style={{ fontFamily: readingSettings.fontFamily }}
                >
                  Create your first note to get started
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-opacity-20">
          <div className="flex gap-2">
            <button
              onClick={onDownloadAll}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 bg-opacity-50 hover:bg-gray-300 hover:bg-opacity-50 rounded-lg transition-colors"
              style={{ 
                fontSize: `${readingSettings.fontSize - 2}px`,
                fontFamily: readingSettings.fontFamily 
              }}
            >
              <Download size={16} />
              Export All
            </button>
            <button
              onClick={onSettings}
              className="p-2 bg-gray-200 bg-opacity-50 hover:bg-gray-300 hover:bg-opacity-50 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};