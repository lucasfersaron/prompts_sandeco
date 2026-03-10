import { TelegramHandler } from './interfaces/TelegramHandler';

const main = async () => {
    try {
        const handler = new TelegramHandler();
        await handler.start();
    } catch (error) {
        console.error("Critical Failure:", error);
        process.exit(1);
    }
};

main();
