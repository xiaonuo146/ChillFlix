const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true }, // 20 (%) hoặc 45000 (VND)
    appliesTo: { type: String, enum: ['room', 'total', 'fnb'], default: 'room' },
    minOrderAmount: { type: Number, default: 0 },
    validFromHour: { type: Number }, // Ví dụ 21 cho CHILL10
    requiredRoomCategory: { type: String }, // 'couple' cho FNBCOUPLE
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);