# 🛒 OpenCart - Complete E-Commerce Solution

A modern, full-stack e-commerce application built with React, Node.js, and MongoDB. This application provides a complete solution for managing products, orders, and payments with a beautiful, responsive user interface.

## ✨ Features

### 🎯 Core Functionality
- **Product Management**: Add, edit, delete, and view products with images and pricing
- **Shopping Cart**: Add products to cart, manage quantities, and checkout
- **Order Management**: Create, track, and manage customer orders
- **Payment Processing**: Handle secure payment transactions
- **Dashboard**: Real-time statistics and quick access to all features

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and card-based layouts
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive**: Smooth animations, hover effects, and loading states
- **Accessible**: Proper focus states and keyboard navigation

### 🔧 Technical Features
- **Microservices Architecture**: Separate services for products, orders, and payments
- **Real-time Updates**: Live data synchronization across all components
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Professional loading indicators and spinners

## 🏗️ Architecture

### Frontend (React)
- **React 18** with modern hooks and functional components
- **React Router** for navigation and routing
- **CSS Modules** for scoped styling
- **Context API** for state management (cart functionality)

### Backend Services
- **Product Service** (Port 3000): Product CRUD operations
- **Order Service** (Port 3001): Order management and processing
- **Payment Service** (Port 3002): Payment processing and transactions

### Database
- **MongoDB** with separate collections for products, orders, and payments
- **Data Population**: Automatic seeding with sample products

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd openCart
   ```

2. **Start the application with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Product Service: http://localhost:3000/api
   - Order Service: http://localhost:3001
   - Payment Service: http://localhost:3002

### Manual Setup (Alternative)

1. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Product Service
   cd ../opencart-product-service
   npm install

   # Order Service
   cd ../opencart-order-service
   npm install

   # Payment Service
   cd ../opencart-payment-service
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env files in each service directory
   MONGODB_URI=mongodb://localhost:27017/opencart
   PORT=3000  # (respective port for each service)
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start services**
   ```bash
   # Terminal 1 - Product Service
   cd opencart-product-service
   npm start

   # Terminal 2 - Order Service
   cd opencart-order-service
   npm start

   # Terminal 3 - Payment Service
   cd opencart-payment-service
   npm start

   # Terminal 4 - Frontend
   cd frontend
   npm start
   ```

## 📱 Application Pages

### 🏠 Dashboard (`/`)
- Overview statistics (products, orders, payments, revenue)
- Quick action buttons for common tasks
- System status indicators
- Recent activity feed

### 🛍️ Shop (`/products`)
- Browse product catalog with images and prices
- Add products to shopping cart
- Responsive grid layout
- Product search and filtering

### 📦 Manage Products (`/manage-products`)
- Add new products with images and details
- Edit existing product information
- Delete products with confirmation
- Bulk operations support

### 📋 Orders (`/orders`)
- View all customer orders with status
- Create new orders manually
- Edit order details and status
- Delete orders with confirmation
- Order history and tracking

### 💳 Payments (`/payments`)
- Process payments for pending orders
- View payment history and transactions
- Multiple payment methods support
- Payment status tracking
- Transaction ID management

### 🛒 Shopping Cart (`/cart`)
- Review cart items and quantities
- Update product quantities
- Remove items from cart
- Checkout process
- Order confirmation

## 🔌 API Endpoints

### Product Service (Port 3000)
```
GET    /api/products          # Get all products
POST   /api/products          # Create new product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Order Service (Port 3001)
```
GET    /orders                # Get all orders
POST   /orders                # Create new order
PUT    /orders/:id            # Update order
DELETE /orders/:id            # Delete order
GET    /products              # Get products for order management
```

### Payment Service (Port 3002)
```
GET    /payments              # Get all payments
POST   /payments              # Process payment
PUT    /payments/:id          # Update payment
DELETE /payments/:id          # Delete payment
GET    /payments/:id          # Get specific payment
```

## 🎨 Design System

### Color Palette
- **Primary**: `#fbbf24` (Gold)
- **Success**: `#10b981` (Green)
- **Warning**: `#fbbf24` (Yellow)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)
- **Background**: `#0f172a` to `#1e293b` (Dark gradient)

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable fonts
- **Monospace**: For IDs and technical data

### Components
- **Cards**: Rounded corners, shadows, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Forms**: Clean inputs with focus states
- **Modals**: Backdrop blur, slide-in animations

## 🔧 Development

### Project Structure
```
opencart/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main application
├── opencart-product-service/  # Product management service
├── opencart-order-service/    # Order management service
├── opencart-payment-service/  # Payment processing service
└── docker-compose.yml        # Docker configuration
```

### Adding New Features
1. Create new components in `frontend/src/components/`
2. Add new pages in `frontend/src/pages/`
3. Update routing in `App.jsx`
4. Add navigation links in `Navbar.jsx`
5. Create corresponding API endpoints in services

### Styling Guidelines
- Use CSS Modules for component-specific styles
- Follow the established color palette
- Implement responsive design for all components
- Add hover effects and transitions for better UX

## 🚀 Deployment

### Docker Deployment
```bash
# Build and deploy with Docker Compose
docker-compose up -d --build

# Scale services if needed
docker-compose up -d --scale product-service=2
```

### Environment Variables
```bash
# Frontend
REACT_APP_API_URL=http://localhost:3000

# Services
MONGODB_URI=mongodb://mongo:27017/opencart
PORT=3000
NODE_ENV=production
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Product CRUD operations
- [ ] Shopping cart functionality
- [ ] Order creation and management
- [ ] Payment processing
- [ ] Responsive design on different screen sizes
- [ ] Error handling and loading states
- [ ] Navigation and routing

### API Testing
```bash
# Test product endpoints
curl http://localhost:3000/api/products

# Test order endpoints
curl http://localhost:3001/orders

# Test payment endpoints
curl http://localhost:3002/payments
```

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with fallbacks
- **Caching**: Browser caching for static assets
- **Code Splitting**: Separate bundles for different pages

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Loading times and user interactions
- **Database Monitoring**: Query performance and connection status

## 🔒 Security

### Security Features
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error messages without sensitive data
- **Data Sanitization**: Protection against XSS and injection attacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎉 Acknowledgments

- React team for the amazing framework
- MongoDB for the robust database
- Docker for containerization
- All contributors and users

---

**OpenCart** - Your complete e-commerce solution! 🛒✨
