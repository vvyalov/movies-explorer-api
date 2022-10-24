const movieRouter = require('express').Router();
const { isObjectIdOrHexString } = require('mongoose');
const { isURL } = require('validator');
const { celebrate, Joi } = require('celebrate');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

const validationId = (value) => {
  if (isObjectIdOrHexString(value)) {
    return value;
  }
  throw new Error('Передан некорректный id фильма');
};

const validationUrl = (value) => {
  if (isURL(value)) {
    return value;
  }
  throw new Error('Передана некорректная ссылка');
};

// возвращает все сохранённые текущим пользователем фильмы
movieRouter.get('/', getMovies);

// создаёт фильм
movieRouter.post(
  '/',
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
      movieId: Joi.number().required(), // id из ответа стороннего api
    }),
  }),
  createMovie,
);

// удаляет сохранённый фильм по id
movieRouter.delete(
  '/:movieDeleteId',
  celebrate({
    params: Joi.object().keys({
      movieDeleteId: Joi.string().required().custom(validationId),
    }),
  }),
  deleteMovie,
);

module.exports = movieRouter;
