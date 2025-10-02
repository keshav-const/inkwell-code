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
  
  // Listen for code execution results from editor
  useEffect(() => {
    const handleExecutionResult = (event: CustomEvent) => {
      const { output, isError } = event.detail;
      const newOutput: TerminalOutput = {
        id: Date.now().toString(),
        command: 'run',
        output,
        error: isError ? 'true' : undefined,
        timestamp: new Date().toLocaleTimeString(),
      };
      setOutputs(prev => [...prev, newOutput]);
    };

    window.addEventListener('code-execution-result', handleExecutionResult as EventListener);
    return () => {
      window.removeEventListener('code-execution-result', handleExecutionResult as EventListener);
    };
  }, []);

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
  Supported languages: JavaScript, Python, C++, Java, C#, Go, Rust, PHP, Ruby, and more.
  
Troubleshooting:
  - Make sure you have an active file selected in the editor
  - Check that your code syntax is correct for the selected language
  - View the browser console for detailed error messages`
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
              ? { ...output, output: 'No active file to run. Please select a file in the editor first.', error: 'true' }
              : output
          ));
          setIsExecuting(false);
          return;
        }

        console.log('🏃 Executing code via judge0-runner:', {
          language: activeFile.language,
          contentLength: activeFile.content?.length || 0
        });

        try {
          // Execute the active file using Judge0
          const { data, error } = await supabase.functions.invoke('judge0-runner', {
            body: {
              language: activeFile.language,
              source: activeFile.content,
              stdin: ''
            }
          });

          console.log('📤 Judge0 response:', { data, error });

          if (error) {
            console.error('❌ Function invocation failed:', error);
            
            setOutputs(prev => prev.map(output => 
              output.id === newOutput.id 
                ? { 
                    ...output, 
                    output: '❌ Code execution service temporarily unavailable. Please retry.', 
                    error: 'true' 
                  }
                : output
            ));
            
            toast({
              title: "Error",
              description: "Code execution failed",
              variant: "destructive"
            });
            
            setIsExecuting(false);
            return;
          }

          // Handle standardized response format with status field
          if (data?.status === 'error') {
            console.error('❌ Judge0 execution error:', data);
            
            setOutputs(prev => prev.map(output => 
              output.id === newOutput.id 
                ? { 
                    ...output, 
                    output: `❌ ${data.message || 'Code execution service temporarily unavailable. Please retry.'}`, 
                    error: 'true' 
                  }
                : output
            ));
            
            toast({
              title: "Error",
              description: "Code execution failed",
              variant: "destructive"
            });
            
            setIsExecuting(false);
            return;
          }

          // Success case - extract all output fields
          const stdout = data?.stdout?.trim() || '';
          const stderr = data?.stderr?.trim() || '';
          const compile_output = data?.compile_output?.trim() || '';
          const status = data?.execution_status || 'Completed';
          
          console.log('📊 Judge0 Response:', { 
            stdout: stdout ? `${stdout.substring(0, 100)}...` : '(empty)',
            stderr: stderr ? `${stderr.substring(0, 100)}...` : '(empty)',
            compile_output: compile_output ? `${compile_output.substring(0, 100)}...` : '(empty)',
            status,
            time: data.time,
            memory: data.memory
          });
          
          let output = `Running ${activeFile.name}...\n`;
          
          // Show stdout first (program output)
          if (stdout) {
            output += `\n📤 Output:\n${stdout}\n`;
          }
          
          // Show compilation errors
          if (compile_output) {
            output += `\n❌ Compilation Error:\n${compile_output}\n`;
          }
          
          // Show runtime errors (stderr)
          if (stderr) {
            output += `\n❌ Runtime Error:\n${stderr}\n`;
          }
          
          // If no output at all
          if (!stdout && !stderr && !compile_output) {
            output += '\n✅ Code executed successfully (no output generated)\n';
          }
          
          // Always show execution stats
          output += `\n⏱️ Execution time: ${data.time || '0'}s`;
          
          if (data.memory) {
            output += ` | Memory: ${data.memory} KB`;
          }
          
          const hasError = data?.status === 'error' || !!stderr || !!compile_output;

          setOutputs(prev => prev.map(outputItem => 
            outputItem.id === newOutput.id 
              ? {
                  ...outputItem,
                  output,
                  error: hasError ? 'true' : undefined,
                  exitCode: hasError ? 1 : 0
                }
              : outputItem
          ));
          
          // Show simple notification
          toast({
            title: hasError ? "Error" : "Run complete",
            description: hasError ? "Check terminal for details" : "Code executed successfully"
          });
        } catch (runError: any) {
          console.error('❌ Run command failed:', runError);
          setOutputs(prev => prev.map(output => 
            output.id === newOutput.id 
              ? { 
                  ...output, 
                  output: `Failed to execute code: ${runError.message}\n\n🔧 Try refreshing the page or check your connection.`, 
                  error: 'true' 
                }
              : output
          ));
        }
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
      <div className="flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap">
        {outputs.length === 0 ? (
          <div className="text-muted-foreground">
            Press Run to execute your code. Output will appear here.
          </div>
        ) : (
          outputs.map((output) => (
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
                <div className="ml-4 whitespace-pre-wrap">
                  {(() => {
                    const lines = output.output.split('\n');
                    let currentSection = 'normal'; // 'normal', 'stdout', 'compilation-error', 'runtime-error'
                    
                    return lines.map((line, index) => {
                      // Detect section markers
                      if (line.includes('📤 Output:')) {
                        currentSection = 'stdout';
                      } else if (line.includes('❌ Compilation Error:')) {
                        currentSection = 'compilation-error';
                      } else if (line.includes('❌ Runtime Error:')) {
                        currentSection = 'runtime-error';
                      } else if (line.includes('⏱️') || line.includes('✅')) {
                        currentSection = 'normal';
                      }
                      
                      // Determine color based on current section and line content
                      let colorClass = 'text-gray-300'; // default
                      
                      if (line.includes('❌') || currentSection === 'compilation-error' || currentSection === 'runtime-error') {
                        colorClass = 'text-red-400';
                      } else if (line.includes('✅')) {
                        colorClass = 'text-green-400';
                      } else if (line.includes('⏱️') || line.includes('📊')) {
                        colorClass = 'text-blue-400';
                      } else if (line.includes('📤 Output:')) {
                        colorClass = 'text-cyan-400';
                      } else if (currentSection === 'stdout') {
                        colorClass = 'text-gray-100'; // stdout in white/light gray
                      }
                      
                      return (
                        <div key={index} className={colorClass}>
                          {line}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};