// models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    status: { type: String, enum: ['in_corso', 'conclusa'], default: 'in_corso' },
    winner: { type: String, enum: ['villici', 'lupi', null], default: null },
    rolesPool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
},{timestamps : true});

module.exports = mongoose.model('Game', gameSchema);
