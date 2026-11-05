const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Đã kết nối MongoDB thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    console.log("👉 Nhớ mở ứng dụng MongoDB Compass trên máy tính và bấm Connect nhé!");
    process.exit(1);
  }
};

module.exports = connectDB;