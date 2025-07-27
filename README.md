# Bicycle Store - Lightning Web Components

A professional bicycle store application built with Lightning Web Components (LWC) Open Source and Salesforce Lightning Design System (SLDS).

## Features

- 🚴‍♀️ **Product Catalog**: Browse bicycles with filtering, sorting, and pagination
- 🛒 **Shopping Cart**: Add items, manage quantities, and view totals
- 🎨 **Color Variants**: Select from different color options with dynamic images
- 📱 **Responsive Design**: Mobile-first design with SLDS components
- ⚡ **Lightning Fast**: Built with LWC for optimal performance

## Technology Stack

- **Framework**: Lightning Web Components (LWC) Open Source
- **Styling**: Salesforce Lightning Design System (SLDS)
- **Build Tool**: Rollup with LWC plugin
- **JavaScript**: ES2022 features (where supported by LWC)
- **Architecture**: Component-based with centralized state management

## Development

### Prerequisites

- Node.js 18 or higher
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/dab/storefront-lwc.git
cd storefront-lwc

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3001`

### Available Scripts

- `npm start` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Steps

1. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Set Source to "GitHub Actions"

2. **Push to Main Branch**:
   ```bash
   git push origin main
   ```

3. **Automatic Deployment**:
   - The workflow will automatically build and deploy your app
   - Your site will be available at: `https://[username].github.io/[repository-name]`


## Project Structure

```
src/
├── index.js                 # Application entry point
├── modules/my/
│   ├── app/                 # Main app component
│   ├── bikeStore/           # Store component with business logic
│   ├── bikeCard/            # Product card component
│   ├── bikeDetail/          # Product detail view
│   ├── bikeFilters/         # Filtering component
│   ├── bikePagination/      # Pagination component
│   ├── cartStore/           # Cart state management
│   └── cartSummary/         # Shopping cart component
└── assets/
    └── bikes.json           # Product data
```

## Key Features Implementation

### Component Architecture
- **Modular Design**: Each component handles specific functionality
- **Event Communication**: Custom events for component interaction
- **State Management**: Centralized cart store with localStorage persistence

### SLDS Integration
- **Synthetic Shadow DOM**: Configured for proper SLDS styling
- **Utility Classes**: Extensive use of SLDS utility classes
- **Responsive Grid**: SLDS grid system for layout

### Performance Optimizations
- **Efficient Rendering**: Component-based updates
- **Optimized Assets**: SLDS assets properly bundled
- **Clean Code**: ESLint and Prettier for code quality

## License

This project is licensed under the MIT License.