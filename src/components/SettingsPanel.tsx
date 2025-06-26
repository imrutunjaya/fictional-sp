import React from 'react';
import { X, Type, Palette, Layout, Eye } from 'lucide-react';
import { ReadingSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'System', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times', value: 'Times, serif' },
    { name: 'Courier', value: 'Courier, monospace' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  ];

  const themes = [
    { name: 'Light', value: 'light' as const, bg: 'bg-white', text: 'text-gray-900' },
    { name: 'Dark', value: 'dark' as const, bg: 'bg-gray-900', text: 'text-gray-100' },
    { name: 'Sepia', value: 'sepia' as const, bg: 'bg-amber-50', text: 'text-amber-900' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reading Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Type size={16} />
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
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-lg text-gray-500">A</span>
              <span className="text-sm text-gray-700 w-8">{settings.fontSize}px</span>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Type size={16} />
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Layout size={16} />
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
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-500">Loose</span>
              <span className="text-sm text-gray-700 w-8">{settings.lineHeight}</span>
            </div>
          </div>

          {/* Max Width */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Layout size={16} />
              Reading Width
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Narrow</span>
              <input
                type="range"
                min="600"
                max="1200"
                step="50"
                value={settings.maxWidth}
                onChange={(e) => onUpdateSettings({ maxWidth: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-500">Wide</span>
              <span className="text-sm text-gray-700 w-12">{settings.maxWidth}px</span>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Palette size={16} />
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onUpdateSettings({ theme: theme.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.theme === theme.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${theme.bg} ${theme.text} flex items-center justify-center text-xs mb-2`}>
                    <Eye size={14} />
                  </div>
                  <span className="text-sm font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};