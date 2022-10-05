const Movie = require('../models/movie');
const RequestError = require('../errors/request-error');
const NotFoundError = require('../errors/not-found-error');
const AccessError = require('../errors/access-error');
const EmailError = require('../errors/email-error');

const newMovie = (req, res, next) => {
  Movie.create({ owner: req.user._id, ...req.body })
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные'));
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

function deleteMovie(req, res, next) {
  const owner = req.user._id;
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Указанный _id не найден');
      }
      if (movie.owner.toString() !== owner) {
        throw new AccessError('У пользователя нет прав на удаление');
      } else {
        Movie.findByIdAndDelete(movieId)
          .then((deleteMovies) => {
            res.status(200).send(deleteMovies);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new RequestError('Передан некорректный _id'));
              return;
            }
            next(err);
          })
          .catch(next);
      }
    })
    .catch(next);
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
  getMovie,
};
