const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();

// 1. TỰ ĐỘNG NẠP SẴN TÀI KHOẢN & PHÒNG NẾU DATABASE CHƯA CÓ
async function autoProvision() {
    try {
        // Kiểm tra tài khoản Admin
        const adminExists = await User.findOne({ email: 'admin@chillflix.vn' });
        if (!adminExists) {
            await User.create({
                fullName: 'Trần Minh Đạt (Quản Lý Rạp)',
                email: 'admin@chillflix.vn',
                phone: '0988234567',
                passwordHash: 'admin',
                role: 'admin',
                rank: 'Quản Trị Viên',
                points: 0
            });
            console.log('👑 [AUTO-SEED] Đã tạo tài khoản Admin: admin@chillflix.vn / admin');
        }

        // Kiểm tra tài khoản Khách
        const customerExists = await User.findOne({ email: 'khachhang@chillflix.vn' });
        if (!customerExists) {
            await User.create({
                fullName: 'Trần Văn An',
                email: 'khachhang@chillflix.vn',
                phone: '0912345678',
                passwordHash: '123',
                role: 'customer',
                rank: 'Thành viên Mới',
                points: 0
            });
            console.log('👤 [AUTO-SEED] Đã tạo tài khoản Khách: khachhang@chillflix.vn / 123');
        }

        // Kiểm tra 4 phòng chiếu 
        const roomCount = await Room.countDocuments();
        if (roomCount === 0) {
            await Room.insertMany([
                { roomId: 'couple_a', name: 'Phòng Couple A - Tiêu Chuẩn Velvet', category: 'couple', capacityMax: 2, pricePerHour: 120000, cleanStatus: 'ready', isActive: true },
                { roomId: 'couple_b', name: 'Phòng Couple B - Phong Cách Scandinavia', category: 'couple', capacityMax: 2, pricePerHour: 120000, cleanStatus: 'ready', isActive: true },
                { roomId: 'group4', name: 'Phòng Nhóm 4 - Apollo Lounge', category: 'group', capacityMax: 6, pricePerHour: 180000, cleanStatus: 'ready', isActive: true },
                { roomId: 'vip', name: 'Phòng Laser 4K Family Suite (VIP)', category: 'vip', capacityMax: 12, pricePerHour: 350000, cleanStatus: 'ready', isActive: true }
            ]);
            console.log('🚪 [AUTO-SEED] Đã nạp sẵn 4 phòng chiếu chuẩn!');
        }
    } catch (err) {
        console.error('Lỗi auto-provision:', err.message);
    }
}

// Kết nối DB và tự động kích hoạt tài khoản
connectDB().then(() => {
    autoProvision();
});

app.use(helmet({ contentSecurityPolicy: false })); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate-limiting cho Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { status: 'error', message: 'Quá nhiều yêu cầu thử lại sau 15 phút' }
});

// ROUTE MOUNTING
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Background Task: Tự động nhả phòng các đơn pending quá 10 phút
setInterval(async () => {
    try {
        const result = await Booking.updateMany(
            { status: 'pending', holdExpiresAt: { $lt: new Date() } },
            { status: 'expired' }
        );
        if (result.modifiedCount > 0) {
            console.log(`🧹 Đã giải phóng ${result.modifiedCount} phòng giữ chỗ hết hạn.`);
        }
    } catch (e) {
        console.error('Lỗi cron giải phóng phòng:', e.message);
    }
}, 60 * 1000);

// Xử lý 404 chuẩn Express 5 (Không dùng *)
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Endpoint không tồn tại' }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ' : err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    if (err) return console.error('Không khởi động được:', err);
    console.log(` ChillFlix Backend chạy tại http://localhost:${PORT}`);
});