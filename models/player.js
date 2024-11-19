const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    isAlive: { type: Boolean, default: true },
    score: {type: Number, default: 0 }
});

module.exports = mongoose.model('Player', playerSchema);