import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PreviewProps {
  html: string;
  css: string;
  javascript: string;
  isRunning: boolean;
  onRunComplete: () => void;
}

export const Preview: React.FC<PreviewProps> = ({
  html,
  css,
  javascript,
  isRunning,
  onRunComplete
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  useEffect(() => {
    if (isRunning) {
      updatePreview();
    }
  }, [html, css, javascript, isRunning]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    setError(null);
    setConsoleOutput([]);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Create the HTML content
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Override console methods to capture output
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          
          console.log = function(...args) {
            window.parent.postMessage({
              type: 'console',
              method: 'log',
              args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
            }, '*');
            originalLog.apply(console, args);
          };
          
          console.error = function(...args) {
            window.parent.postMessage({
              type: 'console',
              method: 'error',
              args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
            }, '*');
            originalError.apply(console, args);
          };
          
          console.warn = function(...args) {
            window.parent.postMessage({
              type: 'console',
              method: 'warn',
              args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
            }, '*');
            originalWarn.apply(console, args);
          };
          
          // Catch runtime errors
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'error',
              message: message,
              source: source,
              line: lineno,
              column: colno
            }, '*');
            return false;
          };
          
          try {
            ${javascript}
          } catch (error) {
            window.parent.postMessage({
              type: 'error',
              message: error.message,
              stack: error.stack
            }, '*');
          }
        </script>
      </body>
      </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();

    // Delay to allow the iframe to load
    setTimeout(() => {
      onRunComplete();
    }, 500);
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, 
          `[${event.data.method.toUpperCase()}] ${event.data.args.join(' ')}`
        ]);
      } else if (event.data.type === 'error') {
        setError(event.data.message);
        setConsoleOutput(prev => [...prev, 
          `[ERROR] ${event.data.message}`
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {consoleOutput.length > 0 && (
        <div className="h-32 bg-gray-900 text-gray-300 border border-gray-600 rounded-md mt-2 overflow-auto">
          <div className="p-2 border-b border-gray-600 text-xs font-medium">Console Output</div>
          <div className="p-2 text-xs font-mono space-y-1">
            {consoleOutput.map((output, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {output}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};