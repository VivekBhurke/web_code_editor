import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  editorTheme: string;
  setEditorTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('livecodepad_theme');
    const savedEditorTheme = localStorage.getItem('livecodepad_editor_theme');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
    
    if (savedEditorTheme) {
      setEditorTheme(savedEditorTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('livecodepad_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSetEditorTheme = (theme: string) => {
    setEditorTheme(theme);
    localStorage.setItem('livecodepad_editor_theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      editorTheme, 
      setEditorTheme: handleSetEditorTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};