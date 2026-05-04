const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const { parsePrice } = require('../utils/priceParser');
const db = require('../config/db');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function scrapePrices() {
    const results = {};
    
    // Lấy danh sách URL Crawler từ DB thay vì Hardcode
    let urls = {};
    try {
        const [rows] = await db.query('SELECT * FROM products');
        for (const row of rows) {
            urls[row.key_name] = { 
                name: row.name, 
                url: row.url, 
                color: row.color, 
                bg: row.bg_color 
            };
        }
    } catch(err) {
        console.error("Lỗi lấy danh sách nông sản từ CSDL:", err);
        return {};
    }

    for (const [key, info] of Object.entries(urls)) {
        // Init default empty
        results[key] = {
            label: info.name,
            dates: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
            data: [0, 0, 0, 0, 0, 0, 0],
            color: info.color || '#3b82f6',
            bg: info.bg || 'rgba(59, 130, 246, 0.1)',
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

module.exports = { scrapePrices };
