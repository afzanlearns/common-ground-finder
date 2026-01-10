import { GoogleGenerativeAI } from "@google/generative-ai";
import { Result } from "./types";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

// Fallback explanation if API fails or key is missing
const FALLBACK_EXPLANATION =
  "This option was recommended based on the highest overlap of participant availability and location preferences. It aims to maximize attendance while keeping travel distance reasonable for the majority of the group.";

export async function generateExplanation(result: Result): Promise<string> {
  if (!API_KEY) {
    console.warn("GEMINI_API_KEY is missing from backend/.env. Using fallback explanation.");
    return FALLBACK_EXPLANATION;
  }

  // List of models to try in order of preference
  const modelsToTry = [
    "gemini-flash-latest",
    "gemini-1.5-flash",
  ];
  let lastError = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI explanation with model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const bestOption = result.bestOption;
      const alternatives = (result.alternatives || []).map(a => `${a.title} (${a.fairnessScore}% fairness)`).join(", ");

      const prompt = `
          You are an AI assistant for a group decision support app called 'Common Ground Finder'.
          Explain why this specific option was recommended to the group.
          
          Data:
          - Title: ${bestOption.title}
          - Date/Time: ${bestOption.day}, ${bestOption.time}
          - Venue: ${bestOption.location}
          - Fairness: ${bestOption.fairnessScore}%
          - Group Size: ${bestOption.attendees?.length || 0}
          - Pros: ${bestOption.pros?.join(", ") || "N/A"}
          - Alternatives: ${alternatives || "None"}

          Instructions:
          - Clear, neutral, transparent language.
          - Mention trade-offs if some people can't make it.
          - Strictly under 3 sentences.
          - Start with "This option was recommended because..."
          `;

      const resultGen = await model.generateContent(prompt);
      const response = await resultGen.response;
      const text = response.text();

      console.log(`Success! Explanation generated using ${modelName}`);
      return text.trim();
    } catch (error: any) {
      lastError = error.message || String(error);
      console.warn(`Model ${modelName} failed: ${lastError}`);
      if (lastError.includes("API_KEY_INVALID")) break; // Don't try other models if key is bad
    }
  }

  console.error("AI Generation failed for all models. Using fallback.");
  if (lastError.includes("API_KEY_INVALID")) {
    console.error("CRITICAL: Your Gemini API Key is invalid. Please check your .env file.");
  } else if (lastError.includes("404")) {
    console.error("HINT: The selected models are not available for your API key. Make sure the Generative Language API is enabled.");
  }

  return FALLBACK_EXPLANATION;
}
