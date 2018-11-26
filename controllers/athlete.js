const Athlete = require("../models/Athlete");

/**
 * Create New Athlete
 * CODE: 11XX
 * (req.body): firstName, lastName, passcode, sport (ALL REQUIRED)
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): athleteStack = [theNewAthlete] || [existingAthlete] || [empty]
 */
exports.new = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.session.currentOrg) return next("E1111: Missing Session 'currentOrg' ");

    if (!req.body.firstName || !req.body.lastName || !req.body.passcode || !req.body.sport) {

        return res.status(400).send('Complete Required Fields');
    }

    const newAthlete = new Athlete();

    newAthlete.firstName = req.body.firstName;

    newAthlete.lastName = req.body.lastName;

    newAthlete.passcode = req.body.passcode;

    newAthlete.sport = req.body.sport.split(",");

    newAthlete.organization = req.session.currentOrg._id;

    Athlete.find({ passcode: req.body.passcode, organization: req.session.currentOrg }, (err, existingAthlete) => {

        if (err) { return next(err); }

        if (existingAthlete.length) {

            res.locals.athleteStack = existingAthlete;

            return res.status(400).send("Passcode Exists")

        } else {

            newAthlete.save((err, savedAthlete) => {

                if (err) {

                    if (err.errors.passcode) {
                        if (err.errors.passcode.kind === "unique") {
                            // TODO: implement way to check for passcode in "update" so we can remove this
                            return res.status(400).send("Passcode Exists")
                        }
                        if (err.errors.passcode.kind === "max" || err.errors.passcode.kind === "min") {

                            return res.status(400).send('Passcode Out of Range');
                        }

                    } else { return next(err); }
                }

                res.locals.athleteStack.push(savedAthlete);

                return next();

            });

        }

    });
};

/**
 * Find All Athletes by Organization
 * CODE: 12XX
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): athleteStack = [theAthletes] || [empty]
 */
exports.findByOrg = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.session.currentOrg) return next("E1211: Missing Session 'currentOrg' ");

    Athlete.find({ organization: req.session.currentOrg._id }, (err, theAthletes) => {

        if (err) { return next(err); }

        res.locals.athleteStack = theAthletes;

        return next();
    });
};

/**
 * Find Sinlge Athlete by ID
 * CODE: 13XX
 * (req.params): id (REQUIRED)
 * (res.locals): athleteStack = [theAthlete] || [empty]
 */
exports.findById = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.params.id) return next("E1331: Missing Parameter 'id' ");

    Athlete.findOne({ _id: req.params.id }, (err, theAthlete) => {

        if (err) {

            if (err.name === "CastError") return next("E1334: Incorrect Parameter 'id' ");

            else { return next(err); }

        }

        if (!theAthlete) {

            return res.status(404).send("Athlete Not Found")

        } else {

        res.locals.athleteStack.push(theAthlete);

        }

        return next();
    });
};

/**
 * Find Athlete by 'authType' (Device Only)
 * CODE: 14XX
 * (req.params): authType (REQUIRED), authId (REQUIRED)
 * (res.locals): deviceStack (REQUIRED), athleteStack = [theAthlete] || [empty]
 */
exports.findByAuthType = (req, res, next) => {

    res.locals.athleteStack = [];

    if (res.locals.deviceStack.length != 1) return next("E1421: Missing Locals 'deviceStack'");

    if (req.params.authType != "fingerprint" && req.params.authType != "passcode") return next("E1441: Incorrect Parameter 'authType'");

    Athlete.find({ organization: res.locals.deviceStack[0].organization }).where(req.params.authType, req.params.authId).limit(1).exec((err, theAthlete) => {

        if (err) { return next(err); }

        if (!theAthlete.length) {

            return res.status(404).send('Athlete Not Found');

        } else {

            res.locals.athleteStack = theAthlete;

        }

        return next();
    });
};

/**
 * Update Athlete
 * CODE: 15XX
 * (req.body): firstName, lastName, gender, birthday, sport, showWeight, highRisk, passcode, bodyFat, fingerprint
 * (req.session): currentOrg (REQUIRED)
 * (req.params): id (REQUIRED)
 * (res.locals): athleteStack = [savedAthlete] || [empty]
 */
