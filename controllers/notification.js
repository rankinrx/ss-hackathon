const Notification = require("../models/Notification");

/**
 * Create New Notification
 * CODE: 35XX
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): deviceStack = [theDevice] || []
 */
exports.new = async (req, res, next) => {

    res.locals.notificationStack = [];

    if (res.locals.athleteStack.length != 1) return next("E3522: Missing Locals 'athleteStack' ");
    if (res.locals.weightStack.length != 1) return next("E3523: Missing Locals 'calcStack' ");

    const newRecord = res.locals.weightStack[0];
    const athlete = res.locals.athleteStack[0];

    if (!newRecord.ioFlag && !newRecord.deltaFlag) {
        return next();
    }

    if (newRecord.ioFlag) {
        const ioMessage = `${newRecord.dmyDate} ${athlete.fullName} didn't weigh out`;
        await createNotification(ioMessage);
    }

    if (newRecord.deltaFlag) {
        const deltaMessage = `${newRecord.dmyDate} at ${newRecord.time} ${athlete.fullName} was dehydrated`;
        await createNotification(deltaMessage);
    }

    return next();

    function createNotification(theMessage) {

        const newNotification = new Notification();
        newNotification.athlete = athlete._id;
        newNotification.body = theMessage;

        return newNotification.save((err, theNotification) => {

            if (err) { return next(err); }

            res.locals.notificationStack.push(theNotification);

            req.flash('success', { code: 3503, msg: 'Created Notification' });

        });

    }

};

/**
 * Find Notifications by AthleteStack
 * CODE: 31XX
 * (res.locals): athleteStack, notificationStack = [theNoticiations] || []
 */
exports.findByAthleteStack = (req, res, next) => {

    res.locals.notificationStack = [];

    const theAthletes = res.locals.athleteStack;

    const athleteIds = [];

    if (!theAthletes) return next("E2222: Missing Locals 'athleteStack' ");

    if (!theAthletes.length) {

        req.flash('errors', { code: 3102, msg: 'Notifications Not Found' });

        return next();

    }

    theAthletes.forEach(function (athlete) {

        athleteIds.push(athlete._id);

    });

    Notification.find({ athlete: { $in: athleteIds } }, (err, theNotifications) => {

        if (err) { return next(err); }

        if (!theNotifications.length) {

            req.flash('errors', { code: 3102, msg: 'Notifications Not Found' });

        } else {

            res.locals.notificationStack = theNotifications;

            req.flash('success', { code: 3101, msg: `Notifications Found` });
        }

        return next();

    });

};

/**
 *  Delete Single Notification by id
 * CODE: 32XX
 * (req.params): id
 * (res.locals): theNotifications = [deletedNotification] || []
 */
exports.deleteById = (req, res, next) => {

    res.locals.notificationStack = [];

    if (!req.params.id) return next("E3231: Missing Parameter 'id'");

    Notification.findOneAndDelete({ _id: req.params.id }, (err, deletedNotification) => {

        if (err) { return next(err); }

        if (!deletedNotification) {

            req.flash('errors', { code: 3202, msg: 'Notification Not Found' });

        } else {

            res.locals.notificationStack.push(deletedNotification);

            req.flash('success', { code: 3205, msg: `Deleted Notification` });
        }

        return next();



    });

};

/**
 * Delete All Notifications by Athlete id
 * CODE: 34XX
 * (req.params): id (REQUIRED)
 * (res.locals): notificationStack = [#] || [empty]
 */
exports.deleteByAthleteId = (req, res, next) => {

    res.locals.notificationStack = [];

    if (!req.params.id) return next("E3431: Missing Parameter 'id' ");

    Notification.deleteMany({ athlete: req.params.id }, (err, deletedNotifications) => {

        if (err) { return next(err); }

        if (deletedNotifications.n === 0) {

            req.flash('errors', { code: 2402, msg: 'Notifications Not Found' });

        } else {

            res.locals.notificationStack.push(deletedNotifications.n);

            req.flash('success', { code: 2405, msg: 'Notifications Deleted' });

        }

        return next();

    });
};

/**
 * Delete All Notifications by athleteStack
 * CODE: 33XX
 * (res.locals): athleteStack (REQUIRED), notificationStack = [#] || []
 */
exports.deleteByAthleteStack = (req, res, next) => {

    res.locals.notificationStack = [];

    const theAthletes = res.locals.athleteStack;

    const athleteIds = [];

    if (!theAthletes) return next("E3322: Missing Locals 'athleteStack' ");

    if (!theAthletes.length) {

        req.flash('errors', { code: 3302, msg: 'Notifications Not Found' });

        return next();

    }

    theAthletes.forEach(function (athlete) {

        athleteIds.push(athlete._id);

    });

    Notification.deleteMany({ athlete: { $in: athleteIds } }, (err, deletedNotifications) => {

        if (err) { return next(err); }

        if (deletedNotifications.n === 0) {

            req.flash('errors', { code: 3302, msg: 'Notifications Not Found' });

        } else {

            res.locals.notificationStack.push(deletedNotifications.n);

            req.flash('success', { code: 3305, msg: 'Notifications Deleted' });

        }

        return next();

    });
};

