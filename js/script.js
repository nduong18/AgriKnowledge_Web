/**
 * Sổ tay Nông dân số - Core JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Date Update
    const dateSpan = document.getElementById('current-date');
    if(dateSpan) {
        const today = new Date();
        dateSpan.textContent = today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = "var(--shadow-md)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });

    // 3. Setup Open-Meteo Weather API (SaaS Dashboard & Hero integration)
    const fetchWeather = async (lat, lon, locationName) => {
        const tempUI = document.getElementById('dash-temp');
        const descUI = document.getElementById('dash-weather-desc');
        const iconUI = document.getElementById('dash-weather-icon');
        const windUI = document.getElementById('dash-wind');
        const heroUI = document.getElementById('hero-weather'); // From hero section
        
        try {
            if(descUI) descUI.textContent = `Đang cập nhật...`;
            if(heroUI) heroUI.textContent = `Đang tải...`;

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            const code = data.current_weather.weathercode;
            
            // Map simple weather codes
            let status = "Trời Nắng Trong";
            let iconClass = "fa-sun";
            let iconColor = "var(--orange-500)";
            
            if(code > 50) {
                status = "Có mưa rải rác";
                iconClass = "fa-cloud-rain";
                iconColor = "var(--blue-500)";
            } else if (code > 0) {
                status = "Nhiều Mây";
                iconClass = "fa-cloud";
                iconColor = "var(--slate-400)";
            }

            // Update UI
            if(tempUI) tempUI.textContent = temp;
            if(descUI) descUI.textContent = `${locationName} - ${status}`;
            if(windUI) windUI.textContent = `${wind} km/h`;
            if(iconUI) {
                iconUI.className = `fa-solid ${iconClass} weather-icon-large`;
                iconUI.style.color = iconColor;
            }

            if(heroUI) heroUI.textContent = `${temp}°C - ${status}`;

            // Update AI Feed conditionally
            updateAIFeed(locationName, temp, code);

        } catch(e) {
            console.error(e);
            if(descUI) descUI.textContent = "Mất kết nối máy chủ dữ liệu";
            if(heroUI) heroUI.textContent = "Offline";
        }
    };

    // Simulated AI Recommendation Engine Logic
    const updateAIFeed = (location, temp, weathercode) => {
        const feedContainer = document.getElementById('dash-ai-feed');
        if(!feedContainer) return;

        let html = '';
        if (weathercode > 50) {
            html = `
                <li class="feed-item warning">
                    <div class="feed-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="feed-content">
                        <strong>Cảnh báo Dịch Mốc sương (${location})</strong>
                        <p>Độ ẩm dư thừa liên tục do mưa. Khuyến nghị phun phòng ngừa xịt thuốc gốc Đồng hoặc Mancozeb.</p>
                    </div>
                </li>
            `;
        } else if (temp > 35) {
            html = `
                <li class="feed-item warning">
                    <div class="feed-icon"><i class="fa-solid fa-temperature-arrow-up text-red-500"></i></div>
                    <div class="feed-content">
                        <strong>Nắng Nóng Cục Bộ (${location})</strong>
                        <p>Nhiệt độ ${temp}°C cao bất thường. Đề nghị tăng lưu lượng tưới nhỏ giọt, phủ rơm giữ ẩm gốc.</p>
                    </div>
                </li>
            `;
        } else {
            html = `
                <li class="feed-item" style="border-color: var(--emerald-500)">
                    <div class="feed-icon text-emerald"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="feed-content">
                        <strong>Điều kiện tiêu chuẩn (${location})</strong>
                        <p>Thời tiết ôn hòa. Rất phù hợp để bón phân thúc đợt 2 cho vùng đất gò cao.</p>
                    </div>
                </li>
            `;
        }
        
        // Add static knowledge snippet
        html += `
            <li class="feed-item" style="border-color: var(--blue-500)">
                <div class="feed-icon text-blue"><i class="fa-solid fa-lightbulb"></i></div>
                <div class="feed-content">
                    <strong>Nghiệp vụ thị trường</strong>
                    <p>Khối lượng giao dịch qua sàn "Nông Dân Số" tuần qua tăng trưởng ổn định. Nên cân nhắc ký HĐ bao tiêu trước.</p>
                </div>
            </li>
        `;
        feedContainer.innerHTML = html;
    };

    // Initial Load
    fetchWeather(10.45, 105.63, 'Đồng Tháp');

    // Location Dropdown Bind
    const locationSelect = document.getElementById('dash-location');
    if(locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            const [lat, lon, name] = e.target.value.split(',');
            fetchWeather(lat, lon, name);
        });
    }

    // 4. Setup Chart.js with Mock SAAS Data
    let priceChart;
    const productsData = {
        'lua': { label: 'Giá Lúa IR50404 (VNĐ)', data: [7200, 7250, 7150, 7300, 7500, 7520, 7600], color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', min: 7000 },
        'caphe': { label: 'Cà phê Robusta (VNĐ)', data: [95000, 96000, 97500, 97000, 99000, 101000, 103000], color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', min: 90000 },
        'saurieng': { label: 'Sầu Riêng Ri6 (VNĐ)', data: [85000, 83000, 82000, 84000, 86000, 88000, 90000], color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', min: 75000 }
    };

    const ctx = document.getElementById('dashPriceChart');
    if (ctx) {
        Chart.defaults.font.family = "'Inter', sans-serif";
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: productsData['lua'].label,
                    data: productsData['lua'].data,
                    borderColor: productsData['lua'].color,
                    backgroundColor: productsData['lua'].bg,
                    borderWidth: 3,
                    pointBackgroundColor: 'white',
                    pointBorderColor: productsData['lua'].color,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    x: { grid: { display: false, drawBorder: false } },
                    y: { 
                        display: true, 
                        min: productsData['lua'].min,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { font: { size: 11 }, color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // Product dropddown Bind
    const productSelect = document.getElementById('dash-product');
    if(productSelect) {
        productSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const info = productsData[val];
            
            if(priceChart && info) {
                // Update specific product data
                priceChart.data.datasets[0].label = info.label;
                priceChart.data.datasets[0].data = info.data;
                priceChart.data.datasets[0].borderColor = info.color;
                priceChart.data.datasets[0].backgroundColor = info.bg;
                priceChart.data.datasets[0].pointBorderColor = info.color;
                priceChart.options.scales.y.min = info.min;
                priceChart.update();
                
                // Update market mockup data just for fun
                const marketList = document.getElementById('dash-market-list');
                if(marketList) {
                    marketList.innerHTML = `
                        <div class="market-item">
                            <div class="mi-avatar">DN</div>
                            <div class="mi-info">
                                <strong>Doanh nghiệp Tự Động</strong>
                                <span>Cần thu mua: 15 Tấn - ${info.label.split(' (')[0]}</span>
                                <small><i class="fa-solid fa-sack-dollar"></i> Giá hiện hành: ~${info.data[6]}đ/kg</small>
                            </div>
                            <button class="btn btn-sm btn-outline-emerald">Nhắn tin</button>
                        </div>
                    `;
                }
            }
        });
    }

    // 5. Intercept mockup buttons (excluding valid navigational links)
    document.querySelectorAll('.btn-outline, .btn-outline-emerald, .dash-nav a').forEach(b => {
        if(b.getAttribute('href') === '#' || !b.getAttribute('href')) {
            b.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Tính năng đang được phát triển. Yêu cầu kết nối Backend.');
            });
        }
    });

    // 6. Password Toggle Logic for Auth Pages
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Find the closest wrapper and then the input inside it
            const input = this.previousElementSibling;
            
            // Toggle the type attribute
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle the eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
});
