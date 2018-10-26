/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * 
 * TODO:
 * 
 */
const Device = require("../models/Device");

/**
 * QUERY find the device by org
 */
exports.findByOrg = (req, res, next) => {

    Device.find({ organization: req.session.currentOrg._id }, (err, theDevices) => {

        if (err) { return next(err); }

        res.locals.deviceStack = theDevices;

        next();
    });
};

/**
 * GET user's subscription type
 */
exports.findById = (req, res, next) => {

    Device.findOne({ _id: req.params.id }, (err, theDevice) => {

        if (err) { return next(err); }

        res.locals.deviceStack = theDevice;

        next();
    });
};

/**
 * GET user's subscription type
 */
exports.externalAuthType = (req, res, next) => {

    if (req.params.authType != "fingerprint" && req.params.authType != "passcode")

        return res.json({ msg: "Invalid Request" });

    res.locals.authType = req.params.authType;

    next();
};

/**
 * CALC new weight entry
 */
exports.weightCalc = async(req, res, next) => {
    const athlete = res.locals.athleteStack;
    const orgSettings = req.session.currentOrg;
    const lastRecords = res.locals.weightStack;
    const measurement = Number(req.params.wt);

    const today = new Date();

    const calcs = { type: null, delta: null, ioFlag: null, deltaFlag: null, calcMsg: null, wtMsg: null };
    // If new record, => IN
    if (lastRecords.length === 0) {
        calcs.type = "IN";
        calcs.delta = null;
        calcs.ioFlag = false;
        calcs.deltaFlag = false;
    }
    // If more than 1 record exists
    else if (lastRecords.length >= 1) {
        //If the last record type is IN
        if (lastRecords[0].type === "IN") {
            let lastDate = new Date(lastRecords[0].createdAt);
            //If the record was today => OUT
            if (today.toDateString() === lastDate.toDateString()) {
                calcs.type = "OUT";
                calcs.delta = await precisionRound((((lastRecords[0].weight - measurement) / lastRecords[0].weight) * 100), 1);
                calcs.ioFlag = false;
                if (calcs.delta >= orgSettings.ioPercent) {
                    calcs.deltaFlag = true;
                    calcs.calcMsg = `You have lost ${calcs.delta}% of your weight since weigh-in! ${orgSettings.ioMessage}`;
                } else {
                    calcs.deltaFlag = false;
                }
            }
            // If the record was NOT today => IN w/ error
            else {
                calcs.type = "IN";
                calcs.delta = await precisionRound((((lastRecords[0].weight - measurement) / lastRecords[0].weight) * 100), 1);
                calcs.ioFlag = true;
                calcs.calcMsg = "You didn't weight-out last time. ";
                if (calcs.delta >= orgSettings.iiPercent) {
                    calcs.deltaFlag = true;
                    calcs.calcMsg = calcs.calcMsg + `You have lost ${calcs.delta}% of your weight since last weigh-in! ${orgSettings.iiMessage}`;
                } else {
                    calcs.deltaFlag = false;
                    calcs.calcMsg = calcs.calcMsg + "Make sure you remember this time!";
                }
            }
        }
        //If the last record type is OUT => IN
        else if (lastRecords[0].type === "OUT") {
            calcs.type = "IN";
            calcs.delta = await precisionRound((((lastRecords[1].weight - measurement) / lastRecords[1].weight) * 100), 1);
            calcs.ioFlag = false;
            if (calcs.delta >= orgSettings.iiPercent) {
                calcs.deltaFlag = true;
                calcs.calcMsg = `You have lost ${calcs.delta}% of your weight since last weigh-in! ${orgSettings.iiMessage}`;
            } else {
                calcs.deltaFlag = false;
            }
        } else {
            next("Weight Calculation Error!");
        }
    }

    if (athlete.showWeight) {
        calcs.wtMsg = `Weighed ${calcs.type} at ${measurement} lbs.`;
    } else {
        calcs.wtMsg = `Weighed ${calcs.type}.`;
    }
    res.locals.calcs = calcs;
    next();
};

/**
 * GET user's subscription type
 */
exports.weightResponse = (req, res, next) => {
    res.json(res.locals.calcs)
};


function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}