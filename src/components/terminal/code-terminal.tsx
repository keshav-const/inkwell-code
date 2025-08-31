import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  error?: string;
  timestamp: string;
  exitCode?: number;
}

interface CodeTerminalProps {
  className?: string;
  activeFile?: {
    id: string;
    name: string;
    content: string;
    language: string;
  };
}

export const CodeTerminal: React.FC<CodeTerminalProps> = ({
  className = "",
  activeFile
}) => {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [outputs]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setIsExecuting(true);

    // Add command to history
    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      command,
      output: '',
      timestamp,
    };

    setOutputs(prev => [...prev, newOutput]);

    try {
      // Handle special commands
      if (command === 'clear') {
        setOutputs([]);
        setCurrentCommand('');
        setIsExecuting(false);
        return;
      }

      if (command === 'help') {
        setOutputs(prev => prev.map(output => 
          output.id === newOutput.id 
            ? {
                ...output,
                output: `Available commands:
  clear     - Clear the terminal
  run       - Run the current file
  help      - Show this help message
  
File execution:
  The terminal will automatically run code from your active file when you use 'run' command.
  Supported languages: JavaScript, Python, C++, and more.`
              }
            : output
        ));
        setIsExecuting(false);
        return;
      }

      if (command === 'run') {
        if (!activeFile) {
          setOutputs(prev => prev.map(output => 
            output.id === newOutput.id 
              ? { ...output, output: 'No active file to run', error: 'true' }
              : output
          ));
          setIsExecuting(false);
          return;
        }

        // Execute the active file using Judge0
        const { data, error } = await supabase.functions.invoke('judge0-runner', {
          body: {
            language: activeFile.language,
            source: activeFile.content,
            stdin: ''
          }
        });

        if (error) throw error;

        const output = data.output || data.error || 'No output';
        const hasError = !!data.error;

        setOutputs(prev => prev.map(output => 
          output.id === newOutput.id 
            ? {
                ...output,
                output: `Running ${activeFile.name}...\n${output}`,
                error: hasError ? 'true' : undefined,
                exitCode: data.exitCode || 0
              }
            : output
        ));
      } else {
        // For other commands, show a helpful message
        setOutputs(prev => prev.map(output => 
          output.id === newOutput.id 
            ? {
                ...output,
                output: `Command '${command}' not recognized. Type 'help' for available commands.`,
                error: 'true'
              }
            : output
        ));
      }
    } catch (error: any) {
      console.error('Terminal execution error:', error);
      setOutputs(prev => prev.map(output => 
        output.id === newOutput.id 
          ? {
              ...output,
              output: `Error: ${error.message}`,
              error: 'true'
            }
          : output
      ));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !isExecuting) {
      executeCommand(currentCommand.trim());
      setCurrentCommand('');
    }
  };

  return (
    <div className={`h-full bg-black text-green-400 p-4 font-mono text-sm overflow-hidden flex flex-col ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-gray-400">Inkwell Terminal</span>
        </div>
        <button
          onClick={() => setOutputs([])}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Welcome message */}
        {outputs.length === 0 && (
          <div className="space-y-1">
            <div className="text-green-500">Welcome to Inkwell Code Terminal</div>
            <div className="text-gray-400">Type 'help' for available commands or 'run' to execute your code.</div>
          </div>
        )}

        {/* Command outputs */}
        {outputs.map((output) => (
          <motion.div
            key={output.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <span className="text-green-500">$</span>
              <span className="text-white">{output.command}</span>
            </div>
            {output.output && (
              <div className={`ml-4 whitespace-pre-wrap ${
                output.error ? 'text-red-400' : 'text-gray-300'
              }`}>
                {output.output}
              </div>
            )}
          </motion.div>
        ))}

        {/* Current command input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-green-500">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            disabled={isExecuting}
            className="flex-1 bg-transparent text-white outline-none disabled:opacity-50"
            placeholder={isExecuting ? "Executing..." : "Type a command..."}
            autoFocus
          />
          {isExecuting && (
            <span className="text-yellow-400 animate-pulse">Running...</span>
          )}
        </form>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};