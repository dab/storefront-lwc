import { LightningElement, api } from 'lwc';

export default class BikeDetail extends LightningElement {
  @api bike;
  selectedColor = '';
  quantity = 1;
  isImageZoomed = false;
  
  connectedCallback() {
    if (this.bike?.colors?.length > 0) {
      this.selectedColor = this.bike.colors[0];
    }
  }
  
  handleColorChange(event) {
    this.selectedColor = event.target.value;
  }
  
  handleQuantityChange(event) {
    this.quantity = parseInt(event.target.value, 10) || 1;
  }
  
  handleAddToCart() {
    const addEvent = new CustomEvent('add_to_cart', {
      bubbles: true,
      composed: false,
      detail: {
        bikeId: this.bike.id,
        selectedColor: this.selectedColor,
        quantity: this.quantity
      }
    });
    
    this.dispatchEvent(addEvent);
  }
  
  handleBackToStore() {
    const backEvent = new CustomEvent('back_to_store', {
      bubbles: true,
      composed: false
    });
    
    this.dispatchEvent(backEvent);
  }
  
  handleImageClick() {
    this.isImageZoomed = !this.isImageZoomed;
  }
  
  handleImageKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleImageClick();
    }
  }
  
  handleZoomClose() {
    this.isImageZoomed = false;
  }
  
  get currentImage() {
    // Use color-specific image if available, fallback to default image
    if (this.bike?.images && this.selectedColor && this.bike.images[this.selectedColor]) {
      return this.bike.images[this.selectedColor];
    }
    return this.bike?.image || 'https://placehold.co/600x400';
  }
  
  get formattedPrice() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.bike?.price || 0);
  }
  
  get formattedOriginalPrice() {
    if (!this.bike?.originalPrice || this.bike.originalPrice === this.bike.price) {
      return null;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.bike.originalPrice);
  }
  
  get hasDiscount() {
    return this.formattedOriginalPrice !== null;
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
  
  get deliveryTime() {
    return this.bike?.deliveryTime || 'Contact us for delivery info';
  }
  
  get frameSize() {
    if (!this.bike?.frameSize) return 'Various sizes available';
    return this.bike.frameSize.join(', ');
  }
  
  get specifications() {
    if (!this.bike?.specs) return [];
    
    return Object.entries(this.bike.specs).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  }
  
  get quantityOptions() {
    return Array.from({length: 10}, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
      selected: this.quantity === (i + 1)
    }));
  }
  
  get imageContainerClass() {
    return this.isImageZoomed ? 'product-image-container zoomed' : 'product-image-container';
  }
  
  get zoomModalClass() {
    return this.isImageZoomed ? 'zoom-modal show' : 'zoom-modal';
  }
}