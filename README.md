require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { buildReply } = require('./recommender');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Add it to your environment or .env file.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcome =
    'Welcome to Movie Bot! 🎬\n\n' +
    'Send me a movie mood or genre, for example:\n' +
    '• funny family movie\n' +
    '• dark sci-fi\n' +
    '• romantic movie\n' +
    '• thrilling action\n\n' +
    'I will recommend movies for you.';

  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (!text || text.startsWith('/')) {
    return;
  }

  const reply = buildReply(text);
  bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
});

console.log('Movie bot is running...');
