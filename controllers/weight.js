const Weight = require("../models/Weight");
/**
 * Create New Weight
 * CODE: 21XX
 * (res.locals): athleteStack (REQUIRED), deviceStack (REQUIRED), calcStack (REQUIRED), weightStack = [theWeight] || []
 * (req.params): wt, authType (REQUIRED)
 */
exports.new = (req, res, next) => {

    res.locals.weightStack = [];

    if (res.locals.deviceStack.length != 1) return next("E2121: Missing Locals 'deviceStack' ");
    if (res.locals.athleteStack.length != 1) return next("E2122: Missing Locals 'athleteStack' ");
    if (res.locals.calcStack.length != 1) return next("E2123: Missing Locals 'calcStack' ");
    if (req.params.authType != "fingerprint" && req.params.authType != "passcode") return next("E2132: Incorrect Parameter 'authType'");


    const newWeight = new Weight();
    newWeight.device = res.locals.deviceStack[0]._id;
    newWeight.athlete = res.locals.athleteStack[0];
    newWeight.method = req.params.authType;
    newWeight.weight = Number(req.params.wt);
    newWeight.type = res.locals.calcStack[0].type;
    newWeight.delta = res.locals.calcStack[0].delta;
    newWeight.ioFlag = res.locals.calcStack[0].ioFlag;
    newWeight.deltaFlag = res.locals.calcStack[0].deltaFlag;

    newWeight.save((err, theWeight) => {

        if (err) { return next(err); }

        res.locals.weightStack.push(theWeight);

        return next();

    });

};

/**
 * Find Last (3) IN/OUT Weights by Athlete (Device Only)
 * CODE: 22XX
 * (res.locals): athleteStack (REQUIRED), weightStack = [theWeights] || []
 */
exports.findByIo = (req, res, next) => {

    res.locals.weightStack = [];

    if (res.locals.athleteStack.length != 1) return next("E2222: Missing Locals 'athleteStack' ");

    Weight.find({ athlete: res.locals.athleteStack[0]._id }).where('type').in(['IN', 'OUT']).sort({ 'createdAt': -1 }).limit(3).exec((err, theWeights) => {

        if (err) { return next(err); }

        res.locals.weightStack = theWeights;

        return next();

    });

};

/**
 * Find Weights by Athlete(s)
 * CODE: 23XX
 * (res.locals): athleteStack (REQUIRED), weightStack = [theWeights] || []
 */
exports.findByAthleteStack = (req, res, next) => {

    res.locals.weightStack = [];

    const theAthletes = res.locals.athleteStack;

    const athleteIds = [];

    if (!theAthletes) return next("E2222: Missing Locals 'athleteStack' ");

    if (!theAthletes.length) {

        return next();

    }

    theAthletes.forEach(function (athlete) {

        athleteIds.push(athlete._id);
    });

    Weight.find({ athlete: { $in: athleteIds } }).sort({ 'createdAt': -1 }).exec((err, theWeights) => {

        if (err) { return next(err); }

        res.locals.weightStack = theWeights;

        return next();

    });

};

/**
 * Delete All Weights by Single Athlete '_id'
 * CODE: 24XX
 * (req.params): id (REQUIRED)
 * (res.locals): weightStack = [#] || [empty]
 */
exports.deleteByAthleteId = (req, res, next) => {

    res.locals.weightStack = [];

    if (!req.params.id) return next("E2431: Missing Parameter 'id' ");

    Weight.deleteMany({ athlete: req.params.id }, (err, deletedWeight) => {

        if (err) { return next(err); }

        res.locals.weightStack.push(deletedWeight.n);

        return next();

    });
};

/**
 * Delete All Weights by Athlete Stack
 * CODE: 25XX
 * (res.locals): athleteStack (REQUIRED), weightStack = [#] || [empty]
 */
exports.deleteByAthleteStack = (req, res, next) => {

    res.locals.weightStack = [];

    const theAthletes = res.locals.athleteStack;

    const athleteIds = [];

    if (!theAthletes) return next("E2522: Missing Locals 'athleteStack' ");

    if (!theAthletes.length) {

        return next();

    }

    theAthletes.forEach(function (athlete) {

        athleteIds.push(athlete._id);

    });

    Weight.deleteMany({ athlete: { $in: athleteIds } }, (err, deletedWeights) => {

        if (err) { return next(err); }

        res.locals.weightStack.push(deletedWeights.n);

        return next();

    });
};