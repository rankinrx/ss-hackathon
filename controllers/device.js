/**
* RULES: 
* - CREATE: res.locals.deviceStack = theDevice || ERROR
* - FIND: res.locals.deviceStack = [theDevices] || []
* - CALC: res.locals.calcStack = calcs 
*/

const Device = require("../models/Device");

/**
 * Create New Device
 * CODE: 51XX
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): deviceStack = [theDevice] || []
 */
exports.new = (req, res, next) => {

    res.locals.deviceStack = [];

    if (!req.session.currentOrg) return next("E5211: Missing Session 'currentOrg' ");

    const newDevice = new Device();
    newDevice.name = "Device " + parseInt(Math.random() * 100).toString();
    newDevice.organization = req.session.currentOrg;

    newDevice.save((err, theDevice) => {

        if (err) { return next(err); }

        res.locals.deviceStack.push(theDevice);

        req.flash('success', { code: 5103, msg: 'Created Device' });

        return res.json({

            msg: req.flash(),
    
            data: res.locals.deviceStack
    
        });

    });

};

/**
 * Find All Devices by Organization
 * CODE: 52XX
 * (req.session): currentOrg (REQUIRED)
 * (res.locals): deviceStack = [theDevices] || []
 */
exports.findByOrg = (req, res, next) => {

    res.locals.deviceStack = [];

    if (!req.session.currentOrg) return next("E5211: Missing Session 'currentOrg' ");

    Device.find({ organization: req.session.currentOrg._id }, (err, theDevices) => {

        if (err) { return next(err); }

        if (!theDevices.length) {

            req.flash('errors', { code: 5202, msg: 'Device Not Found' });

        } else {

            res.locals.deviceStack = theDevices;

            req.flash('success', { code: 5201, msg: 'Device Found' });
        }

        return next();
    });
};

/**
 * Find Single Device by ID
 * CODE: 53XX
 * (req.params): id (REQUIRED)
 * (res.locals): deviceStack = [theAthlete] || []
 */
exports.findById = (req, res, next) => {

    res.locals.deviceStack = [];

    if (!req.params.id) return next("E5331: Missing Parameter 'id' ");

    Device.findOne({ _id: req.params.id }, (err, theDevice) => {

        if (err) { return next(err); }

        if (!theDevice) {

            req.flash('errors', { code: 5302, msg: 'Device Not Found' });

        } else {

            req.flash('success', { code: 5301, msg: 'Device Found' });

            res.locals.deviceStack.push(theDevice);
        }

        return next();

    });

};

/**
 * Calculate Properties for a new IN/OUT weight
 * CODE: 54XX
 * (req.session): currentOrg (REQUIRED)
 * (req.params): wt (REQUIRED)
 * (res.locals): athleteStack (REQUIRED), weightStack (REQUIRED), calcStack = [calcs] || []
 */
exports.ioWeightCalc = async (req, res, next) => {

    res.locals.calcStack = [];

    if (!req.session.currentOrg) return next("E5411: Missing Session 'currentOrg' ");
    if (res.locals.athleteStack.length != 1) return next("E5422: Missing Locals 'athleteStack' ");
    if (!res.locals.weightStack) return next("E5422: Missing Locals 'weightStack' ");
    if (!req.params.wt) return next("E5433: Incorrect Parameter 'wt'");

    const athlete = res.locals.athleteStack[0];

    const orgSettings = req.session.currentOrg;

    const lastRecords = res.locals.weightStack;

    const measurement = parseFloat(req.params.wt);

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
        calcs.wtMsg = `Weight ${calcs.type} at ${measurement} lbs.`;
    } else {
        calcs.wtMsg = `Weight ${calcs.type}.`;
    }

    res.locals.calcStack.push(calcs);

    req.flash('success', { code: 5403, msg: 'Created New IN/OUT Weight' });

    return next();
};

/**
 * Calculate Properties for a new SAVE weight
 * CODE: 55XX
 * (req.params): wt (REQUIRED)
 * (res.locals): athleteStack, weightStack, calcs = [calcs] || []
 */
exports.sWeightCalc = async (req, res, next) => {

    res.locals.calcStack = [];

    if (res.locals.athleteStack.length != 1) return next("E5522: Missing Locals 'athleteStack' ");
    if (!req.params.wt) return next("E5433: Incorrect Parameter 'wt'");

    const athlete = res.locals.athleteStack[0];

    const measurement = parseFloat(req.params.wt);

    const calcs = { type: "SAVE", delta: null, ioFlag: false, deltaFlag: false, calcMsg: null, wtMsg: null };

    if (athlete.showWeight) {
        calcs.wtMsg = `Weight Saved at ${measurement} lbs.`;
    } else {
        calcs.wtMsg = `Weight Saved`;
    }

    res.locals.calcStack.push(calcs);

    req.flash('success', { code: 5503, msg: 'Created New SAVE Weight' });

    return next();
};

/**
 * JSON RESPONSE: Create New Weight Entry
 * (res.locals): weightStack
 * DONE
 */
exports.resNewWeight = (req, res, next) => {

    return res.json({

        msg: req.flash(),
        
        data: {
            wtMsg: res.locals.calcStack[0].wtMsg,
            calcMsg: res.locals.calcStack[0].calcMsg,
            entry: res.locals.weightStack[0]
        }
    });

};

/**
 * Function for Rounding Weight Calculations
 */
function precisionRound(number, precision) {

    const factor = Math.pow(10, precision);

    return Math.round(number * factor) / factor;
}