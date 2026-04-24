import { loadUntil, log } from './ioManager.ts';
import { randomPeriods } from "./terminalFormatting.ts";
import { PromptKeys, Prompts } from './utils/Prompting.ts';



const maxTries = 5;
export async function askGeminiWithRetry(query: string, key: string, systemPromt: PromptKeys = 'TEXT_PROMPT'): Promise<string> {
    let num503s = 0;

  const process = async () => {
    let numTries = 0;
    while (numTries < maxTries) {
      numTries++;
      try {
        const prompt = Prompts[systemPromt]
        const response = await askGemini(query, key, prompt);
        return response;
      } catch (err) {
        if (err instanceof GeminiError && err.status === 503) {
          num503s++;
        } else {
          throw err;
        }
      }
    }
    throw new GeminiError(503, 'Gemini servers are cooked!', {});
  };

  return await loadUntil(process());
}

export async function askGemini(query: string, key: string, systemPromt: string): Promise<string> {
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{
          text: systemPromt,
        }],
      },
      contents: [{
        parts: [{ text: query }],
      }],
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    if (response.status === 503) {
      throw new GeminiError(503, response.statusText, errorBody,);
    }
    throw new GeminiError(response.status, response.statusText,errorBody);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof candidate === "string") {
    return candidate;
  } else {
    throw new Error("No valid response from Gemini API.");
  }
}

export class GeminiError extends Error {
  status: number;
  statusText: string;
  body: any;

  constructor(status: number, statusText: string, body: any) {
    super();
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}
