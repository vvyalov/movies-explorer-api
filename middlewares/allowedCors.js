const allowedCors = {
  origin: [
    'https://vyalov.movie.nomorepartiesxyz.ru',
    'http://vyalov.movie.nomorepartiesxyz.ru',
    'http://api.vyalov.nomorepartiesxyz.ru',
    'https://api.vyalov.nomorepartiesxyz.ru',
    'http://localhost:3000',
    'https://localhost:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = allowedCors;
