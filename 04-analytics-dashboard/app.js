// ==========================================
// ANALYTICS DASHBOARD - CRYPTO MARKET DATA
// ==========================================

const API_BASE = 'https://api.coingecko.com/api/v3';
let charts = {};
let cryptoData = [];

// ==========================================
// INITIALIZATION
// ==========================================

let currentTab = 'dashboard';
let realtimeInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeCharts();
    fetchAllData();
    startAutoRefresh();
    setupTabNavigation();
    loadSettings();
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
// TAB NAVIGATION
// ==========================================

function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.querySelector('span').textContent.toLowerCase().replace('-', '');
            switchTab(tabName);

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    const mainContent = document.querySelector('.main-content');

    // Clear realtime interval when switching tabs
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }

    switch(tabName) {
        case 'dashboard':
            showDashboard(mainContent);
            break;
        case 'analytics':
            showAnalytics(mainContent);
            break;
        case 'realtime':
            showRealtime(mainContent);
            break;
        case 'settings':
            showSettings(mainContent);
            break;
    }
}

function showDashboard(container) {
    container.innerHTML = `
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <button class="menu-toggle" id="menuToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div>
                    <h1>Crypto Market Overview</h1>
                    <p class="subtitle">Real-time cryptocurrency market data</p>
                </div>
            </div>
            <div class="header-right">
                <button class="theme-toggle" id="themeToggle" title="Toggle theme">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="5" stroke-width="2"/>
                        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <button class="refresh-btn" id="refreshBtn" title="Refresh data">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 4v6h6M23 20v-6h-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </header>

        <!-- Stats Cards -->
        <section class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Market Cap</span>
                    <span class="stat-badge positive">+2.4%</span>
                </div>
                <div class="stat-value" id="marketCap">Loading...</div>
                <div class="stat-chart">
                    <canvas id="marketCapChart"></canvas>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">24h Volume</span>
                    <span class="stat-badge neutral">-0.8%</span>
                </div>
                <div class="stat-value" id="volume24h">Loading...</div>
                <div class="stat-chart">
                    <canvas id="volumeChart"></canvas>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Bitcoin Dominance</span>
                    <span class="stat-badge positive">+1.2%</span>
                </div>
                <div class="stat-value" id="btcDominance">Loading...</div>
                <div class="stat-chart">
                    <canvas id="dominanceChart"></canvas>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Active Cryptocurrencies</span>
                    <span class="stat-badge positive">+15</span>
                </div>
                <div class="stat-value" id="activeCryptos">Loading...</div>
                <div class="stat-info">Tracked markets</div>
            </div>
        </section>

        <!-- Main Charts -->
        <section class="charts-grid">
            <div class="chart-card large">
                <div class="chart-header">
                    <h2>Top Cryptocurrencies</h2>
                    <div class="chart-controls">
                        <button class="chart-btn active" data-range="7d">7D</button>
                        <button class="chart-btn" data-range="30d">30D</button>
                        <button class="chart-btn" data-range="90d">90D</button>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="mainChart"></canvas>
                </div>
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <h2>Market Distribution</h2>
                </div>
                <div class="chart-body">
                    <canvas id="pieChart"></canvas>
                </div>
            </div>
        </section>

        <!-- Crypto Table -->
        <section class="table-card">
            <div class="table-header">
                <h2>Top 10 Cryptocurrencies</h2>
                <div class="table-actions">
                    <input type="text" placeholder="Search..." class="search-input" id="searchInput">
                </div>
            </div>
            <div class="table-container">
                <table class="crypto-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>24h %</th>
                            <th>7d %</th>
                            <th>Market Cap</th>
                            <th>Volume (24h)</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody id="cryptoTableBody">
                        <tr>
                            <td colspan="8" class="loading-cell">Loading market data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    // Reinitialize after DOM update
    setupEventListeners();
    initializeCharts();
    fetchAllData();
}

function showAnalytics(container) {
    container.innerHTML = `
        <header class="header">
            <div class="header-left">
                <button class="menu-toggle" id="menuToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div>
                    <h1>Advanced Analytics</h1>
                    <p class="subtitle">Deep market insights and trends</p>
                </div>
            </div>
        </header>

        <section class="analytics-content">
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Market Trends</h3>
                    <div class="trend-analysis">
                        <div class="trend-item">
                            <span class="trend-label">Bull Market Probability</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 68%"></div>
                            </div>
                            <span class="trend-value">68%</span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">Market Sentiment</span>
                            <div class="progress-bar">
                                <div class="progress-fill positive" style="width: 72%"></div>
                            </div>
                            <span class="trend-value">Bullish</span>
                        </div>
                        <div class="trend-item">
                            <span class="trend-label">Volatility Index</span>
                            <div class="progress-bar">
                                <div class="progress-fill warning" style="width: 45%"></div>
                            </div>
                            <span class="trend-value">Medium</span>
                        </div>
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>Performance Metrics</h3>
                    <canvas id="performanceChart"></canvas>
                </div>

                <div class="analytics-card">
                    <h3>Correlation Matrix</h3>
                    <canvas id="correlationChart"></canvas>
                </div>

                <div class="analytics-card">
                    <h3>Volume Analysis</h3>
                    <canvas id="volumeAnalysisChart"></canvas>
                </div>
            </div>

            <div class="insights-panel">
                <h3>Key Insights</h3>
                <div class="insight-item">
                    <div class="insight-icon positive">↗</div>
                    <div class="insight-content">
                        <h4>Strong Upward Momentum</h4>
                        <p>Bitcoin has broken key resistance at $45,000 with increasing volume</p>
                    </div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon warning">⚡</div>
                    <div class="insight-content">
                        <h4>Increased Volatility Expected</h4>
                        <p>Options data suggests higher volatility in the next 7 days</p>
                    </div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon info">📊</div>
                    <div class="insight-content">
                        <h4>Altcoin Season Indicator</h4>
                        <p>Ethereum and major altcoins showing relative strength vs Bitcoin</p>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Initialize analytics charts
    setTimeout(initializeAnalyticsCharts, 100);
    setupEventListeners();
}

