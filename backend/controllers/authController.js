const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { email, password, display_name, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu không được để trống' });
        }

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email này đã được sử dụng' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = (role === 'merchant') ? 'merchant' : 'farmer';
        const validDisplayName = display_name || (userRole === 'merchant' ? 'Thương lái mới' : 'Nông dân mới');

        await db.query('INSERT INTO users (email, password, display_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, validDisplayName, userRole]);
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu không được để trống' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const user = users[0];
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, display_name: user.display_name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                display_name: user.display_name,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Dùng tạm để tạo sẵn 1 account Admin nhanh
exports.createAdmin = async (req, res) => {
    try {
        const { email, password, display_name } = req.body;
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email trùng lặp' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const validName = display_name || 'Quản trị viên';
        
        await db.query('INSERT INTO users (email, password, display_name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, validName, 'admin']);
        res.status(201).json({ message: 'Đã tạo tài khoản admin thành công!' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { display_name, avatar, password } = req.body;

        // Fetch current user
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        const currentUser = users[0];

        let updateQuery = 'UPDATE users SET display_name = ?, avatar = ?';
        let queryParams = [
            display_name || currentUser.display_name,
            avatar !== undefined ? avatar : currentUser.avatar
        ];

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(userId);

        await db.query(updateQuery, queryParams);

        // Fetch updated user to return
        const [updatedUsers] = await db.query('SELECT id, email, display_name, role, avatar FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Cập nhật hồ sơ thành công', user: updatedUsers[0] });
    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
