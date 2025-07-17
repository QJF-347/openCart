import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQty);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    
    // Transform cart data to match backend expectations
    // Include tax in the product prices to match the total
    const transformedCart = cart.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: (item.price * 1.1) // Include tax in the price
    }));
    
    const orderData = { 
      products: transformedCart,
      customerInfo: {
        email: 'customer@example.com',
        name: 'John Doe'
      }
    };
    
    console.log('Sending order data:', orderData);
    
    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      console.log('Order created successfully:', result);
      console.log('Setting orderId to:', result._id);
      setOrderId(result._id);
      clearCart();
      setShowPopup(true);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => setShowPopup(false);

  const handlePayment = async () => {
    if (!orderId) {
      console.error('No orderId available');
      alert('No order ID available. Please try checking out again.');
      return;
    }
    
    try {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'credit_card',
        amount: total, // Use the total with tax
        customerInfo: {
          email: 'customer@example.com',
          name: 'John Doe'
        }
      };

      console.log('Sending payment data:', paymentData);
      console.log('orderId type:', typeof orderId, 'value:', orderId);
      console.log('amount type:', typeof total, 'value:', total);
      console.log('JSON stringified:', JSON.stringify(paymentData));

      const requestBody = JSON.stringify(paymentData);
      console.log('Request body length:', requestBody.length);
      console.log('Request body:', requestBody);

      const res = await fetch('http://localhost:3002/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody,
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payment response error:', res.status, errorText);
        throw new Error(`Payment failed: ${res.status} - ${errorText}`);
      }

      const result = await res.json();
      console.log('Payment successful:', result);
      alert('Payment processed successfully!');
      closePopup();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed: ' + err.message);
    }
  };

  return (
    <div className="cartPage">
      <div className="cartHeader">
        <h2>🛒 Shopping Cart</h2>
        <p className="cartSubtitle">Review your items and proceed to checkout</p>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popupIcon">✅</div>
            <h3>Order Placed Successfully!</h3>
            <p>Your order has been created and saved to the database.</p>
            <p className="orderId">Order ID: {orderId}</p>
            <div className="popupActions">
              <button onClick={handlePayment} className="paymentBtn">
                💳 Process Payment
              </button>
              <button onClick={closePopup} className="closeBtn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loadingState">
          <div className="spinner"></div>
          <p>Processing your order...</p>
        </div>
      ) : error ? (
        <div className="errorState">
          <p className="error">{error}</p>
          <button className="checkoutBtn" onClick={handleCheckout}>Try Again</button>
        </div>
      ) : cart.length === 0 ? (
        <div className="emptyCart">
          <div className="emptyCartIcon">🛍️</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
        </div>
      ) : (
        <>
          <div className="cartItems">
            {cart.map((item) => (
              <div key={item.id} className="cartItem">
                <div className="itemImage">
                  <img src={item.image || `https://source.unsplash.com/100x100/?${encodeURIComponent(item.name)}`} alt={item.name} />
                </div>
                <div className="itemDetails">
                  <h4 className="itemName">{item.name}</h4>
                  <p className="itemPrice">${item.price.toFixed(2)} each</p>
                </div>
                <div className="itemQuantity">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                    className="qtyBtn"
                  >
                    -
                  </button>
                  <span className="qtyValue">{item.qty}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                    className="qtyBtn"
                  >
                    +
                  </button>
                </div>
                <div className="itemTotal">
                  ${(item.price * item.qty).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="removeBtn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="cartSummary">
            <div className="summaryRow">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summaryRow">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summaryRow total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="cartActions">
            <button onClick={clearCart} className="clearBtn">
              🗑️ Clear Cart
            </button>
            <button className="checkoutBtn" onClick={handleCheckout}>
              �� Checkout (${(total).toFixed(2)})
            </button>
          </div>
        </>
      )}
    </div>
  );
} 