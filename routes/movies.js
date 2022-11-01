const router = require('express').Router();
const { isURL } = require('validator')
const { celebrate, Joi } = require('celebrate');
const {
  newMovie, deleteMovie, getMovie
} = require('../controllers/movies');

const validationUrl = (value) => {
  if (isURL(value)) {
    return value;
  }
  throw new Error('Передана некорректная ссылка');
};

router.get('/', getMovie);
router.post('/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validationUrl),
      trailerLink: Joi.string().required().custom(validationUrl),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().custom(validationUrl),
      movieId: Joi.number().required(),
    })
  }),
  newMovie);

  router.delete(
    '/:movieDeleteId',
    deleteMovie,
  );


module.exports = router;
