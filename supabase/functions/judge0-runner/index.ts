import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunCodeRequest {
  language: string;
  source: string;
  stdin?: string;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

// Language mapping from Monaco to Judge0
const languageMap: Record<string, number> = {
  'javascript': 63, // Node.js
  'typescript': 74, // TypeScript
  'python': 71, // Python 3
  'java': 62, // Java
  'cpp': 76, // C++ (GCC 9.2.0)
  'c': 75, // C (GCC 9.2.0)
  'csharp': 51, // C# (.NET Core)
  'go': 60, // Go
  'rust': 73, // Rust
  'php': 68, // PHP
  'ruby': 72, // Ruby
  'html': 63, // Use Node.js for HTML (will need to be wrapped)
  'css': 63, // Use Node.js for CSS (will need to be wrapped)
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request with method:', req.method);
    const { language, source, stdin = '' }: RunCodeRequest = await req.json();
    console.log('Request payload:', { language, sourceLength: source?.length });

    // Validate input
    if (!language || !source) {
      return new Response(
        JSON.stringify({ 
          error: 'Language and source code are required',
          received: { language: !!language, source: !!source }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if we support this language
    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported language: ${language}`,
          supported_languages: Object.keys(languageMap)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare source code based on language
    let processedSource = source;
    
    // Special handling for HTML/CSS - wrap them in Node.js code
    if (language.toLowerCase() === 'html') {
      processedSource = `
        console.log("HTML Preview:");
        console.log(\`${source.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
      `;
    } else if (language.toLowerCase() === 'css') {
      processedSource = `
        console.log("CSS Styles:");
        console.log(\`${source.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
      `;
    }

    // Judge0 API endpoint
    const judge0Url = 'https://judge0-ce.p.rapidapi.com';
    
    // Try multiple possible environment variable names for the API key
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY') || 
                       Deno.env.get('RAPID_API_KEY') || 
                       Deno.env.get('JUDGE0_API_KEY');
    
    console.log('Available env vars:', Object.keys(Deno.env.toObject()));
    console.log('RapidAPI key configured:', !!rapidApiKey);
    console.log('RapidAPI key length:', rapidApiKey?.length || 0);
    
    if (!rapidApiKey) {
      console.error('No RapidAPI key found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Judge0 API key not configured. Please check that RAPIDAPI_KEY is set in Supabase secrets.',
          help: 'Visit https://rapidapi.com/judge0-official/api/judge0-ce to get an API key',
          available_env_vars: Object.keys(Deno.env.toObject()).filter(k => k.includes('API'))
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Encode source code in base64 to handle UTF-8 issues properly
    const encodedSource = btoa(unescape(encodeURIComponent(processedSource)));
    const encodedStdin = stdin ? btoa(unescape(encodeURIComponent(stdin))) : '';

    // Submit code for execution
    console.log('Submitting to Judge0 API with base64 encoding...');
    const submissionPayload = {
      language_id: languageId,
      source_code: encodedSource,
      stdin: encodedStdin,
      redirect_stderr_to_stdout: false
    };
    
    let submissionResponse;
    let submissionResult;
    
    try {
      submissionResponse = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify(submissionPayload)
      });

      console.log('Judge0 submission response status:', submissionResponse.status);
      
      if (!submissionResponse.ok) {
        const errorText = await submissionResponse.text();
        console.error('Judge0 API submission error response:', errorText);
        
        // Parse error message for better user feedback
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorText;
        } catch {
          errorMessage = errorText;
        }
        
        if (submissionResponse.status === 401 || submissionResponse.status === 403) {
          return new Response(
            JSON.stringify({ 
              error: 'Judge0 API authentication failed',
              message: 'Please check your RapidAPI key and subscription status',
              details: errorMessage,
              help: 'Visit https://rapidapi.com/judge0-official/api/judge0-ce to manage your subscription'
            }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Judge0 API submission error',
            message: errorMessage,
            status: submissionResponse.status,
            judge0_response: errorText
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      submissionResult = await submissionResponse.json();
      console.log('Judge0 submission result:', submissionResult);
      
    } catch (error) {
      console.error('Judge0 submission fetch error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Judge0 API network error',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to connect to Judge0 API'
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!submissionResult.token) {
      return new Response(
        JSON.stringify({ 
          error: 'No submission token received from Judge0',
          details: submissionResult
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Wait and retrieve the execution result
    const token = submissionResult.token;
    let result: Judge0Response | null = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await fetch(
        `${judge0Url}/submissions/${token}?base64_encoded=true`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
        }
      );

      if (resultResponse.ok) {
        result = await resultResponse.json();
        console.log('Judge0 result attempt', attempts + 1, ':', { 
          status: result?.status, 
          hasOutput: !!(result?.stdout || result?.stderr),
          statusId: result?.status?.id 
        });
        
        // Status ID 1 = In Queue, 2 = Processing, 3 = Accepted (finished)
        if (result?.status?.id && result.status.id > 2) {
          break;
        }
      }
      
      attempts++;
    }
    
    if (!result) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve execution result from Judge0',
          message: 'Execution timed out or failed to complete'
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Decode base64 encoded outputs
    const decodedStdout = result.stdout ? atob(result.stdout) : '';
    const decodedStderr = result.stderr ? atob(result.stderr) : '';
    const decodedCompileOutput = result.compile_output ? atob(result.compile_output) : '';

    // Process and return results
    const response = {
      stdout: decodedStdout,
      stderr: decodedStderr,
      compile_output: decodedCompileOutput,
      status: result.status?.description || 'Unknown',
      time: result.time || '0',
      memory: result.memory || 0,
      language: language,
      success: result.status?.id === 3, // Status ID 3 means "Accepted"
      output: decodedStdout || decodedStderr || decodedCompileOutput || 'No output',
      error: decodedStderr || (result.status?.id !== 3 ? result.status?.description : null)
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Judge0 runner error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});