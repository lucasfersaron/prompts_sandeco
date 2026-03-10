import { ConversationRepository, Conversation } from './ConversationRepository';
import { MessageRepository, Message } from './MessageRepository';

export class MemoryManager {
    private conversationRepo: ConversationRepository;
    private messageRepo: MessageRepository;

    constructor() {
        this.conversationRepo = new ConversationRepository();
        this.messageRepo = new MessageRepository();
    }

    public getOrCreateConversation(id: string, userId: string, provider: string): Conversation {
        let conv = this.conversationRepo.findById(id);
        if (!conv) {
            conv = { id, user_id: userId, provider };
            this.conversationRepo.create(conv);
        }
        return conv;
    }

    public clearConversation(id: string): void {
        // Optional: Depending on logic, this could just delete messages
    }

    public saveMessage(conversationId: string, role: 'user' | 'assistant' | 'system' | 'tool', content: string): Message {
        const msg: Message = { conversation_id: conversationId, role, content };
        this.messageRepo.create(msg);
        return msg;
    }

    // Gets the recent context representing the memory window
    public getContext(conversationId: string, windowSize: number = 20): Array<{ role: string, content: string }> {
        const messages = this.messageRepo.findByConversationId(conversationId, windowSize);
        return messages.map(m => ({ role: m.role, content: m.content }));
    }
}
