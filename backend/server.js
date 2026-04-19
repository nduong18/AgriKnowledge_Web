const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const priceRoutes = require('./routes/priceRoutes');
const newsRoutes = require('./routes/newsRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Tăng limit cho nội dung bài viết có ảnh base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phục vụ frontend (các file tĩnh HTML, CSS, JS) từ thư mục gốc
app.use(express.static(path.join(__dirname, '../')));

// Sử dụng Routes cho RESTful API
app.use('/api/prices', priceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/messages', messageRoutes);

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
