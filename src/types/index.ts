export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
}

export interface ReadingSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  maxWidth: number;
}

export interface AppSettings {
  sidebarCollapsed: boolean;
  currentView: 'list' | 'preview' | 'edit';
  reading: ReadingSettings;
}

export interface ShareData {
  id: string;
  url: string;
  expiresAt: Date;
}