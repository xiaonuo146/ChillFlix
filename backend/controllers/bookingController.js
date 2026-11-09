const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

// 1. Tạo đơn đặt phòng mới trên Database
exports.createBooking = async (req, res, next) => {
    try {
        const {
            roomId, roomName, date, startTime, duration,
            tmdbMovieId, movieTitle, posterPath,
            customer, foods, voucherCode, roomTotal, foodTotal, voucherDiscount, finalTotal
        } = req.body;

        // Tính mốc thời gian và 15 phút đệm dọn phòng
        const [sH, sM] = (startTime || "18:00").split(':').map(Number);
        const startAt = new Date(`${date}T${String(sH).padStart(2,'0')}:${String(sM).padStart(2,'0')}:00`);
        const durationHours = Number(duration) || 2;
        const endAt = new Date(startAt.getTime() + durationHours * 3600000);
        const blockedUntil = new Date(endAt.getTime() + 15 * 60000); // +15p đệm

        // Kiểm tra trùng phòng
        const overlap = await Booking.findOne({
            roomId, date,
            status: { $in: ['pending', 'confirmed', 'checked_in'] },
            startAt: { $lt: blockedUntil },
            blockedUntil: { $gt: startAt }
        });

        if (overlap) {
            return res.status(409).json({
                status: 'error',
                message: 'Phòng đã có khách giữ chỗ vào khung giờ này! Vui lòng chọn khung giờ khác.'
            });
        }

        const bookingCode = 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const smartPin = String(Math.floor(1000 + Math.random() * 9000));
        const calcTotal = finalTotal || (roomTotal + (foodTotal || 0) - (voucherDiscount || 0));

        // Tìm User nếu khách đã đăng nhập
        let userId = req.user ? req.user._id : (req.body.userId || null);
        if (!userId && customer && customer.email) {
            const u = await User.findOne({ email: customer.email.toLowerCase() });
            if (u) userId = u._id;
        }

        const newBooking = await Booking.create({
            bookingCode,
            user: userId,
            customer: customer || { name: "Khách vãng lai", phone: "0900000000", email: "guest@chillflix.vn" },
            roomId: roomId || "couple_a",
            roomName: roomName || "Phòng riêng",
            tmdbMovieId: tmdbMovieId || 693134,
            movieTitle: movieTitle || "Phim chiếu rạp",
            posterPath: posterPath || "",
            date, startTime,
            duration: durationHours,
            startAt, endAt, blockedUntil,
            foods: foods || [],
            roomTotal: roomTotal || 240000,
            foodTotal: foodTotal || 0,
            voucherCode: voucherCode || "",
            voucherDiscount: voucherDiscount || 0,
            finalTotal: calcTotal,
            earnedPoints: Math.floor(calcTotal / 10000), // 10.000đ = 1 điểm
            smartPin,
            status: 'pending',
            paymentStatus: 'unpaid', // Mặc định chưa duyệt chuyển khoản
            holdExpiresAt: new Date(Date.now() + 10 * 60000)
        });

        res.status(201).json({ status: 'success', data: newBooking });
    } catch (error) {
        next(error);
    }
};

// 2. Xác nhận thanh toán (Mở khóa PIN & Cộng điểm thưởng cho khách)
exports.confirmPayment = async (req, res, next) => {
    try {
        const { bookingCode } = req.body;
        const booking = await Booking.findOne({ bookingCode });

        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn hàng' });
        }

        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.holdExpiresAt = null;
        await booking.save();

        // TÌM TÀI KHOẢN KHÁCH ĐỂ CỘNG ĐIỂM (Tìm theo User ID hoặc Email)
        let targetUser = null;
        if (booking.user) {
            targetUser = await User.findById(booking.user);
        }
        if (!targetUser && booking.customer && booking.customer.email) {
            targetUser = await User.findOne({ email: booking.customer.email.toLowerCase() });
        }
        // Nếu vẫn không thấy, cộng luôn cho tài khoản khách mặc định
        if (!targetUser) {
            targetUser = await User.findOne({ email: 'khachhang@chillflix.vn' });
        }

        if (targetUser) {
            const pointsToAdd = booking.earnedPoints || Math.floor((booking.finalTotal || 0) / 10000);
            targetUser.points = (targetUser.points || 0) + pointsToAdd;

            if (targetUser.points >= 3000) targetUser.rank = 'Hạng Kim Cương';
            else if (targetUser.points >= 1500) targetUser.rank = 'Hạng Vàng';
            else if (targetUser.points >= 500) targetUser.rank = 'Hạng Bạc';

            await targetUser.save();
            console.log(`🎉 Đã cộng +${pointsToAdd} điểm cho khách: ${targetUser.fullName}. Tổng điểm: ${targetUser.points}`);
        }

        res.json({
            status: 'success',
            message: 'Đã xác nhận thanh toán & tích lũy điểm thưởng!',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// 3. Lấy vé theo mã đơn
exports.getTicket = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ bookingCode: req.params.code });
        if (!booking) return res.status(404).json({ status: 'error', message: 'Không tìm thấy vé' });
        res.json({ status: 'success', data: booking });
    } catch (error) {
        next(error);
    }
};
// 4. Lấy lịch sử vé của khách đang đăng nhập
exports.getMyBookings = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Chưa đăng nhập' });
        }
        // CHỈ TÌM ĐƠN CỦA CHÍNH TÀI KHOẢN NÀY
        const bookings = await Booking.find({
            $or: [
                { user: req.user._id },
                { 'customer.email': req.user.email }
            ]
        }).sort({ createdAt: -1 });

        res.json({ status: 'success', data: bookings });
    } catch (error) {
        next(error);
    }
};

// 5. Hủy vé trước 2 tiếng
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ bookingCode: req.params.code });
        if (!booking) return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn' });

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        await booking.save();

        // Hoàn lại điểm nếu đã cộng
        if (booking.user && booking.earnedPoints) {
            const user = await User.findById(booking.user);
            if (user) {
                user.points = Math.max(0, (user.points || 0) - booking.earnedPoints);
                await user.save();
            }
        }

        res.json({ status: 'success', message: 'Hủy đơn thành công', data: booking });
    } catch (error) {
        next(error);
    }
};