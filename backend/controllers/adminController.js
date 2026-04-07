const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Tổng số Nông dân
        const [farmerCountResult] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'farmer'");
        const totalFarmers = farmerCountResult[0].total;

        // 2. Lấy danh sách 10 nông dân đăng ký mới nhất
        const [recentFarmers] = await db.query("SELECT id, email, role, created_at FROM users WHERE role = 'farmer' ORDER BY created_at DESC LIMIT 10");

        // (Fake data tạm thời Lệnh thu mua để UI không bị trống)
        const totalOrders = 48;

        const [productsCountResult] = await db.query("SELECT COUNT(*) as total FROM products");
        const totalProducts = productsCountResult[0].total;

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

exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
}

exports.addProduct = async (req, res) => {
    try {
        const { key_name, name, url, color, bg_color } = req.body;
        if (!key_name || !name) {
            return res.status(400).json({ error: 'Mã Model và Tên không được bỏ trống' });
        }
        const insertColor = color || '#3b82f6';
        const insertBgColor = bg_color || 'rgba(59, 130, 246, 0.1)';
        
        await db.query('INSERT INTO products (key_name, name, url, color, bg_color) VALUES (?, ?, ?, ?, ?)', 
            [key_name.toLowerCase(), name, url || '', insertColor, insertBgColor]);
            
        res.status(201).json({ message: 'Thêm nông sản vào trình theo dõi và biểu đồ thành công!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Trùng mã nông sản (Ký hiệu) hoặc máy chủ gặp lỗi!' });
    }
}
