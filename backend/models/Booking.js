const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingCode: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        roomNote: { type: String, default: '' }
    },
    roomId: { type: String, required: true },
    roomName: { type: String, required: true },

    tmdbMovieId: { type: mongoose.Schema.Types.Mixed, default: 693134 },
    
    movieTitle: { type: String, required: true },
    posterPath: { type: String },
    
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    blockedUntil: { type: Date, required: true },

    foods: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number
    }],

    roomTotal: { type: Number, required: true },
    foodTotal: { type: Number, default: 0 },
    voucherCode: { type: String },
    voucherDiscount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },
    earnedPoints: { type: Number, default: 0 },

    smartPin: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired'],
        default: 'pending'
    },
    paymentMethod: { type: String, default: 'vietqr' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    holdExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);