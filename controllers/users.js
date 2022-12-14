const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RequestError = require('../errors/request-error');
const EmailError = require('../errors/email-error');
const NotFoundError = require('../errors/not-found-error');
const User = require('../models/user');

const { JWT_SECRET = 'some-secret-key' } = process.env;


const newUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      })
        .then((user) => {
          res.status(201).send({
            name: user.name,
            email: user.email,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new RequestError('Данные заполнены с ошибкой или не переданы'));
            return;
          }
          if (err.code === 11000) {
            next(new EmailError('Пользователь с таким email уже существует'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Указанный _id не найден');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new EmailError('Пользователь с таким email уже существует'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные'));
        return;
      }
      if (err.name === 'CastError') {
        next(new NotFoundError('Указанный _id не найден'));
        return;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id.toHexString() }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'none',
        secure: true
      }).json({ email: user.email });
      res.status(200).send({ token })
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  const userCurrentId = req.user._id;
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);

  User.findById(userCurrentId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным _id не найден');
      }
      res.send(user);
    })
    .catch(next);
};

const outLogin = (req, res, next) => {
  res.clearCookie('jwt', {
    maxAge: 0,
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  }).send({ message: 'Выход из профиля' });
  next();
};

module.exports = {
  newUser,
  updateUser,
  login,
  getCurrentUser,
  outLogin
};
