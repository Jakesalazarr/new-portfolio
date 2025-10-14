'use client'

import { useState, useEffect } from 'react'

interface CryptoData {
  name: string
  symbol: string
  price: number
  change24h: number
  volume: string
  marketCap: string
  chart: number[]
  logo: string
}

interface Transaction {
  type: 'buy' | 'sell'
  crypto: string
  amount: string
  price: string
  time: string
}

export default function Dashboard() {
  const [time, setTime] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const cryptoData: CryptoData[] = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 67234.56,
      change24h: 5.24,
      volume: '$28.5B',
      marketCap: '$1.31T',
      chart: [45, 52, 48, 65, 72, 68, 80, 75, 82, 78, 85, 88],
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3542.18,
      change24h: 3.67,
      volume: '$15.2B',
      marketCap: '$425.8B',
      chart: [38, 42, 45, 48, 52, 55, 58, 56, 60, 62, 65, 68],
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    },
    {
      name: 'Cardano',
      symbol: 'ADA',
      price: 0.5834,
      change24h: -2.15,
      volume: '$892M',
      marketCap: '$20.5B',
      chart: [65, 62, 58, 55, 52, 48, 45, 42, 40, 38, 35, 32],
      logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      price: 145.67,
      change24h: 8.92,
      volume: '$3.2B',
      marketCap: '$67.3B',
      chart: [35, 42, 48, 55, 62, 68, 75, 78, 82, 85, 88, 92],
      logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
    }
  ]

  const recentTransactions: Transaction[] = [
    { type: 'buy', crypto: 'BTC', amount: '0.0543', price: '$3,650.32', time: '2 min ago' },
    { type: 'sell', crypto: 'ETH', amount: '2.4500', price: '$8,678.24', time: '5 min ago' },
    { type: 'buy', crypto: 'SOL', amount: '15.0000', price: '$2,185.05', time: '12 min ago' },
    { type: 'buy', crypto: 'BTC', amount: '0.1250', price: '$8,404.32', time: '18 min ago' },
    { type: 'sell', crypto: 'ADA', amount: '1200.00', price: '$700.08', time: '24 min ago' }
  ]

  const portfolioData = [
    { asset: 'Bitcoin', amount: '1.2453', value: '$83,712.54', allocation: 45 },
    { asset: 'Ethereum', amount: '12.876', value: '$45,621.09', allocation: 25 },
    { asset: 'Solana', amount: '156.42', value: '$22,785.43', allocation: 12 },
    { asset: 'Cardano', amount: '8543.2', value: '$4,985.17', allocation: 18 }
  ]

  const btcPriceHistory = [62000, 63500, 62800, 64200, 65800, 64500, 66200, 67800, 66500, 68200, 67500, 67234]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '80px',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CryptoTrade
            </h2>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--foreground)',
            cursor: 'pointer',
            padding: '0.5rem',
            opacity: 0.7
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '💰', label: 'Portfolio', active: false },
            { icon: '📈', label: 'Markets', active: false },
            { icon: '🔄', label: 'Trade', active: false },
            { icon: '📜', label: 'History', active: false },
            { icon: '⚙️', label: 'Settings', active: false }
          ].map((item, index) => (
            <button key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem',
              background: item.active ? '#3b82f620' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--foreground)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => !item.active && (e.currentTarget.style.background = '#ffffff10')}
            onMouseLeave={(e) => !item.active && (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <a href="../index.html" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'var(--foreground)',
            opacity: 0.6,
            fontSize: '0.875rem',
            padding: '0.75rem',
            justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M15 10H5M5 10L10 5M5 10L10 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && <span>Back to Portfolio</span>}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <header style={{
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border)',
          padding: '1.25rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>Dashboard</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Welcome back! Here's your crypto overview</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontFamily: 'var(--font-geist-mono)',
                opacity: 0.7,
                background: 'var(--background)',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}>
                {time.toLocaleTimeString()}
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                JD
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Portfolio Value', value: '$186,428.67', change: '+12.5%', icon: '💼', color: '#3b82f6' },
              { label: 'Total Profit', value: '+$48,234.23', change: '+24.8%', icon: '📈', color: '#10b981' },
              { label: '24h Volume', value: '$2.4M', change: '+8.3%', icon: '🔄', color: '#8b5cf6' },
              { label: 'Active Trades', value: '12', change: '+3', icon: '⚡', color: '#f59e0b' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 24px ${stat.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#10b981',
                    background: '#10b98120',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem' }}>{stat.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Bitcoin Price Chart */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
              gridColumn: 'span 2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>Bitcoin (BTC/USD)</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>$67,234.56</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>+5.24%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['1H', '24H', '7D', '1M', '1Y', 'ALL'].map((period, i) => (
                    <button key={i} style={{
                      padding: '0.5rem 1rem',
                      background: i === 1 ? '#3b82f620' : 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--foreground)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: i === 1 ? '600' : '400'
                    }}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '180px' }}>
                {btcPriceHistory.map((price, index) => {
                  const normalized = ((price - 62000) / (68500 - 62000)) * 100
                  return (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '100%',
                        height: `${normalized}%`,
                        background: `linear-gradient(to top, #3b82f6, #60a5fa)`,
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                        e.currentTarget.style.transform = 'scaleY(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.transform = 'scaleY(1)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-28px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          color: 'var(--foreground)',
                          opacity: 0.5,
                          whiteSpace: 'nowrap'
                        }}>
                          ${(price / 1000).toFixed(1)}k
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Crypto Markets Table */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Crypto Markets</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cryptoData.map((crypto, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: '8px',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#ffffff15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        overflow: 'hidden'
                      }}>
                        <img src={crypto.logo} alt={crypto.name} style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{crypto.name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{crypto.symbol}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', height: '30px', width: '80px' }}>
                      {crypto.chart.map((val, i) => (
                        <div key={i} style={{
                          flex: 1,
                          height: `${val}%`,
                          background: crypto.change24h > 0 ? '#10b981' : '#ef4444',
                          opacity: 0.6,
                          borderRadius: '2px'
                        }} />
                      ))}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>${crypto.price.toLocaleString()}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: crypto.change24h > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {crypto.change24h > 0 ? '+' : ''}{crypto.change24h}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Allocation */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Portfolio Allocation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {portfolioData.map((item, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.asset}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6' }}>{item.allocation}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.5rem' }}>
                      <span>{item.amount}</span>
                      <span>{item.value}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--background)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${item.allocation}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Transactions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTransactions.map((tx, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: 'var(--background)',
                  borderRadius: '8px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: tx.type === 'buy' ? '#10b98120' : '#ef444420',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      {tx.type === 'buy' ? '📈' : '📉'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.crypto}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{tx.amount} {tx.crypto}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{tx.price}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '2rem',
          padding: '2rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          color: 'var(--foreground)',
          opacity: 0.5,
          fontSize: '0.875rem'
        }}>
          <p>2025 CryptoTrade Analytics. Built with Next.js 15 + React 19. Part of Senior Fullstack Developer Portfolio.</p>
        </footer>
      </main>
    </div>
  )
}
