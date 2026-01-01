
const { GoogleGenAI, Type } = require("@google/genai");

// Initializing Gemini with the provided API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to generate optimized titles and descriptions for social posts
 */
exports.enrichPostMetadata = async (topic, platforms) => {
  try {
    const prompt = `Act as a viral social media strategist. Generate a title and a platform-specific description for a video about: "${topic}". 
    Target platforms: ${platforms.join(', ')}.
    
    Ensure the description includes relevant hashtags and is optimized for engagement.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "hashtags"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      title: result.title,
      description: `${result.description}\n\n${result.hashtags.map(h => '#' + h).join(' ')}`
    };
  } catch (error) {
    console.error('Gemini Enrichment Error:', error.message);
    return null;
  }
};
