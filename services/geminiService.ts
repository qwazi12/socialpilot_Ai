
import { GoogleGenAI, Type } from "@google/genai";
import { AICaptionResponse, AICaptionSuggestion } from "../types";

// Fix: Helper to ensure fresh instance with current env key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartCaption = async (topic: string, platforms: string[]): Promise<AICaptionResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a viral social media manager. Create a high-engagement post for ${platforms.join(', ')} about: "${topic}".`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          engagement_tip: { type: Type.STRING }
        },
        required: ['caption', 'hashtags', 'engagement_tip']
      }
    }
  });

  return JSON.parse(response.text || '{}') as AICaptionResponse;
};

// Fix: Added missing function for generating multiple post suggestions
export const generatePostSuggestions = async (content: string, platform: string): Promise<AICaptionSuggestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 viral versions of this post for ${platform}: "${content}". Tones: Professional, Humorous, Bold.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING },
            text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['tone', 'text', 'hashtags']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]') as AICaptionSuggestion[];
};

// Fix: Added missing function for quality analysis
export const analyzePostQuality = async (content: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following social media post for engagement potential and provide a one-sentence critique: "${content}"`,
  });

  return response.text || "Analysis unavailable.";
};
