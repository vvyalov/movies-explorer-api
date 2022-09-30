const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  newMovie, deleteMovie, getMovie,
} = require('../controllers/movies');

router.get('/', getMovie);
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().uri(),
      trailerLink: Joi.string().required().uri(),
      thumbnail: Joi.string().required().uri(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  newMovie,
);
router.delete(
  '/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().alphanum().length(24)
        .hex(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
