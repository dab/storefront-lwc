import { LightningElement, api } from 'lwc';

// Constants
const MAX_VISIBLE_PAGES = 5;
const BUTTON_CLASSES = {
  ACTIVE: 'slds-button slds-button_brand',
  INACTIVE: 'slds-button slds-button_neutral',
};

export default class BikePagination extends LightningElement {
  @api currentPage = 1;
  @api totalItems = 0;
  @api itemsPerPage = 6;

  // Memoization for pages calculation
  _cachedPages;
  _lastCurrentPage;
  _lastTotalPages;

  handlePrevious() {
    this._dispatchNavigateEvent(this.currentPage - 1);
  }

  handleNext() {
    this._dispatchNavigateEvent(this.currentPage + 1);
  }

  handlePageClick(event) {
    const page = parseInt(event.target.dataset.page, 10);
    if (page !== this.currentPage) {
      this._dispatchNavigateEvent(page);
    }
  }

  _dispatchNavigateEvent(page) {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { page },
        bubbles: true,
      })
    );
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get hasPreviousPage() {
    return this.currentPage > 1;
  }

  get hasNextPage() {
    return this.currentPage < this.totalPages;
  }

  get pages() {
    // Memoize expensive page calculation
    if (
      !this._cachedPages ||
      this._lastCurrentPage !== this.currentPage ||
      this._lastTotalPages !== this.totalPages
    ) {
      this._cachedPages = this._calculatePages();
      this._lastCurrentPage = this.currentPage;
      this._lastTotalPages = this.totalPages;
    }
    return this._cachedPages;
  }

  _calculatePages() {
    const pages = [];
    const totalPages = this.totalPages;

    if (totalPages <= MAX_VISIBLE_PAGES) {
      // Show all pages if total is within visible limit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(this._createPageObject(i));
      }
    } else {
      // Calculate visible page range
      const halfVisible = Math.floor(MAX_VISIBLE_PAGES / 2);
      let start = Math.max(1, this.currentPage - halfVisible);
      let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

      // Adjust start if we're near the end
      if (end - start + 1 < MAX_VISIBLE_PAGES) {
        start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(this._createPageObject(i));
      }
    }

    return pages;
  }

  _createPageObject(pageNumber) {
    const isActive = pageNumber === this.currentPage;
    return {
      number: pageNumber,
      isActive,
      class: isActive ? BUTTON_CLASSES.ACTIVE : BUTTON_CLASSES.INACTIVE,
      ariaLabel: isActive ? `Current page, page ${pageNumber}` : `Go to page ${pageNumber}`,
    };
  }

  get showPagination() {
    return this.totalPages > 1;
  }

  get paginationInfo() {
    if (this.totalItems === 0) {
      return 'No bikes found';
    }

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    const itemLabel = this.totalItems === 1 ? 'bike' : 'bikes';

    return `Showing ${start}-${end} of ${this.totalItems} ${itemLabel}`;
  }

  // Simplified - use hasPreviousPage/hasNextPage directly in template
  get isPreviousDisabled() {
    return !this.hasPreviousPage;
  }

  get isNextDisabled() {
    return !this.hasNextPage;
  }
}
