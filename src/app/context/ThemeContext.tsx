import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'midnight' | 'aurora' | 'sunrise' | 'ocean' | 'forest' | 'rose';

export interface Theme {
  id: ThemeId;
  name: string;
  desc: string;
  swatches: string[];
}

export const THEMES: Theme[] = [
  {
    id: "midnight",
    name: "Midnight Moss",
    desc: "Dark, earthy green",
    swatches: ["#1a1f1a","#2a3b2a","#4CAF7D","#a8d5b5"],
  },
  {
    id: "aurora",
    name: "Aurora",
    desc: "Deep purple + cyan",
    swatches: ["#12101e","#1e1836","#7c5cbf","#40e0d0"],
  },
  {
    id: "sunrise",
    name: "Sunrise",
    desc: "Warm amber + coral",
    swatches: ["#fff8f0","#fff0e0","#e8650a","#f59e0b"],
  },
  {
    id: "ocean",
    name: "Ocean Depth",
    desc: "Navy + sky blue",
    swatches: ["#0a1628","#0f2040","#1a6fb5","#60b8f0"],
  },
  {
    id: "forest",
    name: "Forest Light",
    desc: "Clean white + green",
    swatches: ["#f8fdf8","#edf7ed","#2e7d32","#66bb6a"],
  },
  {
    id: "rose",
    name: "Rose Gold",
    desc: "Soft pink + gold",
    swatches: ["#fdf5f7","#fce8ed","#c2185b","#f48fb1"],
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem('hh-theme') as ThemeId) || 'midnight';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hh-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
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
