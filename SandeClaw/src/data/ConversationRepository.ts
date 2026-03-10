import { db } from './db';

export interface Conversation {
    id: string;
    user_id: string;
    provider: string;
    created_at?: string;
}

export class ConversationRepository {
    public create(conversation: Conversation): void {
        const stmt = db.prepare('INSERT INTO conversations (id, user_id, provider) VALUES (?, ?, ?)');
        stmt.run(conversation.id, conversation.user_id, conversation.provider);
    }

    public findById(id: string): Conversation | undefined {
        const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
        return stmt.get(id) as Conversation | undefined;
    }
}
