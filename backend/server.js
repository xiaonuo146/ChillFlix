const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// 1. Kết nối cơ sở dữ liệu MongoDB
connectDB();

// 2. Middlewares đọc dữ liệu JSON & cho phép Frontend gọi API
app.use(cors());
app.use(express.json());

// 3. Đường dẫn kiểm tra (Test Route)
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🎬 Backend ChillFlix Cinema Lounge đang hoạt động ổn định!'
  });
});

// 4. Lắng nghe cổng 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Máy chủ Backend đang chạy tại: http://localhost:${PORT}`);
});