exports.updateById = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.session.currentOrg) return next("E1511: Missing Session 'currentOrg' ");

    if (!req.params.id) return next("E1531: Missing Parameter 'id' ");

    const bodyKeys = Object.keys(req.body);

    const availableFields = ["firstName", "lastName", "gender", "birthday", "sport", "showWeight", "highRisk", "passcode", "bodyFat", "fingerprint"];

    if (req.body['bodyFat']) req.body.bodyFat = parseFloat(req.body.bodyFat);

    if (req.body['sport']) req.body.sport = req.body.sport.split(",");

    Athlete.findById(req.params.id).where({ organization: req.session.currentOrg }).exec((err, theAthlete) => {

        if (err) { return next(err); }

        if (!theAthlete) {
            
            return res.status(404).send('Athlete Not Found');

        }

        bodyKeys.forEach(function (key) {

            if (availableFields.indexOf(key) === -1) delete req.body[key];

            if (req.body[key] == theAthlete[key]) delete req.body[key];

        });

        if (!req.body.firstName && !req.body.lastName && !req.body.gender && !req.body.birthday && !req.body.sport

            && !req.body.showWeight && !req.body.highRisk && !req.body.passcode && !req.body.bodyFat && !req.body.fingerprint) {

            return res.status(400).send("No Change");

        }

        theAthlete.set(req.body);

        theAthlete.save((err, updatedAthlete) => {

            if (err) {
                if (err.errors.fingerprint) {
                    if (err.errors.fingerprint.kind === "unique") {
                        return res.status(400).send('Fingerprint Exists');
                    }
                    if (err.errors.fingerprint.kind === "max" || err.errors.fingerprint.kind === "min") {
                        return res.status(400).send('Fingerprint Out of Range ');
                    }
                } else if (err.errors.passcode) {
                    if (err.errors.passcode.kind === "unique") {
                        return res.status(400).send('Passcode Exists');
                    }
                    if (err.errors.passcode.kind === "max" || err.errors.passcode.kind === "min") {
                        return res.status(400).send('Passcode Out of Range');
                    }
                } else if (err.errors.gender) {
                    if (err.errors.gender.kind === "enum") {
                        return res.status(400).send("Value Must Be 'Male' or 'Female'");
                    }
                    return res.sendStatus(400)
                } else if (err.errors["sport.0"]) {
                    if (err.errors["sport.0"].kind === "enum") {
                        return res.status(400).send("Value Must Be 'Football', 'Baseball', 'Wrestling'");
                    }
                } else {
                    return next(err);
                }
            } else {

                res.locals.athleteStack.push(updatedAthlete);

                return next();

            }
        });
    });
};

/**
 * Delete Single Athlete
 * CODE: 16XX
 * (req.params): id (REQUIRED)
 * (res.locals): athleteStack  = [#] || [empty]
 */
exports.deleteById = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.params.id) return next("E1631: Missing Parameter 'id'");

    Athlete.findOneAndDelete({ _id: req.params.id }, (err, deletedAthlete) => {

        if (err) { return next(err); }

        if (!deletedAthlete) {
            return res.status(404).send("Athlete Not Found");

        } else {

            res.locals.athleteStack.push(deletedAthlete);

        }

        return next();

    });

};

/**
 * Delete All Athletes by Organization
 * CODE: 17XX
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): athleteStack = [#] || [empty]
 */
exports.deleteByOrg = (req, res, next) => {

    res.locals.athleteStack = [];

    if (!req.session.currentOrg) return next("E1711: Missing Session 'currentOrg' ");

    Athlete.deleteMany({ organization: req.session.currentOrg._id }, (err, deletedAthletes) => {

        if (err) { return next(err); }

        if (deletedAthletes.n === 0) {

            return res.status(404).send("Athlete Not Found");

        } else {

            res.locals.athleteStack.push(deletedAthletes.n);

        }

        return next();

    });

};