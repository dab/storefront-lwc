import { LightningElement, api } from 'lwc';

export default class BikeFilters extends LightningElement {
  @api bikes = [];
  @api activeFilters = {
    type: '',
    brand: '',
    priceRange: { min: 0, max: 10000 },
  };
  @api showMobile = false;

  handleFilterChange(event) {
    const { name, value } = event.target;
    let filterUpdate;

    if (name === 'minPrice' || name === 'maxPrice') {
      const priceValue = parseInt(value, 10) || (name === 'minPrice' ? 0 : 10000);
      filterUpdate = {
        filterType: 'priceRange',
        value: {
          ...this.activeFilters.priceRange,
          [name === 'minPrice' ? 'min' : 'max']: priceValue,
        },
      };
    } else {
      filterUpdate = {
        filterType: name,
        value,
      };
    }

    this.dispatchEvent(
      new CustomEvent('filterchange', {
        detail: filterUpdate,
        bubbles: true,
      })
    );
  }

  handleClearFilter(event) {
    const filterType = event.target.dataset.filter;
    this.dispatchEvent(
      new CustomEvent('clearfilter', {
        detail: { filterType },
        bubbles: true,
      })
    );
  }

  handleClearAll() {
    this.dispatchEvent(
      new CustomEvent('clearallfilters', {
        bubbles: true,
      })
    );
  }

  get typeOptions() {
    const types = [...new Set(this.bikes.map(bike => bike.type))];
    return [
      { label: 'All Types', value: '', selected: this.activeFilters.type === '' },
      ...types.map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
        selected: this.activeFilters.type === type,
      })),
    ];
  }

  get brandOptions() {
    const brands = [...new Set(this.bikes.map(bike => bike.brand))];
    return [
      { label: 'All Brands', value: '', selected: this.activeFilters.brand === '' },
      ...brands.map(brand => ({
        label: brand,
        value: brand,
        selected: this.activeFilters.brand === brand,
      })),
    ];
  }

  get hasActiveFilters() {
    return (
      this.activeFilters.type ||
      this.activeFilters.brand ||
      this.activeFilters.priceRange.min > 0 ||
      this.activeFilters.priceRange.max < 10000
    );
  }

  get activeFiltersList() {
    const filters = [];
    if (this.activeFilters.type) {
      filters.push({
        key: 'type',
        label: `Type: ${this.activeFilters.type}`,
        value: this.activeFilters.type,
      });
    }
    if (this.activeFilters.brand) {
      filters.push({
        key: 'brand',
        label: `Brand: ${this.activeFilters.brand}`,
        value: this.activeFilters.brand,
      });
    }
    if (this.activeFilters.priceRange.min > 0 || this.activeFilters.priceRange.max < 10000) {
      filters.push({
        key: 'priceRange',
        label: `Price: $${this.activeFilters.priceRange.min} - $${this.activeFilters.priceRange.max}`,
        value: 'price',
      });
    }
    return filters;
  }

  get filterContainerClass() {
    return 'slds-grid slds-wrap slds-grid_vertical-align-center slds-m-bottom_medium';
  }
}
