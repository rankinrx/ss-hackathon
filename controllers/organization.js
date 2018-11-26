const Organization = require("../models/Organization");

/**
 * Find Organization by User
 * Code: 41XX
 * (req.user): (REQUIRED)
 * (res.locals) orgStack = [theorg] || []
 */
exports.findByUser = (req, res, next) => {

  res.locals.orgStack = [];

  if (!req.user) return next("E4151: Missing Req 'user' ");

  Organization.find({ "users": req.user._id }, (err, theOrgs) => {

    if (err) { return next(err); }

    if (!theOrgs.length) return done("E4101: User not associated with a organization");

    res.locals.orgStack = theOrgs;

    return next();

  });

};

/**
 * Update Organization Settings
 * Code: 42XX
 * (req.body): ioPercent, iiPercent, ioMessage, iiMessage || && name, subscription users
 * (req.session) currentOrg = savedOrg (REQUIRED)
 */
exports.update = (req, res, next) => {

  let availableFields = [];

  if (!req.session.currentOrg) return next("E4211: Missing Session 'currentOrg' ");

  if (req.user.profile.role == 'admin') availableFields = ["name", "subscription", "users", "iiMessage", "ioMessage", "iiPercent", "ioPercent"];
  else if (req.user.profile.role == 'view') availableFields = ["iiMessage", "ioMessage", "iiPercent", "ioPercent"];

  const bodyKeys = Object.keys(req.body);

  if (req.body['ioPercent']) req.body.ioPercent = parseFloat(req.body.ioPercent);
  if (req.body['iiPercent']) req.body.iiPercent = parseFloat(req.body.iiPercent);

  bodyKeys.forEach(function (key) {

    if (availableFields.indexOf(key) === -1) delete req.body[key];

    if (req.body[key] == req.session.currentOrg[key]) delete req.body[key];

  });

  if (!req.body.iiMessage && !req.body.ioMessage && !req.body.iiPercent && !req.body.ioPercent && !req.body.name

    && !req.body.subscription && !req.body.users) {

      return res.status(400).send("No Change");

  }

  Organization.findByIdAndUpdate(req.session.currentOrg._id, { $set: req.body }, { new: true }, (err, savedOrg) => {

    if (err) { return next(err); }

    if (!savedOrg) {

      return res.status(404).send('Organization Not Found');
    }

    req.session.currentOrg = savedOrg;

    return next();

  });

};

/**
 * Update 'currentOrg' Variable
 * Code: 43XX
 * (req.params): id (REQUIRED)
 * (req.session) currentOrg = theOrg
 */
exports.updateCurrentOrg = (req, res, next) => {

  if (!req.params.id) return next("E4331: Missing Parameter 'id' ");

  Organization.findById(req.params.id, (err, theOrg) => {

    if (err) { return next(err); }

    if (!theOrg) {

      return res.status(404).send('Organization Not Found');

    } else {

      req.session.currentOrg = theOrg;

      return res.json({ data: req.session.currentOrg });

    }

  });

};