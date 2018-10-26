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
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
  function (req, email, password, done) {
    User.findOne({ email: email.toLowerCase() }, function (err, user) {
      if (err)
        return done(err);
      if (!user)
        return done(null, false, { msg: 'No user found' });
      if (!user.validPassword(password))
        return done(null, false, { msg: 'wrong password' });

      // Set the currentOrg variable
      Organization.findOne({
        "users": user._id
      }, function (err, organization) {

        if (organization && organization.name) {
          req.session.currentOrg = organization;
          return done(null, user);
        }
        // else {

        //   var org = "Organization " + parseInt(Math.random() * 100).toString();

        //   var organization = new Organization();

        //   organization.name = org;
        //   organization.users = [user];
        //   organization.save(function (err, result) {
        //     if (err)
        //       return done(null, false, { msg: err });
        //     req.session.currentOrg = result;
        //     return done(null, user);
        //   });
        // }

      })

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
