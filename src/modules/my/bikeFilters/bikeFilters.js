import { LightningElement, api } from 'lwc';

// Constants
const PRICE_RANGE_MIN = 0;
const PRICE_RANGE_MAX = 10000;

export default class BikeFilters extends LightningElement {
  @api bikes = [];
  @api activeFilters = {
    type: '',
    brand: '',
    priceRange: { min: PRICE_RANGE_MIN, max: PRICE_RANGE_MAX },
  };
  @api showMobile = false;

  // Memoized computed values for performance
  _cachedTypeOptions;
  _cachedBrandOptions;
  _lastBikesLengthForTypes = 0;
  _lastBikesLengthForBrands = 0;

  handleFilterChange(event) {
    const { name, value } = event.target;

    const filterUpdate = this._createFilterUpdate(name, value);

    this.dispatchEvent(
      new CustomEvent('filterchange', {
        detail: filterUpdate,
        bubbles: true,
      })
    );
  }

  _createFilterUpdate(name, value) {
    if (name === 'minPrice' || name === 'maxPrice') {
      const defaultValue = name === 'minPrice' ? PRICE_RANGE_MIN : PRICE_RANGE_MAX;
      const priceValue = parseInt(value, 10) || defaultValue;

      return {
        filterType: 'priceRange',
        value: {
          ...this.activeFilters.priceRange,
          [name === 'minPrice' ? 'min' : 'max']: priceValue,
        },
      };
    }

    return {
      filterType: name,
      value,
    };
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

  get typeOptions() {
    // Memoize expensive array operations for performance
    if (!this._cachedTypeOptions || this._lastBikesLengthForTypes !== this.bikes.length) {
      const types = [...new Set(this.bikes.map(bike => bike.type))];
      this._cachedTypeOptions = [
        { label: 'All Types', value: '' },
        ...types.map(type => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
        })),
      ];
      this._lastBikesLengthForTypes = this.bikes.length;
    }

    // Add selection state without re-computing the entire array
    return this._cachedTypeOptions.map(option => ({
      ...option,
      selected: this.activeFilters.type === option.value,
    }));
  }

  get brandOptions() {
    // Memoize expensive array operations for performance
    if (!this._cachedBrandOptions || this._lastBikesLengthForBrands !== this.bikes.length) {
      const brands = [...new Set(this.bikes.map(bike => bike.brand))];
      this._cachedBrandOptions = [
        { label: 'All Brands', value: '' },
        ...brands.map(brand => ({
          label: brand,
          value: brand,
        })),
      ];
      this._lastBikesLengthForBrands = this.bikes.length;
    }

    // Add selection state without re-computing the entire array
    return this._cachedBrandOptions.map(option => ({
      ...option,
      selected: this.activeFilters.brand === option.value,
    }));
  }

  get hasActiveFilters() {
    return (
      this.activeFilters.type ||
      this.activeFilters.brand ||
      this.activeFilters.priceRange.min > PRICE_RANGE_MIN ||
      this.activeFilters.priceRange.max < PRICE_RANGE_MAX
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

    const { min, max } = this.activeFilters.priceRange;
    if (min > PRICE_RANGE_MIN || max < PRICE_RANGE_MAX) {
      filters.push({
        key: 'priceRange',
        label: `Price: $${min} - $${max}`,
        value: 'price',
      });
    }

    return filters;
  }
}
