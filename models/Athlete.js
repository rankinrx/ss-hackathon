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

    gender: { type: String, enum: ["male", "female"] },

    birthday: Date,

    sport: { type: [String], required: true, enum: ["Football", "Baseball", "Wrestling"] },

    showWeight: { type: Boolean, default: true },

    highRisk: { type: Boolean, default: false },

    passcode: { type: Number, min: 1000, max: 9999, required: true, unique: true },

    fingerprint: { type: Number, min: 10000, max: 99999 },

    bodyFat: { type: Float },

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

athleteSchema.plugin(uniqueValidator);

const Athlete = mongoose.model('Athlete', athleteSchema);

module.exports = Athlete;