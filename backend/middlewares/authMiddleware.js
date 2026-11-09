const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Bạn chưa đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-passwordHash');
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Người dùng không tồn tại' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'Bạn không có quyền thực hiện hành động này' });
        }
        next();
    };
};