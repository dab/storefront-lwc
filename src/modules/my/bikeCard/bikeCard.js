import { LightningElement, api } from 'lwc';

// Constants
const DEFAULT_IMAGE_URL = 'https://placehold.co/300x200';
const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
};

export default class BikeCard extends LightningElement {
  @api bike;
  selectedColor = '';

  connectedCallback() {
    // Initialize selected color when bike data is available
    this.selectedColor = this.bike?.colors?.[0] || '';
  }

  handleColorChange(event) {
    this.selectedColor = event.target.value;
  }

  handleAddToCart() {
    this.dispatchEvent(
      new CustomEvent('add_to_cart', {
        bubbles: true,
        detail: {
          bikeId: this.bike.id,
          selectedColor: this.selectedColor,
          quantity: 1,
        },
      })
    );
  }

  handleViewDetails() {
    this.dispatchEvent(
      new CustomEvent('view_product_detail', {
        bubbles: true,
        detail: {
          bikeId: this.bike.id,
        },
      })
    );
  }

  handleKeyDown(event) {
    // Handle Enter and Space key for accessibility
    if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
      event.preventDefault();
      this.handleViewDetails();
    }
  }

  get currentImage() {
    // Use color-specific image if available, fallback to default image
    const colorImages = this.bike?.images?.[this.selectedColor];
    if (colorImages) {
      return Array.isArray(colorImages) ? colorImages[0] : colorImages;
    }
    return this.bike?.image || DEFAULT_IMAGE_URL;
  }

  // Utility method for formatting currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  }

  get formattedPrice() {
    return this.formatCurrency(this.bike?.price);
  }

  get colorOptions() {
    return (this.bike?.colors || []).map(color => ({
      label: color.charAt(0).toUpperCase() + color.slice(1),
      value: color,
      selected: this.selectedColor === color,
    }));
  }

  get stockStatus() {
    return this.bike?.inStock ? 'In Stock' : 'Out of Stock';
  }

  get stockBadgeClass() {
    const baseClasses = 'slds-badge slds-badge_lightest';
    const themeClass = this.bike?.inStock ? 'slds-theme_success' : 'slds-theme_error';
    return `${baseClasses} ${themeClass}`;
  }

  get colorSelectId() {
    return `color-select-${this.bike?.id || 'default'}`;
  }

  get isOutOfStock() {
    return !this.bike?.inStock;
  }
}
