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

    // Submit code for execution
    console.log('Submitting to Judge0 API...');
    const submissionPayload = {
      language_id: languageId,
      source_code: processedSource,
      stdin: stdin
    };
    
    const submissionResponse = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(submissionPayload)
    });

    console.log('Judge0 response status:', submissionResponse.status);
    
    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error('Judge0 API error response:', errorText);
      
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
          error: 'Judge0 API error',
          message: errorMessage,
          status: submissionResponse.status
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result: Judge0Response = await submissionResponse.json();
    console.log('Judge0 result:', { status: result.status, hasOutput: !!result.stdout });

    // Process and return results
    const response = {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      status: result.status?.description || 'Unknown',
      time: result.time || '0',
      memory: result.memory || 0,
      language: language,
      success: result.status?.id === 3, // Status ID 3 means "Accepted"
      output: result.stdout || result.stderr || result.compile_output || 'No output',
      error: result.stderr || (result.status?.id !== 3 ? result.status?.description : null)
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
        message: error.message,
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});