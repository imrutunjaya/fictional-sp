import React from 'react';
import { 
  Plus, 
  Star, 
  Trash2, 
  Search,
  Folder,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import { Note, ReadingSettings } from '../types';

interface NotesListViewProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onToggleStar: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  settings: ReadingSettings;
}

export const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onToggleStar,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  settings,
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
            All Notes
          </h1>
          <button
            onClick={onCreateNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ 
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily 
            }}
          >
            <Plus size={20} />
            New Note
          </button>
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

      {/* Notes Grid */}
      <div className="p-6">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto mb-4 opacity-30" />
            <h3 
              className="text-xl font-medium mb-2 opacity-70"
              style={{ 
                fontSize: `${settings.fontSize + 4}px`,
                fontFamily: settings.fontFamily 
              }}
            >
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p 
              className="opacity-50"
              style={{ 
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily 
              }}
            >
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white bg-opacity-50 border border-gray-200 border-opacity-30 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 
                    className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors"
                    style={{ 
                      fontSize: `${settings.fontSize + 2}px`,
                      fontFamily: settings.fontFamily,
                      lineHeight: settings.lineHeight 
                    }}
                  >
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(note.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        note.isStarred 
                          ? 'text-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star size={16} className={note.isStarred ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p 
                  className="opacity-70 line-clamp-3 mb-4"
                  style={{ 
                    fontSize: `${settings.fontSize - 1}px`,
                    fontFamily: settings.fontFamily,
                    lineHeight: settings.lineHeight 
                  }}
                >
                  {note.content || 'No content'}
                </p>

                <div className="space-y-2">
                  {/* Category and Tags */}
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="opacity-50" />
                    <span 
                      className="text-sm opacity-70"
                      style={{ fontFamily: settings.fontFamily }}
                    >
                      {note.category}
                    </span>
                    {note.tags.length > 0 && (
                      <>
                        <Tag size={14} className="opacity-50 ml-2" />
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-blue-100 bg-opacity-50 text-blue-800 text-xs rounded-full"
                              style={{ fontFamily: settings.fontFamily }}
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span 
                              className="text-xs opacity-50"
                              style={{ fontFamily: settings.fontFamily }}
                            >
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date and Stats */}
                  <div className="flex items-center justify-between text-sm opacity-50">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span style={{ fontFamily: settings.fontFamily }}>
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    <span style={{ fontFamily: settings.fontFamily }}>
                      {note.content.split(/\s+/).filter(Boolean).length} words
                    </span>
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