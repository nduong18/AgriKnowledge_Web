document.addEventListener('DOMContentLoaded', () => {
    const API_URL_PRICES = '/api/prices';
    const defaultAvatar = 'https://images.unsplash.com/photo-1599839619722-39751411ea63?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    if (user.role === 'admin') {
        document.body.classList.add('admin-theme');
        const nav = document.querySelector('.dash-nav');
        if (nav && !nav.querySelector('a[href="admin-products.html"]')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin-products.html';
            adminLink.innerHTML = '<i class="fa-solid fa-user-tie"></i> <span>Vào trang quản trị</span>';
            nav.appendChild(adminLink);
        }
    }

    const nameDisplay = document.getElementById('user-name-display');
    const roleDisplay = document.getElementById('user-role-display');
    const sidebarAvatar = document.getElementById('sidebar-avatar');

    if (nameDisplay) {
        nameDisplay.innerText = user.display_name || (user.email ? user.email.split('@')[0] : 'Người dùng');
    }

    if (sidebarAvatar) {
        sidebarAvatar.src = user.avatar || defaultAvatar;
    }

    if (roleDisplay) {
        if (user.role === 'admin') {
            roleDisplay.innerText = 'Quản trị viên';
            roleDisplay.className = 'badge';
            roleDisplay.style.background = 'var(--red-100)';
            roleDisplay.style.color = 'var(--red-700)';
        } else if (user.role === 'merchant') {
            roleDisplay.innerText = 'Thương lái';
            roleDisplay.className = 'badge';
            roleDisplay.style.background = 'var(--orange-100)';
            roleDisplay.style.color = 'var(--orange-500)';
        } else {
            roleDisplay.innerText = 'Nông dân';
            roleDisplay.className = 'badge badge-farmer';
            roleDisplay.removeAttribute('style');
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.querySelector('.dash-sidebar');
    if (sidebarToggleBtn && sidebar) {
        if (localStorage.getItem('sidebarState') === 'collapsed') {
            sidebar.classList.add('collapsed');
        }

        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
        });
    }

    const productSelect = document.getElementById('market-product-select');
    const productSearch = document.getElementById('market-product-search');
    const suggestionBox = document.getElementById('market-search-suggestions');
    const cardsContainer = document.getElementById('product-price-cards');
    const updatedLabel = document.getElementById('market-last-updated');
    const chartCanvas = document.getElementById('marketPriceChart');

    let pricesData = {};
    let marketChart = null;
    let highlightedIndex = -1;

    const formatPrice = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return '--';
        return `${n.toLocaleString('vi-VN')}đ/kg`;
    };

    const getTrend = (series) => {
        if (!Array.isArray(series) || series.length < 2) {
            return { type: 'flat', label: 'Không đủ dữ liệu' };
        }

        const first = Number(series[0]);
        const last = Number(series[series.length - 1]);
        if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) {
            return { type: 'flat', label: 'Không đủ dữ liệu' };
        }

        const deltaPct = ((last - first) / first) * 100;
        if (Math.abs(deltaPct) < 0.1) {
            return { type: 'flat', label: 'Đi ngang' };
        }

        if (deltaPct > 0) {
            return { type: 'up', label: `Tăng ${deltaPct.toFixed(1)}%` };
        }

        return { type: 'down', label: `Giảm ${Math.abs(deltaPct).toFixed(1)}%` };
    };

    const renderOverviewCards = (activeKey) => {
        if (!cardsContainer) return;

        cardsContainer.innerHTML = '';
        const entries = Object.entries(pricesData);

        if (entries.length === 0) {
            cardsContainer.innerHTML = '<div style="color: var(--slate-500);">Không có dữ liệu giá.</div>';
            return;
        }

        entries.forEach(([key, info]) => {
            const dataSeries = Array.isArray(info.data) ? info.data : [];
            const latest = dataSeries.length > 0 ? dataSeries[dataSeries.length - 1] : null;
            const trend = getTrend(dataSeries);

            const card = document.createElement('div');
            card.className = `product-price-card${activeKey === key ? ' active' : ''}`;
            card.setAttribute('data-key', key);

            card.innerHTML = `
                <div class="pp-head">
                    <div class="pp-name">${info.label || key}</div>
                    <div class="pp-trend ${trend.type}">${trend.label}</div>
                </div>
                <div class="pp-price">${formatPrice(latest)}</div>
            `;

            card.addEventListener('click', () => {
                if (productSelect) {
                    productSelect.value = key;
                }
                updateChart(key);
            });

            cardsContainer.appendChild(card);
        });
    };

    const hideSuggestions = () => {
        if (!suggestionBox) return;
        suggestionBox.style.display = 'none';
        suggestionBox.innerHTML = '';
        highlightedIndex = -1;
    };

    const chooseProduct = (key) => {
        const info = pricesData[key];
        if (!info) return;

        if (productSelect) {
            productSelect.value = key;
        }
        updateChart(key);

        if (productSearch) {
            productSearch.value = info.label || '';
        }

        hideSuggestions();
    };

    const renderSuggestions = (keyword) => {
        if (!suggestionBox) return;

        const normalized = (keyword || '').trim().toLowerCase();
        const entries = Object.entries(pricesData);

        if (entries.length === 0 || normalized.length === 0) {
            hideSuggestions();
            return;
        }

        const matches = entries
            .filter(([, info]) => (info.label || '').toLowerCase().includes(normalized))
            .slice(0, 8);

        if (matches.length === 0) {
            hideSuggestions();
            return;
        }

        suggestionBox.innerHTML = '';
        highlightedIndex = -1;

        matches.forEach(([key, info], index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'market-search-item';
            item.textContent = info.label || key;
            item.setAttribute('data-key', key);
            item.setAttribute('data-index', String(index));

            item.addEventListener('mouseenter', () => {
                highlightedIndex = index;
                Array.from(suggestionBox.querySelectorAll('.market-search-item')).forEach((el, i) => {
                    el.classList.toggle('active', i === highlightedIndex);
                });
            });

            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                chooseProduct(key);
            });

            suggestionBox.appendChild(item);
        });

        suggestionBox.style.display = 'block';
    };

    const createChart = (info) => {
        if (!chartCanvas || !info) return;

        Chart.defaults.font.family = "'Inter', sans-serif";

        marketChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: info.dates || [],
                datasets: [
                    {
                        label: info.label,
                        data: info.data || [],
                        borderColor: info.color || '#3b82f6',
                        backgroundColor: info.bg || 'rgba(59, 130, 246, 0.1)',
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: info.color || '#3b82f6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${formatPrice(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        min: Number.isFinite(Number(info.min)) ? info.min : undefined,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => `${Number(value).toLocaleString('vi-VN')}`
                        }
                    }
                }
            }
        });
    };

    const updateChart = (key) => {
        const info = pricesData[key];
        if (!info) return;

        if (!marketChart) {
            createChart(info);
            renderOverviewCards(key);
            return;
        }

        marketChart.data.labels = info.dates || [];
        marketChart.data.datasets[0].label = info.label;
        marketChart.data.datasets[0].data = info.data || [];
        marketChart.data.datasets[0].borderColor = info.color || '#3b82f6';
        marketChart.data.datasets[0].backgroundColor = info.bg || 'rgba(59, 130, 246, 0.1)';
        marketChart.data.datasets[0].pointBorderColor = info.color || '#3b82f6';
        marketChart.options.scales.y.min = Number.isFinite(Number(info.min)) ? info.min : undefined;
        marketChart.update();

        renderOverviewCards(key);
    };

    const loadPrices = async () => {
        try {
            const res = await fetch(API_URL_PRICES);
            const data = await res.json();
            pricesData = data || {};

            if (productSelect) {
                productSelect.innerHTML = '';
                Object.entries(pricesData).forEach(([key, info]) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = info.label || key;
                    productSelect.appendChild(option);
                });
            }

            const initialKey = Object.keys(pricesData)[0];
            if (initialKey) {
                updateChart(initialKey);
                if (productSearch) {
                    productSearch.value = pricesData[initialKey]?.label || '';
                }
            }

            if (updatedLabel) {
                updatedLabel.textContent = `Cập nhật lúc: ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            }
        } catch (error) {
            console.error('Lỗi tải dữ liệu giá:', error);
            if (cardsContainer) {
                cardsContainer.innerHTML = '<div style="color: var(--red-500);">Không thể tải dữ liệu giá. Vui lòng thử lại.</div>';
            }
            if (updatedLabel) {
                updatedLabel.textContent = 'Không thể cập nhật dữ liệu.';
                updatedLabel.style.color = 'var(--red-500)';
            }
        }
    };

    if (productSelect) {
        productSelect.addEventListener('change', (e) => {
            const selectedKey = e.target.value;
            chooseProduct(selectedKey);
        });
    }

    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            const keyword = e.target.value.trim().toLowerCase();
            if (!keyword) {
                hideSuggestions();
                return;
            }

            renderSuggestions(keyword);

            const exact = Object.entries(pricesData).find(([, info]) => {
                return (info.label || '').toLowerCase() === keyword;
            });

            if (exact) {
                chooseProduct(exact[0]);
            }
        });

        productSearch.addEventListener('change', (e) => {
            const keyword = e.target.value.trim().toLowerCase();
            if (!keyword) return;

            const exact = Object.entries(pricesData).find(([, info]) => {
                return (info.label || '').toLowerCase() === keyword;
            });

            if (!exact) return;

            const [key] = exact;
            chooseProduct(key);
        });

        productSearch.addEventListener('focus', () => {
            if (productSearch.value.trim()) {
                renderSuggestions(productSearch.value);
            }
        });

        productSearch.addEventListener('keydown', (e) => {
            if (!suggestionBox || suggestionBox.style.display !== 'block') return;

            const items = Array.from(suggestionBox.querySelectorAll('.market-search-item'));
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex + 1) % items.length;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const target = highlightedIndex >= 0 ? items[highlightedIndex] : items[0];
                const key = target.getAttribute('data-key');
                if (key) chooseProduct(key);
                return;
            } else if (e.key === 'Escape') {
                hideSuggestions();
                return;
            } else {
                return;
            }

            items.forEach((item, idx) => {
                item.classList.toggle('active', idx === highlightedIndex);
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (!productSearch || !suggestionBox) return;
        const target = e.target;
        if (target === productSearch || suggestionBox.contains(target)) return;
        hideSuggestions();
    });

    loadPrices();
});
