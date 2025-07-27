import { LightningElement, api } from 'lwc';

// Constants
const DEFAULT_IMAGE_URL = 'https://placehold.co/600x400';
const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  SPACE: ' ',
};

export default class BikeDetail extends LightningElement {
  @api bike;
  selectedColor = '';
  quantity = 1;
  isImageZoomed = false;
  currentImageIndex = 0;
  boundKeyHandler;

  connectedCallback() {
    // Initialize selected color
    this.selectedColor = this.bike?.colors?.[0] || '';

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
    this.dispatchEvent(
      new CustomEvent('add_to_cart', {
        bubbles: true,
        detail: {
          bikeId: this.bike.id,
          selectedColor: this.selectedColor,
          quantity: this.quantity,
        },
      })
    );
  }

  handleBackToStore() {
    this.dispatchEvent(
      new CustomEvent('back_to_store', {
        bubbles: true,
      })
    );
  }

  handleImageClick() {
    this.isImageZoomed = !this.isImageZoomed;
  }

  handleImageKeyDown(event) {
    if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
      event.preventDefault();
      this.handleImageClick();
    }
  }

  handleZoomClose() {
    this.isImageZoomed = false;
  }

  handleZoomPrevious = () => this.handlePreviousImage();
  handleZoomNext = () => this.handleNextImage();

  handleZoomKeyDown(event) {
    if (this.isImageZoomed) {
      switch (event.key) {
        case KEYBOARD_KEYS.ESCAPE:
          this.handleZoomClose();
          break;
        case KEYBOARD_KEYS.ARROW_LEFT:
          event.preventDefault();
          this.handlePreviousImage();
          break;
        case KEYBOARD_KEYS.ARROW_RIGHT:
          event.preventDefault();
          this.handleNextImage();
          break;
      }
    }
  }

  handlePreviousImage() {
    const images = this.currentImages;
    if (images.length > 1) {
      this.currentImageIndex =
        this.currentImageIndex === 0 ? images.length - 1 : this.currentImageIndex - 1;
    }
  }

  handleNextImage() {
    const images = this.currentImages;
    if (images.length > 1) {
      this.currentImageIndex =
        this.currentImageIndex === images.length - 1 ? 0 : this.currentImageIndex + 1;
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
    const colorImages = this.bike?.images?.[this.selectedColor];
    if (colorImages) {
      return Array.isArray(colorImages) ? colorImages : [colorImages];
    }
    return [this.bike?.image || DEFAULT_IMAGE_URL];
  }

  get currentImage() {
    // Get the currently selected image from the gallery
    const images = this.currentImages;
    return images[this.currentImageIndex] || images[0] || DEFAULT_IMAGE_URL;
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

  get formattedOriginalPrice() {
    if (!this.bike?.originalPrice || this.bike.originalPrice === this.bike.price) {
      return null;
    }
    return this.formatCurrency(this.bike.originalPrice);
  }

  get hasDiscount() {
    return this.formattedOriginalPrice !== null;
  }

  get colorOptions() {
    if (!this.bike?.colors) return [];

    return this.bike.colors.map(color => ({
      label: color.charAt(0).toUpperCase() + color.slice(1),
      value: color,
      selected: this.selectedColor === color,
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
    return this.bike?.frameSize?.join(', ') || 'Various sizes available';
  }

  get specifications() {
    return Object.entries(this.bike?.specs || {}).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));
  }

  get quantityOptions() {
    return Array.from({ length: 10 }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
      selected: this.quantity === i + 1,
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
      isActive: index === this.currentImageIndex,
    }));
  }

  get imageCounter() {
    return `${this.currentImageIndex + 1} / ${this.currentImages.length}`;
  }
}
