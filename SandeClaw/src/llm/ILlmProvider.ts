export interface ToolCall {
    name: string;
    arguments: any;
}

export interface LlmResponse {
    text?: string;
    toolCalls?: ToolCall[];
    error?: string;
}

export interface ILlmProvider {
    /**
     * Request inference from the model
     * @param systemPrompt The master instructions including skills and tools
     * @param messages The conversation history
     */
    generate(systemPrompt: string, messages: { role: string, content: string }[]): Promise<LlmResponse>;
}
