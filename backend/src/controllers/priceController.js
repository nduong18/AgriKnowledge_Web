const priceService = require('../services/priceService');
const db = require('../config/db');

let cachedData = null;
let lastFetch = 0;

const getPrices = async (req, res) => {
    // Cache for 15 minutes to prevent spamming nhabeagri.com
    if (!cachedData || (Date.now() - lastFetch >= 15 * 60 * 1000)) {
        try {
            cachedData = await priceService.scrapePrices();
            lastFetch = Date.now();
        } catch (error) {
            console.error("Lỗi Controller getPrices:", error);
            if (!cachedData) return res.status(500).json({ error: "Lỗi server khi lấy dữ liệu giá" });
        }
    }

    // Always inject the latest UI metadata (colors, background, name) from the database into the cache
    try {
        const [rows] = await db.query('SELECT key_name, color, bg_color, name FROM products');
        for (const row of rows) {
            if (cachedData[row.key_name]) {
                cachedData[row.key_name].color = row.color || '#3b82f6';
                cachedData[row.key_name].bg = row.bg_color || 'rgba(59, 130, 246, 0.1)';
                cachedData[row.key_name].label = row.name;
            }
        }
    } catch (err) {
        console.error("Lỗi đồng bộ metadata màu sắc từ DB vào Cache:", err);
    }

    res.json(cachedData);
};

module.exports = {
    getPrices
};
