import { GoogleGenAI } from "@google/genai";

// https://ai.google.dev/gemini-api/docs/quickstart#javascript -- docs
// old library got deprecated -- this is new geni ai library
// read docs and properly import lib --> thats the only prob --> rest eveything is working

let aiClient = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key");
  }

  // Lazy init — runs ONLY when function is called
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return aiClient;
}

export const generateExplanation = async ({
  riskScore,
  reasons,
  trustScore,
  overrideCount,
  decision
}) => {
  const ai = getGeminiClient();

  const prompt = `
You are a financial safety assistant.

Context:
- Risk Score: ${riskScore}
- Decision: ${decision}
- Trust Score: ${trustScore}
- Past Overrides: ${overrideCount}
- Risk Reasons: ${reasons.join(", ")}

Explain clearly and calmly:
- Why this action is risky
- How past behavior influenced this
- What could happen if user proceeds
- Do NOT judge or shame
- Do NOT decide anything
- Keep it under 120 words
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  if (!response.text) {
    throw new Error("Empty Gemini response");
  }

  return response.text;
};