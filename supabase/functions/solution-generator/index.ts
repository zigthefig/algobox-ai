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
        const { problem, language } = await req.json();

        const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const systemPrompt = `You are a world-class competitive programmer and algorithm expert. 
Your task is to provide the MOST OPTIMAL solution for the given problem in ${language}.
Your code must be clean, readable, and highly optimized for time and space complexity.
IMPORTANT: Return ONLY the raw code. Do not wrap it in markdown backticks. Do not add explanations. Do not simple print statements unless part of the solution.
The code must be a complete valid ${language} function/script that can be executed directly.`;

        const userPrompt = `Problem Title: ${problem.title}
Problem Description: ${problem.description}
Constraints: ${problem.constraints ? problem.constraints.join("\n") : "Standard constraints"}

Write the optimal ${language} solution now.`;

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
                    temperature: 0.1 // Low temperature for deterministic, optimal code
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", response.status, errorText);
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        let code = data.choices?.[0]?.message?.content || "";

        // Clean up if the LLM accidentally added markdown
        code = code.replace(/```javascript/g, "").replace(/```/g, "").trim();

        return new Response(
            JSON.stringify({ code }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in solution-generator:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
