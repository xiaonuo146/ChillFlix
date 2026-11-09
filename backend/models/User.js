const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    rank: {
        type: String,
        default: 'Thành viên Mới'
    },
    points: {
        type: Number,
        default: 0
    },
    claimedVouchers: [{
        type: String
    }]
}, {
    timestamps: true
});

// Tự động băm mật khẩu trước khi lưu (Chuẩn Mongoose 9: Dùng async/await, KHÔNG dùng next)
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Hàm kiểm tra mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
    // 1. Nếu mật khẩu đã được băm chuẩn bcrypt ($2a$...)
    if (this.passwordHash && this.passwordHash.startsWith('$2')) {
        return bcrypt.compare(candidatePassword, this.passwordHash);
    }
    // 2. Dự phòng nếu lưu chữ thường chưa băm
    return candidatePassword === this.passwordHash;
};

module.exports = mongoose.model('User', userSchema);