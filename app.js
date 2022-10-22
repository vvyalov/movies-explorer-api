const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const UserRouter = require('./routes/users');
const MovieRouter = require('./routes/movies');
const LoginRouter = require('./routes/login');
const rateLimit = require('./middlewares/rateLimit');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');
const allowedCors = require('./middlewares/allowedCors');

const { PORT = 3000, MONGO_DB = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();
app.use(helmet());

mongoose.connect(MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cookieParser());
app.use(cors(allowedCors));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(rateLimit);

app.use('/', LoginRouter);

app.use(requestLogger);

app.use(auth);
app.use('/', UserRouter);
app.use('/', MovieRouter);

app.all('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

app.listen(PORT);
