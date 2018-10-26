/**
 * RULES:
 * A) DO NOT ANY MODELS
 * 
 * TODO:
 * 
 */

 
/**
 * GET overview page
 */
exports.getOverviewPage = (req, res, next) => {

    const info = {
        account: res.locals.account,
        numAthletes: res.locals.athleteStack.length,
        numRecords: res.locals.weightStack.length,
        numDevices: res.locals.deviceStack.length
    };

    return res.json({
        Info: info,
        Notifications: res.locals.notificationStack
    });
};

/**
 * GET athletes page
 */
exports.getAthletesPage = (req, res, next) => {
    const theAthletes = res.locals.athleteStack;
    var results = [];

    theAthletes.forEach(function (athlete) {
        results.push({
            id: athlete._id,
            fullName: athlete.fullName,
            gender: athlete.gender,
            sport: athlete.sport,
            showWeight: athlete.showWeight,
            highRisk: athlete.highRisk
        });
    });
    return res.json({
        Athletes: results
    });
};

/**
 * POST athletes page (create new)
 */
exports.postAthletesPage = (req, res, next) => {

    res.json({
        msg: 'Created Athlete!'
    });
};

/**
 * GET athlete profile page
 */
exports.getAthleteProfilePage = (req, res, next) => {
    const theAthlete = res.locals.athleteStack[0];
    const theNotifications = res.locals.notificationStack;
    // const theWeights = res.locals.weightStack;

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

    const notificationsResults = [];

    theNotifications.forEach(function (notification) {
        notificationsResults.push({
            body: notification.body
        });
    });

    // const weightResults = [];

    // theWeights.forEach(function (weight) {
    //     weightResults.push({
    //         weight: weight.weight,
    //         time: weight.createdAt
    //     });
    // });

    return res.json({
        Athlete: athleteResult,
        Noticiations: notificationsResults
        // Weights: weightResults
    });
};

/**
 * POST athlete profile page (update)
 */
exports.postAthleteProfilePage = (req, res, next) => {

    return res.json({
        msg: 'Updated Athlete!'
    });
};

/**
 * Delete athlete (remove later)
 */
exports.deleteAthlete = (req, res, next) => {
    return res.json({
        msg: 'Deleted athletes and associated weights!'
    });
};

/**
 * GET athlete weight page
 */
exports.getWeightPage = (req, res, next) => {
    const theAthlete = res.locals.athleteStack[0];
    const theWeights = res.locals.weightStack;
    if(!theAthlete) {
        return res.json({
            msg: 'Athlete not found!'
        });
     }

    const athleteResult = {
        id: theAthlete._id,
        fullName: theAthlete.fullName,
        org: req.session.currentOrg.name,
        age: theAthlete.age,
        bodyFat: theAthlete.bodyFat,
        birthday: theAthlete.dmy_Bday,
        sport: theAthlete.sport,
        gender: theAthlete.gender
    };
    const weightResults = [];
    theWeights.forEach(function (weight) {
        weightResults.push({
            type: weight.type,
            date: weight.dmyDate,
            time: weight.time,
            weight: weight.weight,
            delta: weight.delta

        });
    });

    return res.json({
        Athlete: athleteResult,
        Weights: weightResults
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

    return res.json({
        Settings: settingsResult
    });
};

/**
 * POST settings page
 */
exports.postSettingsPage = (req, res, next) => {

    return res.json({
        msg: 'Organization updated!'
    });
};