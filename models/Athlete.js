/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * B) CREATE QUERY HELPERS ONLY IN HERE
 * 
 * TODO:
 * 
 */
const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose, 1);
const moment = require("moment");
const uniqueValidator = require('mongoose-unique-validator');

const athleteSchema = new mongoose.Schema({

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    gender: { type: String, enum: ["Male", "Female"] },

    birthday: Date,

    sport: { type: [String], required: true, enum: ["Football", "Baseball", "Wrestling"] },

    showWeight: { type: Boolean, default: true },

    highRisk: { type: Boolean, default: false },

    passcode: { type: Number, min: 1000, max: 9999, required: true, unique: true},

    fingerprint: { type: Number, min: 10000, max: 99999, unique: true, sparse: true},

    bodyFat: { type: Float },

    gradeLevel: { type: Number, min: 1, max: 4},

    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true}

}, {
        timestamps: true,
        id: false,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

athleteSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

athleteSchema.virtual('dmy_Bday').get(function () {
    if (this.birthday)
        return moment(this.birthday).format("L");
});

athleteSchema.virtual('age').get(function () {
    if (this.birthday)
        return moment().diff(this.birthday, 'years');
});

athleteSchema.virtual('gradYear').get(function () {
    if (this.gradeLevel) {
        // assume school is a highschool or college (4 year timespaan)
        return moment().year() + (4-this.gradeLevel);
    } 
});

// athleteSchema.post('update', function(error, doc, next) {
//     if (error.name === 'MongoError' && error.code === 11000) {
//         err.errmsg = "Passcode Must Be Unique";
//         console.log('THISS')
//       next(error);
//     } else {
//       next(error);
//     }
//   });

athleteSchema.plugin(uniqueValidator);

const Athlete = mongoose.model('Athlete', athleteSchema);

module.exports = Athlete;