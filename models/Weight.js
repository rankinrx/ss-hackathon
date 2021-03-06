/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * B) CREATE QUERY HELPERS ONLY IN HERE
 * C) Device needs to be required
 * 
 * TODO:
 * 
 */
const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose, 1);
const moment = require("moment");

const weightSchema = new mongoose.Schema({

    athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },

    type: { type: String, enum: ["IN", "OUT", "SAVE"], required: true },

    weight: { type: Float, required: true },

    delta: { type: Float, default: 0 },

    ioFlag: { type: Boolean, default: false },

    deltaFlag: { type: Boolean, default: false },

    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },

    method: { type: String, enum: ["passcode", "fingerprint"], required: true }

}, { timestamps: true });

weightSchema.virtual('dmyDate').get(function () {
    return moment(this.createdAt).format("L");
});

weightSchema.virtual('time').get(function () {
    return moment(this.createdAt).format("LT")
});


const Weight = mongoose.model('Weight', weightSchema);

module.exports = Weight;