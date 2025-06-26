import { Note, ReadingSettings } from '../types';
import jsPDF from 'jspdf';

export const downloadNote = (note: Note, format: 'txt' | 'md' | 'json') => {
  let content = '';
  let mimeType = '';
  let extension = '';

  switch (format) {
    case 'txt':
      content = `${note.title}\n\n${note.content}`;
      mimeType = 'text/plain';
      extension = 'txt';
      break;
    case 'md':
      content = `# ${note.title}\n\n${note.content}`;
      mimeType = 'text/markdown';
      extension = 'md';
      break;
    case 'json':
      content = JSON.stringify(note, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadNoteToPDF = (note: Note, settings: ReadingSettings) => {
  const doc = new jsPDF();
  
  // Set font based on settings
  let fontFamily = 'helvetica';
  if (settings.fontFamily.includes('Times')) {
    fontFamily = 'times';
  } else if (settings.fontFamily.includes('Courier')) {
    fontFamily = 'courier';
  }
  
  doc.setFont(fontFamily);
  
  // Title
  doc.setFontSize(20);
  doc.setFont(fontFamily, 'bold');
  const title = note.title || 'Untitled Note';
  doc.text(title, 20, 30);
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(100);
  doc.text(`Created: ${note.createdAt.toLocaleDateString()}`, 20, 45);
  doc.text(`Updated: ${note.updatedAt.toLocaleDateString()}`, 20, 52);
  doc.text(`Words: ${note.content.split(/\s+/).filter(Boolean).length}`, 20, 59);
  
  // Tags
  if (note.tags.length > 0) {
    doc.text(`Tags: ${note.tags.join(', ')}`, 20, 66);
  }
  
  // Content
  doc.setTextColor(0);
  doc.setFontSize(settings.fontSize * 0.75); // Adjust for PDF
  
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPosition = note.tags.length > 0 ? 80 : 73;
  
  if (note.content) {
    const lines = doc.splitTextToSize(note.content, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > 270) { // Near bottom of page
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += settings.lineHeight * 6; // Adjust line spacing
    });
  } else {
    doc.setTextColor(150);
    doc.text('This note is empty.', margin, yPosition);
  }
  
  // Save the PDF
  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
};

export const downloadAllNotes = (notes: Note[]) => {
  const content = JSON.stringify(notes, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const generateShareableLink = (noteId: string): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?shared=${noteId}&t=${Date.now()}`;
};