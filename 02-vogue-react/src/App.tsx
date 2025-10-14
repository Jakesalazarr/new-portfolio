import { useState, useEffect } from 'react'
import './App.css'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  badge?: string
  image: string
  filter: string[]
  quantity?: number
}

interface Category {
  name: string
  description: string
  image: string
}

function App() {
  const [currentFilter, setCurrentFilter] = useState('all')
  const [cart, setCart] = useState<Product[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const categories: Category[] = [
    {
      name: 'Women',
      description: 'Elegant & Modern',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop'
    },
    {
      name: 'Men',
      description: 'Classic & Refined',
      image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=500&fit=crop'
    },
    {
      name: 'Accessories',
      description: 'Complete Your Look',
      image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=400&h=500&fit=crop'
    },
    {
      name: 'Footwear',
      description: 'Step in Style',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop'
    }
  ]

  const products: Product[] = [
    {
      id: 1,
      name: 'Silk Evening Dress',
      category: 'Women',
      price: 189,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular']
    },
    {
      id: 2,
      name: 'Tailored Blazer',
      category: 'Men',
      price: 249,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    },
    {
      id: 3,
      name: 'Cashmere Sweater',
      category: 'Women',
      price: 159,
      rating: 4,
      badge: 'sale',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 4,
      name: 'Leather Handbag',
      category: 'Accessories',
      price: 299,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular']
    },
    {
      id: 5,
      name: 'Classic Trench Coat',
      category: 'Women',
      price: 329,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop',
      filter: ['all', 'new']
    },
    {
      id: 6,
      name: 'Oxford Dress Shoes',
      category: 'Footwear',
      price: 199,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    },
    {
      id: 7,
      name: 'Designer Sunglasses',
      category: 'Accessories',
      price: 229,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop',
      filter: ['all', 'new']
    },
    {
      id: 8,
      name: 'Linen Summer Dress',
      category: 'Women',
      price: 139,
      rating: 4,
      badge: 'sale',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 9,
      name: 'Slim Fit Jeans',
      category: 'Men',
      price: 119,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    },
    {
      id: 10,
      name: 'Ankle Boots',
      category: 'Footwear',
      price: 179,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular']
    },
    {
      id: 11,
      name: 'Wool Scarf',
      category: 'Accessories',
      price: 79,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 12,
      name: 'Formal Shirt',
      category: 'Men',
      price: 89,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    }
  ]

  const filters = ['all', 'new', 'sale', 'popular']

  const filteredProducts = products.filter(product =>
    product.filter.includes(currentFilter)
  )

  useEffect(() => {
    const savedCart = localStorage.getItem('vogueCart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('vogueCart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (product: Product, change: number) => {
    const newQuantity = (product.quantity || 1) + change
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== product.id))
    } else {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const cartItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-content">
          <a href="https://jacobsalazar.pages.dev/" className="back-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M15 10H5M5 10L10 5M5 10L10 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Portfolio
          </a>
          <div className="logo">JAKE'S VAULT</div>
          <div className="nav-links">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#shop" className="nav-link">Shop</a>
            <a href="#about" className="nav-link">About</a>
          </div>
          <div className="nav-actions">
            <button className="icon-btn search-btn" aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icon-btn cart-btn" onClick={() => setCartOpen(!cartOpen)} aria-label="Shopping cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 2L7 8M17 8L15 2M7 8H17M7 8L5 18H19L17 8M10 12V16M14 12V16" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="cart-count">{cartItemsCount}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">Exclusive Collection 2025</span>
            <h1 className="hero-title">Where Style Meets Distinction</h1>
            <p className="hero-subtitle">
              Discover Jake's Vault – a curated collection of premium fashion pieces
              for the discerning individual. Timeless elegance, modern sensibility.
            </p>
            <div className="hero-cta">
              <a href="#shop" className="btn btn-primary">Shop Collection</a>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop"
              alt="Fashion model"
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <a href="#" className="category-link">Explore →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="shop" className="products">
        <div className="container">
          <div className="products-header">
            <h2 className="section-title">Featured Products</h2>
            <div className="filters">
              {filters.map(filter => (
                <button
                  key={filter}
                  className={`filter-btn ${currentFilter === filter ? 'active' : ''}`}
                  onClick={() => setCurrentFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">${product.price}</div>
                  <div className="product-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`star ${star > product.rating ? 'empty' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container about-content">
          <div className="about-text">
            <span className="about-badge">Our Philosophy</span>
            <h2 className="about-title">Curated for the Modern Connoisseur</h2>
            <p>
              Jake's Vault is a destination for those who appreciate exceptional style
              and uncompromising quality. Each piece is handpicked to represent the
              perfect fusion of contemporary design and timeless appeal.
            </p>
            <p>
              From refined essentials to bold statement pieces, our collection celebrates
              individuality and sophisticated taste.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea1c8573?w=600&h=600&fit=crop"
              alt="Fashion atelier"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-section">
            <h3 className="logo">JAKE'S VAULT</h3>
            <p>Curated luxury fashion for the discerning individual.</p>
          </div>
          <div className="footer-section">
            <h4>Shop</h4>
            <ul>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
              <li><a href="#">Sale</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>2025 Jake's Vault. Built with React 19 + Vite. Part of Senior Fullstack Developer Portfolio.</p>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      <div className={`cart-sidebar ${cartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button className="close-cart" onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${item.price}</div>
                  <div className="cart-item-quantity">
                    <button className="qty-btn" onClick={() => updateQuantity(item, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span className="total-price">${cartTotal}</span>
          </div>
          <button className="btn btn-primary btn-block">Checkout</button>
        </div>
      </div>
      <div className={`cart-overlay ${cartOpen ? 'active' : ''}`} onClick={() => setCartOpen(false)}></div>
    </>
  )
}

export default App
