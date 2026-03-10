import { ILlmProvider, LlmResponse } from './ILlmProvider';
import { GoogleGenAI } from '@google/genai';

export class GeminiProvider implements ILlmProvider {
    private ai: GoogleGenAI;
    private model: string;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = 'gemini-2.5-flash';
    }

    public async generate(systemPrompt: string, messages: { role: string, content: string }[]): Promise<LlmResponse> {
        try {
            const contents = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: contents,
                config: {
                    systemInstruction: systemPrompt
                }
            });

            return {
                text: response.text
            };
        } catch (e: any) {
            console.error("Gemini Error:", e.message);
            return { error: e.message };
        }
    }
}
