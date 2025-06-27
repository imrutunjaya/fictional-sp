import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Star, 
  Download, 
  Share2, 
  Trash2,
  Eye,
  Edit3,
  Tag,
  Folder,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Link,
  Palette,
  Highlighter,
  FileText,
  StickyNote
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
  onToggleDiagrams: () => void;
}

interface Highlight {
  id: string;
  text: string;
  note: string;
  color: string;
  position: { start: number; end: number };
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
  onToggleDiagrams,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isHandwrittenMode, setIsHandwrittenMode] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const [highlightNote, setHighlightNote] = useState('');
  const [noteTheme, setNoteTheme] = useState('plain');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags);
      setHighlights(note.highlights || []);
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
      onUpdateNote(note.id, { title, content, category, tags, highlights });
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

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'underline':
        newText = `<u>${selectedText}</u>`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case 'list':
        newText = `\n- ${selectedText}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case 'orderedList':
        newText = `\n1. ${selectedText}`;
        cursorOffset = selectedText ? 0 : 4;
        break;
      case 'quote':
        newText = `\n> ${selectedText}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        cursorOffset = selectedText ? -4 : -5;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      const newPosition = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    if (selected.trim().length > 0) {
      setSelectedText(selected);
    }
  };

  const handleHighlight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    if (selected.trim().length > 0) {
      setSelectedText(selected);
      setShowHighlightModal(true);
    }
  };

  const addHighlight = () => {
    if (!selectedText || !note) return;

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: selectedText,
      note: highlightNote,
      color: highlightColor,
      position: { 
        start: content.indexOf(selectedText), 
        end: content.indexOf(selectedText) + selectedText.length 
      }
    };

    const newHighlights = [...highlights, newHighlight];
    setHighlights(newHighlights);
    onUpdateNote(note.id, { highlights: newHighlights });
    
    setShowHighlightModal(false);
    setHighlightNote('');
    setSelectedText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const imageMarkdown = `\n![Image](${imageUrl})\n`;
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(start);
      setContent(newContent);
      
      // Set cursor position after the image
      setTimeout(() => {
        const newPosition = start + imageMarkdown.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    };
    reader.readAsDataURL(file);
  };

  const getThemeStyles = () => {
    const themes = {
      plain: {
        background: 'bg-gradient-to-br from-amber-50 to-orange-100',
        lines: null,
        margin: null
      },
      ruled: {
        background: 'bg-white',
        lines: 'repeating-linear-gradient(transparent, transparent 29px, #e5e7eb 29px, #e5e7eb 30px)',
        margin: 'border-l-2 border-red-300 ml-20'
      },
      graph: {
        background: 'bg-blue-50',
        lines: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #dbeafe 19px, #dbeafe 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #dbeafe 19px, #dbeafe 20px)',
        margin: null
      },
      dotted: {
        background: 'bg-gray-50',
        lines: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        margin: null
      },
      college: {
        background: 'bg-blue-50',
        lines: 'repeating-linear-gradient(transparent, transparent 31px, #3b82f6 31px, #3b82f6 32px)',
        margin: 'border-l-2 border-red-400 ml-16'
      }
    };
    return themes[noteTheme as keyof typeof themes] || themes.plain;
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-blue-300"
              style={{ top: `${i * 5}%` }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full w-px bg-blue-300"
              style={{ left: `${i * 5}%` }}
            />
          ))}
        </div>
        
        <div className="text-center text-gray-500 z-10">
          <Edit3 size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium mb-2">No note selected</h3>
          <p>Choose a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  const handwrittenFont = "'Kalam', 'Comic Sans MS', cursive";
  const currentFont = isHandwrittenMode ? handwrittenFont : 'inherit';
  const themeStyle = getThemeStyles();

  return (
    <div className={`flex-1 flex flex-col ${themeStyle.background} relative overflow-hidden`}>
      {/* Background Pattern */}
      {themeStyle.lines && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ 
            backgroundImage: themeStyle.lines,
            backgroundSize: noteTheme === 'dotted' ? '20px 20px' : 'auto'
          }}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white bg-opacity-90 backdrop-blur-sm z-10">
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
            onClick={onToggleDiagrams}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Diagrams & Drawings"
          >
            <Palette size={16} />
          </button>
          
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Enhanced Formatting Toolbar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white bg-opacity-90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => insertFormatting('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => insertFormatting('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => insertFormatting('underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={() => insertFormatting('list')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => insertFormatting('orderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => insertFormatting('quote')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Quote"
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => insertFormatting('code')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Code"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => insertFormatting('link')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Link"
          >
            <Link size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={handleHighlight}
            className="p-2 hover:bg-yellow-200 rounded transition-colors"
            title="Highlight Text"
          >
            <Highlighter size={16} />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Image"
          >
            <Image size={16} />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          {/* Note Theme Selector */}
          <select
            value={noteTheme}
            onChange={(e) => setNoteTheme(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="Note Theme"
          >
            <option value="plain">Plain</option>
            <option value="ruled">Ruled</option>
            <option value="graph">Graph</option>
            <option value="dotted">Dotted</option>
            <option value="college">College</option>
          </select>
          
          <button
            onClick={() => setIsHandwrittenMode(!isHandwrittenMode)}
            className={`px-3 py-1.5 rounded transition-colors text-sm ${
              isHandwrittenMode 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-200'
            }`}
            title="Handwritten Font"
          >
            Handwritten
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 p-6 relative z-10 ${themeStyle.margin || ''}`}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-bold border-none outline-none mb-4 placeholder-gray-400 bg-transparent"
          style={{ fontFamily: currentFont }}
        />
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={handleTextSelection}
          placeholder="Start writing your note..."
          className="w-full h-full border-none outline-none resize-none text-gray-800 leading-relaxed placeholder-gray-400 bg-transparent"
          style={{ 
            minHeight: 'calc(100vh - 350px)',
            fontFamily: currentFont,
            fontSize: isHandwrittenMode ? '18px' : '16px',
            lineHeight: noteTheme === 'ruled' || noteTheme === 'college' ? '30px' : '1.8'
          }}
        />
      </div>

      {/* Highlights Panel */}
      {highlights.length > 0 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto z-20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <StickyNote size={16} />
            Highlights & Notes
          </h4>
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="p-2 rounded border-l-4" style={{ borderColor: highlight.color }}>
                <div className="text-sm font-medium" style={{ backgroundColor: highlight.color + '20' }}>
                  "{highlight.text}"
                </div>
                {highlight.note && (
                  <div className="text-xs text-gray-600 mt-1">{highlight.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlight Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Highlight</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Selected Text:</label>
              <div className="p-2 bg-gray-100 rounded text-sm">{selectedText}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Highlight Color:</label>
              <div className="flex gap-2">
                {['#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#e91e63'].map(color => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    className={`w-8 h-8 rounded border-2 ${highlightColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Note (optional):</label>
              <textarea
                value={highlightNote}
                onChange={(e) => setHighlightNote(e.target.value)}
                placeholder="Add a note about this highlight..."
                className="w-full p-2 border rounded resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addHighlight}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Add Highlight
              </button>
              <button
                onClick={() => setShowHighlightModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between bg-white bg-opacity-90 backdrop-blur-sm z-10">
        <div>
          Last saved: {note.updatedAt.toLocaleString()}
        </div>
        <div className="flex items-center gap-4">
          <span>{highlights.length} highlights</span>
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>
    </div>
  );
};