const { movies } = require('./movies');

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
          if (movie.mood.toLowerCase().includes(flag) || movie.genre.toLowerCase().includes(flag) || words.some((word) => movie.summary.toLowerCase().includes(word))) {
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

module.exports = { buildReply, getTopMatches };
