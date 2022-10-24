const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const UserRouter = require('./routes/users');
const MovieRouter = require('./routes/movies');
const LoginRouter = require('./routes/login')
const rateLimit = require('./middlewares/rateLimit');
const { requestLogger, errorLogger } = require('./middlewares/logger')
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');
const allowedCors = require('./middlewares/allowedCors');

const { PORT = 3000, MONGO_DB = 'mongodb://localhost:27017/moviedb' } = process.env;
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

app.use(requestLogger);
app.use(rateLimit);

app.use('/', LoginRouter)

app.use(auth);
app.use('/users', UserRouter);
app.use('/movies', MovieRouter);

app.use(errorLogger)

app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

app.listen(PORT);
