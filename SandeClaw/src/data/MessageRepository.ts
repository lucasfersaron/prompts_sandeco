import { db } from './db';

export interface Message {
    id?: number;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    created_at?: string;
}

export class MessageRepository {
    public create(message: Message): void {
        const stmt = db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)');
        stmt.run(message.conversation_id, message.role, message.content);
    }

    public findByConversationId(conversationId: string, limit = 50): Message[] {
        const stmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?');
        const records = stmt.all(conversationId, limit) as Message[];
        return records.reverse(); // Return in chronological order
    }
}
