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

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    };

    const formatPrice = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return '--';
        return `${n.toLocaleString('vi-VN')}đ/kg`;
    };

    const getRoleLabel = (role) => {
        if (role === 'merchant') return 'Thương lái';
        if (role === 'admin') return 'Admin';
        return 'Nông dân';
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return tmp.textContent || tmp.innerText || '';
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'Không rõ ngày';
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getWindDirection = (degrees) => {
        const value = Number(degrees);
        if (!Number.isFinite(value)) return '--';
        const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
        return directions[Math.round(value / 45) % 8];
    };

    const getWeatherNote = ({ humidity, wind, rain, code }) => {
        if (Number(rain) > 0 || Number(code) >= 51) return 'Đang có mưa hoặc khả năng mưa tại khu vực này. Nên kiểm tra thoát nước, che chắn vật tư và cân nhắc lịch phơi sấy.';
        if (Number(humidity) >= 80) return 'Độ ẩm đang cao. Nên chú ý nấm bệnh, thông thoáng ruộng/vườn và theo dõi lá non.';
        if (Number(wind) >= 25) return 'Gió khá mạnh. Hạn chế phun thuốc, bón phân lá hoặc thao tác cần độ chính xác ngoài đồng.';
        return 'Điều kiện thời tiết hiện tại ổn định cho việc theo dõi canh tác và giao thương trong ngày.';
    };

    const getTrend = (series) => {
        if (!Array.isArray(series) || series.length < 2) return { label: 'Chưa đủ dữ liệu', value: 0 };
        const first = Number(series[0]);
        const last = Number(series[series.length - 1]);
        if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return { label: 'Chưa đủ dữ liệu', value: 0 };
        const change = ((last - first) / first) * 100;
        if (Math.abs(change) < 0.1) return { label: 'Đi ngang', value: change };
        return { label: `${change > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(change).toFixed(1)}%`, value: change };
    };

    const state = {
        weather: null,
        selectedLocation: 'Đồng Tháp',
        prices: {},
        selectedProductKey: null
    };

    const updatePriceSummary = (key) => {
        const summary = document.getElementById('dash-price-summary');
        const trendLabel = document.getElementById('dash-price-trend');
        const info = state.prices[key];
        if (!summary || !trendLabel || !info) return;

        const series = Array.isArray(info.data) ? info.data : [];
        const latest = series.length ? series[series.length - 1] : null;
        const trend = getTrend(series);
        summary.textContent = latest ? formatPrice(latest) : '--';
        trendLabel.textContent = `${info.label || key} · ${trend.label}`;
    };

    // 3. Setup Open-Meteo Weather API (SaaS Dashboard & Hero integration)
    const fetchWeather = async (lat, lon, locationName) => {
        const tempUI = document.getElementById('dash-temp');
        const descUI = document.getElementById('dash-weather-desc');
        const iconUI = document.getElementById('dash-weather-icon');
        const windUI = document.getElementById('dash-wind');
        const humidityUI = document.getElementById('dash-humidity');
        const feelsLikeUI = document.getElementById('dash-feels-like');
        const windDirUI = document.getElementById('dash-wind-dir');
        const rainUI = document.getElementById('dash-rain');
        const pressureUI = document.getElementById('dash-pressure');
        const noteUI = document.getElementById('dash-weather-note');
        const updatedUI = document.getElementById('dash-weather-updated');
        const heroUI = document.getElementById('hero-weather'); // From hero section
        
        try {
            state.selectedLocation = locationName;
            if(descUI) descUI.textContent = `Đang cập nhật...`;
            if(heroUI) heroUI.textContent = `Đang tải...`;

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto`);
            const data = await res.json();
            const current = data.current || {};
            const temp = current.temperature_2m;
            const apparentTemp = current.apparent_temperature;
            const wind = current.wind_speed_10m;
            const windDirection = current.wind_direction_10m;
            const humidity = current.relative_humidity_2m;
            const rain = Number(current.rain || current.precipitation || 0);
            const pressure = current.surface_pressure;
            const code = current.weather_code;
            
            // Map simple weather codes
            let status = "Trời nắng";
            let iconClass = "fa-sun";
            let iconColor = "var(--orange-500)";
            
            if(code >= 51) {
                status = "Có mưa rải rác";
                iconClass = "fa-cloud-rain";
                iconColor = "var(--blue-500)";
            } else if (code > 0) {
                status = "Nhiều mây";
                iconClass = "fa-cloud";
                iconColor = "var(--slate-400)";
            }

            // Update UI
            if(tempUI) tempUI.textContent = Math.round(temp);
            if(descUI) descUI.textContent = `${locationName} - ${status}`;
            if(windUI) windUI.textContent = `${Math.round(wind)} km/h`;
            if(humidityUI) humidityUI.textContent = `${Math.round(humidity)}%`;
            if(feelsLikeUI) feelsLikeUI.textContent = `${Math.round(apparentTemp)}°C`;
            if(windDirUI) windDirUI.textContent = getWindDirection(windDirection);
            if(rainUI) rainUI.textContent = `${rain.toFixed(1)} mm`;
            if(pressureUI) pressureUI.textContent = `${Math.round(pressure)} hPa`;
            if(iconUI) {
                iconUI.className = `fa-solid ${iconClass} weather-icon-large`;
                iconUI.style.color = iconColor;
            }

            if(heroUI) heroUI.textContent = `${Math.round(temp)}°C - ${status}`;
            state.weather = {
                temp: Math.round(temp),
                apparentTemp: Math.round(apparentTemp),
                wind: Math.round(wind),
                windDirection,
                humidity: Math.round(humidity),
                rain,
                pressure: Math.round(pressure),
                code
            };
            if(noteUI) noteUI.textContent = getWeatherNote(state.weather);
            if(updatedUI) {
                updatedUI.textContent = `Cập nhật: ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            }

        } catch(e) {
            console.error(e);
            if(descUI) descUI.textContent = "Mất kết nối máy chủ dữ liệu";
            if(noteUI) noteUI.textContent = "Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.";
            if(heroUI) heroUI.textContent = "Offline";
        }
    };

    // Initial Load
    if (document.getElementById('dash-temp') || document.getElementById('hero-weather')) {
        fetchWeather(10.45, 105.63, 'Đồng Tháp');
    }

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
        const productSelect = document.getElementById('dash-product');
        if (!productSelect && !ctx) return;

        try {
            const res = await fetch('/api/prices');
            productsData = await res.json();
            state.prices = productsData || {};
            
            // Build dynamic dropdown options based on backend response
            if (productSelect) {
                productSelect.innerHTML = '';
                for (const [key, info] of Object.entries(productsData)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = info.label || key;
                    productSelect.appendChild(option);
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
        const initialProduct = document.getElementById('dash-product')?.value || Object.keys(productsData)[0] || 'lua';
        const initialEntry = productsData[initialProduct]
            ? [initialProduct, productsData[initialProduct]]
            : Object.entries(productsData)[0];
        if (!initialEntry) return;
        const [initialKey, info] = initialEntry;
        if (!info) return;
        state.selectedProductKey = initialKey;
        updatePriceSummary(initialKey);

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
                        bodyFont: { size: 14, weight: 'bold' },
                        callbacks: {
                            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${formatPrice(tooltipItem.parsed.y)}`
                        }
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
                state.selectedProductKey = val;
                priceChart.data.labels = info.dates || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                priceChart.data.datasets[0].label = info.label;
                priceChart.data.datasets[0].data = info.data;
                priceChart.data.datasets[0].borderColor = info.color;
                priceChart.data.datasets[0].backgroundColor = info.bg;
                priceChart.data.datasets[0].pointBorderColor = info.color;
                priceChart.options.scales.y.min = info.min;
                priceChart.update();
                updatePriceSummary(val);
            }
        });
    }

    const loadMarketplaceOverview = async () => {
        const marketList = document.getElementById('dash-market-list');
        const marketTitle = document.getElementById('dash-market-title');
        const marketSummary = document.getElementById('dash-market-summary');
        if (!marketList) return;

        const user = getCurrentUser();
        const role = user?.role || 'farmer';
        const type = role === 'farmer' ? 'buy' : role === 'merchant' ? 'sell' : '';

        if (marketTitle) {
            marketTitle.textContent = role === 'farmer'
                ? 'Nhu cầu thu mua mới'
                : role === 'merchant'
                    ? 'Nguồn hàng mới'
                    : 'Tin giao thương mới';
        }

        try {
            const params = new URLSearchParams();
            if (type) params.set('type', type);
            const res = await fetch(`/api/marketplace${params.toString() ? `?${params.toString()}` : ''}`);
            const posts = await res.json();
            const visiblePosts = Array.isArray(posts) ? posts.slice(0, 4) : [];
            if (marketSummary) marketSummary.textContent = Array.isArray(posts) ? posts.length : 0;

            if (visiblePosts.length === 0) {
                marketList.innerHTML = `
                    <div class="market-item">
                        <div class="mi-avatar"><i class="fa-solid fa-inbox"></i></div>
                        <div class="mi-info">
                            <strong>Chưa có tin phù hợp</strong>
                            <span>Vào Giao thương để đăng tin mua/bán đầu tiên.</span>
                        </div>
                        <a class="btn btn-sm btn-outline-emerald" href="marketplace.html">Mở</a>
                    </div>
                `;
                return;
            }

            marketList.innerHTML = visiblePosts.map((post) => {
                const isBuy = post.post_type === 'buy';
                const initials = (post.display_name || post.product_name || 'AG').trim().slice(0, 2).toUpperCase();
                const owner = post.display_name || getRoleLabel(post.role);
                const actionLabel = isBuy ? 'Cần mua' : 'Cần bán';
                const meta = [post.quantity, post.location].filter(Boolean).join(' - ') || 'Thông tin đang cập nhật';

                return `
                    <div class="market-item">
                        <div class="mi-avatar">${escapeHtml(initials)}</div>
                        <div class="mi-info">
                            <strong>${escapeHtml(owner)}</strong>
                            <span>${escapeHtml(actionLabel)}: ${escapeHtml(post.product_name)}</span>
                            <small><i class="fa-solid fa-location-dot"></i> ${escapeHtml(meta)}</small>
                        </div>
                        <a class="btn btn-sm btn-outline-emerald" href="marketplace.html">Xem</a>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Lỗi tải tổng quan giao thương:', error);
            if (marketSummary) marketSummary.textContent = '--';
            marketList.innerHTML = `
                <div class="market-item">
                    <div class="mi-avatar"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="mi-info">
                        <strong>Không thể tải tin giao thương</strong>
                        <span>Vui lòng thử lại sau.</span>
                    </div>
                </div>
            `;
        }
    };

    const updateNotificationBadge = async () => {
        const notifyDot = document.getElementById('dash-notify-dot');
        const notificationBtn = document.getElementById('dash-notification-btn');
        const unreadSummary = document.getElementById('dash-unread-summary');
        if (!notifyDot && !notificationBtn) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/messages/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const unread = Number(data.unread_count) || 0;

            if (notifyDot) notifyDot.style.display = unread > 0 ? 'block' : 'none';
            if (unreadSummary) unreadSummary.textContent = unread > 99 ? '99+' : unread;
            if (notificationBtn) {
                notificationBtn.title = unread > 0 ? `${unread} tin nhắn chưa đọc` : 'Không có tin nhắn chưa đọc';
                notificationBtn.addEventListener('click', () => {
                    window.location.href = 'marketplace.html';
                }, { once: true });
            }
        } catch (error) {
            console.error('Lỗi tải số tin nhắn chưa đọc:', error);
        }
    };

    const loadNewsOverview = async () => {
        const newsList = document.getElementById('dash-news-list');
        if (!newsList) return;

        try {
            const res = await fetch('/api/news');
            const news = await res.json();
            const visibleNews = Array.isArray(news) ? news.slice(0, 3) : [];

            if (visibleNews.length === 0) {
                newsList.innerHTML = '<div class="overview-empty">Chưa có tin tức được xuất bản.</div>';
                return;
            }

            newsList.innerHTML = visibleNews.map((item) => {
                const thumb = item.thumbnail_url || 'https://images.unsplash.com/photo-1592982537447-6f2c6a0c5c1b?auto=format&fit=crop&w=160&q=80';
                const snippet = stripHtml(item.snippet || item.content || '');
                return `
                    <a class="overview-news-item" href="news-detail.html?id=${encodeURIComponent(item.id)}">
                        <div class="overview-news-thumb" style="background-image: url('${escapeHtml(thumb)}');"></div>
                        <div class="overview-news-content">
                            <strong>${escapeHtml(item.title)}</strong>
                            <span>${escapeHtml(formatShortDate(item.created_at))}${snippet ? ` · ${escapeHtml(snippet.slice(0, 52))}` : ''}</span>
                        </div>
                    </a>
                `;
            }).join('');
        } catch (error) {
            console.error('Lỗi tải tin tức tổng quan:', error);
            newsList.innerHTML = '<div class="overview-empty">Không thể tải tin tức. Vui lòng thử lại sau.</div>';
        }
    };

    loadMarketplaceOverview();
    updateNotificationBadge();
    loadNewsOverview();

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
