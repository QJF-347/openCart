import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import './CartPage.css';
// Removed: import { initiateSTKPush } from './mpesaStkTest.cjs';
// The M-Pesa logic is now handled by your backend.
import axios from 'axios'; // Import axios for making HTTP requests to your backend

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [showMpesaPopup, setShowMpesaPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [error, setError] = useState('');
  const [mpesaError, setMpesaError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(''); // State for M-Pesa phone number
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax; // Total amount to be paid

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

    // Transform cart items to match your order schema (assuming product ID and quantity)
    const transformedCart = cart.map(item => ({
      productId: item.id, // Assuming 'id' from cart item maps to 'productId' in your order schema
      quantity: item.qty,
      price: item.price // Send original price; backend will validate against order total
    }));

    const orderData = {
      products: transformedCart,
      totalAmount: total, // Send the calculated total amount
      customerInfo: {
        email: 'customer@example.com', // Replace with actual customer email
        name: 'John Doe' // Replace with actual customer name
      }
    };

    try {
      // Call your backend's orders endpoint to create the order
      const res = await fetch('http://localhost:3001/orders', { // Ensure this matches your backend's orders endpoint URL and port
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json(); // Assuming backend sends JSON error
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const result = await res.json();
      console.log('Order created successfully:', result);
      if (!result._id) {
        throw new Error('Order creation failed: No order ID returned');
      }
      // setOrderId(result.payment.orderId); // Assuming your /payments endpoint returns the orderId in result.payment.orderId
      setShowPopup(true); // Show order placed successfully popup
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowMpesaPopup(false);
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      setMpesaError('Please enter your M-Pesa phone number');
      return;
    }

    // Validate M-Pesa phone number format (starts with 254, followed by 9 digits)
    if (!/^254[17]\d{8}$/.test(phoneNumber)) { // Updated regex for 2547XXXXXXXX or 2541XXXXXXXX
      setMpesaError('Invalid M-Pesa number format. Must start with 254 followed by 9 digits (e.g., 254712345678)');
      return;
    }

    // if (!orderId) {
    //   console.error('No orderId available for M-Pesa payment');
    //   setMpesaError('No order ID available. Please try checking out again.');
    //   return;
    // }

    setMpesaLoading(true);
    setMpesaError('');

    try {
      // Call your backend's M-Pesa STK Push endpoint
      const response = await axios.post('http://localhost:3002/api/mpesa/stkpush', { // Ensure this matches your backend's M-Pesa endpoint URL and port
        // orderId: orderId,
        amount: total, // Send the total amount to the backend
        phoneNumber: phoneNumber,
        // customerInfo: { // Optional: send additional customer info
        //   email: 'customer@example.com',
        //   name: 'John Doe'
        // }
      });

      console.log('M-Pesa payment initiated by backend:', response.data);

      // Check M-Pesa response for success
      if (response.data && response.data.ResponseCode === '0') {
        alert('M-Pesa payment request sent! Please check your phone to complete the payment.');
        clearCart(); // Clear cart on successful initiation
        closePopup(); // Close all popups
      } else {
        // Handle M-Pesa specific errors returned from your backend
        setMpesaError(response.data.ResponseDescription || 'Failed to initiate M-Pesa payment. Please try again.');
        console.error('M-Pesa API returned an error:', response.data);
      }

    } catch (err) {
      console.error('M-Pesa payment error (frontend):', err);
      // Display error message from backend if available, otherwise a generic one
      setMpesaError(err.response?.data?.message || err.message || 'Failed to initiate M-Pesa payment. Network error or server issue.');
    } finally {
      setMpesaLoading(false);
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
              <button
                onClick={() => {
                  setShowPopup(false);
                  setShowMpesaPopup(true);
                }}
                className="paymentBtn mpesaBtn"
              >
                📱 Pay with M-Pesa
              </button>
              <button onClick={closePopup} className="closeBtn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMpesaPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popupIcon">📱</div>
            <h3>M-Pesa Payment</h3>
            <p>Enter your M-Pesa phone number to receive payment request</p>

            <div className="mpesaForm">
              <input
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mpesaInput"
              />
              {mpesaError && <p className="error">{mpesaError}</p>}
              <p className="mpesaNote">Format: 254 followed by your phone number (e.g., 254712345678)</p>
            </div>

            <div className="popupActions">
              <button
                onClick={handleMpesaPayment}
                className="paymentBtn"
                disabled={mpesaLoading}
              >
                {mpesaLoading ? 'Processing...' : 'Send Payment Request'}
              </button>
              <button onClick={closePopup} className="closeBtn">
                Cancel
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
              Checkout (${(total).toFixed(2)})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
