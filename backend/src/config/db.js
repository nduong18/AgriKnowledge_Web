const mysql = require('mysql2/promise');
require('./env');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
};

let pool;

async function initDB() {
    try {
        // Kết nối chưa chỉ định DB để tạo DB nếu chưa có
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'agriknowledge'}\`;`);
        await connection.end();

        // Kết nối chính thức kèm DB
        pool = mysql.createPool({
            ...dbConfig,
            database: process.env.DB_NAME || 'agriknowledge',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Tạo bảng users
        const createUsersTableCmd = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            display_name VARCHAR(255) DEFAULT 'Người dùng mới',
            role ENUM('farmer', 'admin', 'merchant') DEFAULT 'farmer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await pool.query(createUsersTableCmd);

        // Auto-migrate to add display_name if table was already created before
        try {
            await pool.query("ALTER TABLE users ADD COLUMN display_name VARCHAR(255) DEFAULT 'Người dùng mới'");
        } catch(e) { /* Lỗi Duplicate column tức là cột đã tồn tại, có thể bỏ qua */ }

        // Auto-migrate to add avatar
        try {
            await pool.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(500) DEFAULT NULL");
        } catch(e) { /* Lỗi Duplicate column tức là cột đã tồn tại, có thể bỏ qua */ }

        // Auto-migrate to update role enum
        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'admin', 'merchant') DEFAULT 'farmer'");
        } catch(e) { console.warn('Lỗi cập nhật cột role', e.message); }

        // Mở rộng Bảng Nông sản (Products) cho bộ Crawler Web
        const createProductsTableCmd = `
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            key_name VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(1024),
            color VARCHAR(50) DEFAULT '#3b82f6',
            bg_color VARCHAR(50) DEFAULT 'rgba(59, 130, 246, 0.1)',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await pool.query(createProductsTableCmd);

        // Chèn dữ liệu mặc định nếu bảng trống
        const [productCount] = await pool.query("SELECT COUNT(*) as total FROM products");
        if (productCount[0].total === 0) {
            const defaults = [
                ['caphe', 'Giá Cà Phê Arabica', 'https://nhabeagri.com/gia-nong-san/gia-ca-phe-arabica/', '#8b5cf6', 'rgba(139, 92, 246, 0.1)'],
                ['cacao', 'Giá Ca Cao', 'https://nhabeagri.com/gia-nong-san/gia-ca-cao/', '#a855f7', 'rgba(168, 85, 247, 0.1)'],
                ['lua', 'Giá Gạo Thô', 'https://nhabeagri.com/gia-nong-san/gia-gao-tho/', '#3b82f6', 'rgba(59, 130, 246, 0.1)'],
                ['ngo', 'Giá Ngô Mới Nhất', 'https://nhabeagri.com/gia-nong-san/gia-ngo-moi-nhat/', '#eab308', 'rgba(234, 179, 8, 0.1)'],
                ['daunanh', 'Giá Hạt Đậu Nành Thô', 'https://nhabeagri.com/gia-hat-dau-nanh-tho/', '#22c55e', 'rgba(34, 197, 94, 0.1)'],
                ['saurieng', 'Giá Sầu Riêng Xuất Khẩu', '', '#f97316', 'rgba(249, 115, 22, 0.1)']
            ];
            for (const p of defaults) {
                await pool.query('INSERT IGNORE INTO products (key_name, name, url, color, bg_color) VALUES (?, ?, ?, ?, ?)', p);
            }
        }

        // Bảng Tin tức Nông nghiệp (News)
        const createNewsTableCmd = `
        CREATE TABLE IF NOT EXISTS news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT,
            author_name VARCHAR(255) DEFAULT 'Admin',
            title VARCHAR(500) NOT NULL,
            thumbnail_url VARCHAR(1024),
            content LONGTEXT NOT NULL,
            is_published TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        `;
        await pool.query(createNewsTableCmd);

        // Bảng Giao thương (Marketplace Posts)
        const createMarketplaceCmd = `
        CREATE TABLE IF NOT EXISTS marketplace_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            post_type ENUM('sell', 'buy') NOT NULL,
            category VARCHAR(100),
            product_name VARCHAR(255) NOT NULL,
            quantity VARCHAR(100),
            location VARCHAR(255),
            description TEXT,
            image_url LONGTEXT,
            is_verified BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `;
        await pool.query(createMarketplaceCmd);

        // Bảng Tin nhắn (Messages)
        const createMessagesCmd = `
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `;
        await pool.query(createMessagesCmd);

        console.log('✅ Cơ sở dữ liệu MySQL và các bảng đã sẵn sàng (bao gồm giao thương & tin nhắn).');
    } catch (error) {
        console.error('❌ Lỗi khởi tạo CSDL MySQL:', error.message);
    }
}

initDB();

module.exports = {
    query: async (sql, params) => {
        if (!pool) throw new Error("Database connection pool is not initialized yet.");
        return pool.query(sql, params);
    }
};
