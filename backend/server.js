const express = require('express');
const cors = require('cors');
const priceRoutes = require('./routes/priceRoutes');

const app = express();
app.use(cors());

// Sử dụng Routes cho RESTful API
app.use('/api/prices', priceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend API đang chạy tại http://localhost:${PORT}`);
    console.log(`Dữ liệu giá có thể lấy bằng lệnh GET /api/prices`);
});
