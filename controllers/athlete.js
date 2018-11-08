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

        req.flash('errors', { code: 1106, msg: 'Please complete all required fields' });

        return next();
    }

    const newAthlete = new Athlete();

    newAthlete.firstName = req.body.firstName;

    newAthlete.lastName = req.body.lastName;

    newAthlete.passcode = req.body.passcode;

    newAthlete.sport = req.body.sport;

    newAthlete.organization = req.session.currentOrg._id;

    Athlete.find({ passcode: req.body.passcode, organization: req.session.currentOrg }, (err, existingAthlete) => {

        if (err) { return next(err); }

        if (existingAthlete.length) {

            res.locals.athleteStack = existingAthlete;

            req.flash('errors', { code: 1108, msg: 'Account with that passcode already exists' });

            return next();

        } else {

            newAthlete.save((err, savedAthlete) => {

                if (err) {
                    // return res.json(err)
                    if (err.errors.passcode) {
                        if (err.errors.passcode.kind === "unique") {
                            req.flash('errors', { code: 1508, msg: 'Passcode Exists' });
                        }
                        if (err.errors.passcode.kind === "max" || err.errors.passcode.kind === "min") {
                            req.flash('errors', { code: 1509, msg: 'Passcode Out of Range ' });
                        }
                        return next();

                    } else { return next(err); }
                }

                res.locals.athleteStack.push(savedAthlete);

                req.flash('success', { code: 1103, msg: 'Created New Athlete' });

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

        if (!theAthletes.length) {

            req.flash('errors', { code: 1202, msg: 'Athlete Not Found' });

        } else {

            res.locals.athleteStack = theAthletes;

            req.flash('success', { code: 1201, msg: `Athlete Found` });
        }

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

            if(err.name === "CastError") return next("E1334: Incorrect Parameter 'id' ");

            else {return next(err);}

        } 

        if (!theAthlete) {

            req.flash('errors', { code: 1302, msg: 'Athlete Not Found' });

        } else {

            res.locals.athleteStack.push(theAthlete);

            req.flash('success', { code: 1301, msg: `Athlete Found` });

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

            req.flash('errors', { code: 1402, msg: 'Athlete Not Found' });

        } else {

            res.locals.athleteStack = theAthlete;

            req.flash('success', { code: 1401, msg: `Athlete Found` });

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

    Athlete.findById(req.params.id).where({ organization: req.session.currentOrg }).exec((err, theAthlete) => {

        if (err) { return next(err); }

        if (!theAthlete) {

            req.flash('errors', { code: 1502, msg: 'Athlete Not Found' });

            return next();

        }

        bodyKeys.forEach(function (key) {

            if (availableFields.indexOf(key) === -1) delete req.body[key];

            if (req.body[key] == theAthlete[key]) delete req.body[key];

        });

        if (!req.body.firstName && !req.body.lastName && !req.body.gender && !req.body.birthday && !req.body.sport

            && !req.body.showWeight && !req.body.highRisk && !req.body.passcode && !req.body.bodyFat && !req.body.fingerprint) {

            req.flash('errors', { code: 1507, msg: 'No Changes' });

            return next();

        }

        theAthlete.set(req.body);

        theAthlete.save((err, updatedAthlete) => {

            if (err) {
                if (err.errors.fingerprint) {
                    if (err.errors.fingerprint.kind === "unique") {
                        req.flash('errors', { code: 1508, msg: 'Fingerprint Exists' });
                    }
                    if (err.errors.fingerprint.kind === "max" || err.errors.fingerprint.kind === "min") {
                        req.flash('errors', { code: 1509, msg: 'Fingerprint Out of Range ' });
                    }
                    return next();
                } else if (err.errors.passcode) {
                    if (err.errors.passcode.kind === "unique") {
                        req.flash('errors', { code: 1508, msg: 'Passcode Exists' });
                    }
                    if (err.errors.passcode.kind === "max" || err.errors.passcode.kind === "min") {
                        req.flash('errors', { code: 1509, msg: 'Passcode Out of Range ' });
                    }
                    return next();
                } else if (err.errors.gender) {
                    if (err.errors.gender.kind === "enum") {
                        req.flash('errors', { code: 1511, msg: "Value Must Be 'Male' or 'Female'" });
                    }
                    return next();
                } else if (err.errors["sport.0"]) {
                    if (err.errors["sport.0"].kind === "enum") {
                        req.flash('errors', { code: 1511, msg: "Value Must Be 'Football', 'Baseball', 'Wrestling'" });
                    }
                    return next();
                } else {
                    return next(err);
                }
            } else {

                res.locals.athleteStack.push(updatedAthlete);

                req.flash('success', { code: 1504, msg: 'Athlete Updated' });

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

            req.flash('errors', { code: 1602, msg: 'Athlete Not Found' });

        } else {

            res.locals.athleteStack.push(deletedAthlete);

            req.flash('success', { code: 1605, msg: 'Athlete Deleted' });

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

            req.flash('errors', { code: 1702, msg: 'Athlete Not Found' });

        } else {

            res.locals.athleteStack.push(deletedAthletes.n);

            req.flash('success', { code: 1705, msg: 'Athlete Deleted' });

        }

        return next();

    });

};