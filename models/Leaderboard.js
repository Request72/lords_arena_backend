const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    username: String,
    kills: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
