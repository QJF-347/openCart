import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    setShowPopup(true);
    clearCart();
  };

  const closePopup = () => setShowPopup(false);

  return (
    <div className="cartPage">
      <h2>Shopping Cart</h2>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Order Placed!</h3>
            <p>Your order has been placed successfully.</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cartList">
            {cart.map((item) => (
              <li key={item.id} className="cartItem">
                <span>{item.name} (x{item.qty})</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cartActions">
            <span className="cartTotal">Total: ${total.toFixed(2)}</span>
            <button onClick={clearCart}>Clear Cart</button>
            <button className="checkoutBtn" onClick={handleCheckout}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
} 