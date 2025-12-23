
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, MapsResult, EACCountry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AUDIT_KNOWLEDGE_BASE = `
Core EAC Financial Audit Certifications: ICPAK (Kenya), ICPAU (Uganda), NBAA (Tanzania), ICPAR (Rwanda), ONEC (DRC).
Regional Bodies: East African Community (EAC) Secretariat, EAC Customs Union, Common Market Protocol.

Regional Tax Authorities:
1. Kenya: Kenya Revenue Authority (KRA), iTax System.
2. Uganda: Uganda Revenue Authority (URA), e-Tax.
3. Tanzania: Tanzania Revenue Authority (TRA), EFDMS.
4. Rwanda: Rwanda Revenue Authority (RRA), EBM system.
5. Burundi: OBR (Office Burundais des Recettes).
6. South Sudan: National Revenue Authority (NRA).
7. DR Congo: DGI (Direction Générale des Impôts).

Audit Standards: Adoption of IFRS for SMEs and ISA (International Standards on Auditing) across the region.
Ideologies: Professional Skepticism, Public Interest, Inclusive Capitalism in Africa.
`;

const getSystemInstruction = (country: EACCountry) => `You are mugisolo, a specialized regional AI assistant for SMEs in the East African Community (EAC).
Currently, your context is strictly set to ${country}. 
You are an expert in regional tax laws (EAC Common External Tariff) and specific national regulations (e.g., Kenya KRA iTax, Rwanda RRA EBM).
Apply ideologies of professional skepticism and act as a gatekeeper for African financial markets.
Refer to this regional knowledge base: ${AUDIT_KNOWLEDGE_BASE}
Always be professional and concise. Use Maps for local geography queries.`;

export const chatWithGemini = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[], 
  country: EACCountry,
  useThinking: boolean = false
) => {
  const model = 'gemini-3-pro-preview';
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: getSystemInstruction(country),
      thinkingConfig: useThinking ? { thinkingBudget: 32768 } : undefined,
    },
    history,
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const extractReceiptData = async (base64Image: string, country: EACCountry): Promise<Partial<Transaction>> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Extract transaction details from this receipt for a business located in ${country}. 
  Extract: Date (YYYY-MM-DD), Total Amount, Merchant, Category, Invoice Number, Due Date.
  Identify if it's Income or Expense.
  Return strictly valid JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          dueDate: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['income', 'expense'] }
        },
        required: ['amount', 'description', 'category']
      }
    }
  });
  try { return JSON.parse(response.text || '{}'); } catch (e) { return {}; }
};

export const analyzeAnomalies = async (transactions: Transaction[], country: EACCountry): Promise<any[]> => {
  const model = 'gemini-3-pro-preview';
  const prompt = `Perform continuous compliance monitoring for a ${country}-based SME. 
  Check for regional fraud patterns, local tax miscalculations, and IFRS/ISA inconsistencies.
  Transactions: ${JSON.stringify(transactions)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            transactionId: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            reason: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          }
        }
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateManagementCommentary = async (transactions: Transaction[], country: EACCountry, language: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Provide management commentary for a ${country} business in ${language}.
  Transactions: ${JSON.stringify(transactions)}`;
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || 'No commentary generated.';
};

// Added analyzeFinancialImage to handle document evidence analysis
export const analyzeFinancialImage = async (base64Image: string, prompt: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      }
    ],
  });
  return response.text || '';
};

export const findNearbyAccountingServices = async (lat: number, lng: number): Promise<{ text: string, maps: MapsResult[] }> => {
  const model = 'gemini-2.5-flash';
  const response = await ai.models.generateContent({
    model,
    contents: "Find the nearest regional revenue authority offices and certified EAC accounting firms near me.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
    }
  });
  const mapsResults: MapsResult[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  for (const chunk of chunks) {
    if (chunk.maps) { mapsResults.push({ title: chunk.maps.title || 'Location', uri: chunk.maps.uri }); }
  }
  return { text: response.text || 'Found locations.', maps: mapsResults };
};
