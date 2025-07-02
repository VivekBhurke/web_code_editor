export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  html: string;
  css: string;
  javascript: string;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  forks: number;
  forkedFrom?: string;
}

export interface Theme {
  name: string;
  label: string;
  isDark: boolean;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}