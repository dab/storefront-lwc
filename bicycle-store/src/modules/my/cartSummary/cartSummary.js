import { LightningElement, api } from 'lwc';

export default class CartSummary extends LightningElement {
  @api cartItems = [];
  @api cartTotal = 0;
  @api cartCount = 0;
  
  isExpanded = false;
  
  handleToggleCart() {
    this.isExpanded = !this.isExpanded;
  }
  
  handleQuantityChange(event) {
    const cartId = parseInt(event.target.dataset.cartId, 10);
    const quantity = parseInt(event.target.value, 10);
    
    // Event per lwc.dev standards
    const updateEvent = new CustomEvent('update_cart', {
      bubbles: true,
      composed: false,
      detail: {
        cartId,
        quantity
      }
    });
    
    this.dispatchEvent(updateEvent);
  }
  
  handleRemoveItem(event) {
    const cartId = parseInt(event.target.dataset.cartId, 10);
    
    const removeEvent = new CustomEvent('update_cart', {
      bubbles: true,
      composed: false,
      detail: {
        cartId,
        quantity: 0  // 0 quantity = remove
      }
    });
    
    this.dispatchEvent(removeEvent);
  }
  
  get formattedTotal() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.cartTotal);
  }
  
  get isEmpty() {
    return this.cartItems.length === 0;
  }
  
  get cartSummaryText() {
    if (this.isEmpty) {
      return 'Cart (0)';
    }
    return `Cart (${this.cartCount})`;
  }
  
  get expandedClass() {
    return this.isExpanded ? 'cart-content expanded' : 'cart-content collapsed';
  }
  
  get toggleButtonText() {
    return this.isExpanded ? '▼' : '▲';
  }

  get cartItemsWithFormatting() {
    return this.cartItems.map(item => ({
      ...item,
      quantityId: `qty-${item.cartId}`,
      formattedPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(item.price),
      formattedLineTotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(item.lineTotal)
    }));
  }
}