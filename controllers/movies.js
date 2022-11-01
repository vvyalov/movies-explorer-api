const Movie = require('../models/movie')
const RequestError = require('../errors/request-error');
const NotFoundError = require('../errors/not-found-error');
const AccessError = require('../errors/access-error');

const newMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные при создании фильма'));
        return;
      }
      next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const { movieDeleteId } = req.params;
  Movie.findById(movieDeleteId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм с указанным id не найден');
      }
      if (!movie.owner.equals()) {
        throw new AccessError('У текущего пользователя нет прав на удаление данного фильма');
      }
      Movie.findByIdAndRemove(movie._id)
        .then(() => {
          res.send(movie);
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Передан некорректный id фильма'));
        return;
      }
      next(err);
    });
}

const getMovie = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports = {
  newMovie,
  deleteMovie,
  getMovie
};
