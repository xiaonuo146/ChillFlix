const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    sku: { type: String, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['combo', 'drink', 'food'], required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    description: { type: String },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    tag: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);