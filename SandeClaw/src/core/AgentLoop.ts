import { ILlmProvider } from '../llm/ILlmProvider';
import { MemoryManager } from '../data/MemoryManager';

export class AgentLoop {
    private maxIterations = 5;

    constructor(
        private llm: ILlmProvider,
        private memory: MemoryManager
    ) { }

    /**
     * Runs the ReAct loop
     * @param conversationId 
     * @param systemPrompt 
     * @param context 
     * @returns The final response string
     */
    public async run(conversationId: string, systemPrompt: string, context: { role: string, content: string }[]): Promise<string> {
        let currentIteration = 0;
        const messages = [...context];

        console.log(`[AgentLoop] Starting loop for conversation ${conversationId}`);

        while (currentIteration < this.maxIterations) {
            currentIteration++;
            console.log(`[AgentLoop] Iteration ${currentIteration}/${this.maxIterations}`);

            const response = await this.llm.generate(systemPrompt, messages);

            if (response.error) {
                console.error(`[AgentLoop] LLM Error: ${response.error}`);
                return "Desculpe, tive um problema ao processar sua mensagem (Erro de API).";
            }

            // If we have tool calls, we would process them here.
            // For the first version, we'll focus on text-based ReAct or simple responses.
            if (response.toolCalls && response.toolCalls.length > 0) {
                // TODO: Implement Tool execution logic
                console.log(`[AgentLoop] Detected ${response.toolCalls.length} tool calls. (Tool execution not fully implemented in MVP)`);
            }

            if (response.text) {
                console.log(`[AgentLoop] Final response received.`);
                return response.text;
            }

            // Fallback if no text but no tools either
            if (!response.toolCalls || response.toolCalls.length === 0) {
                break;
            }
        }

        return "Desculpe, não consegui chegar a uma conclusão após várias tentativas.";
    }
}
