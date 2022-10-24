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

const { PORT = 3000, MONGO_DB = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();

app.use(helmet());

mongoose.connect(MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(requestLogger);

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
