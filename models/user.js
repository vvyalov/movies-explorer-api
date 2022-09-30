const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const AuthError = require('../errors/auth-error');
const EmailError = require('../errors/email-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: isEmail,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

/* eslint-disable */
userSchema.statics.findUserByCredentials = function ({ email, password }) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new EmailError('Неправильные данные');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неправильные данные');
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
