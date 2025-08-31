import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { PrimaryButton } from '../ui/primary-button';
import { ChevronDownIcon, PlayIcon } from '../icons/hand-drawn-icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import type { FileModel } from '@/types/collaboration';

interface CollaborativeEditorProps {
  className?: string;
  roomId: string;
  files: FileModel[];
  collaboration: any;
  onFilesChange?: (files: FileModel[]) => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'json', label: 'JSON' }
];

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  className = "",
  roomId,
  files,
  collaboration,
  onFilesChange
}) => {
  const { user } = useAuth();
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  const handleEditorChange = useCallback(async (value: string | undefined) => {
    if (!activeFile || !user || !value) return;
    
    try {
      // Update file in database
      const { error } = await supabase
        .from('files')
        .update({ 
          content: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeFile.id);

      if (error) throw error;

      // Broadcast change to other users
      if (collaboration.broadcastCodeChange) {
        await collaboration.broadcastCodeChange(activeFile.id, value, {
          type: 'replace',
          range: { startLine: 1, startColumn: 1, endLine: 999999, endColumn: 1 },
          text: value
        });
      }
    } catch (error) {
      console.error('Failed to update file:', error);
    }
  }, [activeFile, user, collaboration]);

  const handleRunCode = useCallback(async () => {
    if (!activeFile || isRunning) return;
    
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('judge0-runner', {
        body: {
          language: activeFile.language,
          source: activeFile.content,
          stdin: ''
        }
      });

      if (error) throw error;

      // Show results in toast or terminal
      if (data.output) {
        toast({
          title: 'Code executed successfully',
          description: `Output: ${data.output.substring(0, 100)}${data.output.length > 100 ? '...' : ''}`,
        });
      } else if (data.error) {
        toast({
          title: 'Execution error',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Failed to run code:', error);
      toast({
        title: 'Failed to run code',
        description: error.message || 'An error occurred while running the code',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  }, [activeFile, isRunning]);

  const createNewFile = useCallback(async () => {
    if (!newFileName.trim() || !user) return;

    const extension = newFileName.includes('.') ? newFileName.split('.').pop() : 'txt';
    const language = getLanguageFromExtension(extension || 'txt');

    try {
      const { data, error } = await supabase
        .from('files')
        .insert({
          room_id: roomId,
          name: newFileName,
          content: '',
          language,
          type: 'file'
        })
        .select()
        .single();

      if (error) throw error;

      setNewFileName('');
      setShowNewFile(false);
      setActiveFileId(data.id);
      
      toast({
        title: 'File created',
        description: `${newFileName} has been created successfully.`
      });
    } catch (error: any) {
      console.error('Failed to create file:', error);
      toast({
        title: 'Failed to create file',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [newFileName, user, roomId]);

  const getLanguageFromExtension = (extension: string): string => {
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'py': 'python',
      'cpp': 'cpp',
      'c': 'cpp',
      'json': 'json',
      'txt': 'plaintext'
    };
    return langMap[extension.toLowerCase()] || 'plaintext';
  };

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-primary">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No files in this room yet</p>
          <PrimaryButton onClick={() => setShowNewFile(true)}>
            <span>+</span>
            <span>Create First File</span>
          </PrimaryButton>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => setShowNewFile(true)}
              className="px-2 py-1.5 text-sm font-medium rounded-t-md text-muted-foreground hover:text-foreground hover:bg-surface-tertiary/50 transition-all duration-normal"
            >
              +
            </button>
          </div>
          
          {/* Language Display */}
          <div className="text-sm text-muted-foreground">
            {activeFile?.language || 'plaintext'}
          </div>
        </div>

        {/* Run Button */}
        <PrimaryButton
          variant="primary"
          size="sm"
          glow
          onClick={handleRunCode}
          disabled={isRunning || !activeFile}
          className="flex items-center space-x-2"
        >
          <PlayIcon size={14} />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </PrimaryButton>
      </div>

      {/* New File Input */}
      {showNewFile && (
        <div className="p-3 bg-surface-tertiary border-b border-border">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter file name (e.g., main.js, styles.css)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFile();
                if (e.key === 'Escape') setShowNewFile(false);
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-surface-primary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <PrimaryButton size="sm" onClick={createNewFile}>
              Create
            </PrimaryButton>
            <button
              onClick={() => setShowNewFile(false)}
              className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        {activeFile ? (
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
              renderIndentGuides: true,
              highlightActiveIndentGuide: true,
              wordWrap: 'on',
              wrappingIndent: 'indent',
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: true,
              parameterHints: { enabled: true },
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoSurround: 'languageDefined',
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a file to start editing
          </div>
        )}
      </div>
    </motion.div>
  );
};