function showRealtime(container) {
    container.innerHTML = `
        <header class="header">
            <div class="header-left">
                <button class="menu-toggle" id="menuToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div>
                    <h1>Real-time Monitor</h1>
                    <p class="subtitle">Live cryptocurrency price updates</p>
                </div>
            </div>
            <div class="header-right">
                <div class="live-indicator">
                    <span class="pulse"></span>
                    <span>LIVE</span>
                </div>
            </div>
        </header>

        <section class="realtime-content">
            <div class="realtime-grid" id="realtimeGrid">
                <!-- Realtime cards will be inserted here -->
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <h2>Live Price Chart</h2>
                </div>
                <div class="chart-body">
                    <canvas id="realtimeChart"></canvas>
                </div>
            </div>

            <div class="order-book">
                <h3>Order Book</h3>
                <div class="order-book-content">
                    <div class="bids">
                        <h4>Bids</h4>
                        <div class="order-list" id="bidsList"></div>
                    </div>
                    <div class="asks">
                        <h4>Asks</h4>
                        <div class="order-list" id="asksList"></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    setupEventListeners();
    startRealtimeUpdates();
}

function showSettings(container) {
    container.innerHTML = `
        <header class="header">
            <div class="header-left">
                <button class="menu-toggle" id="menuToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div>
                    <h1>Settings</h1>
                    <p class="subtitle">Customize your dashboard experience</p>
                </div>
            </div>
        </header>

        <section class="settings-content">
            <div class="settings-section">
                <h3>Display Settings</h3>
                <div class="setting-item">
                    <label for="currency">Display Currency</label>
                    <select id="currency" class="setting-select">
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                        <option value="gbp">GBP (£)</option>
                        <option value="jpy">JPY (¥)</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="refresh-rate">Auto Refresh Rate</label>
                    <select id="refresh-rate" class="setting-select">
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="600">10 minutes</option>
                        <option value="0">Disabled</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="decimal-places">Decimal Places</label>
                    <input type="number" id="decimal-places" class="setting-input" min="0" max="8" value="2">
                </div>
            </div>

            <div class="settings-section">
                <h3>Notifications</h3>
                <div class="setting-item toggle">
                    <label for="price-alerts">Price Alerts</label>
                    <label class="switch">
                        <input type="checkbox" id="price-alerts">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item toggle">
                    <label for="volume-alerts">Volume Spike Alerts</label>
                    <label class="switch">
                        <input type="checkbox" id="volume-alerts">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item toggle">
                    <label for="news-updates">News Updates</label>
                    <label class="switch">
                        <input type="checkbox" id="news-updates" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <h3>Data Sources</h3>
                <div class="setting-item">
                    <label for="api-provider">API Provider</label>
                    <select id="api-provider" class="setting-select">
                        <option value="coingecko">CoinGecko</option>
                        <option value="coinmarketcap">CoinMarketCap</option>
                        <option value="binance">Binance</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="data-points">Historical Data Points</label>
                    <select id="data-points" class="setting-select">
                        <option value="24">24 hours</option>
                        <option value="168">7 days</option>
                        <option value="720">30 days</option>
                    </select>
                </div>
            </div>

            <div class="settings-actions">
                <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                <button class="btn btn-secondary" onclick="resetSettings()">Reset to Default</button>
            </div>
        </section>
    `;

    setupEventListeners();
    loadSettingsUI();
}

// Initialize Analytics Charts
function initializeAnalyticsCharts() {
    const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP'],
                datasets: [{
                    label: '24h Performance',
                    data: [5.2, 3.8, -1.2, 8.5, 2.1, -0.5],
                    backgroundColor: (context) => {
                        const value = context.parsed.y;
                        return value > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    const correlationCtx = document.getElementById('correlationChart')?.getContext('2d');
    if (correlationCtx) {
        new Chart(correlationCtx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Correlation',
                    data: [
                        {x: 1, y: 2, r: 15},
                        {x: 2, y: 3, r: 10},
                        {x: 3, y: 1, r: 20},
                        {x: 4, y: 4, r: 8}
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.5)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    const volumeAnalysisCtx = document.getElementById('volumeAnalysisChart')?.getContext('2d');
    if (volumeAnalysisCtx) {
        new Chart(volumeAnalysisCtx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Volume',
                    data: generateMockData(24, 100, 500),
                    borderColor: '#764ba2',
                    fill: true,
                    backgroundColor: 'rgba(118, 75, 162, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Realtime Updates
function startRealtimeUpdates() {
    const updateRealtimeData = () => {
        const grid = document.getElementById('realtimeGrid');
        if (!grid) return;

        const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP'];
        grid.innerHTML = cryptos.map(crypto => `
            <div class="realtime-card">
                <div class="realtime-header">
                    <h3>${crypto}/USD</h3>
                    <span class="realtime-change ${Math.random() > 0.5 ? 'positive' : 'negative'}">
                        ${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(2)}%
                    </span>
                </div>
                <div class="realtime-price">
                    $${(Math.random() * 50000 + 10000).toFixed(2)}
                </div>
                <div class="realtime-info">
                    <span>Vol: ${(Math.random() * 100).toFixed(2)}B</span>
                    <span>24h: ${(Math.random() * 10 - 5).toFixed(2)}%</span>
                </div>
            </div>
        `).join('');

        // Update order book
        updateOrderBook();
    };

    updateRealtimeData();
    realtimeInterval = setInterval(updateRealtimeData, 2000);

    // Initialize realtime chart
    const realtimeChartCtx = document.getElementById('realtimeChart')?.getContext('2d');
    if (realtimeChartCtx) {
        const realtimeChart = new Chart(realtimeChartCtx, {
            type: 'line',
            data: {
                labels: Array(50).fill(''),
                datasets: [{
                    label: 'BTC/USD',
                    data: generateMockData(50, 45000, 46000),
                    borderColor: '#667eea',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    x: { display: false },
                    y: {
                        position: 'right',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });

        // Update chart with new data
        setInterval(() => {
            if (currentTab !== 'realtime') return;

            realtimeChart.data.datasets[0].data.shift();
            realtimeChart.data.datasets[0].data.push(45000 + Math.random() * 1000);
            realtimeChart.update('none');
        }, 1000);
    }
}

function updateOrderBook() {
    const bids = document.getElementById('bidsList');
    const asks = document.getElementById('asksList');

    if (bids) {
        bids.innerHTML = Array(10).fill(0).map(() => `
            <div class="order-item bid">
                <span class="order-price">$${(45000 - Math.random() * 100).toFixed(2)}</span>
                <span class="order-amount">${(Math.random() * 10).toFixed(4)}</span>
            </div>
        `).join('');
    }

    if (asks) {
        asks.innerHTML = Array(10).fill(0).map(() => `
            <div class="order-item ask">
                <span class="order-price">$${(45100 + Math.random() * 100).toFixed(2)}</span>
                <span class="order-amount">${(Math.random() * 10).toFixed(4)}</span>
            </div>
        `).join('');
    }
}

// Settings Functions
function saveSettings() {
    const settings = {
        currency: document.getElementById('currency')?.value,
        refreshRate: document.getElementById('refresh-rate')?.value,
        decimalPlaces: document.getElementById('decimal-places')?.value,
        priceAlerts: document.getElementById('price-alerts')?.checked,
        volumeAlerts: document.getElementById('volume-alerts')?.checked,
        newsUpdates: document.getElementById('news-updates')?.checked,
        apiProvider: document.getElementById('api-provider')?.value,
        dataPoints: document.getElementById('data-points')?.value
    };

    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

function resetSettings() {
    localStorage.removeItem('dashboardSettings');
    loadSettingsUI();
    alert('Settings reset to default!');
}

function loadSettings() {
    const settings = localStorage.getItem('dashboardSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    return {};
}

function loadSettingsUI() {
    const settings = loadSettings();

    if (settings.currency) document.getElementById('currency').value = settings.currency;
    if (settings.refreshRate) document.getElementById('refresh-rate').value = settings.refreshRate;
    if (settings.decimalPlaces) document.getElementById('decimal-places').value = settings.decimalPlaces;
    if (settings.priceAlerts !== undefined) document.getElementById('price-alerts').checked = settings.priceAlerts;
    if (settings.volumeAlerts !== undefined) document.getElementById('volume-alerts').checked = settings.volumeAlerts;
    if (settings.newsUpdates !== undefined) document.getElementById('news-updates').checked = settings.newsUpdates;
    if (settings.apiProvider) document.getElementById('api-provider').value = settings.apiProvider;
    if (settings.dataPoints) document.getElementById('data-points').value = settings.dataPoints;
}

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%c📊 Analytics Dashboard', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cReal-time cryptocurrency data from CoinGecko API', 'font-size: 12px; color: #94a3b8;');
console.log('%cPart of Fullstack Developer Portfolio', 'font-size: 12px; color: #94a3b8;');
