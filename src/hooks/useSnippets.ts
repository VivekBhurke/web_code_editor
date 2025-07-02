import { useState, useEffect } from 'react';
import { Snippet } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSnippets();
  }, [user]);

  const loadSnippets = () => {
    const stored = localStorage.getItem('livecodepad_snippets');
    if (stored) {
      const parsedSnippets = JSON.parse(stored).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }));
      setSnippets(parsedSnippets);
    }
  };

  const saveSnippet = (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'forks'>) => {
    const newSnippet: Snippet = {
      ...snippet,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      forks: 0
    };

    const updatedSnippets = [...snippets, newSnippet];
    setSnippets(updatedSnippets);
    localStorage.setItem('livecodepad_snippets', JSON.stringify(updatedSnippets));
    return newSnippet;
  };

  const updateSnippet = (id: string, updates: Partial<Snippet>) => {
    const updatedSnippets = snippets.map(snippet =>
      snippet.id === id
        ? { ...snippet, ...updates, updatedAt: new Date() }
        : snippet
    );
    setSnippets(updatedSnippets);
    localStorage.setItem('livecodepad_snippets', JSON.stringify(updatedSnippets));
  };

  const deleteSnippet = (id: string) => {
    const updatedSnippets = snippets.filter(snippet => snippet.id !== id);
    setSnippets(updatedSnippets);
    localStorage.setItem('livecodepad_snippets', JSON.stringify(updatedSnippets));
  };

  const forkSnippet = (originalId: string, title: string) => {
    const original = snippets.find(s => s.id === originalId);
    if (!original || !user) return null;

    const forkedSnippet: Snippet = {
      ...original,
      id: Date.now().toString(),
      title,
      userId: user.id,
      forkedFrom: originalId,
      createdAt: new Date(),
      updatedAt: new Date(),
      forks: 0
    };

    // Increment fork count on original
    updateSnippet(originalId, { forks: original.forks + 1 });

    const updatedSnippets = [...snippets, forkedSnippet];
    setSnippets(updatedSnippets);
    localStorage.setItem('livecodepad_snippets', JSON.stringify(updatedSnippets));
    return forkedSnippet;
  };

  const getUserSnippets = () => {
    return user ? snippets.filter(snippet => snippet.userId === user.id) : [];
  };

  const getPublicSnippets = () => {
    return snippets.filter(snippet => snippet.isPublic);
  };

  return {
    snippets,
    currentSnippet,
    setCurrentSnippet,
    saveSnippet,
    updateSnippet,
    deleteSnippet,
    forkSnippet,
    getUserSnippets,
    getPublicSnippets
  };
};