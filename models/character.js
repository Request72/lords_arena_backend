const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: String,
    type: String,
    power: Number,
    rarity: String,
    unlockCost: Number,
});

module.exports = mongoose.model('Character', characterSchema);