import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface SkillMetadata {
    name: string;
    description: string;
    [key: string]: any;
}

export interface Skill {
    metadata: SkillMetadata;
    content: string; // The markdown instructions
}

export class SkillLoader {
    private skillsDir: string;
    private skills: Map<string, Skill> = new Map();

    constructor() {
        this.skillsDir = path.resolve(process.cwd(), '.agents', 'skills');
        this.ensureDirExists();
    }

    private ensureDirExists() {
        if (!fs.existsSync(this.skillsDir)) {
            fs.mkdirSync(this.skillsDir, { recursive: true });
        }
    }

    public loadAllSkills(): Skill[] {
        this.skills.clear();

        if (!fs.existsSync(this.skillsDir)) return [];

        const dirs = fs.readdirSync(this.skillsDir, { withFileTypes: true });

        for (const d of dirs) {
            if (d.isDirectory()) {
                const skillFilePath = path.join(this.skillsDir, d.name, 'SKILL.md');
                if (fs.existsSync(skillFilePath)) {
                    this.parseSkillFile(skillFilePath, d.name);
                }
            }
        }

        return Array.from(this.skills.values());
    }

    private parseSkillFile(filePath: string, dirName: string) {
        const rawContent = fs.readFileSync(filePath, 'utf-8');

        // Naive split of yaml frontmatter
        const match = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!match) return; // Skip if no frontmatter

        try {
            const metadata = yaml.load(match[1]) as SkillMetadata;
            if (!metadata.name) metadata.name = dirName; // fallback name

            this.skills.set(metadata.name, {
                metadata,
                content: match[2].trim()
            });
        } catch (e) {
            console.error(`Failed to parse frontmatter for skill at ${filePath}`);
        }
    }

    public getSkill(name: string): Skill | undefined {
        return this.skills.get(name);
    }
}
