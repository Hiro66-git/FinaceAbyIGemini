import { GoogleGenAI, Type } from "@google/genai";
import { Expense } from '../types';

// Fix: Correctly initialize GoogleGenAI client as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseReceipt = async (base64Image: string, mimeType: string) => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: 'Analyze this receipt and extract the total amount, date (in YYYY-MM-DD format), and a brief description or merchant name. Respond in the JSON format defined by the schema.',
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                // Fix: Removed invalid `required` property from responseSchema.
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: {
                            type: Type.NUMBER,
                            description: 'The total amount on the receipt.'
                        },
                        date: {
                            type: Type.STRING,
                            description: 'The date on the receipt in YYYY-MM-DD format.'
                        },
                        description: {
                            type: Type.STRING,
                            description: 'The merchant name or a brief description of the purchase.'
                        }
                    }
                }
            }
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as { amount: number; date: string; description: string; };

    } catch (error) {
        console.error("Error parsing receipt with Gemini:", error);
        throw new Error("Failed to analyze receipt. Please try again or enter details manually.");
    }
};

export const generateFinancialInsight = async (expenses: Expense[]): Promise<string> => {
    const prompt = `Based on the following expense data from the last few months, provide one concise, actionable financial insight for a small business owner or freelancer. Focus on spending trends, potential savings, or category analysis. Keep the insight to a single sentence. For example: "Your software subscription costs have been steadily increasing; consider reviewing them for potential savings."
    
    Expense Data:
    ${JSON.stringify(expenses, null, 2)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Fix: Use the recommended `response.text` property to extract the text.
        return response.text.trim();
    } catch (error) {
        console.error("Error generating insight with Gemini:", error);
        return "Could not generate an insight at this time.";
    }
};
