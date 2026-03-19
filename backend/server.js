const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const priceRoutes = require('./routes/priceRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Để parse body dạng JSON

// Sử dụng Routes cho RESTful API
app.use('/api/prices', priceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Backend API đang chạy tại http://localhost:${PORT}`);
    console.log(`Dữ liệu giá có thể lấy bằng lệnh GET /api/prices`);
});

// Lắng nghe sự kiện khi nhấn Ctrl + C ở Terminal
process.on('SIGINT', () => {
    console.log('\n⛔ Nhận lệnh tắt server (Ctrl + C)...');
    server.close(() => {
        console.log('✅ Server đã dừng hoạt động hoàn toàn. Tạm biệt!');
        process.exit(0);
    });
});
