
import { GoogleGenAI } from "@google/genai";

export class TallyAIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.warn("Failed to initialize Google GenAI", e);
      }
    } else {
      console.warn("Google GenAI API Key is missing. AI features will be disabled.");
    }
  }

  async getProductRecommendation(userProblem: string): Promise<string> {
    if (!this.ai) {
      return "AI recommendations are currently unavailable (API Key missing). Please view our Products page manually.";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `User is looking for a Tally TDL solution. 
                   User Problem: "${userProblem}"
                   Suggest the best automation approach or TDL type. 
                   Keep it professional and concise. Focus on Indian MSME needs.`,
        config: {
          systemInstruction: "You are a professional Tally Developer and Consultant. Help users solve their accounting automation problems using Tally TDL.",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      // Fix: Directly use .text property instead of calling it as a function
      return response.text || "I recommend consulting our customization team for a tailored solution.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Unable to provide an AI recommendation at the moment. Please contact our support.";
    }
  }
}

export const tallyAI = new TallyAIService();
