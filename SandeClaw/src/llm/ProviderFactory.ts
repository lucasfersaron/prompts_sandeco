import { ILlmProvider } from './ILlmProvider';
import { GeminiProvider } from './GeminiProvider';

export class ProviderFactory {
    static create(providerName: string): ILlmProvider {
        switch (providerName.toLowerCase()) {
            case 'gemini':
            default:
                const key = process.env.GEMINI_API_KEY;
                if (!key) throw new Error("GEMINI_API_KEY is not defined.");
                return new GeminiProvider(key);
        }
    }
}
