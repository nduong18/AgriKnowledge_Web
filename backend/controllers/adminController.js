const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Tổng số Nông dân
        const [farmerCountResult] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'farmer'");
        const totalFarmers = farmerCountResult[0].total;

        // 2. Lấy danh sách 10 nông dân đăng ký mới nhất
        const [recentFarmers] = await db.query("SELECT id, email, role, created_at FROM users WHERE role = 'farmer' ORDER BY created_at DESC LIMIT 10");

        // (Fake data tạm thời cho Nông sản và Lệnh thu mua để UI không bị trống)
        const totalProducts = 253;
        const totalOrders = 48;

        res.json({
            totalFarmers,
            totalProducts,
            totalOrders,
            recentFarmers
        });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu Admin Dashboard:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};
