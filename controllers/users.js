const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RequestError = require('../errors/request-error');
const EmailError = require('../errors/email-error');
const NotFoundError = require('../errors/not-found-error');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const newUser = (req, res, next) => {
  const { name, email } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Данные заполнены с ошибкой'));
        return;
      }
      if (err.code === 11000) {
        next(new EmailError('Пользователь с таким email уже существует'));
        return;
      }
      next(err);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      res.status(200).send(user);
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
  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
      res.status(200).send({ token });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  const userCurrentId = req.user._id;
  User.findById(userCurrentId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Указанный _id не найден');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  newUser,
  updateUser,
  login,
  getCurrentUser,
};