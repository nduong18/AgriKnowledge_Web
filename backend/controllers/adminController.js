const db = require('../config/db');
const bcrypt = require('bcrypt');

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

// Farmers Management
exports.getAllFarmers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, email, display_name, role, avatar, created_at FROM users WHERE role = 'farmer' ORDER BY created_at DESC");
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách nông dân' });
    }
}

exports.addFarmer = async (req, res) => {
    try {
        const { email, password, display_name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu không được để trống' });
        }
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email này đã tồn tại trong hệ thống' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const validName = display_name || 'Nông dân mới';
        
        await db.query('INSERT INTO users (email, password, display_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, validName, 'farmer']);
        res.status(201).json({ message: 'Thêm nông dân thành công!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi máy chủ khi tạo nông dân' });
    }
}

exports.updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const { display_name, password } = req.body;

        const [users] = await db.query("SELECT * FROM users WHERE id = ? AND role = 'farmer'", [id]);
        if (users.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản nông dân' });

        let sql = 'UPDATE users SET display_name = ?';
        let params = [display_name || users[0].display_name];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password = ?';
            params.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật nông dân' });
    }
}

exports.deleteFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query("SELECT * FROM users WHERE id = ? AND role = 'farmer'", [id]);
        if (users.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản nông dân' });

        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: 'Xóa tài khoản nông dân thành công!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi máy chủ khi xóa nông dân' });
    }
}
