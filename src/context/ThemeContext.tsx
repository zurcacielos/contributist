'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // Safe default matching SSR root default

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const fallbackTheme = systemPrefersDark ? 'dark' : 'light';
        setThemeState(fallbackTheme);
        document.documentElement.setAttribute('data-theme', fallbackTheme);
      }
    } catch (e) {
      console.warn('Failed to access theme preferences:', e);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
