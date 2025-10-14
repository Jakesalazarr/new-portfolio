// ==========================================
// ANALYTICS DASHBOARD - CRYPTO MARKET DATA
// ==========================================

const API_BASE = 'https://api.coingecko.com/api/v3';
let charts = {};
let cryptoData = [];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeCharts();
    fetchAllData();
    startAutoRefresh();
});

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        fetchAllData();
        animateRefresh();
    });

    // Menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);

    // Chart range buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateMainChart(e.target.dataset.range);
        });
    });

    // Search
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);

    // Update charts
    Object.values(charts).forEach(chart => {
        chart.options.scales?.y && (chart.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color'));
        chart.options.scales?.x && (chart.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color'));
        chart.update();
    });
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('open');
}

function animateRefresh() {
    const btn = document.getElementById('refreshBtn');
    btn?.classList.add('spinning');
    setTimeout(() => btn?.classList.remove('spinning'), 1000);
}

// ==========================================
// DATA FETCHING
// ==========================================

async function fetchAllData() {
    try {
        await Promise.all([
            fetchGlobalData(),
            fetchTopCryptos(),
            fetchMarketChart()
        ]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchGlobalData() {
    try {
        const response = await fetch(`${API_BASE}/global`);
        const data = await response.json();
        updateGlobalStats(data.data);
    } catch (error) {
        console.error('Error fetching global data:', error);
    }
}

async function fetchTopCryptos() {
    try {
        const response = await fetch(`${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h,7d`);
        cryptoData = await response.json();
        updateCryptoTable(cryptoData);
        updatePieChart(cryptoData);
    } catch (error) {
        console.error('Error fetching crypto data:', error);
    }
}

async function fetchMarketChart() {
    try {
        const response = await fetch(`${API_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=7`);
        const data = await response.json();
        updateMainChart('7d', data);
    } catch (error) {
        console.error('Error fetching market chart:', error);
    }
}

// ==========================================
// UPDATE FUNCTIONS
// ==========================================

function updateGlobalStats(data) {
    const marketCap = document.getElementById('marketCap');
    const volume24h = document.getElementById('volume24h');
    const btcDominance = document.getElementById('btcDominance');
    const activeCryptos = document.getElementById('activeCryptos');

    if (marketCap) marketCap.textContent = formatCurrency(data.total_market_cap.usd);
    if (volume24h) volume24h.textContent = formatCurrency(data.total_volume.usd);
    if (btcDominance) btcDominance.textContent = data.market_cap_percentage.btc.toFixed(1) + '%';
    if (activeCryptos) activeCryptos.textContent = data.active_cryptocurrencies.toLocaleString();

    // Update mini charts
    updateMiniCharts();
}

function updateCryptoTable(data) {
    const tbody = document.getElementById('cryptoTableBody');
    if (!tbody) return;

    tbody.innerHTML = data.map((crypto, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <div class="crypto-name">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                    <div class="crypto-info">
                        <strong>${crypto.name}</strong>
                        <span class="crypto-symbol">${crypto.symbol}</span>
                    </div>
                </div>
            </td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td class="price-change ${crypto.price_change_percentage_7d_in_currency >= 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_7d_in_currency >= 0 ? '+' : ''}${crypto.price_change_percentage_7d_in_currency.toFixed(2)}%
            </td>
            <td>$${formatNumber(crypto.market_cap)}</td>
            <td>$${formatNumber(crypto.total_volume)}</td>
            <td>
                <canvas class="trend-sparkline" data-sparkline='${JSON.stringify(crypto.sparkline_in_7d.price)}'></canvas>
            </td>
        </tr>
    `).join('');

    // Draw sparklines
    setTimeout(drawSparklines, 100);
}

function drawSparklines() {
    document.querySelectorAll('.trend-sparkline').forEach(canvas => {
        const data = JSON.parse(canvas.dataset.sparkline);
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 80;
        const height = canvas.height = 30;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = data[data.length - 1] >= data[0] ? '#10b981' : '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredData = cryptoData.filter(crypto =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query)
    );
    updateCryptoTable(filteredData);
}

// ==========================================
// CHARTS INITIALIZATION
// ==========================================

function initializeCharts() {
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        }
    };

    // Market Cap Mini Chart
    const marketCapCtx = document.getElementById('marketCapChart')?.getContext('2d');
    if (marketCapCtx) {
        charts.marketCap = new Chart(marketCapCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: generateMockData(30, 1000, 1200),
                    borderColor: '#667eea',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: { ...chartConfig, scales: { y: { display: false }, x: { display: false } } }
        });
    }

    // Volume Mini Chart
    const volumeCtx = document.getElementById('volumeChart')?.getContext('2d');
    if (volumeCtx) {
        charts.volume = new Chart(volumeCtx, {
            type: 'bar',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: generateMockData(30, 80, 120),
                    backgroundColor: '#764ba2',
                }]
            },
            options: { ...chartConfig, scales: { y: { display: false }, x: { display: false } } }
        });
    }

    // Dominance Mini Chart
    const dominanceCtx = document.getElementById('dominanceChart')?.getContext('2d');
    if (dominanceCtx) {
        charts.dominance = new Chart(dominanceCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: generateMockData(30, 40, 45),
                    borderColor: '#10b981',
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: { ...chartConfig, scales: { y: { display: false }, x: { display: false } } }
        });
    }

    // Main Chart
    const mainCtx = document.getElementById('mainChart')?.getContext('2d');
    if (mainCtx) {
        charts.main = new Chart(mainCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bitcoin',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...chartConfig,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', maxTicksLimit: 7 }
                    }
                }
            }
        });
    }

    // Pie Chart
    const pieCtx = document.getElementById('pieChart')?.getContext('2d');
    if (pieCtx) {
        charts.pie = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#4facfe',
                        '#43e97b', '#fa709a', '#fee140', '#30cfd0'
                    ]
                }]
            },
            options: {
                ...chartConfig,
                plugins: {
                    legend: { display: true, position: 'bottom' }
                }
            }
        });
    }
}

function updateMiniCharts() {
    if (charts.marketCap) {
        charts.marketCap.data.datasets[0].data = generateMockData(30, 1000, 1200);
        charts.marketCap.update();
    }
    if (charts.volume) {
        charts.volume.data.datasets[0].data = generateMockData(30, 80, 120);
        charts.volume.update();
    }
    if (charts.dominance) {
        charts.dominance.data.datasets[0].data = generateMockData(30, 40, 45);
        charts.dominance.update();
    }
}

function updateMainChart(range, data) {
    if (!charts.main) return;

    if (data && data.prices) {
        const prices = data.prices.slice(-168); // Last 7 days
        charts.main.data.labels = prices.map(p => new Date(p[0]).toLocaleDateString());
        charts.main.data.datasets[0].data = prices.map(p => p[1]);
        charts.main.update();
    }
}

function updatePieChart(data) {
    if (!charts.pie) return;

    const top5 = data.slice(0, 5);
    charts.pie.data.labels = top5.map(c => c.name);
    charts.pie.data.datasets[0].data = top5.map(c => c.market_cap);
    charts.pie.update();
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatCurrency(value) {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    return '$' + value.toLocaleString();
}

function formatNumber(value) {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toLocaleString();
}

function generateMockData(count, min, max) {
    return Array.from({ length: count }, () =>
        Math.random() * (max - min) + min
    );
}

function startAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(fetchAllData, 5 * 60 * 1000);
}

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%c📊 Analytics Dashboard', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cReal-time cryptocurrency data from CoinGecko API', 'font-size: 12px; color: #94a3b8;');
console.log('%cPart of Fullstack Developer Portfolio', 'font-size: 12px; color: #94a3b8;');
