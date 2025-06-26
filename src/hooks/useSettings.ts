import { useState, useEffect } from 'react';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'notes-app-settings';

const defaultSettings: AppSettings = {
  sidebarCollapsed: false,
  currentView: 'list',
  reading: {
    fontSize: 16,
    fontFamily: 'Inter',
    lineHeight: 1.6,
    theme: 'light',
    maxWidth: 800,
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateReadingSettings = (updates: Partial<AppSettings['reading']>) => {
    setSettings(prev => ({
      ...prev,
      reading: { ...prev.reading, ...updates }
    }));
  };

  return {
    settings,
    updateSettings,
    updateReadingSettings,
  };
};