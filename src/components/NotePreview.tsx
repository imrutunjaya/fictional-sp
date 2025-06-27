import React, { useState, useEffect } from 'react';
import { Note, ReadingSettings } from '../types';
import { Edit3, Star, Share2, Download, Palette, ChevronLeft } from 'lucide-react';

interface NotePreviewProps {
  note: Note;
  settings: ReadingSettings;
  onEdit: () => void;
  onToggleStar: (id: string) => void;
  onShare: (note: Note) => void;
  onDownload: (note: Note) => void;
  onToggleDiagrams: () => void;
}

export const NotePreview: React.FC<NotePreviewProps> = ({
  note,
  settings,
  onEdit,
  onToggleStar,
  onShare,
  onDownload,
  onToggleDiagrams,
}) => {
  const [showDiagramsButton, setShowDiagramsButton] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // Swipe left to right (show diagrams button)
      if (diff < -100) {
        setShowDiagramsButton(true);
      }
      // Swipe right to left (hide diagrams button)
      else if (diff > 100) {
        setShowDiagramsButton(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX]);

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
    <div className={`flex-1 ${themeClasses[settings.theme]} transition-colors duration-200 relative`}>
      {/* Floating Diagrams Button */}
      {showDiagramsButton && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
          <button
            onClick={onToggleDiagrams}
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 animate-pulse"
            title="Open Diagrams & Drawings"
          >
            <Palette size={24} />
          </button>
        </div>
      )}

      {/* Swipe Indicator */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs writing-mode-vertical opacity-30 pointer-events-none">
        <ChevronLeft size={16} className="animate-bounce" />
        <span className="ml-1">Swipe for diagrams</span>
      </div>

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

            <button
              onClick={onToggleDiagrams}
              className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
              title="Diagrams & Drawings"
            >
              <Palette size={18} />
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