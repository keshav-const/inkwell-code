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
            let errorMessage = `Failed to execute code: ${error.message}`;
            
            if (error.message?.includes('non-2xx status code')) {
              errorMessage += '\n\n🔧 Troubleshooting:\n• Check if RapidAPI key is configured\n• Verify Judge0 service is available\n• Check Edge Function logs for details';
            }
            
            setOutputs(prev => prev.map(output => 
              output.id === newOutput.id 
                ? { ...output, output: errorMessage, error: 'true' }
                : output
            ));
            setIsExecuting(false);
            return;
          }

          // Handle response data
          if (data?.error) {
            console.error('❌ Judge0 API error:', data);
            let errorMessage = `Judge0 Error: ${data.error}`;
            
            if (data.message?.includes('authentication') || data.message?.includes('401')) {
              errorMessage += '\n\n💡 This appears to be an API authentication issue.\nPlease check that the RapidAPI key is properly configured.';
            } else if (data.message?.includes('subscription')) {
              errorMessage += '\n\n💡 Your RapidAPI subscription may need to be activated.';
            } else if (data.help) {
              errorMessage += `\n\n${data.help}`;
            }
            
            setOutputs(prev => prev.map(output => 
              output.id === newOutput.id 
                ? { ...output, output: errorMessage, error: 'true' }
                : output
            ));
            setIsExecuting(false);
            return;
          }

          // Success case
          const stdout = data?.stdout || '';
          const stderr = data?.stderr || '';
          const compile_output = data?.compile_output || '';
          const status = data?.status || 'Unknown';
          
          let output = `Running ${activeFile.name}...\n`;
          
          if (stdout) {
            output += `✅ Output:\n${stdout}\n`;
          }
          
          if (compile_output) {
            output += `🔧 Compile Output:\n${compile_output}\n`;
          }
          
          if (stderr) {
            output += `❌ Errors:\n${stderr}\n`;
          }
          
          if (!stdout && !stderr && !compile_output) {
            output += '✅ Code executed successfully (no output generated)';
          }
          
          output += `\n📊 Status: ${status}`;
          
          if (data.time) {
            output += ` | ⏱️ Time: ${data.time}s`;
          }
          
          if (data.memory) {
            output += ` | 🧠 Memory: ${data.memory} KB`;
          }
          
          const hasError = data?.success === false || !!stderr;

          setOutputs(prev => prev.map(outputItem => 
            outputItem.id === newOutput.id 
              ? {
                  ...outputItem,
                  output,
                  error: hasError ? 'true' : undefined,
                  exitCode: data?.exitCode || (hasError ? 1 : 0)
                }
              : outputItem
          ));
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
                  {output.output.split('\n').map((line, index) => {
                    const isStderr = line.includes('❌ Errors:') || 
                                     (output.output.includes('❌ Errors:') && 
                                      output.output.indexOf(line) > output.output.indexOf('❌ Errors:') &&
                                      (output.output.indexOf('📊 Status:') === -1 || 
                                       output.output.indexOf(line) < output.output.indexOf('📊 Status:')));
                    const isError = output.error === 'true' || line.includes('❌') || line.includes('Error:');
                    const isSuccess = line.includes('✅') || line.includes('Output:');
                    const isInfo = line.includes('📊') || line.includes('⏱️') || line.includes('🧠');
                    
                    return (
                      <div 
                        key={index} 
                        className={`${
                          isStderr || isError ? 'text-red-400' :
                          isSuccess ? 'text-green-400' :
                          isInfo ? 'text-blue-400' :
                          'text-gray-300'
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
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