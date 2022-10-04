const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');
const {
  newMovie, deleteMovie, getMovie,
} = require('../controllers/movies');

const validateUrl = (value) => {
  if (isURL(value)) {
    return value;
  }
  throw new Error('Некорректная ссылка');
};

router.get('/movies', getMovie);
router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validateUrl),
      trailerLink: Joi.string().required().custom(validateUrl),
      thumbnail: Joi.string().required().custom(validateUrl),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  newMovie,
);
router.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().alphanum().length(24)
        .hex(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
