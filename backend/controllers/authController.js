const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'chillflix_secret_2026', {
        expiresIn: '7d'
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('👉 Nhận yêu cầu đăng nhập:', { email, password });

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
        }

        const account = email.trim().toLowerCase();

        // 1. CƠ CHẾ BẢO ĐẢM CHO 2 TÀI KHOẢN MẪU (KHÔNG BAO GIỜ BỊ LỖI)
        if (account === 'admin@chillflix.vn' && password === 'admin') {
            let admin = await User.findOne({ email: 'admin@chillflix.vn' });
            if (!admin) {
                admin = await User.create({
                    fullName: 'Trần Minh Đạt (Quản Lý Rạp)',
                    email: 'admin@chillflix.vn',
                    phone: '0988234567',
                    passwordHash: 'admin',
                    role: 'admin',
                    rank: 'Quản Trị Viên',
                    points: 0
                });
            }
            const token = signToken(admin._id, admin.role);
            return res.json({
                status: 'success',
                token,
                user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: 'admin', points: admin.points }
            });
        }

        if (account === 'khachhang@chillflix.vn' && password === '123') {
            let customer = await User.findOne({ email: 'khachhang@chillflix.vn' });
            if (!customer) {
                customer = await User.create({
                    fullName: 'Trần Văn An',
                    email: 'khachhang@chillflix.vn',
                    phone: '0912345678',
                    passwordHash: '123',
                    role: 'customer',
                    rank: 'Thành viên Mới',
                    points: 0
                });
            }
            const token = signToken(customer._id, customer.role);
            return res.json({
                status: 'success',
                token,
                user: { id: customer._id, fullName: customer.fullName, email: customer.email, role: 'customer', points: customer.points }
            });
        }

        // 2. TÀI KHOẢN TỰ ĐĂNG KÝ
        const user = await User.findOne({
            $or: [{ email: account }, { phone: email.trim() }]
        });

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Tài khoản không tồn tại' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Sai mật khẩu' });
        }

        const token = signToken(user._id, user.role);
        return res.json({
            status: 'success',
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, points: user.points, rank: user.rank }
        });

    } catch (err) {
        console.error('Lỗi login:', err);
        res.status(500).json({ status: 'error', message: 'Lỗi máy chủ khi đăng nhập' });
    }
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        const newUser = await User.create({
            fullName,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            passwordHash: password,
            role: 'customer',
            rank: 'Thành viên Mới',
            points: 0
        });

        const token = signToken(newUser._id, newUser.role);
        res.status(201).json({
            status: 'success',
            token,
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, points: 0 }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.json({ status: 'success', user: req.user });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};