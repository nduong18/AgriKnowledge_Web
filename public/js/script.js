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
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.style.boxShadow = "var(--shadow-md)";
            } else {
                navbar.style.boxShadow = "none";
            }
        });
    }

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

        } catch(e) {
            console.error(e);
            if(descUI) descUI.textContent = "Mất kết nối máy chủ dữ liệu";
            if(heroUI) heroUI.textContent = "Offline";
        }
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

    // 4. Setup Chart.js with API Data
    let priceChart;
    let productsData = {};

    const loadPriceData = async () => {
        try {
            const res = await fetch('/api/prices');
            productsData = await res.json();
            
            // Build dynamic dropdown options based on backend response
            const productSelect = document.getElementById('dash-product');
            if (productSelect) {
                productSelect.innerHTML = '';
                for (const [key, info] of Object.entries(productsData)) {
                    productSelect.innerHTML += `<option value="${key}">${info.label}</option>`;
                }
            }
            
            initChart();
        } catch (error) {
            console.error('Lỗi API giá:', error);
        }
    };

    const ctx = document.getElementById('dashPriceChart');
    const initChart = () => {
        if (!ctx) return;
        const initialProduct = document.getElementById('dash-product')?.value || 'lua';
        const info = productsData[initialProduct] || Object.values(productsData)[0];
        if (!info) return;

        Chart.defaults.font.family = "'Inter', sans-serif";
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: info.dates || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: info.label,
                    data: info.data,
                    borderColor: info.color,
                    backgroundColor: info.bg,
                    borderWidth: 3,
                    pointBackgroundColor: 'white',
                    pointBorderColor: info.color,
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
                        min: info.min,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { font: { size: 11 }, color: '#94a3b8' }
                    }
                }
            }
        });
    };

    // start fetching
    loadPriceData();

    // Product dropddown Bind
    const productSelect = document.getElementById('dash-product');
    if(productSelect) {
        productSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const info = productsData[val];
            
            if(priceChart && info) {
                // Update specific product data
                priceChart.data.labels = info.dates || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
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
        if((b.getAttribute('href') === '#' || !b.getAttribute('href')) && !b.hasAttribute('id') && !b.classList.contains('btn-chat')) {
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
