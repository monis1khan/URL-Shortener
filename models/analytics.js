const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        index: true, // Crucial for generating graphs later
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    // Now you can track REAL analytics
    userAgent: String,
    ipAddress: String,
    country: String,
});

module.exports = mongoose.model('analytics', analyticsSchema);