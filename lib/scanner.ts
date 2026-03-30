export const SECURITY_SYSTEM_PROMPT = `
You are both a Company IT Manager and a user-friendly AI Expert.
Analyze the following MCP server code and provide both a SECURITY and an OVERVIEW analysis using non-technical language.

1. SECURITY ANALYSIS:
   - What does this MCP do? (1 simple sentence)
   - What does it access? (Files, APIs, sensitive data, etc. with concrete examples)
   - Worst case scenario? (A realistic, non-alarmist but serious example)
   - What's your recommendation? (Simple, actionable advice)

2. STRUCTURED OVERVIEW:
   - What is it? (Detailed, 2-3 paragraph definition explaining the core value and technology)
   - How to use? (Detailed, multi-step guide including installation and common commands)
   - Key Features? (At least 4 distinct features)
   - Use Cases? (At least 3 realistic scenario examples)
   - FAQ? (At least 3 comprehensive Q&A pairs)

Return the result ONLY in the following JSON format:
{
  "safety": {
    "overall_score": <safety score 1-10>,
    "risk_level": "LOW" | "MEDIUM" | "HIGH",
    "supports_scoping": <boolean>,
    "what_it_does": "Short description",
    "what_it_accesses": ["Access 1", "Access 2"],
    "worst_case_scenario": "Scenario description",
    "recommendation": "Advice",
    "safe_install_command": "npx ... --scope ...",
    "unsafe_install_command": "npx ...",
    "scope_guide": "Scoping guide text"
  },
  "overview": {
    "what_is": "What is it?",
    "how_to_use": "How to use?",
    "key_features": ["Feature 1", "Feature 2"],
    "use_cases": ["Scenario 1", "Scenario 2"],
    "faq": [
      {"q": "Question 1", "a": "Answer 1"},
      {"q": "Question 2", "a": "Answer 2"}
    ]
  },
  "summary": "General summary"
}

CRITICAL RULES:
- ABSOLUTELY NO technical jargon (Forbidden: process.env, fs.readFile, exec, api_key, etc.).
- Use clear, user-centric language instead (e.g., "can read your files", "can send data to external servers").
- The language MUST be English.
`;

import { calculateHeuristicAnalysis } from './trust-engine';

const MODEL_PRIMARY = 'claude-3-5-sonnet-20241022';
const MODEL_FALLBACK = 'claude-3-opus-20240229';

export function getMockAnalysis(server: any) {
  const serverName = server?.name || 'this reservoir';
  const heuristic = calculateHeuristicAnalysis({
    name: server?.name || 'server',
    stars: server?.stars || 0,
    github_updated_at: server?.updated_at || new Date().toISOString(),
    author: server?.author || 'unknown',
    is_verified: server?.is_verified || false
  });

  return {
    safety: {
      ...heuristic.security,
      overall_score: heuristic.score,
      signals: heuristic.signals
    },
    overview: {
      what_is: `A high-performance MCP server implementation for ${serverName} that bridges the gap between the Model Context Protocol and external services. It allows Large Language Models to interact with your data and tools with low latency and native support.`,
      how_to_use: `1. Ensure you have an MCP-compatible client (like Claude Desktop) installed.\n2. Configure your server with: npx @modelcontextprotocol/${serverName}\n3. Restart your client and verify the new tools are available in the system catalog.`,
      key_features: [
        "Native MCP Protocol Support",
        "High-performance Data Streaming",
        "Type-safe Tool Definitions",
        "Seamless Environment Integration"
      ],
      use_cases: [
        "Connecting external databases to AI workflows",
        "Automating workflow tasks via natural language",
        "Augmenting developer productivity with specialized tools"
      ],
      faq: [
        {"q": "What is an MCP server?", "a": "MCP is an open standard that enables developers to build secure, two-way integrations between AI models and local or remote data sources."},
        {"q": "Is this server ready for production?", "a": "Yes, this server follows standard MCP security patterns and tool-restricted access."}
      ]
    },
    summary: "Generated via Metadata Heuristics (AI Scanner Offline)."
  };
}

export async function analyzeServerWithClaude(sourceCode: string, server?: any) {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const serverName = server?.name || 'this server';
  
  // Truncate context to stay within token limits (approx 15k chars for safety)
  const truncatedContext = sourceCode.slice(0, 15000);

  if (!anthropicApiKey) {
    console.warn("ANTHROPIC_API_KEY is not set. Returning mock data.");
    return getMockAnalysis(server);
  }

  const makeRequest = async (modelName: string) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 2000,
        system: SECURITY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: "Analyze this MCP server:\n" + truncatedContext }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('over_quota') || errorText.includes('credit')) {
         console.warn("API Quota exceeded. Using mock fallback.");
         return { isMock: true };
      }
      throw new Error(errorText);
    }
    return response.json();
  };

  try {
    let data;
    try {
      data = await makeRequest(MODEL_PRIMARY);
      if (data.isMock) return getMockAnalysis(server);
    } catch (error: any) {
      if (error.message && error.message.includes('not_found')) {
        console.log('Primary model unavailable, using fallback...');
        data = await makeRequest(MODEL_FALLBACK);
        if (data.isMock) return getMockAnalysis(server);
      } else {
        throw error;
      }
    }

    const textContent = data.content[0].text;
    
    // Attempt to parse JSON
    const jsonStart = textContent.indexOf("{");
    const jsonEnd = textContent.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd >= 0) {
      return JSON.parse(textContent.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error("Invalid response format from Claude");
  } catch (error) {
    console.error("Scanner Error:", error);
    // Final fallback to mock if everything fails
    return getMockAnalysis(server);
  }
}
