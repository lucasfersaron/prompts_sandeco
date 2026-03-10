import { AgentLoop } from '../core/AgentLoop';
import { SkillLoader } from './SkillLoader';
import { SkillRouter } from './SkillRouter';
import { ProviderFactory } from '../llm/ProviderFactory';
import { MemoryManager } from '../data/MemoryManager';

export class SkillExecutor {
    private loader: SkillLoader;
    private memory: MemoryManager;

    constructor(memory: MemoryManager) {
        this.memory = memory;
        this.loader = new SkillLoader();
    }

    public async execute(conversationId: string, userInput: string): Promise<string> {
        const allSkills = this.loader.loadAllSkills();

        // Create a fast/cheap LLM instance for routing (e.g. Gemini Flash)
        const routerLlm = ProviderFactory.create('gemini');
        const router = new SkillRouter(routerLlm);

        const targetSkillName = await router.route(userInput, allSkills);

        let baseSystemPrompt = `You are SandecoClaw, a local AI assistant. You answer primarily via Telegram.\n`;
        let activatedSkill = null;

        if (targetSkillName) {
            activatedSkill = this.loader.getSkill(targetSkillName);
            if (activatedSkill) {
                baseSystemPrompt += `\n[Context: A skill named "${activatedSkill.metadata.name}" has been activated.]\n${activatedSkill.content}\n`;
            }
        }

        // Agent Loop Processing
        const loopLlm = ProviderFactory.create('gemini'); // Primary reasoning engine
        const loop = new AgentLoop(loopLlm, this.memory);

        // Save user message for context
        this.memory.saveMessage(conversationId, 'user', userInput);

        const context = this.memory.getContext(conversationId);

        const response = await loop.run(conversationId, baseSystemPrompt, context);

        // Save assistant response
        this.memory.saveMessage(conversationId, 'assistant', response);

        return response;
    }
}
