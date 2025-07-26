import { LightningElement, track } from 'lwc';

export default class BikeStore extends LightningElement {
  bikes = [];
  filteredBikes = [];
  cartItems = [];
  @track cartTotal = 0;
  
  @track activeFilters = {
    type: '',
    brand: '',
    priceRange: { min: 0, max: 5000 }
  };
  
  sortBy = 'popularity';
  showMobileFilters = false;
  
  // View management
  currentView = 'store'; // 'store' or 'detail'
  selectedBikeId = null;
  
  connectedCallback() {
    this.loadBikes();
    this.loadCartFromStorage();
    this.setupBrowserNavigation();
  }
  
  disconnectedCallback() {
    this.cleanupBrowserNavigation();
  }
  
  setupBrowserNavigation() {
    // Handle browser back/forward buttons
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.handlePopState);
    
    // Set initial state
    if (window.history && window.history.replaceState) {
      window.history.replaceState({ view: 'store' }, '', '#/');
    }
  }
  
  cleanupBrowserNavigation() {
    window.removeEventListener('popstate', this.handlePopState);
  }
  
  handlePopState(event) {
    if (event.state) {
      if (event.state.view === 'detail' && event.state.bikeId) {
        this.selectedBikeId = event.state.bikeId;
        this.currentView = 'detail';
      } else {
        this.currentView = 'store';
        this.selectedBikeId = null;
      }
    } else {
      // Default to store view if no state
      this.currentView = 'store';
      this.selectedBikeId = null;
    }
  }
  
  async loadBikes() {
    try {
      // Load from static JSON file
      const response = await fetch('/assets/bikes.json');
      const data = await response.json();
      this.bikes = data.bikes || [];
      this.applyFiltersAndSort();
    } catch (error) {
      console.error('Error loading bikes:', error);
      // Fallback to sample data if static file fails
      this.bikes = this.getSampleBikes();
      this.applyFiltersAndSort();
    }
  }
  
  getSampleBikes() {
    return [
      {
        id: 'bike-1',
        name: 'Mountain Explorer',
        type: 'mountain',
        brand: 'TrailBlaze',
        price: 899.99,
        image: 'https://placehold.co/300x200',
        colors: ['red', 'blue'],
        gearType: '21-speed',
        inStock: true
      },
      {
        id: 'bike-2', 
        name: 'City Cruiser',
        type: 'hybrid',
        brand: 'UrbanRide',
        price: 549.99,
        image: 'https://placehold.co/300x200',
        colors: ['black', 'white'],
        gearType: '7-speed', 
        inStock: true
      },
      {
        id: 'bike-3',
        name: 'Road Racer',
        type: 'road',
        brand: 'SpeedCorp',
        price: 1299.99,
        image: 'https://placehold.co/300x200',
        colors: ['yellow', 'green'],
        gearType: '16-speed',
        inStock: true
      }
    ];
  }
  
  handleAddToCart(event) {
    const { bikeId, selectedColor, quantity } = event.detail;
    const bike = this.bikes.find(b => b.id === bikeId);
    
    if (!bike) return;
    
    // Create new array reference for reactivity
    const newItem = { 
      ...bike, 
      selectedColor, 
      quantity, 
      cartId: Date.now(),
      lineTotal: bike.price * quantity
    };
    
    this.cartItems = [...this.cartItems, newItem];
    
    this.calculateCartTotal();
    this.saveCartToStorage();
    
    // Show brief confirmation (for AC requirement)
    this.showCartConfirmation();
  }
  
  handleViewProductDetail(event) {
    const { bikeId } = event.detail;
    this.selectedBikeId = bikeId;
    this.currentView = 'detail';
    
    // Update URL for browser back button support
    if (window.history && window.history.pushState) {
      window.history.pushState(
        { view: 'detail', bikeId }, 
        '', 
        `#/product/${bikeId}`
      );
    }
  }
  
  handleBackToStore() {
    this.currentView = 'store';
    this.selectedBikeId = null;
    
    // Update URL
    if (window.history && window.history.pushState) {
      window.history.pushState({ view: 'store' }, '', '#/');
    }
  }
  
  handleUpdateCart(event) {
    const { cartId, quantity } = event.detail;
    
    if (quantity === 0) {
      // Remove item
      this.cartItems = this.cartItems.filter(item => item.cartId !== cartId);
    } else {
      // Update quantity and line total
      this.cartItems = this.cartItems.map(item => 
        item.cartId === cartId ? { 
          ...item, 
          quantity,
          lineTotal: item.price * quantity
        } : item
      );
    }
  }
  
  // Removed getter - now using @track cartTotal property
  
  get cartCount() {
    return this.cartItems.reduce((count, item) => 
      count + item.quantity, 0
    );
  }
  
  // Filter and Sort Methods
  handleFilterChange(event) {
    const { filterType, value } = event.detail;
    
    // Create new object reference for reactivity
    this.activeFilters = {
      ...this.activeFilters,
      [filterType]: value
    };
    
    this.applyFiltersAndSort();
  }
  
  handleTypeFilter(event) {
    this.activeFilters = {
      ...this.activeFilters,
      type: event.target.value
    };
    this.applyFiltersAndSort();
  }
  
  handleBrandFilter(event) {
    this.activeFilters = {
      ...this.activeFilters,
      brand: event.target.value
    };
    this.applyFiltersAndSort();
  }
  
  handleMinPriceChange(event) {
    const minPrice = parseInt(event.target.value, 10) || 0;
    this.activeFilters = {
      ...this.activeFilters,
      priceRange: {
        ...this.activeFilters.priceRange,
        min: minPrice
      }
    };
    this.applyFiltersAndSort();
  }
  
  handleMaxPriceChange(event) {
    const maxPrice = parseInt(event.target.value, 10) || 5000;
    this.activeFilters = {
      ...this.activeFilters,
      priceRange: {
        ...this.activeFilters.priceRange,
        max: maxPrice
      }
    };
    this.applyFiltersAndSort();
  }
  
  handleRemoveFilter(event) {
    const filterType = event.target.dataset.filter;
    
    if (filterType === 'type') {
      this.activeFilters = { ...this.activeFilters, type: '' };
    } else if (filterType === 'brand') {
      this.activeFilters = { ...this.activeFilters, brand: '' };
    }
    
    this.applyFiltersAndSort();
  }
  
  handleSortChange(event) {
    this.sortBy = event.target.value;
    this.applyFiltersAndSort();
  }
  
  handleClearFilters() {
    this.activeFilters = {
      type: '',
      brand: '',
      priceRange: { min: 0, max: 5000 }
    };
    this.applyFiltersAndSort();
  }
  
  handleClearFilter(event) {
    const filterType = event.detail.filterType;
    
    if (filterType === 'priceRange') {
      this.activeFilters = {
        ...this.activeFilters,
        priceRange: { min: 0, max: 5000 }
      };
    } else {
      this.activeFilters = {
        ...this.activeFilters,
        [filterType]: ''
      };
    }
    
    this.applyFiltersAndSort();
  }
  
  handleToggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }
  
  applyFiltersAndSort() {
    // Start with all bikes
    let filtered = [...this.bikes];
    
    // Apply type filter
    if (this.activeFilters.type) {
      filtered = filtered.filter(bike => bike.type === this.activeFilters.type);
    }
    
    // Apply brand filter
    if (this.activeFilters.brand) {
      filtered = filtered.filter(bike => bike.brand === this.activeFilters.brand);
    }
    
    // Apply price range filter
    filtered = filtered.filter(bike => 
      bike.price >= this.activeFilters.priceRange.min && 
      bike.price <= this.activeFilters.priceRange.max
    );
    
    // Apply sorting
    filtered = this.sortBikes(filtered);
    
    // Update filtered bikes
    this.filteredBikes = filtered;
  }
  
  sortBikes(bikes) {
    const sortedBikes = [...bikes];
    
    switch (this.sortBy) {
      case 'price-low':
        return sortedBikes.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sortedBikes.sort((a, b) => b.price - a.price);
      case 'popularity':
        return sortedBikes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'newest':
        return sortedBikes.sort((a, b) => {
          const dateA = new Date(a.releaseDate || '2024-01-01');
          const dateB = new Date(b.releaseDate || '2024-01-01');
          return dateB - dateA;
        });
      default:
        return sortedBikes;
    }
  }
  
  // Computed properties for filter options
  get typeOptions() {
    const types = [...new Set(this.bikes.map(bike => bike.type))];
    return [
      { label: 'All Types', value: '', selected: this.activeFilters.type === '' },
      ...types.map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
        selected: this.activeFilters.type === type
      }))
    ];
  }
  
  get brandOptions() {
    const brands = [...new Set(this.bikes.map(bike => bike.brand))];
    return [
      { label: 'All Brands', value: '', selected: this.activeFilters.brand === '' },
      ...brands.map(brand => ({
        label: brand,
        value: brand,
        selected: this.activeFilters.brand === brand
      }))
    ];
  }
  
  get sortOptions() {
    return [
      { label: 'Popularity', value: 'popularity', selected: this.sortBy === 'popularity' },
      { label: 'Price: Low to High', value: 'price-low', selected: this.sortBy === 'price-low' },
      { label: 'Price: High to Low', value: 'price-high', selected: this.sortBy === 'price-high' },
      { label: 'Newest Arrivals', value: 'newest', selected: this.sortBy === 'newest' }
    ];
  }
  
  get activeFilterCount() {
    let count = 0;
    if (this.activeFilters.type) count++;
    if (this.activeFilters.brand) count++;
    if (this.activeFilters.priceRange.min > 0 || this.activeFilters.priceRange.max < 5000) count++;
    return count;
  }
  
  get hasActiveFilters() {
    return this.activeFilterCount > 0;
  }
  
  get mobileFilterButtonText() {
    return this.activeFilterCount > 0 ? 
      `Filter (${this.activeFilterCount})` : 
      'Filter';
  }
  
  get maxPrice() {
    return Math.max(...this.bikes.map(bike => bike.price), 5000);
  }
  
  // View management computed properties
  get isStoreView() {
    return this.currentView === 'store';
  }
  
  get isDetailView() {
    return this.currentView === 'detail';
  }
  
  get selectedBike() {
    if (!this.selectedBikeId) return null;
    return this.bikes.find(bike => bike.id === this.selectedBikeId);
  }
  
  // Cart persistence methods
  calculateCartTotal() {
    this.cartTotal = this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }
  
  saveCartToStorage() {
    try {
      localStorage.setItem('bikestore_cart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.warn('Cart persistence unavailable:', error);
    }
  }
  
  loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('bikestore_cart');
      const loadedItems = saved ? JSON.parse(saved) : [];
      
      // Ensure line totals are calculated for loaded items
      this.cartItems = loadedItems.map(item => ({
        ...item,
        lineTotal: item.price * item.quantity
      }));
      
      this.calculateCartTotal();
    } catch (error) {
      console.warn('Cart loading failed:', error);
      this.cartItems = [];
    }
  }
  
  showCartConfirmation() {
    // Simple confirmation method - could be enhanced with toast notifications
    // For now, this ensures cart count updates are visible immediately
    const cartElement = this.template.querySelector('my-cart-summary');
    if (cartElement) {
      cartElement.classList.add('cart-updated');
      setTimeout(() => {
        cartElement.classList.remove('cart-updated');
      }, 300);
    }
  }
}