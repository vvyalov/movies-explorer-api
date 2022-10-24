const autorizationRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');
const { createUser, login, outLogin } = require('../controllers/users');

autorizationRouter.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
autorizationRouter.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      avatar: Joi.string().custom((value, helpers) => {
        if (isURL(value)) {
          return value;
        }
        return helpers.message('Поле avatar заполнено некорректно');
      }),
    }),
  }),
  createUser,
);
autorizationRouter.get(
  '/signout',
  outLogin,
);

module.exports = autorizationRouter;
