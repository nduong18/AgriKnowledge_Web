const provincesData = [
    { name: "Hà Nội", slug: "ha-noi", lat: 21.0285, lon: 105.8542 },
    { name: "Hà Giang", slug: "ha-giang", lat: 22.8233, lon: 104.9836 },
    { name: "Cao Bằng", slug: "cao-bang", lat: 22.6667, lon: 106.2500 },
    { name: "Bắc Kạn", slug: "bac-kan", lat: 22.1333, lon: 105.8333 },
    { name: "Tuyên Quang", slug: "tuyen-quang", lat: 21.8167, lon: 105.2167 },
    { name: "Lào Cai", slug: "lao-cai", lat: 22.4833, lon: 103.9667 },
    { name: "Điện Biên", slug: "dien-bien", lat: 21.3833, lon: 103.0167 },
    { name: "Lai Châu", slug: "lai-chau", lat: 22.4000, lon: 103.2500 },
    { name: "Sơn La", slug: "son-la", lat: 21.3333, lon: 103.9000 },
    { name: "Yên Bái", slug: "yen-bai", lat: 21.7167, lon: 104.8667 },
    { name: "Hòa Bình", slug: "hoa-binh", lat: 20.8167, lon: 105.3333 },
    { name: "Thái Nguyên", slug: "thai-nguyen", lat: 21.6000, lon: 105.8500 },
    { name: "Lạng Sơn", slug: "lang-son", lat: 21.8333, lon: 106.7500 },
    { name: "Quảng Ninh", slug: "quang-ninh", lat: 20.9500, lon: 107.0833 },
    { name: "Bắc Giang", slug: "bac-giang", lat: 21.2667, lon: 106.2000 },
    { name: "Phú Thọ", slug: "phu-tho", lat: 21.3167, lon: 105.2167 },
    { name: "Vĩnh Phúc", slug: "vinh-phuc", lat: 21.3167, lon: 105.6000 },
    { name: "Bắc Ninh", slug: "bac-ninh", lat: 21.1833, lon: 106.0667 },
    { name: "Hải Dương", slug: "hai-duong", lat: 20.9333, lon: 106.3167 },
    { name: "Hải Phòng", slug: "hai-phong", lat: 20.8000, lon: 106.6667 },
    { name: "Hưng Yên", slug: "hung-yen", lat: 20.6500, lon: 106.0500 },
    { name: "Thái Bình", slug: "thai-binh", lat: 20.4500, lon: 106.3333 },
    { name: "Hà Nam", slug: "ha-nam", lat: 20.5333, lon: 105.9167 },
    { name: "Nam Định", slug: "nam-dinh", lat: 20.4333, lon: 106.1667 },
    { name: "Ninh Bình", slug: "ninh-binh", lat: 20.2500, lon: 105.9833 },
    { name: "Thanh Hóa", slug: "thanh-hoa", lat: 19.8000, lon: 105.7667 },
    { name: "Nghệ An", slug: "nghe-an", lat: 18.6667, lon: 105.6667 },
    { name: "Hà Tĩnh", slug: "ha-tinh", lat: 18.3333, lon: 105.9000 },
    { name: "Quảng Bình", slug: "quang-binh", lat: 17.4833, lon: 106.6000 },
    { name: "Quảng Trị", slug: "quang-tri", lat: 16.7500, lon: 107.2000 },
    { name: "Thừa Thiên Huế", slug: "hue", lat: 16.4667, lon: 107.6000 },
    { name: "Đà Nẵng", slug: "da-nang", lat: 16.0667, lon: 108.2333 },
    { name: "Quảng Nam", slug: "quang-nam", lat: 15.5833, lon: 108.0000 },
    { name: "Quảng Ngãi", slug: "quang-ngai", lat: 15.1167, lon: 108.8000 },
    { name: "Bình Định", slug: "binh-dinh", lat: 13.9167, lon: 109.0500 },
    { name: "Phú Yên", slug: "phu-yen", lat: 13.0833, lon: 109.3000 },
    { name: "Khánh Hòa", slug: "khanh-hoa", lat: 12.2500, lon: 109.1833 },
    { name: "Ninh Thuận", slug: "ninh-thuan", lat: 11.5833, lon: 108.9833 },
    { name: "Bình Thuận", slug: "binh-thuan", lat: 10.9333, lon: 108.1000 },
    { name: "Kon Tum", slug: "kon-tum", lat: 14.3500, lon: 108.0000 },
    { name: "Gia Lai", slug: "gia-lai", lat: 13.9833, lon: 108.0000 },
    { name: "Đắk Lắk", slug: "dak-lak", lat: 12.6667, lon: 108.0500 },
    { name: "Đắk Nông", slug: "dak-nong", lat: 12.0000, lon: 107.6667 },
    { name: "Lâm Đồng", slug: "lam-dong", lat: 11.9500, lon: 108.4333 },
    { name: "Bình Phước", slug: "binh-phuoc", lat: 11.7500, lon: 106.9167 },
    { name: "Tây Ninh", slug: "tay-ninh", lat: 11.3000, lon: 106.1000 },
    { name: "Bình Dương", slug: "binh-duong", lat: 11.0000, lon: 106.6500 },
    { name: "Đồng Nai", slug: "dong-nai", lat: 10.9500, lon: 106.8167 },
    { name: "Bà Rịa - Vũng Tàu", slug: "ba-ria-vung-tau", lat: 10.5000, lon: 107.1667 },
    { name: "Hồ Chí Minh", slug: "ho-chi-minh", lat: 10.8231, lon: 106.6297 },
    { name: "Long An", slug: "long-an", lat: 10.5333, lon: 106.4000 },
    { name: "Tiền Giang", slug: "tien-giang", lat: 10.4167, lon: 106.3333 },
    { name: "Bến Tre", slug: "ben-tre", lat: 10.2333, lon: 106.3667 },
    { name: "Trà Vinh", slug: "tra-vinh", lat: 9.8167, lon: 106.3000 },
    { name: "Vĩnh Long", slug: "vinh-long", lat: 10.2500, lon: 105.9667 },
    { name: "Đồng Tháp", slug: "dong-thap", lat: 10.5000, lon: 105.6833 },
    { name: "An Giang", slug: "an-giang", lat: 10.5000, lon: 105.1667 },
    { name: "Kiên Giang", slug: "kien-giang", lat: 10.0167, lon: 105.0833 },
    { name: "Cần Thơ", slug: "can-tho", lat: 10.0333, lon: 105.7833 },
    { name: "Hậu Giang", slug: "hau-giang", lat: 9.7833, lon: 105.4667 },
    { name: "Sóc Trăng", slug: "soc-trang", lat: 9.6000, lon: 105.9667 },
    { name: "Bạc Liêu", slug: "bac-lieu", lat: 9.2833, lon: 105.7167 },
    { name: "Cà Mau", slug: "ca-mau", lat: 9.1833, lon: 105.1500 }
];

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById("provinceSelect");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Populate Dropdown
    provincesData.forEach((p, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = p.name;
        select.appendChild(option);
    });

    const getWeatherIcon = (code) => {
        if (code === 0) return { icon: "fa-sun", color: "var(--orange-500)", text: "Trời Nắng Khô ráo" };
        if (code >= 1 && code <= 3) return { icon: "fa-cloud-sun", color: "var(--slate-400)", text: "Nhiều Mây" };
        if (code >= 45 && code <= 48) return { icon: "fa-smog", color: "var(--slate-400)", text: "Sương Mù" };
        if (code >= 51 && code <= 67) return { icon: "fa-cloud-rain", color: "var(--blue-500)", text: "Mưa Nhỏ" };
        if (code >= 71 && code <= 77) return { icon: "fa-snowflake", color: "var(--blue-300)", text: "Lạnh Giá" };
        if (code >= 80 && code <= 82) return { icon: "fa-cloud-showers-heavy", color: "var(--blue-600)", text: "Mưa Rào" };
        if (code >= 95) return { icon: "fa-cloud-bolt", color: "var(--purple-500)", text: "Có Giông Bão" };
        return { icon: "fa-cloud", color: "var(--slate-400)", text: "Có Mây" };
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    const fetchWeatherData = async (index) => {
        const province = provincesData[index];
        select.value = index;
        
        // Cập nhật Hash
        const newHash = "#" + province.slug;
        if (location.hash !== newHash) {
            history.replaceState(null, "", newHash);
        }
        document.title = "Thời tiết " + province.name + " - Sổ tay Nông dân số";

        const container = document.getElementById('native-weather-container');
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; color: var(--slate-500);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--emerald-500); margin-bottom: 16px;"></i>
                <p>Đang tải dữ liệu vi khí hậu khu vực <strong>${province.name}</strong>...</p>
            </div>
        `;

        try {
            // Gọi Open-Meteo API
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${province.lat}&longitude=${province.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok`;
            const response = await fetch(url);
            const data = await response.json();

            // Phân tích dữ liệu hiện tại
            const current = data.current_weather;
            const currentUI = getWeatherIcon(current.weathercode);
            
            // Xây dựng UI
            let html = `
                <div class="current-weather-hero">
                    <div class="hero-left">
                        <h2><i class="fa-solid fa-location-dot text-emerald" style="margin-right:8px;"></i> ${province.name}</h2>
                        <span class="cw-date">Dữ liệu ghi nhận tự động lúc ${new Date(current.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                        <div class="temp-display">
                            <i class="fa-solid ${currentUI.icon}" style="color: ${currentUI.color};"></i>
                            <span class="temp-value">${Math.round(current.temperature)}<small>°C</small></span>
                        </div>
                        <p class="weather-text" style="color: ${currentUI.color}; font-weight: 600; font-size: 1.25rem;">${currentUI.text}</p>
                    </div>
                    <div class="hero-right">
                        <div class="stat-box">
                            <div class="sb-icon bg-blue-light text-blue" style="background: var(--blue-50);"><i class="fa-solid fa-wind"></i></div>
                            <div>
                                <small>Sức gió</small>
                                <strong>${current.windspeed} km/h</strong>
                            </div>
                        </div>
                        <div class="stat-box">
                            <div class="sb-icon bg-emerald-light text-emerald" style="background: var(--emerald-50);"><i class="fa-solid fa-compass"></i></div>
                            <div>
                                <small>Hướng gió</small>
                                <strong>${current.winddirection}°</strong>
                            </div>
                        </div>
                        <div class="stat-box">
                            <div class="sb-icon bg-purple-light text-purple" style="background: var(--purple-50); color: var(--purple-500);"><i class="fa-solid fa-leaf"></i></div>
                            <div>
                                <small>Khuyến nghị</small>
                                <strong style="font-size:0.85rem; line-height: 1.2;">Theo dõi mùa vụ</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3 class="section-title"><i class="fa-solid fa-calendar-days text-emerald"></i> Dự báo 7 ngày tới</h3>
                <div class="forecast-grid">
            `;

            // Lặp 7 ngày
            const daily = data.daily;
            for(let i = 0; i < daily.time.length; i++) {
                const dayUI = getWeatherIcon(daily.weathercode[i]);
                const isToday = i === 0;
                
                html += `
                    <div class="forecast-card ${isToday ? 'today' : ''}">
                        <div class="fc-day">${isToday ? 'Hôm nay' : getDayName(daily.time[i])}</div>
                        <div class="fc-date">${formatDate(daily.time[i])}</div>
                        <i class="fa-solid ${dayUI.icon} fc-icon" style="color: ${dayUI.color};"></i>
                        <div class="fc-temps">
                            <div class="fc-max" title="Cao nhất"><i class="fa-solid fa-arrow-up text-orange" style="font-size:0.75rem; margin-right:4px;"></i>${Math.round(daily.temperature_2m_max[i])}°</div>
                            <div class="fc-min" title="Thấp nhất"><i class="fa-solid fa-arrow-down text-blue" style="font-size:0.75rem; margin-right:4px;"></i>${Math.round(daily.temperature_2m_min[i])}°</div>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;

        } catch (error) {
            console.error(error);
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: var(--red-500);">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; margin-bottom: 16px;"></i>
                    <p>Mất kết nối dữ liệu khí tượng mạng lưới Open-Meteo.</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="location.reload()">Thử lại</button>
                </div>
            `;
        }
    };

    function getInitialIndex() {
        const hash = decodeURIComponent(location.hash.replace("#", "").trim());
        if (!hash) return 0;
        const idx = provincesData.findIndex(p => p.slug === hash);
        return idx >= 0 ? idx : 0;
    }

    select.addEventListener("change", () => {
        fetchWeatherData(Number(select.value));
    });

    if(prevBtn) {
        prevBtn.addEventListener("click", () => {
            let i = Number(select.value) - 1;
            if (i < 0) i = provincesData.length - 1;
            fetchWeatherData(i);
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener("click", () => {
            let i = Number(select.value) + 1;
            if (i >= provincesData.length) i = 0;
            fetchWeatherData(i);
        });
    }

    window.addEventListener("hashchange", () => {
        fetchWeatherData(getInitialIndex());
    });

    // Initial Fetch
    fetchWeatherData(getInitialIndex());
});
