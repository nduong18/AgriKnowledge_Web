const mysql = require('mysql2/promise');
require('dotenv').config();

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
            role ENUM('farmer', 'admin') DEFAULT 'farmer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await pool.query(createUsersTableCmd);
        
        console.log('✅ Cơ sở dữ liệu MySQL và bảng users đã sẵn sàng.');
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
