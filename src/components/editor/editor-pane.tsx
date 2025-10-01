import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { PrimaryButton } from '../ui/primary-button';
import { ChevronDownIcon, PlayIcon } from '../icons/hand-drawn-icons';

interface FileModel {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface EditorPaneProps {
  className?: string;
}

const initialFiles: FileModel[] = [
  {
    id: '1',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inkwell Code Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Welcome to Inkwell Code</h1>
        <p>Start building something amazing!</p>
        <button id="demo-btn">Click me</button>
    </div>
    <script src="main.js"></script>
</body>
</html>`
  },
  {
    id: '2',
    name: 'styles.css',
    language: 'css',
    content: `/* Modern CSS Reset */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Work Sans', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

#app {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    max-width: 500px;
}

h1 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    margin-bottom: 2rem;
    color: #666;
    font-size: 1.1rem;
}

#demo-btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

#demo-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}`
  },
  {
    id: '3',
    name: 'main.js',
    language: 'javascript',
    content: `// Welcome to Inkwell Code!
// This is your main JavaScript file

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Inkwell Code is ready!');
    
    const button = document.getElementById('demo-btn');
    const app = document.getElementById('app');
    
    let clickCount = 0;
    
    button.addEventListener('click', function() {
        clickCount++;
        
        // Fun click animations and messages
        const messages = [
            'Hello World! 👋',
            'Nice click! ✨',
            'You\\'re getting good at this! 🚀',
            'Keep clicking! 🎯',
            'Awesome! 🎉'
        ];
        
        const colors = [
            'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            'linear-gradient(45deg, #10ac84, #00d2d3)',
            'linear-gradient(45deg, #5f27cd, #a55eea)',
            'linear-gradient(45deg, #fd79a8, #fdcb6e)',
            'linear-gradient(45deg, #6c5ce7, #a29bfe)'
        ];
        
        // Update button text and style
        button.textContent = messages[clickCount % messages.length];
        button.style.background = colors[clickCount % colors.length];
        
        // Add a fun bounce effect
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        // Create a particle effect
        createParticle(button);
    });
    
    function createParticle(element) {
        const particle = document.createElement('div');
        particle.style.cssText = \`
            position: absolute;
            width: 6px;
            height: 6px;
            background: #667eea;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: particle-float 1s ease-out forwards;
        \`;
        
        const rect = element.getBoundingClientRect();
        particle.style.left = rect.left + Math.random() * rect.width + 'px';
        particle.style.top = rect.top + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
    
    // Add particle animation CSS
    const style = document.createElement('style');
    style.textContent = \`
        @keyframes particle-float {
            to {
                transform: translateY(-100px) scale(0);
                opacity: 0;
            }
        }
    \`;
    document.head.appendChild(style);
});`
  }
];

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'json', label: 'JSON' }
];

export const EditorPane: React.FC<EditorPaneProps> = ({ className = "" }) => {
  const [files] = useState<FileModel[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleEditorChange = useCallback((value: string | undefined) => {
    // In a real app, this would update the file content and sync with other users
    console.log('Editor content changed:', value);
  }, []);

  const handleRunCode = useCallback(() => {
    // Placeholder for code execution
    console.log('Running code...', activeFile);
  }, [activeFile]);

  return (
    <motion.div 
      className={`flex flex-col h-full ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 bg-surface-secondary border-b border-border">
        <div className="flex items-center space-x-4">
          {/* File Tabs */}
          <div className="flex space-x-1">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-all duration-normal ${
                  file.id === activeFileId
                    ? 'bg-surface-tertiary text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-tertiary/50'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-surface-primary border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {languageOptions.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Run Button */}
        <PrimaryButton
          variant="primary"
          size="sm"
          glow
          onClick={handleRunCode}
          className="flex items-center space-x-2"
        >
          <PlayIcon size={14} />
          <span>Run</span>
        </PrimaryButton>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontFamily: 'Fira Code, Consolas, monospace',
            fontSize: 14,
            fontLigatures: true,
            lineHeight: 1.6,
            minimap: { enabled: true, scale: 0.8 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            matchBrackets: 'always',
            glyphMargin: true,
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'currentDocument',
            parameterHints: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoSurround: 'languageDefined',
          }}
        />
      </div>
    </motion.div>
  );
};