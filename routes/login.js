const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { newUser, login } = require('../controllers/users');



router.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email(),
      password: Joi.string().required(),
    })
  }),
  login);

router.post('/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    })
  }),
  newUser);


module.exports = router;
