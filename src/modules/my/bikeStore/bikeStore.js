import { LightningElement, track } from 'lwc';
import cartStore from 'my/cartStore';

export default class BikeStore extends LightningElement {
  bikes = [];
  filteredBikes = [];
  displayedBikes = [];

  @track cartState = {
    items: [],
    total: 0,
    count: 0,
  };

  @track activeFilters = {
    type: '',
    brand: '',
    priceRange: { min: 0, max: 10000 },
  };

  sortBy = 'popularity';
  showMobileFilters = false;

  // View management
  currentView = 'store';
  selectedBikeId = null;

  // Error handling
  showError = false;
  errorMessage = '';

  // Pagination
  itemsPerPage = 6;
  currentPage = 1;

  // Private fields using conventional naming
  _unsubscribeCart;
  _popstateHandler;

  async connectedCallback() {
    this._setupBrowserNavigation();
    this._subscribeToCart();
    await this.loadBikes();
  }

  disconnectedCallback() {
    this._cleanupBrowserNavigation();
    if (this._unsubscribeCart) {
      this._unsubscribeCart();
    }
  }

  _setupBrowserNavigation() {
    this._popstateHandler = this._handlePopState.bind(this);
    window.addEventListener('popstate', this._popstateHandler);

    if (window.history?.replaceState) {
      window.history.replaceState({ view: 'store' }, '', '#/');
    }
  }

  _cleanupBrowserNavigation() {
    if (this._popstateHandler) {
      window.removeEventListener('popstate', this._popstateHandler);
    }
  }

  _handlePopState(event) {
    if (event.state?.view === 'detail' && event.state.bikeId) {
      this.selectedBikeId = event.state.bikeId;
      this.currentView = 'detail';
    } else {
      this.currentView = 'store';
      this.selectedBikeId = null;
    }
  }

  _subscribeToCart() {
    this._unsubscribeCart = cartStore.subscribe(state => {
      this.cartState = state;
    });

    // Get initial state
    this.cartState = {
      items: cartStore.getItems(),
      total: cartStore.getTotal(),
      count: cartStore.getCount(),
    };
  }

  async loadBikes() {
    try {
      const response = await fetch('/assets/bikes.json');
      const data = await response.json();
      this.bikes = data.bikes || [];
      this.applyFiltersAndSort();
      cartStore.refreshImages(this.bikes);
    } catch {
      this.showError = true;
      this.errorMessage = 'Failed to load products. Please refresh the page.';
    }
  }

  // Event Handlers
  handleAddToCart(event) {
    const { bikeId, selectedColor, quantity } = event.detail;
    const bike = this.bikes.find(b => b.id === bikeId);

    if (bike) {
      cartStore.addItem(bike, selectedColor, quantity);
    }
  }

  handleViewProductDetail(event) {
    const { bikeId } = event.detail;
    this.selectedBikeId = bikeId;
    this.currentView = 'detail';

    if (window.history?.pushState) {
      window.history.pushState({ view: 'detail', bikeId }, '', `#/product/${bikeId}`);
    }
  }

  handleBackToStore() {
    this.currentView = 'store';
    this.selectedBikeId = null;

    if (window.history?.pushState) {
      window.history.pushState({ view: 'store' }, '', '#/');
    }
  }

  handleUpdateCart(event) {
    const { cartId, quantity } = event.detail;
    cartStore.updateQuantity(cartId, quantity);
  }

  // Filter handlers
  handleFilterChange(event) {
    const { filterType, value } = event.detail;

    this.activeFilters = {
      ...this.activeFilters,
      [filterType]: value,
    };

    this.applyFiltersAndSort();
  }

  handleClearFilter(event) {
    const { filterType } = event.detail;

    if (filterType === 'priceRange') {
      this.activeFilters = {
        ...this.activeFilters,
        priceRange: { min: 0, max: 10000 },
      };
    } else {
      this.activeFilters = {
        ...this.activeFilters,
        [filterType]: '',
      };
    }

    this.applyFiltersAndSort();
  }

  handleClearAllFilters() {
    this.activeFilters = {
      type: '',
      brand: '',
      priceRange: { min: 0, max: 10000 },
    };
    this.applyFiltersAndSort();
  }

  handleSortChange(event) {
    this.sortBy = event.target.value;
    this.applyFiltersAndSort();
  }

  handleToggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  // Pagination handlers
  handlePageNavigation(event) {
    this.currentPage = event.detail.page;
    this.updateDisplayedBikes();
  }

  // Filtering and sorting
  applyFiltersAndSort() {
    let filtered = [...this.bikes];

    if (this.activeFilters.type) {
      filtered = filtered.filter(bike => bike.type === this.activeFilters.type);
    }

    if (this.activeFilters.brand) {
      filtered = filtered.filter(bike => bike.brand === this.activeFilters.brand);
    }

    filtered = filtered.filter(
      bike =>
        bike.price >= this.activeFilters.priceRange.min &&
        bike.price <= this.activeFilters.priceRange.max
    );

    filtered = this._sortBikes(filtered);

    this.filteredBikes = filtered;
    this.currentPage = 1;
    this.updateDisplayedBikes();
  }

  updateDisplayedBikes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBikes = this.filteredBikes.slice(startIndex, endIndex);
  }

  _sortBikes(bikes) {
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
          const dateA = new Date(a.releaseDate || '2025-01-01');
          const dateB = new Date(b.releaseDate || '2025-01-01');
          return dateB - dateA;
        });
      default:
        return sortedBikes;
    }
  }

  // Computed properties
  get isStoreView() {
    return this.currentView === 'store';
  }

  get isDetailView() {
    return this.currentView === 'detail';
  }

  get selectedBike() {
    return this.selectedBikeId ? this.bikes.find(bike => bike.id === this.selectedBikeId) : null;
  }

  get hasActiveFilters() {
    return (
      this.activeFilters.type ||
      this.activeFilters.brand ||
      this.activeFilters.priceRange.min > 0 ||
      this.activeFilters.priceRange.max < 10000
    );
  }

  get activeFilterCount() {
    let count = 0;
    if (this.activeFilters.type) count++;
    if (this.activeFilters.brand) count++;
    if (this.activeFilters.priceRange.min > 0 || this.activeFilters.priceRange.max < 10000) count++;
    return count;
  }

  get mobileFilterButtonText() {
    return this.activeFilterCount > 0 ? `Filter (${this.activeFilterCount})` : 'Filter';
  }

  get sortOptions() {
    return [
      { label: 'Popularity', value: 'popularity', selected: this.sortBy === 'popularity' },
      { label: 'Price: Low to High', value: 'price-low', selected: this.sortBy === 'price-low' },
      { label: 'Price: High to Low', value: 'price-high', selected: this.sortBy === 'price-high' },
      { label: 'Newest Arrivals', value: 'newest', selected: this.sortBy === 'newest' },
    ];
  }
}
