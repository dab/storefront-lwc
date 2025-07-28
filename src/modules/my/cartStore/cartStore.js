// Lightweight cart store using ES2022 features

// Constants
const DEFAULT_IMAGE_URL = 'https://placehold.co/300x200';
const STORAGE_KEY = 'bikestore_cart';

class CartStore {
  _items = new Map();
  _listeners = new Set();

  // Cached values for performance
  _cachedState = null;
  _isDirty = true;

  constructor() {
    this.loadFromStorage();
  }

  // Add item to cart
  addItem(bike, selectedColor, quantity = 1) {
    // Validate inputs
    if (!bike?.id || !bike?.price || quantity <= 0) {
      throw new Error('Invalid item data');
    }

    // Check if item with same bike ID and color already exists
    const existingItem = this._findExistingItem(bike.id, selectedColor);

    if (existingItem) {
      // Increase quantity of existing item
      this.updateQuantity(existingItem.cartId, existingItem.quantity + quantity);
      return existingItem.cartId;
    }
    // Add new item with better ID generation
    const cartId = this._generateCartId();
    const item = {
      ...bike,
      cartId,
      selectedColor,
      quantity,
      lineTotal: bike.price * quantity,
      image: this._getColorImage(bike, selectedColor),
    };

    this._items.set(cartId, item);
    this._markDirty();
    this._saveToStorage();
    this._notifyListeners();
    return cartId;
  }

  // Update item quantity
  updateQuantity(cartId, quantity) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const item = this._items.get(cartId);
    if (item) {
      if (quantity === 0) {
        this._items.delete(cartId);
      } else {
        item.quantity = quantity;
        item.lineTotal = item.price * quantity;
      }
      this._markDirty();
      this._saveToStorage();
      this._notifyListeners();
    }
  }

  // Get all items as array
  getItems() {
    return this._getState().items;
  }

  // Get cart total
  getTotal() {
    return this._getState().total;
  }

  // Get total item count
  getCount() {
    return this._getState().count;
  }

  // Get cached state with performance optimization
  _getState() {
    if (this._isDirty || !this._cachedState) {
      const items = [...this._items.values()];
      this._cachedState = {
        items,
        total: items.reduce((total, item) => total + item.lineTotal, 0),
        count: items.reduce((count, item) => count + item.quantity, 0),
      };
      this._isDirty = false;
    }
    return this._cachedState;
  }

  // Mark state as dirty to trigger recalculation
  _markDirty() {
    this._isDirty = true;
  }

  // Subscribe to changes
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // Private methods
  _generateCartId() {
    // Use crypto API for better uniqueness, fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  _findExistingItem(bikeId, selectedColor) {
    // More efficient than converting to array and using find
    for (const item of this._items.values()) {
      if (item.id === bikeId && item.selectedColor === selectedColor) {
        return item;
      }
    }
    return null;
  }

  _getColorImage(bike, selectedColor) {
    if (bike?.images?.[selectedColor]) {
      const images = bike.images[selectedColor];
      return Array.isArray(images) ? images[0] : images;
    }
    return bike?.image || DEFAULT_IMAGE_URL;
  }

  _notifyListeners() {
    const state = this._getState();
    this._listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }

  _saveToStorage() {
    try {
      const items = this.getItems();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Cart persistence unavailable:', error.message);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items)) {
          items.forEach(item => {
            // Validate loaded item
            if (item.cartId && item.price && item.quantity) {
              this._items.set(item.cartId, {
                ...item,
                lineTotal: item.price * item.quantity,
              });
            }
          });
          this._markDirty();
        }
      }
    } catch (error) {
      console.warn('Cart loading failed:', error.message);
    }
  }

  // Refresh images after bikes data is loaded
  refreshImages(bikes) {
    if (!Array.isArray(bikes) || bikes.length === 0) {
      return;
    }

    let updated = false;

    // Create lookup map for better performance
    const bikeMap = new Map(bikes.map(bike => [bike.id, bike]));

    this._items.forEach(item => {
      const bike = bikeMap.get(item.id);
      if (bike) {
        const newImage = this._getColorImage(bike, item.selectedColor);
        if (item.image !== newImage) {
          item.image = newImage;
          updated = true;
        }
      }
    });

    if (updated) {
      this._markDirty();
      this._saveToStorage();
      this._notifyListeners();
    }
  }
}

// Export singleton instance
export default new CartStore();
