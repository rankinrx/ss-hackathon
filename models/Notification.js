/**
 * RULES:
 * A) DO NOT INCLUDE OTHER MODELS
 * B) CREATE QUERY HELPERS ONLY IN HERE
 * 
 * TODO:
 * 
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },

    body: { type: String, required: true }

}, { timestamps: true,});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;