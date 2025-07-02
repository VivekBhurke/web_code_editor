import React, { useState, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { Preview } from './components/Preview';
import { SaveSnippetModal } from './components/SaveSnippetModal';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSnippets } from './hooks/useSnippets';
import { useAuth } from './contexts/AuthContext';
import { Snippet } from './types';

const EditorApp: React.FC = () => {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web App</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to LiveCodePad!</h1>
        <p>Start coding and see your changes in real-time.</p>
        <button onclick="sayHello()">Click me!</button>
    </div>
</body>
</html>`);

  const [css, setCss] = useState(`body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
    width: 90%;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}`);

  const [javascript, setJavascript] = useState(`function sayHello() {
    alert('Hello from LiveCodePad! 🚀');
    console.log('Button clicked!');
}

// You can also use modern JavaScript features
const features = ['Real-time preview', 'Syntax highlighting', 'Auto-completion'];
console.log('LiveCodePad features:', features);

// Example of DOM manipulation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully!');
});`);

  const [isRunning, setIsRunning] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');

  const { user } = useAuth();
  const { saveSnippet, currentSnippet, setCurrentSnippet } = useSnippets();

  // Auto-run with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsRunning(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [html, css, javascript]);

  const handleSave = () => {
    if (!user) {
      alert('Please sign in to save snippets');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveSnippet = (title: string, description: string, isPublic: boolean) => {
    if (!user) return;

    const snippet = saveSnippet({
      title,
      description,
      html,
      css,
      javascript,
      isPublic,
      userId: user.id
    });

    setCurrentSnippet(snippet);
    alert('Snippet saved successfully!');
  };

  const handleLoadSnippet = (snippet: Snippet) => {
    setHtml(snippet.html);
    setCss(snippet.css);
    setJavascript(snippet.javascript);
    setCurrentSnippet(snippet);
  };

  const handleRun = () => {
    setIsRunning(true);
  };

  const handleRunComplete = () => {
    setIsRunning(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header
        onSave={handleSave}
        onRun={handleRun}
        isRunning={isRunning}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onLoadSnippet={handleLoadSnippet} />
        
        <div className="flex-1">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full flex flex-col">
                {/* Editor Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  {[
                    { key: 'html', label: 'HTML', color: 'text-orange-600' },
                    { key: 'css', label: 'CSS', color: 'text-blue-600' },
                    { key: 'javascript', label: 'JavaScript', color: 'text-yellow-600' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? `${tab.color} border-b-2 border-current bg-gray-50 dark:bg-gray-800`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Editor Content */}
                <div className="flex-1">
                  {activeTab === 'html' && (
                    <CodeEditor
                      language="html"
                      value={html}
                      onChange={setHtml}
                    />
                  )}
                  {activeTab === 'css' && (
                    <CodeEditor
                      language="css"
                      value={css}
                      onChange={setCss}
                    />
                  )}
                  {activeTab === 'javascript' && (
                    <CodeEditor
                      language="javascript"
                      value={javascript}
                      onChange={setJavascript}
                    />
                  )}
                </div>
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
            
            <Panel defaultSize={40} minSize={20}>
              <div className="h-full p-4">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h3>
                </div>
                <Preview
                  html={html}
                  css={css}
                  javascript={javascript}
                  isRunning={isRunning}
                  onRunComplete={handleRunComplete}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {showSaveModal && (
        <SaveSnippetModal
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveSnippet}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <EditorApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;