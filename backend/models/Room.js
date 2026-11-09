const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true }, // 'couple_a', 'couple_b', 'group4', 'vip'
    name: { type: String, required: true },
    category: { type: String, enum: ['couple', 'group', 'vip'], required: true },
    capacityMax: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    audioSystem: { type: String, default: 'Dolby Atmos 7.1' },
    description: { type: String },
    tags: [{ type: String }],
    imageUrl: { type: String },
    cleanStatus: { type: String, enum: ['ready', 'cleaning'], default: 'ready' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);