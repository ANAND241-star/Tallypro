
import { GoogleGenAI } from "@google/genai";

export class TallyAIService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use the exact named parameter and process.env.API_KEY directly
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getProductRecommendation(userProblem: string): Promise<string> {
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
