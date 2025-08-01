import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage/PaymentPage.jsx';
import PaymentsPage from './pages/PaymentsPage/PaymentsPage.jsx';
import ProductManagementPage from './pages/ProductManagementPage/ProductManagementPage.jsx';
import OrdersPage from './pages/OrdersPage/OrdersPage.jsx';
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/Login/Login.jsx';
import { CartProvider } from './components/CartContext';
import './App.css';

function App() {
  return (
    <Router>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/manage-products" element={<ProductManagementPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/cart" element={<CartPage />} /> 
      </Routes>
    </Router>
  );
}

export default function WrappedApp() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}
