// models/role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    affiliation: { type: String, required: true, enum: ["buono", "cattivo","neutrale"] },
});

module.exports = mongoose.model('Role', RoleSchema);
