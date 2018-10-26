/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * 
 * TODO:
 * 
 */
const Notification = require("../models/Notification");
const asyncHandler = require('express-async-handler');
/**
 * GET user's subscription type
 */
exports.findByAthlete = asyncHandler(async (req, res, next) => {
    const theAthletes = res.locals.athleteStack;
    const athleteIds = [];

    theAthletes.forEach(function (athlete) {
        athleteIds.push(athlete._id);
    });

    Notification.find({ athlete: { $in: athleteIds } }, (err, theNotifications) => {
        if (err) { return next(err); }

        res.locals.notificationStack = theNotifications;

        next();
    });
});

/**
 * POST delete notification
 */
exports.deleteById = asyncHandler(async (req, res, next) => {

    Notification.findOneAndDelete({_id: req.params.id}, (err) => {

        if (err) { return next(err); }

        res.JSON("Deleted Notification");

    });
});
