/**
 * TODO:
 * 1) did not use uniqueValidator from previous
 * 2) changed structure: before => now
 *      user.created_at => user.createdOn
 *      user.firstName => user.profile.firstName
 *      user.lastName => user.profile.lastName
 *      user.role => user.profile.role
 */

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  profile: {
    firstName: String,
    lastName: String,
    gender: String,
    location: String,
    picture: String,
    role: { type: String, enum: ["view", "user", "admin"], required: true, default: "view" }
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for generating user's fullname.
 */
userSchema.methods.fullName = function () {
  return this.firstName + " " + this.lastName;
};

/**
 * Helper method for validating user's password.
 */
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
