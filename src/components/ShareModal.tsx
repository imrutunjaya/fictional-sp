import React, { useState } from 'react';
import { Share2, X, Copy, Check, Globe, Clock } from 'lucide-react';
import { Note } from '../types';
import { generateShareableLink } from '../utils/fileUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareLink] = useState(() => generateShareableLink(note.id));

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
          url: shareLink,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Share2 size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Note</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{note.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {note.content || 'No content'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Share Link */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe size={16} />
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-3 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
              )}
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-1 gap-3">
              {navigator.share && (
                <button
                  onClick={handleShareNative}
                  className="flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share via System</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Check out this note: ${note.title}`);
                  const body = encodeURIComponent(`${note.content.substring(0, 200)}...\n\nView full note: ${shareLink}`);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                className="flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>📧</span>
                <span>Share via Email</span>
              </button>
            </div>

            {/* Link Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Link Information</p>
                  <p className="text-blue-700">
                    This link provides read-only access to your note. Anyone with this link can view the note content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};