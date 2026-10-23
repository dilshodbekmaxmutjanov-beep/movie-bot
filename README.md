require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { movies } = require('./movies');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here');
  process.exit(1);
}

function normalize(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function getTopMatches(input) {
  const text = normalize(input || '');

  if (!text || text.length < 2) {
    return movies.slice(0, 3);
  }

  const matches = movies
    .map((movie) => {
      let score = 0;

      if (text.includes(movie.genre.toLowerCase())) score += 3;
      if (text.includes(movie.mood.toLowerCase())) score += 2;

      const keywords = {
        funny: ['comedy', 'fun', 'humor', 'laugh'],
        scary: ['horror', 'creepy', 'scary', 'tense'],
        sad: ['drama', 'emotional', 'heartfelt'],
        romantic: ['romance', 'love', 'romantic'],
        smart: ['thriller', 'mind-bending', 'thoughtful'],
        family: ['family', 'kids', 'animation'],
        action: ['action', 'adventure', 'intense'],
        sci: ['sci-fi', 'space', 'future'],
        feelgood: ['uplifting', 'feel-good', 'warm'],
        dark: ['dark', 'grim', 'serious']
      };

      for (const [flag, words] of Object.entries(keywords)) {
        if (text.includes(flag) || words.some((word) => text.includes(word))) {
          if (
            movie.mood.toLowerCase().includes(flag) ||
            movie.genre.toLowerCase().includes(flag) ||
            words.some((word) => movie.summary.toLowerCase().includes(word))
          ) {
            score += 2;
          }
        }
      }

      if (movie.title.toLowerCase().includes(text)) score += 4;

      return { ...movie, score };
    })
    .filter((movie) => movie.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return matches.length ? matches : movies.slice(0, 3);
}

function buildReply(input) {
  const suggestions = getTopMatches(input);
  const query = input ? `*Your search:* ${input}\n\n` : '';

  const list = suggestions
    .map(
      (movie) =>
        `🎬 *${movie.title}*\n` +
        `Genre: ${movie.genre}\n` +
        `Mood: ${movie.mood}\n` +
        `Summary: ${movie.summary}`
    )
    .join('\n\n');

  return `${query}${list}`;
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
