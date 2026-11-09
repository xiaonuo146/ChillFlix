const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Lấy toàn bộ đơn đặt phòng
router.get('/bookings', async (req, res, next) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json({ status: 'success', data: bookings });
    } catch (err) {
        next(err);
    }
});

// Check-in đơn
router.patch('/bookings/:code/checkin', async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ bookingCode: req.params.code });
        if (!booking) return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn' });
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                status: 'error',
                message: ' Đơn đặt phòng này ĐÃ BỊ HỦY! Không thể check-in cho khách vào phòng.'
            });
        }
        if (booking.status === 'expired') {
            return res.status(400).json({
                status: 'error',
                message: ' Đơn này đã quá hạn giữ chỗ 10 phút và đã bị hủy phòng.'
            });
        }

        if (booking.status === 'checked_in') {
            return res.status(400).json({
                status: 'error',
                message: ' Đơn này đã được check-in trước đó rồi.'
            });
        }
        booking.status = 'checked_in';
        await booking.save();
        res.json({ status: 'success', data: booking });
    } catch (err) {
        next(err);
    }
});

// Thống kê nhanh Dashboard
router.get('/dashboard', async (req, res, next) => {
    try {
        const bookings = await Booking.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalTotal || 0), 0);
        res.json({
            status: 'success',
            data: { totalOrders: bookings.length, totalRevenue }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;