import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  badge?: string;
  image: string;
  filter: string[];
  quantity?: number;
  description?: string;
  materials?: string[];
  dimensions?: string;
  images?: string[];
}

interface Category {
  name: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Kura - Scandinavian Furniture Store';

  cartOpen = false;
  cart: Product[] = [];
  currentFilter = 'all';
  filters = ['all', 'new', 'sale', 'popular'];

  // Quick View Modal states
  quickViewOpen = false;
  selectedProduct: Product | null = null;
  selectedImageIndex = 0;
  activeTab = 'details';

  // Checkout Demo state
  showCheckoutDemo = false;

  // Search state
  searchOpen = false;
  searchQuery = '';
  searchResults: Product[] = [];

  categories: Category[] = [
    {
      name: 'Seating',
      description: 'Chairs & Sofas',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
    },
    {
      name: 'Tables',
      description: 'Dining & Coffee',
      image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=300&fit=crop'
    },
    {
      name: 'Storage',
      description: 'Shelves & Cabinets',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop'
    },
    {
      name: 'Lighting',
      description: 'Lamps & Fixtures',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop'
    }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Minimal Oak Chair',
      category: 'Seating',
      price: 349,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular'],
      description: 'Crafted from solid oak with a minimalist design that combines comfort with timeless Scandinavian aesthetics. Perfect for dining rooms or as an accent piece.',
      materials: ['Solid Oak Wood', 'Natural Oil Finish', 'Steel Reinforcements'],
      dimensions: 'W: 18" × D: 20" × H: 32"',
      images: [
        'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop'
      ]
    },
    {
      id: 2,
      name: 'Nordic Dining Table',
      category: 'Tables',
      price: 899,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=500&fit=crop',
      filter: ['all', 'popular'],
      description: 'Spacious dining table featuring clean lines and a natural wood finish. Seats up to 6 people comfortably, ideal for family gatherings.',
      materials: ['Solid Pine Wood', 'Water-based Lacquer', 'Metal Brackets'],
      dimensions: 'W: 72" × D: 36" × H: 30"',
      images: [
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=600&fit=crop'
      ]
    },
    {
      id: 3,
      name: 'Ash Wood Bookshelf',
      category: 'Storage',
      price: 549,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=500&fit=crop',
      filter: ['all']
    },
    {
      id: 4,
      name: 'Pendant Light Fixture',
      category: 'Lighting',
      price: 199,
      rating: 5,
      badge: 'sale',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 5,
      name: 'Lounge Armchair',
      category: 'Seating',
      price: 649,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular']
    },
    {
      id: 6,
      name: 'Coffee Table Round',
      category: 'Tables',
      price: 449,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    },
    {
      id: 7,
      name: 'Modular Cabinet System',
      category: 'Storage',
      price: 799,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=500&fit=crop',
      filter: ['all', 'new']
    },
    {
      id: 8,
      name: 'Arc Floor Lamp',
      category: 'Lighting',
      price: 299,
      rating: 4,
      badge: 'sale',
      image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 9,
      name: 'Velvet Sofa 3-Seater',
      category: 'Seating',
      price: 1299,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
      filter: ['all', 'popular']
    },
    {
      id: 10,
      name: 'Walnut Side Table',
      category: 'Tables',
      price: 249,
      rating: 4,
      badge: 'sale',
      image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=500&fit=crop',
      filter: ['all', 'sale']
    },
    {
      id: 11,
      name: 'Wall-Mounted Shelf',
      category: 'Storage',
      price: 179,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
      filter: ['all']
    },
    {
      id: 12,
      name: 'Table Lamp Set',
      category: 'Lighting',
      price: 149,
      rating: 5,
      badge: 'new',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=500&fit=crop',
      filter: ['all', 'new', 'popular']
    }
  ];

  get filteredProducts(): Product[] {
    return this.products.filter(product =>
      product.filter.includes(this.currentFilter)
    );
  }

  get cartItemsCount(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) =>
      sum + (item.price * (item.quantity || 0)), 0
    );
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.saveCart();
  }

  updateQuantity(item: Product, change: number): void {
    const cartItem = this.cart.find(i => i.id === item.id);
    if (!cartItem) return;

    cartItem.quantity = (cartItem.quantity || 0) + change;

    if (cartItem.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== item.id);
    }

    this.saveCart();
  }

  private saveCart(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kuraCart', JSON.stringify(this.cart));
    }
  }

  private loadCart(): void {
    if (typeof localStorage !== 'undefined') {
      const savedCart = localStorage.getItem('kuraCart');
      if (savedCart) {
        this.cart = JSON.parse(savedCart);
      }
    }
  }

  ngOnInit(): void {
    this.loadCart();
  }

  // Quick View Modal Methods
  openQuickView(product: Product): void {
    this.selectedProduct = product;
    this.selectedImageIndex = 0;
    this.activeTab = 'details';
    this.quickViewOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeQuickView(): void {
    this.quickViewOpen = false;
    this.selectedProduct = null;
    document.body.style.overflow = '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getRelatedProducts(product: Product): Product[] {
    return this.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }

  getProductsByCategory(categoryName: string): Product[] {
    return this.products.filter(p => p.category === categoryName);
  }

  // Enhanced category exploration
  exploreCategory(categoryName: string): void {
    const categoryProducts = this.getProductsByCategory(categoryName);
    if (categoryProducts.length > 0) {
      this.openQuickView(categoryProducts[0]);
    }
  }

  // Checkout Demo Handler
  handleCheckout(): void {
    this.showCheckoutDemo = true;
    this.cartOpen = false;
    document.body.style.overflow = 'hidden';

    // Auto close after 3 seconds
    setTimeout(() => {
      this.closeCheckoutDemo();
    }, 3000);
  }

  closeCheckoutDemo(): void {
    this.showCheckoutDemo = false;
    document.body.style.overflow = '';
  }

  // Search Methods
  openSearch(): void {
    this.searchOpen = true;
    this.searchQuery = '';
    this.searchResults = [];
    document.body.style.overflow = 'hidden';
  }

  closeSearch(): void {
    this.searchOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    document.body.style.overflow = '';
  }

  handleSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.searchResults = [];
      return;
    }

    const lowerQuery = this.searchQuery.toLowerCase();
    this.searchResults = this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
      (product.materials && product.materials.some(m => m.toLowerCase().includes(lowerQuery)))
    );
  }

  handleSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchResults.length > 0) {
      this.openQuickView(this.searchResults[0]);
      this.closeSearch();
    }
  }

  searchSuggestion(term: string): void {
    this.searchQuery = term;
    this.handleSearch();
  }
}
