const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const app = express();
app.use(cors());

const urls = {
    "caphe": { name: "Giá Cà Phê Arabica", url: "https://nhabeagri.com/gia-nong-san/gia-ca-phe-arabica/" },
    "cacao": { name: "Giá Ca Cao", url: "https://nhabeagri.com/gia-nong-san/gia-ca-cao/" },
    "lua": { name: "Giá Gạo Thô", url: "https://nhabeagri.com/gia-nong-san/gia-gao-tho/" },
    "ngo": { name: "Giá Ngô Mới Nhất", url: "https://nhabeagri.com/gia-nong-san/gia-ngo-moi-nhat/" },
    "daunanh": { name: "Giá Hạt Đậu Nành Thô", url: "https://nhabeagri.com/gia-hat-dau-nanh-tho/" },
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Hàm dọn dẹp giá: "100.000" -> 100000, "100,000" -> 100000, "95" -> 95000 (tùy định dạng)
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Remove space, VNĐ, commas, letters
    let cleaned = priceStr.replace(/[^\d.,]/g, "").replace(/,/g, ""); 
    // Usually nhabeagri uses . for thousands or , for thousands. Let's assume . or , are just thousand separators if no decimals.
    cleaned = cleaned.replace(/\./g, "");
    let val = parseInt(cleaned, 10);
    // If value is too small (e.g., 95 for 95000), adjust it (heuristic)
    if (val < 1000 && val > 0) val = val * 1000;
    return isNaN(val) ? 0 : val;
}

// Cache kết quả để API chạy nhanh
let cachedData = null;
let lastFetch = 0;

async function scrapePrices() {
    const results = {};
    const colors = {
        "lua": { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
        "caphe": { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
        "cacao": { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)" },
        "ngo": { color: "#eab308", bg: "rgba(234, 179, 8, 0.1)" },
        "daunanh": { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" },
        "saurieng": { color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" }
    };

    for (const [key, info] of Object.entries(urls)) {
        // Init default empty
        results[key] = {
            label: info.name,
            dates: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
            data: [0, 0, 0, 0, 0, 0, 0],
            color: colors[key].color,
            bg: colors[key].bg,
            min: 0,
            originalData: []
        };

        if (!info.url) {
            // Sầu riêng mockup (do ko có url crawling)
            results[key].data = [80000, 81000, 80500, 82000, 84000, 86000, 85000];
            results[key].min = 75000;
            continue;
        }

        try {
            console.log(`Đang tải dữ liệu ${info.name}...`);
            const response = await axios.get(info.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                httpsAgent, timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const table = $('table.gia-ca-phe').first();

            if (table.length > 0) {
                const rows = table.find('tbody tr').length > 0 ? table.find('tbody tr') : table.find('tr');
                let rawData = [];
                rows.each((i, row) => {
                    const cols = $(row).find('td');
                    if (cols.length >= 2) {
                        const dateText = $(cols[0]).text().trim();
                        const priceText = $(cols[1]).text().trim();
                        if (dateText && priceText && dateText.toLowerCase() !== 'ngày') {
                            rawData.push({ date: dateText, priceStr: priceText });
                        }
                    }
                });

                // Top row is usually newest. We need the latest 7 days.
                // It's possible rawData only has 5 rows.
                rawData = rawData.slice(0, 7).reverse(); // Oldest to newest for the chart

                if (rawData.length > 0) {
                    const parsedPrices = rawData.map(r => parsePrice(r.priceStr));
                    // Handle dates: short format like "19-03"
                    const parsedDates = rawData.map(r => r.date.substring(0, 5));

                    // Fill to exactly 7 items if needed to look good on chart 
                    // (if only 5 rows found, duplicate the first one)
                    while(parsedPrices.length < 7) {
                        parsedPrices.unshift(parsedPrices[0]);
                        parsedDates.unshift(parsedDates[0]);
                    }

                    results[key].dates = parsedDates;
                    results[key].data = parsedPrices;
                    const minPrice = Math.min(...parsedPrices);
                    results[key].min = Math.floor(minPrice * 0.95); // Y-axis min a bit lower
                    results[key].originalData = rawData;
                }
            }
        } catch (error) {
            console.error(`Lỗi tải ${info.name}:`, error.message);
        }
    }
    return results;
}

app.get('/api/prices', async (req, res) => {
    // Cache for 15 minutes to prevent spamming nhabeagri.com
    if (cachedData && (Date.now() - lastFetch < 15 * 60 * 1000)) {
        return res.json(cachedData);
    }

    const data = await scrapePrices();
    cachedData = data;
    lastFetch = Date.now();
    res.json(data);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend API đang chạy tại http://localhost:${PORT}`);
    console.log(`Dữ liệu giá có thể lấy bằng lệnh GET /api/prices`);
});
