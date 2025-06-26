import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  File, 
  Settings, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Note, ReadingSettings } from '../types';
import { downloadNote, downloadNoteToPDF } from '../utils/fileUtils';

interface DownloadsViewProps {
  note: Note;
  settings: ReadingSettings;
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void;
}

interface DownloadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  format: string;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  note,
  settings,
  onUpdateSettings,
}) => {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const simulateDownload = async (format: string, downloadFn: () => void) => {
    const downloadId = Date.now().toString();
    const newDownload: DownloadProgress = {
      id: downloadId,
      progress: 0,
      status: 'downloading',
      format,
    };

    setDownloads(prev => [newDownload, ...prev]);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setDownloads(prev => prev.map(d => 
        d.id === downloadId ? { ...d, progress: i } : d
      ));
    }

    try {
      downloadFn();
      setDownloads(prev => prev.map(d => 
        d.id === downloadId ? { ...d, status: 'completed' } : d
      ));
    } catch (error) {
      setDownloads(prev => prev.map(d => 
        d.id === downloadId ? { ...d, status: 'error' } : d
      ));
    }
  };

  const handleDownload = (format: 'txt' | 'md' | 'json' | 'pdf') => {
    if (format === 'pdf') {
      simulateDownload('PDF', () => downloadNoteToPDF(note, settings));
    } else {
      simulateDownload(format.toUpperCase(), () => downloadNote(note, format));
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-6' : 'mb-4'}>
        {line || '\u00A0'}
      </p>
    ));
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900',
  };

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'System', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times', value: 'Times, serif' },
    { name: 'Courier', value: 'Courier, monospace' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Downloads & Reading</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {note.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReading(!isReading)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isReading ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Eye size={16} />
            {isReading ? 'Exit Reading' : 'Reading Mode'}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Downloads Panel */}
        {!isReading && (
          <div className="w-80 border-r border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
            
            {/* Download Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleDownload('txt')}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Text File</div>
                  <div className="text-sm text-gray-500">Plain text format</div>
                </div>
              </button>
              
              <button
                onClick={() => handleDownload('md')}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <File size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Markdown</div>
                  <div className="text-sm text-gray-500">Markdown format</div>
                </div>
              </button>
              
              <button
                onClick={() => handleDownload('json')}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <File size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">JSON</div>
                  <div className="text-sm text-gray-500">Data format</div>
                </div>
              </button>
              
              <button
                onClick={() => handleDownload('pdf')}
                className="w-full flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Download size={20} className="text-red-600" />
                <div className="text-left">
                  <div className="font-medium text-red-800">PDF Document</div>
                  <div className="text-sm text-red-600">Formatted PDF</div>
                </div>
              </button>
            </div>

            {/* Download History */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Download History</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {downloads.map((download) => (
                  <div key={download.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{download.format}</span>
                      <div className="flex items-center gap-1">
                        {download.status === 'downloading' && (
                          <Clock size={14} className="text-blue-500" />
                        )}
                        {download.status === 'completed' && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                        {download.status === 'error' && (
                          <AlertCircle size={14} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {download.status === 'downloading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {download.status === 'completed' && (
                      <div className="text-xs text-green-600">Download completed</div>
                    )}
                    
                    {download.status === 'error' && (
                      <div className="text-xs text-red-600">Download failed</div>
                    )}
                  </div>
                ))}
                
                {downloads.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Download size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No downloads yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reading Settings Panel */}
        {showSettings && !isReading && (
          <div className="w-80 border-r border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Settings</h3>
            
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">A</span>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg text-gray-500">A</span>
                  <span className="text-sm text-gray-700 w-8">{settings.fontSize}px</span>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Height
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Tight</span>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => onUpdateSettings({ lineHeight: parseFloat(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">Loose</span>
                  <span className="text-sm text-gray-700 w-8">{settings.lineHeight}</span>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Light', value: 'light' as const },
                    { name: 'Dark', value: 'dark' as const },
                    { name: 'Sepia', value: 'sepia' as const },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => onUpdateSettings({ theme: theme.value })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        settings.theme === theme.value
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 ${isReading ? themeClasses[settings.theme] : 'bg-white'} transition-colors duration-200`}>
          {isReading ? (
            /* Reading Mode */
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
                  </div>
                </header>
                
                <div className="prose prose-lg max-w-none">
                  {note.content ? formatContent(note.content) : (
                    <p className="italic opacity-60">This note is empty.</p>
                  )}
                </div>
              </article>
            </div>
          ) : (
            /* List View */
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <span>Created: {note.createdAt.toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>Updated: {note.updatedAt.toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-gray-700 leading-relaxed">
                    {note.content ? (
                      <div className="max-h-64 overflow-y-auto">
                        {formatContent(note.content)}
                      </div>
                    ) : (
                      <p className="italic text-gray-500">This note is empty.</p>
                    )}
                  </div>
                </div>

                <div className="text-center text-gray-500">
                  <p>Select download format from the left panel or switch to reading mode</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};