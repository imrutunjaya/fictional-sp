import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Star, 
  Download, 
  Share2, 
  Trash2,
  Eye,
  Edit3,
  Tag,
  Folder
} from 'lucide-react';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDownload: (note: Note) => void;
  onShare: (note: Note) => void;
  onTogglePreview: () => void;
  isPreview: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onToggleStar,
  onDownload,
  onShare,
  onTogglePreview,
  isPreview,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags);
      setHasUnsavedChanges(false);
    }
  }, [note]);

  useEffect(() => {
    if (note && (title !== note.title || content !== note.content || category !== note.category)) {
      setHasUnsavedChanges(true);
    }
  }, [title, content, category, note]);

  const handleSave = () => {
    if (note) {
      onUpdateNote(note.id, { title, content, category, tags });
      setHasUnsavedChanges(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        if (note) {
          onUpdateNote(note.id, { tags: newTags });
        }
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    if (note) {
      onUpdateNote(note.id, { tags: newTags });
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <Edit3 size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium mb-2">No note selected</h3>
          <p>Choose a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Ideas">Ideas</option>
              <option value="Projects">Projects</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <Tag size={16} className="text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full cursor-pointer hover:bg-blue-200"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <span className="text-blue-600">×</span>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleAddTag}
                placeholder="Add tag..."
                className="text-xs border-none outline-none bg-transparent placeholder-gray-400 min-w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
          )}
          
          <button
            onClick={onTogglePreview}
            className={`p-2 rounded-lg transition-colors ${
              isPreview ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Toggle Preview"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => onToggleStar(note.id)}
            className={`p-2 rounded-lg transition-colors ${
              note.isStarred ? 'text-yellow-500' : 'hover:bg-gray-100'
            }`}
          >
            <Star size={16} className={note.isStarred ? 'fill-current' : ''} />
          </button>
          
          <button
            onClick={() => onShare(note)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 size={16} />
          </button>
          
          <button
            onClick={() => onDownload(note)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-bold border-none outline-none mb-4 placeholder-gray-400"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full border-none outline-none resize-none text-gray-800 leading-relaxed placeholder-gray-400"
          style={{ minHeight: 'calc(100vh - 240px)' }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
        <div>
          Last saved: {note.updatedAt.toLocaleString()}
        </div>
        <div>
          {content.length} characters, {content.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
    </div>
  );
};