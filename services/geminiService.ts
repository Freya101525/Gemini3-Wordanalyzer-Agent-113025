import { GoogleGenAI } from "@google/genai";
import { PROMPTS } from '../constants';

export const getGenAIClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const performOCR = async (
    base64Data: string, 
    model: string = 'gemini-2.5-flash', 
    maxTokens: number = 12000,
    mimeType: string = 'image/png'
): Promise<string> => {
    try {
        const ai = getGenAIClient();
        
        // Using generateContent for multimodal input
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: PROMPTS.ocr
                    }
                ]
            },
            config: {
                maxOutputTokens: maxTokens
            }
        });

        return response.text || "No text detected.";
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to perform OCR. Please check your API Key and file content.");
    }
};

export const generateSmartNote = async (
    text: string,
    prompt: string = PROMPTS.smartNote,
    model: string = 'gemini-2.5-flash',
    maxTokens: number = 12000
): Promise<any> => {
    try {
        const ai = getGenAIClient();
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        text: prompt + "\n\nTEXT TO ANALYZE:\n" + text
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: maxTokens
            }
        });

        const jsonStr = response.text || "{}";
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Smart Note Error:", error);
        throw new Error("Failed to generate Smart Note.");
    }
};

export const askDocumentQuestion = async (
    docText: string, 
    question: string, 
    model: string, 
    maxTokens: number
): Promise<string> => {
    try {
        const ai = getGenAIClient();

        // If the user selects a thinking model, we might need a budget, but for now we'll stick to standard config
        // or let the SDK handle defaults. The Prompt provided by user assumes standard completion.
        
        const response = await ai.models.generateContent({
            model: model, 
            contents: {
                parts: [
                    { text: "You are a helpful assistant analyzing the following document:\n\n" + docText },
                    { text: "Question: " + question }
                ]
            },
            config: {
                maxOutputTokens: maxTokens,
                temperature: 0.7
            }
        });

        return response.text || "No response generated.";
    } catch (error: any) {
        console.error("Q&A Error:", error);
        throw new Error(error.message || "Failed to get answer from AI.");
    }
};

export const analyzeDocumentText = async (
    text: string,
    prompt: string,
    model: string,
    maxTokens: number
): Promise<string> => {
    try {
        const ai = getGenAIClient();
        
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: "Document Text:\n" + text },
                    { text: "Instruction:\n" + prompt }
                ]
            },
            config: {
                maxOutputTokens: maxTokens,
                temperature: 0.5
            }
        });

        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Analysis Error:", error);
        throw new Error("Failed to analyze text.");
    }
};