const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu không được để trống' });
        }

        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email này đã được sử dụng' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'farmer'; // Mặc định tự đăng ký là farmer

        await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);
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
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
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
        const { email, password } = req.body;
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email trùng lặp' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'admin']);
        res.status(201).json({ message: 'Đã tạo tài khoản admin thành công!' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};
