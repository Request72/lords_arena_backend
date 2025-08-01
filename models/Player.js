const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    socketId: String,
    username: String,
    character: String,
    roomId: String,
    x: Number,
    y: Number,
});

module.exports = mongoose.model('Player', playerSchema);