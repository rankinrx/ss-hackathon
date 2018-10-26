/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * 
 * TODO: 
 * 1) Fix save athlete route
 * 2) error handle on save athlete
 * 
 */
const Weight = require("../models/Weight");

/**
 * MIDDLEWARE create new weight
 */
exports.new = (req, res, next) => {
    const theAthlete = res.locals.athleteStack;

    const newWeight = new Weight();
    newWeight.athlete = theAthlete;
    newWeight.method = res.locals.authType;
    newWeight.weight = Number(req.params.wt);
    newWeight.type = res.locals.calcs.type;
    newWeight.delta = res.locals.calcs.delta;
    newWeight.ioFlag = res.locals.calcs.ioFlag;
    newWeight.deltaFlag = res.locals.calcs.deltaFlag;

    newWeight.save((err, theWeight) => {
        if (err) { return next(err); }
        res.locals.weightStack = theWeight;
        next();
    });
};

/**
 * MIDDLEWARE find last weights by ID 
 */
exports.findLast = (req, res, next) => {
    const theAthlete = res.locals.athleteStack;

    Weight.find({ athlete: theAthlete._id }).sort({ 'createdAt': -1 }).limit(3).exec( (err, theWeights) => {

        if (err) { return next(err); }

        res.locals.weightStack = theWeights;

        next();

    });
};

/**
 * MIDDLEWARE total number of weights by athlete(s)
 */
exports.findByAthlete = (req, res, next) => {
    const theAthletes = res.locals.athleteStack;
    const athleteIds = [];

    theAthletes.forEach(function (athlete) {
        athleteIds.push(athlete._id);
    });

    Weight.find({ athlete: { $in: athleteIds } }, (err, theWeights) => {

        if (err) { return next(err); }

        res.locals.weightStack = theWeights;

        next();

    });
};

/**
 * MIDDLEWARE delete all weights
 */
exports.deleteOne = (req, res, next) => {
    Weight.deleteMany({ athlete: req.params.id }, (err) => {

        if (err) { return next(err); }

        next();

    });
};

/**
 * MIDDLEWARE delete all weights
 */
exports.deleteAll = (req, res, next) => {
    const theAthletes = res.locals.athleteStack;
    const athleteIds = [];

    theAthletes.forEach(function (athlete) {
        athleteIds.push(athlete._id);
    });

    Weight.deleteMany({ athlete: { $in: athleteIds } }, (err) => {

        if (err) { return next(err); }

        next();

    });
};