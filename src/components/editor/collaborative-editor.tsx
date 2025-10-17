import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { PrimaryButton } from '../ui/primary-button';
import { ChevronDownIcon, PlayIcon } from '../icons/hand-drawn-icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { inkwellDarkTheme, inkwellLightTheme } from '@/utils/monaco-themes';
import { getDefaultTemplate } from '@/utils/default-templates';
import { Play, Settings } from 'lucide-react';
import type { FileModel } from '@/types/collaboration';
import { CursorDecorationManager, type RemoteCursor } from './cursor-decorations';

interface CollaborativeEditorProps {
  className?: string;
  roomId: string;
  files: FileModel[];
  collaboration: any;
  onFilesChange?: (files: FileModel[]) => void;
  onOpenTerminal?: () => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', judge0Id: 63 },
  { value: 'typescript', label: 'TypeScript', judge0Id: 74 },
  { value: 'html', label: 'HTML', judge0Id: 63 },
  { value: 'css', label: 'CSS', judge0Id: 63 },
  { value: 'python', label: 'Python', judge0Id: 71 },
  { value: 'cpp', label: 'C++', judge0Id: 54 },
  { value: 'c', label: 'C', judge0Id: 50 },
  { value: 'java', label: 'Java', judge0Id: 62 },
  { value: 'csharp', label: 'C#', judge0Id: 51 },
  { value: 'go', label: 'Go', judge0Id: 60 },
  { value: 'rust', label: 'Rust', judge0Id: 73 },
  { value: 'php', label: 'PHP', judge0Id: 68 },
  { value: 'ruby', label: 'Ruby', judge0Id: 72 },
  { value: 'swift', label: 'Swift', judge0Id: 83 },
  { value: 'kotlin', label: 'Kotlin', judge0Id: 78 },
  { value: 'json', label: 'JSON', judge0Id: 63 }
];

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  className = "",
  roomId,
  files,
  collaboration,
  onFilesChange,
  onOpenTerminal
}) => {
  const { user } = useAuth();
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showStdinDialog, setShowStdinDialog] = useState(false);
  const [stdinInput, setStdinInput] = useState('');
  const [cursorManager, setCursorManager] = useState<CursorDecorationManager | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Update cursor decorations when participants change
  useEffect(() => {
    if (cursorManager && collaboration.participants) {
      const remoteCursors: RemoteCursor[] = collaboration.participants
        .filter((p: any) => p.id !== user?.id && p.cursor)
        .map((p: any) => ({
          userId: p.id,
          userName: p.name,
          position: { line: p.cursor.line, column: p.cursor.column },
          color: p.color || '#2CA6A4'
        }));
      
      cursorManager.updateCursors(remoteCursors);
    }
  }, [cursorManager, collaboration.participants, user?.id]);

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

  const handleRunCode = useCallback(async (withStdin = false) => {
    if (!activeFile || isRunning) return;
    
    if (withStdin) {
      setShowStdinDialog(true);
      return;
    }
    
    // Auto-open terminal panel
    if (onOpenTerminal) {
      onOpenTerminal();
    }
    
    setIsRunning(true);
    setExecutionStatus('running');
    try {
      console.log('Invoking judge0-runner function with:', { language: activeFile.language, contentLength: activeFile.content.length });
      
      const { data, error } = await supabase.functions.invoke('judge0-runner', {
        body: {
          language: activeFile.language,
          source: activeFile.content,
          stdin: stdinInput
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        setExecutionStatus('error');
        throw error;
      }

      // Send results to terminal and show brief toast
      console.log('Code execution result:', data);
      
      // Prepare terminal output
      let terminalResult = `Running ${activeFile.name}...\n`;
      
      if (data.success && data.stdout) {
        terminalResult += `✅ Output:\n${data.stdout}\n`;
        setExecutionStatus('success');
        toast({
          title: 'Code executed successfully',
          description: 'Check terminal for full output',
        });
      } else if (data.error || data.stderr) {
        terminalResult += `❌ Errors:\n${data.error || data.stderr}\n`;
        setExecutionStatus('error');
        toast({
          title: 'Execution error',
          description: 'Check terminal for details',
          variant: 'destructive'
        });
      } else if (data.output) {
        terminalResult += `✅ Output:\n${data.output}\n`;
        setExecutionStatus('success');
        toast({
          title: 'Code executed',
          description: 'Check terminal for full output',
        });
      } else {
        terminalResult += '✅ Code executed successfully (no output generated)\n';
        setExecutionStatus('success');
        toast({
          title: 'Code executed',
          description: 'No output generated',
        });
      }
      
      if (data.time) {
        terminalResult += `⏱️ Execution time: ${data.time}s\n`;
      }
      
      // Send to terminal via custom event
      window.dispatchEvent(new CustomEvent('code-execution-result', {
        detail: { 
          output: terminalResult,
          isError: !data.success || !!data.error || !!data.stderr
        }
      }));
    } catch (error: any) {
      console.error('Failed to run code:', error);
      setExecutionStatus('error');
      toast({
        title: 'Failed to run code',
        description: error.message || 'An error occurred while running the code',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
      setStdinInput('');
      // Reset status after 3 seconds
      setTimeout(() => setExecutionStatus('idle'), 3000);
    }
  }, [activeFile, isRunning, stdinInput]);

  const runWithStdin = useCallback(async () => {
    setShowStdinDialog(false);
    await handleRunCode(false);
  }, [handleRunCode]);

  const createNewFile = useCallback(async () => {
    if (!newFileName.trim() || !user) return;

    const extension = newFileName.includes('.') ? newFileName.split('.').pop() : 'txt';
    const language = getLanguageFromExtension(extension || 'txt');
    const defaultContent = getDefaultTemplate(language);

    try {
      const { data, error } = await supabase
        .from('files')
        .insert({
          room_id: roomId,
          name: newFileName,
          content: defaultContent,
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
        description: `${newFileName} has been created with a starter template.`
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
      'c': 'c',
      'java': 'java',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'json': 'json',
      'txt': 'plaintext'
    };
    return langMap[extension.toLowerCase()] || 'plaintext';
  };

  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    if (!activeFile || !user) return;
    
    try {
      const { error } = await supabase
        .from('files')
        .update({ 
          language: newLanguage,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeFile.id);

      if (error) throw error;

      toast({
        title: 'Language updated',
        description: `File language changed to ${languageOptions.find(l => l.value === newLanguage)?.label || newLanguage}`,
      });
    } catch (error: any) {
      console.error('Failed to update language:', error);
      toast({
        title: 'Failed to update language',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [activeFile, user]);

  const getStatusColor = (status: typeof executionStatus) => {
    switch (status) {
      case 'running': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: typeof executionStatus) => {
    switch (status) {
      case 'running': return 'Running...';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return 'Ready';
    }
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
          {/* File Tabs - Scrollable */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide max-w-md">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-all duration-normal whitespace-nowrap flex-shrink-0 ${
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
              className="px-2 py-1.5 text-sm font-medium rounded-t-md text-muted-foreground hover:text-foreground hover:bg-surface-tertiary/50 transition-all duration-normal flex-shrink-0"
            >
              +
            </button>
          </div>
          
          {/* Language Selector */}
          <Select value={activeFile?.language || 'plaintext'} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Execution Status */}
          <div className={`text-xs font-medium ${getStatusColor(executionStatus)}`}>
            {getStatusText(executionStatus)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="px-2 py-1 text-xs bg-surface-tertiary hover:bg-surface-tertiary/80 rounded transition-colors"
            title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>

          {/* Run with Input Button */}
          <PrimaryButton
            variant="ghost"
            size="sm"
            onClick={() => handleRunCode(true)}
            disabled={isRunning || !activeFile}
            className="flex items-center space-x-2"
          >
            <Settings size={14} />
          </PrimaryButton>

          {/* Run Button */}
          <PrimaryButton
            variant="primary"
            size="sm"
            glow
            onClick={() => handleRunCode(false)}
            disabled={isRunning || !activeFile}
            className="flex items-center space-x-2"
          >
            <PlayIcon size={14} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </PrimaryButton>
        </div>
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
            theme={isDarkTheme ? 'inkwell-dark' : 'inkwell-light'}
            beforeMount={(monaco) => {
              // Define custom themes
              monaco.editor.defineTheme('inkwell-dark', inkwellDarkTheme);
              monaco.editor.defineTheme('inkwell-light', inkwellLightTheme);
            }}
            onMount={(editor, monaco) => {
              // Initialize cursor decoration manager
              const manager = new CursorDecorationManager(editor);
              setCursorManager(manager);

              // Track cursor position changes with throttling
              let cursorUpdateTimeout: NodeJS.Timeout;
              editor.onDidChangeCursorPosition((e) => {
                if (collaboration.updateCursor && user) {
                  console.log('[CURSOR EMIT] Cursor moved to:', e.position.lineNumber, e.position.column);
                  
                  // Throttle cursor updates to avoid spam
                  clearTimeout(cursorUpdateTimeout);
                  cursorUpdateTimeout = setTimeout(() => {
                    collaboration.updateCursor(e.position.lineNumber, e.position.column);
                  }, 100); // Throttle to 100ms
                }
              });
            }}
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
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a file to start editing
          </div>
        )}
      </div>
      
      {/* Stdin Input Dialog */}
      <Dialog open={showStdinDialog} onOpenChange={setShowStdinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Input</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stdin">Input for your program (stdin):</Label>
              <textarea
                id="stdin"
                placeholder="Enter input here..."
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                className="w-full min-h-24 px-3 py-2 text-sm bg-surface-primary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Each line will be provided as input to your program
              </p>
            </div>
            <div className="flex space-x-2">
              <PrimaryButton
                onClick={runWithStdin}
                disabled={isRunning}
                className="flex-1"
              >
                <Play size={16} className="mr-2" />
                {isRunning ? 'Running...' : 'Run with Input'}
              </PrimaryButton>
              <PrimaryButton
                variant="ghost"
                onClick={() => setShowStdinDialog(false)}
                disabled={isRunning}
              >
                Cancel
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};