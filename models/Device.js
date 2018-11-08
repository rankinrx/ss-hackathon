/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * B) CREATE QUERY HELPERS ONLY IN HERE
 * 
 * TODO:
 * 
 */
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({

    name: { type: String, required: false },

    firmware: { type: String, default: "0.1" },

    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

    access: { type: Boolean, default: true }

}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;