import React from 'react';
import { Note, ReadingSettings } from '../types';
import { Edit3, Star, Share2, Download } from 'lucide-react';

interface NotePreviewProps {
  note: Note;
  settings: ReadingSettings;
  onEdit: () => void;
  onToggleStar: (id: string) => void;
  onShare: (note: Note) => void;
  onDownload: (note: Note) => void;
}

export const NotePreview: React.FC<NotePreviewProps> = ({
  note,
  settings,
  onEdit,
  onToggleStar,
  onShare,
  onDownload,
}) => {
  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900',
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-6' : ''}>
        {line || '\u00A0'}
      </p>
    ));
  };

  return (
    <div className={`flex-1 ${themeClasses[settings.theme]} transition-colors duration-200`}>
      {/* Header */}
      <div className="sticky top-0 border-b border-opacity-20 border-gray-300 backdrop-blur-sm bg-opacity-90 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
              title="Edit Note"
            >
              <Edit3 size={18} />
            </button>
            <span className="text-sm opacity-70">Reading Mode</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar(note.id)}
              className={`p-2 rounded-lg transition-colors ${
                note.isStarred 
                  ? 'text-yellow-500' 
                  : 'hover:bg-gray-200 hover:bg-opacity-20'
              }`}
            >
              <Star size={18} className={note.isStarred ? 'fill-current' : ''} />
            </button>
            
            <button
              onClick={() => onShare(note)}
              className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Share2 size={18} />
            </button>
            
            <button
              onClick={() => onDownload(note)}
              className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <article 
          className="mx-auto prose prose-lg"
          style={{ 
            maxWidth: `${settings.maxWidth}px`,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily,
          }}
        >
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {note.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm opacity-70 mb-6">
              <span>Created {note.createdAt.toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated {note.updatedAt.toLocaleDateString()}</span>
              <span>•</span>
              <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
              {note.category && (
                <>
                  <span>•</span>
                  <span className="px-2 py-1 bg-gray-200 bg-opacity-50 rounded text-xs">
                    {note.category}
                  </span>
                </>
              )}
            </div>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-blue-100 bg-opacity-50 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          
          <div className="prose prose-lg max-w-none">
            {note.content ? formatContent(note.content) : (
              <p className="italic opacity-60">This note is empty.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};