import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, role } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Based on this job posting URL and role title, infer the job details.
Role: ${role || "Unknown"}
Job URL: ${url || "Not provided"}

Extract or infer the following about this job position based on common knowledge about the company and role. Be concise and factual. If you don't know something, return null for that field.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a job research assistant. Return structured data about job positions based on the URL and role provided.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "enrich_position",
                description: "Return enriched job position information",
                parameters: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                      description: "Brief job description including key responsibilities (2-3 sentences)",
                    },
                    salary_min: {
                      type: "integer",
                      description: "Estimated minimum annual salary in the local currency. Return null if unknown.",
                    },
                    salary_max: {
                      type: "integer",
                      description: "Estimated maximum annual salary in the local currency. Return null if unknown.",
                    },
                    salary_currency: {
                      type: "string",
                      description: "Currency code (EUR, USD, GBP, CHF). Default to EUR if unknown.",
                    },
                    notes: {
                      type: "string",
                      description: "Key requirements, qualifications, and interesting details about the position",
                    },
                  },
                  required: ["description"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "enrich_position" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const enriched = JSON.parse(toolCall.function.arguments);

    // Clean up null values
    const cleanData: Record<string, any> = {};
    if (enriched.description) cleanData.description = enriched.description;
    if (enriched.salary_min) cleanData.salary_min = enriched.salary_min;
    if (enriched.salary_max) cleanData.salary_max = enriched.salary_max;
    if (enriched.salary_currency) cleanData.salary_currency = enriched.salary_currency;
    if (enriched.notes) cleanData.notes = enriched.notes;

    return new Response(JSON.stringify({ success: true, data: cleanData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enrich-position error:", e);
    return new Response(
      JSON.stringify({
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
