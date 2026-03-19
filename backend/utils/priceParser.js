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

module.exports = { parsePrice };
