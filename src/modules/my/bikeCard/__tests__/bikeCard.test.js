import { createElement } from 'lwc';
import BikeCard from 'my/bikeCard';

describe('my-bike-card', () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe('Component Initialization', () => {
    it('renders with bike data', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      const mockBike = {
        id: 1,
        name: 'Mountain Bike',
        price: 999.99,
        category: 'mountain',
        inStock: true,
        colors: ['red', 'blue', 'black'],
        image: 'bike.jpg',
      };

      element.bike = mockBike;
      document.body.appendChild(element);

      const bikeName = element.shadowRoot.querySelector('h3');
      expect(bikeName.textContent.trim()).toBe('Mountain Bike');
    });

    it('initializes with first color selected', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      const mockBike = {
        id: 1,
        colors: ['red', 'blue', 'black'],
      };

      element.bike = mockBike;
      document.body.appendChild(element);

      return Promise.resolve().then(() => {
        const colorSelect = element.shadowRoot.querySelector('select');
        expect(colorSelect.value).toBe('red');
      });
    });
  });

  describe('Price Formatting', () => {
    it('formats price correctly', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      const mockBike = {
        id: 1,
        name: 'Test Bike',
        price: 1234.56,
      };

      element.bike = mockBike;
      document.body.appendChild(element);

      const priceElement = element.shadowRoot.querySelector('.slds-text-heading_medium');
      expect(priceElement.textContent.trim()).toBe('$1,234.56');
    });
  });

  describe('Stock Status', () => {
    it('shows "In Stock" when bike is available', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 1,
        inStock: true,
      };
      document.body.appendChild(element);

      const badge = element.shadowRoot.querySelector('.slds-badge');
      expect(badge.textContent.trim()).toBe('In Stock');
      expect(badge.classList.contains('slds-theme_success')).toBe(true);
    });

    it('shows "Out of Stock" when bike is unavailable', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 1,
        inStock: false,
      };
      document.body.appendChild(element);

      const badge = element.shadowRoot.querySelector('.slds-badge');
      expect(badge.textContent.trim()).toBe('Out of Stock');
      expect(badge.classList.contains('slds-theme_error')).toBe(true);
    });

    it('disables add to cart button when out of stock', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 1,
        inStock: false,
      };
      document.body.appendChild(element);

      const addButton = element.shadowRoot.querySelector('button:disabled');
      expect(addButton).toBeTruthy();
      expect(addButton.textContent.trim()).toBe('Out of Stock');
    });
  });

  describe('User Interactions', () => {
    it('dispatches add_to_cart event with correct details', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      const mockBike = {
        id: 123,
        inStock: true,
        colors: ['red', 'blue'],
      };

      element.bike = mockBike;
      document.body.appendChild(element);

      const handler = jest.fn();
      element.addEventListener('add_to_cart', handler);

      const addButton = element.shadowRoot.querySelector('button:not(:disabled)');
      addButton.click();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toEqual({
        bikeId: 123,
        selectedColor: 'red',
        quantity: 1,
      });
    });

    it('dispatches view_product_detail event on card click', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 456,
      };
      document.body.appendChild(element);

      const handler = jest.fn();
      element.addEventListener('view_product_detail', handler);

      const card = element.shadowRoot.querySelector('[role="button"]');
      card.click();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toEqual({
        bikeId: 456,
      });
    });

    it('changes color selection', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 1,
        colors: ['red', 'blue', 'black'],
        inStock: true,
      };
      document.body.appendChild(element);

      const colorSelect = element.shadowRoot.querySelector('select');
      colorSelect.value = 'blue';
      colorSelect.dispatchEvent(new CustomEvent('change'));

      return Promise.resolve().then(() => {
        const handler = jest.fn();
        element.addEventListener('add_to_cart', handler);

        const addButton = element.shadowRoot.querySelector('button:not(:disabled)');
        addButton.click();

        expect(handler.mock.calls[0][0].detail.selectedColor).toBe('blue');
      });
    });
  });

  describe('Accessibility', () => {
    it('handles Enter key for card navigation', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = { id: 1 };
      document.body.appendChild(element);

      const handler = jest.fn();
      element.addEventListener('view_product_detail', handler);

      const card = element.shadowRoot.querySelector('[role="button"]');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(handler).toHaveBeenCalled();
    });

    it('handles Space key for card navigation', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = { id: 1 };
      document.body.appendChild(element);

      const handler = jest.fn();
      element.addEventListener('view_product_detail', handler);

      const card = element.shadowRoot.querySelector('[role="button"]');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Image Handling', () => {
    it('shows color-specific image when available', () => {
      const element = createElement('my-bike-card', {
        is: BikeCard,
      });

      element.bike = {
        id: 1,
        colors: ['red', 'blue'],
        images: {
          red: 'red-bike.jpg',
          blue: 'blue-bike.jpg',
        },
      };
      document.body.appendChild(element);

      const img = element.shadowRoot.querySelector('img');
      expect(img.src).toContain('red-bike.jpg');
      const colorSelect = element.shadowRoot.querySelector('select');
      colorSelect.value = 'blue';
      colorSelect.dispatchEvent(new CustomEvent('change'));

      return Promise.resolve().then(() => {
        expect(img.src).toContain('blue-bike.jpg');
      });
    });
  });
});
