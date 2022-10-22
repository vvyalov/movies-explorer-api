const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { newUser, login, outLogin } = require('../controllers/users');

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  newUser,
);

router.get(
  '/signout',
  outLogin,
);

module.exports = router;
