const Organization = require("../models/Organization");
const asyncHandler = require('express-async-handler');
/**
 * QUERY user's subscription type
 */
exports.accountType = (req, res, next) => {
  Organization.findOne({ _id: req.session.currentOrg._id }, (err, theOrg) => {
    if (err) { return next(err); }
    if (!theOrg) {
      req.flash('errors', { msg: 'Organization was not found' });
      return next('Organization was not found');
    }

    res.locals.account = theOrg.subscription
    next();
  });
};

/**
 * QUERY update iiPercent, ioPercent, iiMessage, ioMessage
 */
exports.updateIOsettings = (req, res, next) => {
  if (!req.body.ioPercent && !req.body.iiPercent && !req.body.ioMessage && !req.body.iiMessage) { return next("Nothing to update"); }

  const availableFields = ["iiMessage", "ioMessage", "iiPercent", "ioPercent"]
  const keys = Object.keys(req.body);

  keys.forEach(function (key) {
    if (availableFields.indexOf(key) === -1)
      delete req.body[key];
  });

  Organization.findByIdAndUpdate(req.session.currentOrg._id, { $set: req.body }, (err, savedOrg) => {
    if (err) { return next(err); }

    req.session.currentOrg = savedOrg;
    next();
  });
};

/**
 * SESSION change current org
 */
exports.switchOrg = (req, res, next) => {
  Organization.findById(req.params.id, (err, theOrg) => {
    if (err) { return next(err); }
    req.session.currentOrg = theOrg;
    // req.flash('success', { msg: `You are now viewing ${theOrg.name}` });
    // return res.redirect('/Dashboard/Overview');
    return res.json({
      newOrg: req.session.currentOrg
    });
  });

};

/**
 * QUERY find all orgs 
 */
exports.findByUser = (req, res, next) => {
  Organization.find( {"users": req.user._id}, (err, theOrgs) => {
    if (err) { return next(err); }
    // req.flash('success', { msg: `You are now viewing ${theOrg.name}` });
    // return res.redirect('/Dashboard/Overview');
    res.locals.orgStack = theOrgs;
    return res.json({
      org: theOrgs
    });
  });

  // Organization.find({users: }, (err, theOrg) => {
  //   if (err) { return next(err); }
  //   req.session.currentOrg = theOrg;
  //   // req.flash('success', { msg: `You are now viewing ${theOrg.name}` });
  //   // return res.redirect('/Dashboard/Overview');
  //   return res.json({
  //     newOrg: req.session.currentOrg
  //   });
  // });

};