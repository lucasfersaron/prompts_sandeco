import { Bot, Context } from 'grammy';
import { MemoryManager } from '../data/MemoryManager';
import { SkillExecutor } from '../skills/SkillExecutor';
import * as dotenv from 'dotenv';

dotenv.config();

export class TelegramHandler {
    private bot: Bot;
    private memory: MemoryManager;
    private skillExecutor: SkillExecutor;
    private allowedUserIds: string[];

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing");

        this.bot = new Bot(token);
        this.memory = new MemoryManager();
        this.skillExecutor = new SkillExecutor(this.memory);

        const allowed = process.env.TELEGRAM_ALLOWED_USER_IDS || "";
        this.allowedUserIds = allowed.split(',').map(id => id.trim());
    }

    public async start() {
        console.log("[TelegramHandler] Starting bot...");

        // Whitelist Middleware
        this.bot.use(async (ctx, next) => {
            const userId = ctx.from?.id.toString();
            if (!userId || !this.allowedUserIds.includes(userId)) {
                console.log(`[Security] Ignored unauthorized request from user ${userId}`);
                return;
            }
            await next();
        });

        this.bot.on("message:text", async (ctx) => {
            const chatId = ctx.chat.id.toString();
            const text = ctx.message.text;

            console.log(`[Telegram] Message from ${ctx.from?.username}: ${text}`);

            // Signal typing
            await ctx.replyWithChatAction("typing");

            try {
                const response = await this.skillExecutor.execute(chatId, text);
                await ctx.reply(response);
            } catch (e: any) {
                console.error(`[Error] ${e.message}`);
                await ctx.reply(`Ocorreu um erro interno: ${e.message}`);
            }
        });

        this.bot.start();
        console.log("[TelegramHandler] Bot is running.");
    }
}
