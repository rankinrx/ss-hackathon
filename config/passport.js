/**
* TODO: 
* 1) if user has access to multiple orgs?
* 2) 
*/
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/User');
const Organization = require("../models/Organization");

passport.serializeUser((user, done) => {
  // let sessionUser = { _id: user._id, name: user.name, email: user.email, roles: user.roles }
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


/**
 * Sign in using Email and Password.
 * (req.session): currentOrg
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
  function (req, email, password, done) {
    User.findOne({ email: email.toLowerCase() }, function (err, user) {

      if (err) return done(err);

      if (!user) return done(null, false, { code: 7002, msg: 'User Not Found' });

      if (!user.validPassword(password)) return done(null, false, { code: 7005, msg: 'Incorrect Password' });

      Organization.find({ "users": user._id }, (err, theOrgs) => {

        if (!theOrgs.length) {

          req.session.orgStack = [];

          return done("E7001: User not associated with a organization");

        } else {

          req.session.orgStack = theOrgs;

          return done(null, user);

        }
      });
    });
  }));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

/**
 * Check user authentication
 */
exports.isUserAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.json(true)
  }
  return res.json(false)
};