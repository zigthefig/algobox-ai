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
    const { code, error, language, problemContext, tests, skipAnalysis, executionResults, userQuestion, visualize } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    // Helper to call Groq (or fallback to Gemini if you prefer, but sticking to Groq as per existing code)
    async function callLLM(systemPrompt: string, userPrompt: string) {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 4096,
            temperature: 0.2
          })
        }
      );
      if (!response.ok) {
        throw new Error(`LLM API Error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    }

    // Handle Visualization Request
    if (visualize || language === 'sql') {
      let visualization = null;

      if (language === 'sql') {
        const systemPrompt = `You are an SQL Query Engine Simulator.
            Your task is to generate valid JSON data that represents the result of the user's SQL query.
            
            Rules:
            1. Analyze the SQL query to understand the columns and expected data.
            2. Generate appropriate meaningful mock data (5-10 rows).
            3. Return ONLY valid JSON in the following format:
            {
                "type": "sql",
                "data": [
                    { "id": 1, "name": "John Doe", "email": "john@example.com" },
                    ...
                ]
            }
            4. If the query is invalid, generate a JSON with an error message in a table row or just empty.
            5. Do NOT output markdown or explanation, JUST the JSON.
            `;
        const content = await callLLM(systemPrompt, `Generate mock results for this SQL query:\n\n${code}`);
        try {
          // simple cleanup to get json if wrapped in backticks
          const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
          visualization = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse SQL visualization JSON:", e);
          visualization = { type: 'sql', data: [] }; // Fallback
        }
      } else {
        // Algorithm Visualization
        const systemPrompt = `You are an Algorithm Execution Trace Generator.
            Your task is to trace the execution of the provided code and generate a JSON representation of the state at each significant step.
            
            Rules:
            1. Analyze the code logic (sorting, searching, etc.).
            2. If it's a known algorithm (Bubble Sort, Binary Search, etc.), map it to the 'visual-canvas' format.
            3. If it's a generic array manipulation (like Two Sum), map it to a simple array visualization.
            4. Return ONLY valid JSON in the following format:
            {
                "type": "algorithm",
                "algorithm": "bubble-sort", // or 'quick-sort', 'generic-array'
                "steps": [
                    {
                        "index": 0,
                        "type": "compare",
                        "description": "Comparing index 0 and 1",
                        "state": {
                             "array": [2, 7, 11, 15],
                             "comparing": [0, 1], // indices being compared
                             "sorted": [],
                             "variables": { "i": 0, "j": 1 }
                        }
                    },
                    ...
                ]
            }
            
            Note for 'two-sum':
            - Treat it as a 'generic-array' or simulate 'bubble-sort' style highlighting if helpful.
            - VisualCanvas expects specific 'algorithm' types: 'quick-sort', 'bubble-sort', 'merge-sort', 'binary-search'.
            - If it doesn't fit, map it to 'bubble-sort' but just use highligting for 'comparing' to show current indices being checked.
            
            Return ONLY valid JSON.
            `;
        const content = await callLLM(systemPrompt, `Trace this ${language} code and generate visualization steps:\n\n${code}`);
        try {
          const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
          visualization = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse Algorithm visualization JSON:", e);
        }
      }

      // For SQL, we treat visualization as the main result, so we return early or combine
      return new Response(
        JSON.stringify({ visualization, execution: { available: true, passed: true } }), // Mock execution success for viz
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ... EXISTING EXECUTION LOGIC ...
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
            // execution.error = "language_not_supported"; // Don't error, just don't try execution
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

    const analysis = await callLLM(systemPrompt, userPrompt);

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
