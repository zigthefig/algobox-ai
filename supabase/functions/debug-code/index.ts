import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, error, language, problemContext, tests, skipAnalysis, executionResults, userQuestion } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Judge0 configuration (optional). If not configured we skip execution but still run AI analysis.
    // Judge0 configuration (optional). If not configured we skip execution but still run AI analysis.
    // Default to the public Judge0 CE instance
    const JUDGE0_API_URL = Deno.env.get("JUDGE0_API_URL") || "https://ce.judge0.com";
    const JUDGE0_API_KEY = Deno.env.get("JUDGE0_API_KEY");
    const JUDGE0_API_HOST = Deno.env.get("JUDGE0_API_HOST"); // Optional: for RapidAPI

    async function judge0Fetch(path: string, init?: RequestInit) {
      const headers: Record<string, string> = {};
      const initHeaders = init?.headers;
      if (initHeaders) {
        if (initHeaders instanceof Headers) {
          initHeaders.forEach((value, key) => { headers[key] = value; });
        } else if (Array.isArray(initHeaders)) {
          initHeaders.forEach(([key, value]) => { headers[key] = value; });
        } else {
          Object.assign(headers, initHeaders);
        }
      }

      // Only add auth headers if a key is explicitly configured
      if (JUDGE0_API_KEY) {
        if (JUDGE0_API_HOST) {
          // RapidAPI pattern
          headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
          headers["X-RapidAPI-Host"] = JUDGE0_API_HOST;
        } else {
          // Standard/Self-hosted auth pattern
          headers["Authorization"] = `Bearer ${JUDGE0_API_KEY}`;
        }
      }

      // Ensure we don't have double slashes if path starts with /
      const baseUrl = JUDGE0_API_URL.replace(/\/$/, "");
      const cleanPath = path.startsWith("/") ? path : `/${path}`;

      return fetch(`${baseUrl}${cleanPath}`, { ...(init || {}), headers });
    }

    // Hardcoded language IDs for common languages (Judge0 CE)
    const LANGUAGE_MAP: Record<string, number> = {
      "python": 71,      // Python 3.8.1
      "python3": 71,
      "py": 71,
      "javascript": 63,  // JavaScript (Node.js 12.14.0)
      "js": 63,
      "node": 63,
      "c++": 54,         // C++ (GCC 9.2.0)
      "cpp": 54,
      "c": 50,           // C (GCC 9.2.0)
      "java": 62,        // Java (OpenJDK 13.0.1)
      "typescript": 74,  // TypeScript (3.7.4)
      "ts": 74,
      "go": 60,          // Go (1.13.5)
      "rust": 73,        // Rust (1.40.0)
      "ruby": 72,        // Ruby (2.7.0)
      "csharp": 51,      // C# (Mono 6.6.0)
      "c#": 51,
    };

    function findLanguageId(lang: string): number | null {
      const lc = (lang || "").toLowerCase().trim();
      return LANGUAGE_MAP[lc] || null;
    }

    async function runSubmission(source_code: string, language_id: number | null, stdin?: string) {
      if (!language_id) {
        return { error: "language_not_supported" };
      }

      const body: any = {
        source_code,
        language_id,
        stdin: stdin || "",
      };

      const res = await judge0Fetch(`/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        return { error: `judge0_error: ${res.status} ${text}` };
      }

      const data = await res.json();
      return data;
    }

    // Attempt to run tests with Judge0 if available
    let execution: any = { available: false };

    if (executionResults) {
      execution = executionResults;
    } else {
      try {
        if (JUDGE0_API_URL) {
          const langId = await findLanguageId(language || "");
          if (langId) {
            execution.available = true;
            execution.tests = [];
            let systemError = null;

            if (Array.isArray(tests) && tests.length > 0) {
              for (const t of tests) {
                if (systemError) break;

                const input = t.input ?? "";
                const expected = t.expected ?? null;
                const result = await runSubmission(code, langId, input);

                // Check for API-level errors (not code execution errors)
                if (result.error && typeof result.error === 'string' && result.error.startsWith('judge0_error')) {
                  systemError = result.error;
                  execution.available = false;
                  execution.error = "Execution server unavailable (API error). Falling back to static analysis.";
                  execution.details = result.error; // Keep technical details for debugging but not for display
                  execution.tests = []; // Clear partial tests
                  break;
                }

                const stdout = (result.stdout ?? result.stdout === "") ? result.stdout : null;
                const passed = expected != null ? (stdout != null ? stdout.trim() === expected.trim() : false) : null;
                execution.tests.push({ input, expected, result, stdout, passed });
              }

              if (!systemError) {
                execution.passed = execution.tests.every((t: any) => t.passed === true);
              }
            } else {
              // Single run without tests
              const result = await runSubmission(code, langId, undefined);
              if (result.error && typeof result.error === 'string' && result.error.startsWith('judge0_error')) {
                execution.available = false;
                execution.error = "Execution server unavailable. Static analysis only.";
              } else {
                execution.latest = result;
              }
            }
          } else {
            execution.available = false;
            execution.error = "language_not_supported";
          }
        }
      } catch (err) {
        console.error("Judge0 execution failed:", err);
        execution.available = false;
        execution.error = "Execution server error. Falling back to static analysis.";
      }
    }

    if (skipAnalysis) {
      return new Response(
        JSON.stringify({ analysis: null, execution }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert coding tutor specializing in debugging and algorithm implementation.

Your role:
1. Analyze the execution results and the user's code.
2. STRICTLY respect the programming language provided. Do NOT hallucinate Python errors if the code is JavaScript/C++.
3. Use Markdown formatting heavily:
   - Use \`\`\`language blocks for ALL code.
   - Use ### Headers for sections.
   - Use **Bold** for emphasis.
   - Ensure there are empty lines between sections for readability.

Context:
Language: ${language}

Scenarios:
A. If code is empty or just starter code:
   - Ask the user to try writing a solution.
   - Offer a hint about the algorithm (e.g. "Try using a hash map").

B. If passed (all tests green):
   - ### Great Job! 🎉
   - Praise the user.
   - ### Optimization
   - Suggest one improvement.

C. If functionality failed:
   - ### Bug Detected 🐞
   - Explain what went wrong.
   - ### Fix
   - Provide the corrected code block.

Format Rules:
- NEVER output plain text code. ALWAYS use code blocks.
- Keep explanation concise.`;

    const executionSummary = JSON.stringify(execution, null, 2);

    const userPrompt = `Debug this ${language} code:

\`\`\`${language}
${code}
\`\`\`

${error ? `Error message: ${error}` : ''}
${problemContext ? `Problem context: ${problemContext}` : ''}

Execution summary:
${executionSummary}

${userQuestion ? `\nUSER QUESTION: ${userQuestion}\n` : 'Help me understand what\'s wrong and how to fix it.'}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1024,
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to analyze the code.";

    return new Response(
      JSON.stringify({ analysis, execution }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in debug-code:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
