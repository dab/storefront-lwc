import { LightningElement, api } from 'lwc';

export default class BikeDetail extends LightningElement {
  @api bike;
  selectedColor = '';
  quantity = 1;
  isImageZoomed = false;
  currentImageIndex = 0;
  
  connectedCallback() {
    if (this.bike?.colors?.length > 0) {
      this.selectedColor = this.bike.colors[0];
    }
    
    // Bind keyboard handler for zoom navigation
    this.boundKeyHandler = this.handleZoomKeyDown.bind(this);
    document.addEventListener('keydown', this.boundKeyHandler);
  }
  
  disconnectedCallback() {
    // Clean up keyboard event listener
    if (this.boundKeyHandler) {
      document.removeEventListener('keydown', this.boundKeyHandler);
    }
  }
  
  handleColorChange(event) {
    this.selectedColor = event.target.value;
    this.currentImageIndex = 0; // Reset to first image when color changes
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
  
  handleZoomPrevious() {
    this.handlePreviousImage();
  }
  
  handleZoomNext() {
    this.handleNextImage();
  }
  
  handleZoomKeyDown(event) {
    if (this.isImageZoomed) {
      switch (event.key) {
        case 'Escape':
          this.handleZoomClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.handlePreviousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.handleNextImage();
          break;
      }
    }
  }
  
  handlePreviousImage() {
    const images = this.currentImages;
    if (images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 ? images.length - 1 : this.currentImageIndex - 1;
    }
  }
  
  handleNextImage() {
    const images = this.currentImages;
    if (images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === images.length - 1 ? 0 : this.currentImageIndex + 1;
    }
  }
  
  handleThumbnailClick(event) {
    const index = parseInt(event.target.dataset.index, 10);
    this.currentImageIndex = index;
  }
  
  handleZoomContentClick(event) {
    // Prevent zoom from closing when clicking on content area
    event.stopPropagation();
  }
  
  get currentImages() {
    // Get all images for the selected color
    if (this.bike?.images && this.selectedColor && this.bike.images[this.selectedColor]) {
      const colorImages = this.bike.images[this.selectedColor];
      return Array.isArray(colorImages) ? colorImages : [colorImages];
    }
    return [this.bike?.image || 'https://placehold.co/600x400'];
  }
  
  get currentImage() {
    // Get the currently selected image from the gallery
    const images = this.currentImages;
    return images[this.currentImageIndex] || images[0] || this.bike?.image || 'https://placehold.co/600x400';
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
  
  get hasMultipleImages() {
    return this.currentImages.length > 1;
  }
  
  get thumbnailImages() {
    return this.currentImages.map((image, index) => ({
      url: image,
      index: index,
      isActive: index === this.currentImageIndex
    }));
  }
  
  get imageCounter() {
    return `${this.currentImageIndex + 1} / ${this.currentImages.length}`;
  }
}