import { LightningElement, api } from 'lwc';

export default class BikeCard extends LightningElement {
  @api bike;
  
  selectedColor = '';
  
  connectedCallback() {
    // Set default color
    if (this.bike?.colors?.length > 0) {
      this.selectedColor = this.bike.colors[0];
    }
  }
  
  handleColorChange(event) {
    this.selectedColor = event.target.value;
  }
  
  handleAddToCart() {
    // Event naming per lwc.dev: no uppercase, underscores OK
    const addEvent = new CustomEvent('add_to_cart', {
      bubbles: true,
      composed: false,
      detail: {
        // Send only primitives (lwc.dev best practice)
        bikeId: this.bike.id,
        selectedColor: this.selectedColor,
        quantity: 1
      }
    });
    
    this.dispatchEvent(addEvent);
  }
  
  handleViewDetails() {
    const detailEvent = new CustomEvent('view_product_detail', {
      bubbles: true,
      composed: false,
      detail: {
        bikeId: this.bike.id
      }
    });
    
    this.dispatchEvent(detailEvent);
  }
  
  handleKeyDown(event) {
    // Handle Enter and Space key for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleViewDetails();
    }
  }
  
  get currentImage() {
    // Use color-specific image if available, fallback to default image
    if (this.bike?.images && this.selectedColor && this.bike.images[this.selectedColor]) {
      const colorImages = this.bike.images[this.selectedColor];
      // Use first image from array if it's an array, otherwise use as string
      return Array.isArray(colorImages) ? colorImages[0] : colorImages;
    }
    return this.bike?.image || 'https://placehold.co/300x200';
  }
  
  get formattedPrice() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.bike?.price || 0);
  }
  
  get colorOptions() {
    if (!this.bike?.colors) return [];
    
    return this.bike.colors.map(color => ({
      label: color.charAt(0).toUpperCase() + color.slice(1),
      value: color,
      selected: this.selectedColor === color
    }));
  }
  
  get stockStatus() {
    return this.bike?.inStock ? 'In Stock' : 'Out of Stock';
  }
  
  get stockClass() {
    return this.bike?.inStock ? 'stock-available' : 'stock-unavailable';
  }
  
  get isOutOfStock() {
    return !this.bike?.inStock;
  }
}