// Lightweight cart store using ES2022 features
class CartStore {
  _items = new Map();
  _listeners = new Set();
  
  constructor() {
    this.loadFromStorage();
  }

  // Add item to cart
  addItem(bike, selectedColor, quantity = 1) {
    // Check if item with same bike ID and color already exists
    const existingItem = [...this._items.values()].find(item => 
      item.id === bike.id && item.selectedColor === selectedColor
    );
    
    if (existingItem) {
      // Increase quantity of existing item
      this.updateQuantity(existingItem.cartId, existingItem.quantity + quantity);
      return existingItem.cartId;
    } else {
      // Add new item
      const cartId = Date.now();
      const item = {
        ...bike,
        cartId,
        selectedColor,
        quantity,
        lineTotal: bike.price * quantity,
        image: this._getColorImage(bike, selectedColor)
      };
      
      this._items.set(cartId, item);
      this._saveToStorage();
      this._notifyListeners();
      return cartId;
    }
  }

  // Update item quantity
  updateQuantity(cartId, quantity) {
    const item = this._items.get(cartId);
    if (item) {
      if (quantity === 0) {
        this._items.delete(cartId);
      } else {
        item.quantity = quantity;
        item.lineTotal = item.price * quantity;
      }
      this._saveToStorage();
      this._notifyListeners();
    }
  }

  // Get all items as array
  getItems() {
    return [...this._items.values()];
  }

  // Get cart total
  getTotal() {
    return [...this._items.values()].reduce((total, item) => 
      total + item.lineTotal, 0
    );
  }

  // Get total item count
  getCount() {
    return [...this._items.values()].reduce((count, item) => 
      count + item.quantity, 0
    );
  }

  // Subscribe to changes
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  // Private methods
  _getColorImage(bike, selectedColor) {
    if (bike?.images?.[selectedColor]) {
      const images = bike.images[selectedColor];
      return Array.isArray(images) ? images[0] : images;
    }
    return bike?.image || 'https://placehold.co/300x200';
  }

  _notifyListeners() {
    const state = {
      items: this.getItems(),
      total: this.getTotal(),
      count: this.getCount()
    };
    this._listeners.forEach(listener => listener(state));
  }

  _saveToStorage() {
    try {
      const items = this.getItems();
      localStorage.setItem('bikestore_cart', JSON.stringify(items));
    } catch {
      // Cart persistence unavailable
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('bikestore_cart');
      if (saved) {
        const items = JSON.parse(saved);
        items.forEach(item => {
          this._items.set(item.cartId, {
            ...item,
            lineTotal: item.price * item.quantity
          });
        });
      }
    } catch {
      // Cart loading failed
    }
  }

  // Refresh images after bikes data is loaded
  refreshImages(bikes) {
    let updated = false;
    this._items.forEach((item) => {
      const bike = bikes.find(b => b.id === item.id);
      if (bike) {
        const newImage = this._getColorImage(bike, item.selectedColor);
        if (item.image !== newImage) {
          item.image = newImage;
          updated = true;
        }
      }
    });
    if (updated) {
      this._saveToStorage();
      this._notifyListeners();
    }
  }
}

// Export singleton instance
export default new CartStore();