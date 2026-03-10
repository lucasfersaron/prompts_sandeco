import { ILlmProvider } from '../llm/ILlmProvider';
import { Skill } from './SkillLoader';

export class SkillRouter {
    constructor(private llm: ILlmProvider) { }

    public async route(input: string, availableSkills: Skill[]): Promise<string | null> {
        if (availableSkills.length === 0) return null;

        const skillsOverview = availableSkills.map(s => `- ${s.metadata.name}: ${s.metadata.description || 'No description'}`).join('\n');

        const prompt = `
You are a routing agent for SandeClaw. Analyze the user's input and determine which skill is needed to fulfill the request.
Available skills:
${skillsOverview}

You must return a raw JSON object and nothing else.
If a skill matches, return {"skillName": "<name>"}. 
If NO skill matches or it's a casual conversation, return null inside the JSON: {"skillName": null}.
`;

        const response = await this.llm.generate(prompt, [{ role: 'user', content: input }]);

        if (response.text) {
            try {
                const cleaned = response.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return parsed.skillName || null;
            } catch (e) {
                return null;
            }
        }

        return null;
    }
}
