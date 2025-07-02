import React, { useState } from 'react';
import { FileText, Plus, Trash2, Eye, EyeOff, GitFork, Search } from 'lucide-react';
import { useSnippets } from '../hooks/useSnippets';
import { useAuth } from '../contexts/AuthContext';
import { Snippet } from '../types';

interface SidebarProps {
  onLoadSnippet: (snippet: Snippet) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLoadSnippet }) => {
  const { user } = useAuth();
  const { 
    getUserSnippets, 
    getPublicSnippets, 
    deleteSnippet, 
    forkSnippet 
  } = useSnippets();
  
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [searchTerm, setSearchTerm] = useState('');

  const mySnippets = getUserSnippets();
  const publicSnippets = getPublicSnippets();

  const filteredSnippets = (activeTab === 'my' ? mySnippets : publicSnippets)
    .filter(snippet => 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleFork = (snippet: Snippet) => {
    if (!user) return;
    
    const title = prompt('Enter a name for your fork:', `${snippet.title} (Fork)`);
    if (title) {
      const forkedSnippet = forkSnippet(snippet.id, title);
      if (forkedSnippet) {
        onLoadSnippet(forkedSnippet);
      }
    }
  };

  const handleDelete = (snippetId: string) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      deleteSnippet(snippetId);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'my'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          My Snippets ({mySnippets.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'public'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Public ({publicSnippets.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {activeTab === 'my' ? 'No snippets yet' : 'No public snippets'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => onLoadSnippet(snippet)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {snippet.title}
                    </h3>
                    {snippet.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {snippet.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      {snippet.isPublic ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {snippet.forks > 0 && (
                        <span className="flex items-center space-x-1">
                          <GitFork className="w-3 h-3" />
                          <span>{snippet.forks}</span>
                        </span>
                      )}
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {activeTab === 'public' && snippet.userId !== user?.id && (
                      <button
                        onClick={() => handleFork(snippet)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Fork snippet"
                      >
                        <GitFork className="w-3 h-3" />
                      </button>
                    )}
                    
                    {activeTab === 'my' && (
                      <button
                        onClick={() => handleDelete(snippet.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};