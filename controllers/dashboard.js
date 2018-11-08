const moment = require("moment");
const _ = require('lodash');
/**
 * GET overview page
 */
exports.getOverviewPage = (req, res, next) => {

    return res.json({

        msg: req.flash(),

        data: {
            notifications: res.locals.notificationStack,
            info: {
                account: req.session.currentOrg.subscription,
                numDevices: res.locals.deviceStack.length,
                numAthletes: res.locals.athleteStack.length,
                numRecords: res.locals.weightStack.length

            }
        }

    });
};

/**
 * GET athletes page
 */
exports.getAthletesPage = (req, res, next) => {

    const theAthletes = res.locals.athleteStack;

    const theWeights = res.locals.weightStack;

    let athleteResults = [];

    const groupedByAthlete = _.groupBy(theWeights, function (weight) {
        return weight.athlete;
    });

    // if (theWeights) {

    //     theWeights.forEach(function (weight) {
    //         let index = theAthletes.findIndex(athlete => athlete._id === weight.athlete);
    //         if (!theAthletes[index].weight) theAthletes[index].weight = [];
    //         theAthletes[index].weight.push(weight)
    //     });
    // }

    // return res.json(theWeights)

    if (theAthletes) {
        theAthletes.forEach(function (athlete) {
            if(groupedByAthlete[athlete._id]) {
                athlete.lastMeasured = moment(groupedByAthlete[athlete._id][0].createdAt).format("L");
            } else {
                athlete.lastMeasured = "No Entry";
            }
            athleteResults.push({
                id: athlete._id,
                fullName: athlete.fullName,
                gradeYear: athlete.gradYear,
                sport: athlete.sport,
                age: athlete.age,
                gender: athlete.gender,
                showWeight: athlete.showWeight,
                highRisk: athlete.highRisk,
                lastMeasured: athlete.lastMeasured
            });
        });
    }

    return res.json({

        msg: req.flash(),

        data: {

            athletes: athleteResults

        }

    });
};

/**
 * POST athletes page (create new)
 */
exports.postAthletesPage = (req, res, next) => {

    return res.json({

        msg: req.flash(),

        data: res.locals.athleteStack

    });
};

/**
 * GET athlete profile page
 */
exports.getAthleteProfilePage = (req, res, next) => {
    const theAthlete = res.locals.athleteStack[0];
    const theNotifications = res.locals.notificationStack;
    const theWeights = res.locals.weightStack;
    const notificationsResults = [];

    const athleteResult = {
        id: theAthlete._id,
        firstName: theAthlete.firstName,
        lastName: theAthlete.lastName,
        org: req.session.currentOrg.name,
        age: theAthlete.age,
        bodyFat: theAthlete.bodyFat,
        birthday: theAthlete.dmy_Bday,
        sport: theAthlete.sport,
        gender: theAthlete.gender,
        showWeight: theAthlete.showWeight,
        highRisk: theAthlete.highRisk,
        passcode: theAthlete.passcode
    };

    if (theNotifications) {

        theNotifications.forEach(function (notification) {
            notificationsResults.push({
                body: notification.body
            });
        });

    }

    return res.json({

        msg: req.flash(),
        data: {
            athlete: athleteResult,
            notifications: notificationsResults,
            weights: theWeights
        }

    });
};

/**
 * POST athlete profile page (update)
 */
exports.postAthleteProfilePage = (req, res, next) => {

    return res.json({

        msg: req.flash(),

        data: res.locals.athleteStack

    });
};

/**
 * GET athlete weight page
 */
exports.getWeightPage = (req, res, next) => {

    const theAthlete = res.locals.athleteStack[0];
    const theWeights = res.locals.weightStack;
    const weightResults = [];
    const athleteResults = [];

    if (theAthlete) {
        athleteResults.push({
            id: theAthlete._id,
            fullName: theAthlete.fullName,
            org: req.session.currentOrg.name,
            age: theAthlete.age,
            bodyFat: theAthlete.bodyFat,
            birthday: theAthlete.dmy_Bday,
            sport: theAthlete.sport,
            gender: theAthlete.gender
        });
    }

    

    if (theWeights) {
        theWeights.forEach(function (weight) {
            weightResults.push({
                type: weight.type,
                date: weight.dmyDate,
                time: weight.time,
                weight: weight.weight,
                delta: weight.delta

            });
        });
    }

    return res.json({

        msg: req.flash(),
        data: {
            athlete: athleteResults,
            weight: weightResults
        }

    });

};

/**
 * GET settings page
 */
exports.getSettingsPage = (req, res, next) => {

    const settingsResult = {
        ioMessage: req.session.currentOrg.ioMessage,

        ioPercent: req.session.currentOrg.ioPercent,

        iiMessage: req.session.currentOrg.iiMessage,

        iiPercent: req.session.currentOrg.iiPercent
    };

    req.flash('success', { msg: 'Settings Found' });

    return res.json({

        msg: req.flash(),

        data: {

            settings: settingsResult

        }

    });
};

/**
 * POST settings page
 */
exports.postSettingsPage = (req, res, next) => {

    return res.json({

        msg: req.flash(),

    });
};

/**
 * Delete athlete
 */
exports.deleteAthlete = (req, res, next) => {

    return res.json({

        msg: req.flash(),

        data: {
            athletes: res.locals.athleteStack,
            weights: res.locals.weightStack,
            notifications: res.locals.notificationStack
        }

    });
};

/**
 * Delete single notification
 */
exports.deleteNotification = (req, res, next) => {

    return res.json({

        msg: req.flash(),

        data: {
            notification: res.locals.notificationStack
        }

    });
};
