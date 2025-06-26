import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { NotePreview } from './components/NotePreview';
import { DownloadsView } from './components/DownloadsView';
import { NotesListView } from './components/NotesListView';
import { SettingsPanel } from './components/SettingsPanel';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { downloadNote, downloadAllNotes } from './utils/fileUtils';

function App() {
  const {
    notes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    createNote,
    updateNote,
    deleteNote,
    toggleStar,
  } = useNotes();

  const { settings, updateSettings, updateReadingSettings } = useSettings();

  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);

  const handleCreateNote = () => {
    createNote();
    setShowDownloads(false);
    setShowNotesList(false);
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setShowDownloads(true);
    setIsPreviewMode(false);
    setShowNotesList(false);
  };

  const handleUploadFile = (title: string, content: string) => {
    const noteId = createNote(title, content);
    setSelectedNoteId(noteId);
    setShowDownloads(true);
    setShowNotesList(false);
  };

  const handleDownloadNote = (note: typeof selectedNote) => {
    if (!note) return;
    downloadNote(note, 'md');
  };

  const handleDownloadAll = () => {
    downloadAllNotes(notes);
  };

  const handleShareNote = (note: typeof selectedNote) => {
    if (!note) return;
    setShowShare(true);
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    setShowDownloads(false);
    setShowNotesList(false);
  };

  const handleToggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  };

  const handleBackToEditor = () => {
    setShowDownloads(false);
    setIsPreviewMode(false);
    setShowNotesList(false);
  };

  const handleShowNotesList = () => {
    setShowNotesList(true);
    setShowDownloads(false);
    setIsPreviewMode(false);
    setSelectedNoteId(null);
  };

  const handleSelectNoteFromList = (id: string) => {
    setSelectedNoteId(id);
    setShowNotesList(false);
    setShowDownloads(true);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        collapsed={settings.sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onUpload={() => setShowUpload(true)}
        onDownloadAll={handleDownloadAll}
        onSettings={() => setShowSettings(true)}
        onShowNotesList={handleShowNotesList}
        readingSettings={settings.reading}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {showNotesList ? (
          <NotesListView
            notes={notes}
            onSelectNote={handleSelectNoteFromList}
            onCreateNote={handleCreateNote}
            onDeleteNote={deleteNote}
            onToggleStar={toggleStar}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            settings={settings.reading}
          />
        ) : selectedNote && showDownloads ? (
          <DownloadsView
            note={selectedNote}
            settings={settings.reading}
            onUpdateSettings={updateReadingSettings}
          />
        ) : selectedNote && isPreviewMode ? (
          <NotePreview
            note={selectedNote}
            settings={settings.reading}
            onEdit={handleBackToEditor}
            onToggleStar={toggleStar}
            onShare={handleShareNote}
            onDownload={handleDownloadNote}
          />
        ) : (
          <NoteEditor
            note={selectedNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            onToggleStar={toggleStar}
            onDownload={handleDownloadNote}
            onShare={handleShareNote}
            onTogglePreview={handleTogglePreview}
            isPreview={isPreviewMode}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings.reading}
        onUpdateSettings={updateReadingSettings}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUploadFile}
      />

      {selectedNote && (
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          note={selectedNote}
        />
      )}
    </div>
  );
}

export default App;