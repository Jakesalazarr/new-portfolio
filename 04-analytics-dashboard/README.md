# Analytics Dashboard - Real-time Data Visualization

A modern, responsive analytics dashboard displaying real-time cryptocurrency market data with interactive charts and beautiful UI.

## Features

- **Real-time Data**: Live cryptocurrency market data from CoinGecko API
- **Interactive Charts**: Multiple chart types using Chart.js
- **Market Overview**: Global market stats (Market Cap, Volume, Dominance)
- **Top 10 Cryptos**: Detailed table with price trends
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works perfectly on all devices
- **Auto-refresh**: Updates every 5 minutes
- **Search Functionality**: Filter cryptocurrencies
- **Sparkline Trends**: 7-day mini charts for each crypto

## Tech Stack

- **HTML5/CSS3**: Modern, semantic markup
- **JavaScript (ES6+)**: Async/await, fetch API
- **Chart.js**: Data visualization library
- **CoinGecko API**: Free cryptocurrency data (no auth required)
- **CSS Grid & Flexbox**: Responsive layout
- **Custom Properties**: Theme switching

## API Integration

This dashboard uses the **CoinGecko API** (free tier):

### Endpoints Used:
- `/global` - Global market statistics
- `/coins/markets` - Top cryptocurrencies by market cap
- `/coins/{id}/market_chart` - Historical price data

### API Features:
- No authentication required
- Rate limit: 10-50 calls/minute (free tier)
- Real-time market data
- Historical price charts
- Sparkline data (7-day trends)

## Design Features

### Color Palette (Dark Theme)
- Background: `#0F172A` (Deep slate)
- Secondary: `#1E293B` (Slate)
- Accent: `#667eea` → `#764ba2` (Purple gradient)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)

### Charts
- **Line Charts**: Main price trends
- **Bar Charts**: Volume data
- **Doughnut Chart**: Market distribution
- **Sparklines**: 7-day micro trends

### UI Components
- Stat cards with mini charts
- Interactive data table
- Theme toggle button
- Refresh button with animation
- Mobile-responsive sidebar
- Search/filter functionality

## Running Locally

Simply open `index.html` in a modern browser:

```bash
# Or use a local HTTP server
npx http-server .
# Visit http://localhost:8080
```

**Note**: For best results, use a local server to avoid CORS issues with the API.

## Data Displayed

### Global Stats
- Total Market Capitalization
- 24h Trading Volume
- Bitcoin Dominance %
- Active Cryptocurrencies Count

### Per Cryptocurrency
- Current Price (USD)
- 24h Price Change %
- 7d Price Change %
- Market Cap
- 24h Volume
- 7-day Price Trend (Sparkline)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive

## Future Enhancements

- More data sources (stock market, weather, GitHub stats)
- Custom date range selection
- Export data to CSV/PDF
- Portfolio tracking
- Price alerts
- Multiple currency support
- WebSocket for real-time updates
- User preferences storage
- Historical data comparison
- Additional chart types (candlestick, etc.)

## Alternative APIs

You can easily swap CoinGecko with other APIs:

### OpenWeather API
```javascript
const weather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY`
);
```

### GitHub API
```javascript
const repos = await fetch(
    'https://api.github.com/users/USERNAME/repos'
);
```

### JSONPlaceholder (Mock Data)
```javascript
const data = await fetch(
    'https://jsonplaceholder.typicode.com/posts'
);
```

## Performance

- Lightweight: ~50KB total (excluding Chart.js CDN)
- Fast load time: < 1 second
- Smooth animations: 60fps
- Efficient API calls: Cached & throttled
- Auto-refresh: Every 5 minutes

## Part of Portfolio

This project demonstrates:
- API integration skills
- Data visualization expertise
- Responsive design
- State management
- Modern JavaScript
- Clean UI/UX design

---

**Built with ❤️ for the Portfolio Project**
