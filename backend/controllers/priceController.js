const priceService = require('../services/priceService');

let cachedData = null;
let lastFetch = 0;

const getPrices = async (req, res) => {
    // Cache for 15 minutes to prevent spamming nhabeagri.com
    if (cachedData && (Date.now() - lastFetch < 15 * 60 * 1000)) {
        return res.json(cachedData);
    }

    try {
        const data = await priceService.scrapePrices();
        cachedData = data;
        lastFetch = Date.now();
        res.json(data);
    } catch (error) {
        console.error("Lỗi Controller getPrices:", error);
        res.status(500).json({ error: "Lỗi server khi lấy dữ liệu giá" });
    }
};

module.exports = {
    getPrices
};
