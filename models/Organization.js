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

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },

    subscription: { type: String, enum: ["Standard", "Premium"], default: "Standard"},

    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],

    ioPercent: { type: Float, default: 3.1 },

    iiPercent: { type: Float, default: 3.1 },

    ioMessage: { type: String, default: "Go see your trainer" },

    iiMessage: { type: String, default: "Go see your trainer" }

}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
