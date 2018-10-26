/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * 
 * TODO: 
 * 1) return soft error messages to front-end controller
 * 
 */
const Athlete = require("../models/Athlete");
/**
 * GET find athlete(s) by organization
 */
exports.findByOrg = (req, res, next) => {

    Athlete.find({ organization: req.session.currentOrg._id }, (err, theAthletes) => {

        if (err) { return next(err); }

        res.locals.athleteStack = theAthletes;

        next();
    });
};

/**
 * GET find athlete by id
 */
exports.findById = (req, res, next) => {

    Athlete.find({ _id: req.params.id }, (err, theAthletes) => {

        if (err) { return next(err); }

        res.locals.athleteStack = theAthletes;

        next();
    });
};

/**
 * GET find athlete by authType
 */
exports.findByAuthType = (req, res, next) => {
    authType = res.locals.authType;

    Athlete.findOne().where(authType, req.params.authId).exec( (err, theAthlete) => {

        if (err) { return next(err); }
        if(!theAthlete) {
            return res.json({ msg: 'No Athlete found!' });
        }

        res.locals.athleteStack = theAthlete;

        next();
    });
};

/**
 * POST create new athlete
 * TODO:
 * 1) add findone by fingerprint and do not let create if a match found
 */
exports.create = (req, res, next) => {

    if (!req.body.firstName || !req.body.lastName || !req.body.passcode || !req.body.sport) { return res.json({ msg: 'Required inputs not met'});}

    const newAthlete = new Athlete();
    newAthlete.firstName = req.body.firstName;
    newAthlete.lastName = req.body.lastName;
    newAthlete.passcode = req.body.passcode;
    newAthlete.sport = req.body.sport;
    newAthlete.organization = req.session.currentOrg._id;

    Athlete.findOne({ passcode: req.body.passcode }, (err, existingAthlete) => {
        if (err) { return next(err); }
        if (existingAthlete) {
          return res.json({ msg: 'Account with that passcode already exists.'});
        }
        newAthlete.save((err) => {
          if (err) { return next(err); }
          res.locals.athleteStack = newAthlete;
          next();
        });
      });
};

/**
 * POST update athlete
 */
exports.update = (req, res, next) => {
    if (!req.body.firstName && !req.body.lastName && !req.body.gender && !req.body.birthday && !req.body.sport
        && !req.body.showWeight && !req.body.highRisk && !req.body.passcode && !req.body.bodyFat && !req.body.fingerprint) { res.json({ msg: 'Nothing to update!'}); };

    const athleteId = req.params.id;
    const availableFields = ["firstName", "lastName", "gender", "birthday", "sport", "showWeight", "highRisk", "passcode", "bodyFat", "fingerprint"];
    const keys = Object.keys(req.body);

    keys.forEach(function (key) {

        if (availableFields.indexOf(key) === -1)
            delete req.body[key];

    });

    Athlete.findByIdAndUpdate(athleteId, { $set: req.body }, (err, savedAthlete) => {
        if (err) { return next(err); }

        res.locals.athleteStack = savedAthlete;
        next();
    });
};

/**
 * POST delete single athlete
 */
exports.deleteOne = (req, res, next) => {

    Athlete.findOneAndDelete({_id: req.params.id}, (err) => {

        if (err) { return next(err); }

        next();

    });

};

/**
 * POST delete all athletes
 */
exports.deleteByOrg = (req, res, next) => {

    Athlete.deleteMany({ organization: req.session.currentOrg._id }, (err) => {

        if (err) { return next(err); }

        next();

    });

};