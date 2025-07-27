import { LightningElement, api } from 'lwc';

// Constants
const CURRENCY_CODE = 'USD';
const LOCALE = 'en-US';
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

export default class CartSummary extends LightningElement {
  @api cartItems = [];
  @api cartTotal = 0;
  @api cartCount = 0;

  isExpanded = false;

  // Cached currency formatter for performance
  _currencyFormatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  });

  handleToggleCart() {
    this.isExpanded = !this.isExpanded;
  }

  handleQuantityChange(event) {
    const cartId = event.target.dataset.cartId; // Don't parse as int - keep as string
    const inputValue = parseInt(event.target.value, 10);

    // Allow 0 for removal, otherwise enforce min/max bounds
    let quantity;
    if (inputValue === 0) {
      quantity = 0; // Allow removal
    } else if (isNaN(inputValue) || inputValue < MIN_QUANTITY) {
      quantity = MIN_QUANTITY; // Default to minimum if invalid/empty
    } else {
      quantity = Math.min(MAX_QUANTITY, inputValue); // Cap at maximum
    }

    this._dispatchUpdateCartEvent(cartId, quantity);
  }

  handleRemoveItem(event) {
    const cartId = event.target.dataset.cartId; // Don't parse as int - keep as string
    this._dispatchUpdateCartEvent(cartId, 0); // 0 quantity = remove
  }

  _dispatchUpdateCartEvent(cartId, quantity) {
    this.dispatchEvent(
      new CustomEvent('update_cart', {
        bubbles: true,
        detail: { cartId, quantity },
      })
    );
  }

  get formattedTotal() {
    return this._currencyFormatter.format(this.cartTotal);
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
      formattedPrice: this._currencyFormatter.format(item.price),
      formattedLineTotal: this._currencyFormatter.format(item.lineTotal),
      minQuantity: 0, // Allow 0 for removal
      maxQuantity: MAX_QUANTITY,
    }));
  }
}
