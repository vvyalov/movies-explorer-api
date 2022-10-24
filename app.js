require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');
const CentralizedError = require('./errors/centralized-error');
const router = require('./routes/index');
const auth = require('./middlewares/auth');
const autorizationRouter = require('./routes/autorization');
const limiter = require('./middlewares/rateLimiter');

const { PORT = 3001, MONGO_DB = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();

const allowedCors = [
  'https://vyalov.movie.nomorepartiesxyz.ru',
    'http://vyalov.movie.nomorepartiesxyz.ru',
    'http://api.vyalov.nomorepartiesxyz.ru',
    'https://api.vyalov.nomorepartiesxyz.ru',
    'http://localhost:3000',
    'https://localhost:3000',
];

app.use(helmet());

mongoose.connect(MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(requestLogger);

app.use((req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.end();
  }
  next();
});

app.use(limiter);

app.use(autorizationRouter);

app.use(auth, router);

app.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger);
app.use(errors());
app.use(CentralizedError);

app.listen(PORT);
