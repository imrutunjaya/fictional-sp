import { useState, useEffect } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'notes-app-data';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load notes from localStorage on mount
  useEffect(() => {
    const storedNotes = localStorage.getItem(STORAGE_KEY);
    if (storedNotes) {
      try {
        const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Failed to parse stored notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = (title: string = 'Untitled Note', content: string = '') => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      category: 'General',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  const toggleStar = (id: string) => {
    updateNote(id, { isStarred: !notes.find(n => n.id === id)?.isStarred });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           selectedCategory === 'Starred' && note.isStarred ||
                           note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Starred', ...Array.from(new Set(notes.map(note => note.category)))];

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return {
    notes: filteredNotes,
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
  };
};