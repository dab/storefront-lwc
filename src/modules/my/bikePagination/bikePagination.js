import { LightningElement, api } from 'lwc';

export default class BikePagination extends LightningElement {
  @api currentPage = 1;
  @api totalItems = 0;
  @api itemsPerPage = 6;

  handlePrevious() {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { page: this.currentPage - 1 },
        bubbles: true,
      })
    );
  }

  handleNext() {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { page: this.currentPage + 1 },
        bubbles: true,
      })
    );
  }

  handlePageClick(event) {
    const page = parseInt(event.target.dataset.page, 10);
    if (page !== this.currentPage) {
      this.dispatchEvent(
        new CustomEvent('navigate', {
          detail: { page },
          bubbles: true,
        })
      );
    }
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
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push({
        number: i,
        isActive: i === this.currentPage,
        class:
          i === this.currentPage
            ? 'slds-button slds-button_brand'
            : 'slds-button slds-button_neutral',
      });
    }
    return pages;
  }

  get showPagination() {
    return this.totalPages > 1;
  }

  get paginationInfo() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} bikes`;
  }

  get isPreviousDisabled() {
    return !this.hasPreviousPage;
  }

  get isNextDisabled() {
    return !this.hasNextPage;
  }
}
