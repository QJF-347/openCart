import React, { useEffect, useState } from 'react';
import styles from './PaymentsPage.module.css';

const PAYMENTS_API = 'http://localhost:3002/payments';
const ORDERS_API = 'http://localhost:3001/orders';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    orderId: '',
    paymentMethod: 'credit_card',
    amount: '',
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(PAYMENTS_API);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDERS_API);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      // Filter only pending orders
      const pendingOrders = data.filter(order => order.status === 'pending');
      setOrders(pendingOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('customerInfo.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOrderSelect = (orderId) => {
    const selectedOrder = orders.find(order => order._id === orderId);
    if (selectedOrder) {
      setForm(prev => ({
        ...prev,
        orderId,
        amount: selectedOrder.totalAmount || 
          selectedOrder.products.reduce((sum, product) => 
            sum + (product.productId.price * product.quantity), 0
          ).toFixed(2),
        customerInfo: {
          name: selectedOrder.customerInfo?.name || '',
          email: selectedOrder.customerInfo?.email || '',
          phone: selectedOrder.customerInfo?.phone || ''
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      
      const result = await res.json();
      setShowForm(false);
      setForm({
        orderId: '',
        paymentMethod: 'credit_card',
        amount: '',
        customerInfo: { name: '', email: '', phone: '' }
      });
      fetchPayments();
      fetchOrders(); // Refresh orders to get updated statuses
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await fetch(`${PAYMENTS_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete payment');
      fetchPayments();
    } catch (err) {
      setError(err.message);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return '💳';
      case 'paypal': return '📱';
      case 'bank_transfer': return '🏦';
      case 'crypto': return '₿';
      default: return '💰';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Bank Transfer';
      case 'crypto': return 'Cryptocurrency';
      default: return method;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#fbbf24';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>💳 Payment Management</h1>
          <button 
            className={styles.addButton} 
            onClick={() => setShowForm(true)}
            disabled={orders.length === 0}
          >
            ➕ Process Payment
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading payments...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>❌ Error: {error}</p>
            <button onClick={() => setError('')} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💳</div>
            <h3>No payments found</h3>
            <p>Process payments for pending orders to get started!</p>
          </div>
        ) : (
          <div className={styles.paymentsGrid}>
            {payments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentId}>
                    <span className={styles.paymentLabel}>Payment ID:</span>
                    <span className={styles.paymentValue}>{payment._id.slice(-8)}</span>
                  </div>
                  <div className={styles.paymentStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {getStatusIcon(payment.status)} {payment.status}
                    </span>
                  </div>
                </div>

                <div className={styles.paymentDate}>
                  📅 {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                </div>

                <div className={styles.paymentMethod}>
                  <span className={styles.methodIcon}>
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </span>
                  <span className={styles.methodName}>
                    {getPaymentMethodName(payment.paymentMethod)}
                  </span>
                </div>

                <div className={styles.paymentAmount}>
                  <span className={styles.amountLabel}>Amount:</span>
                  <span className={styles.amountValue}>
                    ${payment.amount.toFixed(2)}
                  </span>
                </div>

                {payment.order && (
                  <div className={styles.orderInfo}>
                    <h4>Order Details:</h4>
                    <div className={styles.orderProducts}>
                      {payment.order.products.map(({ productId, quantity }, index) => (
                        <div key={index} className={styles.productItem}>
                          <img 
                            src={productId.image || `https://source.unsplash.com/40x40/?${encodeURIComponent(productId.name)}`} 
                            alt={productId.name}
                            className={styles.productImage}
                          />
                          <div className={styles.productInfo}>
                            <span className={styles.productName}>{productId.name}</span>
                            <span className={styles.productQuantity}>x{quantity}</span>
                          </div>
                          <span className={styles.productPrice}>
                            ${(productId.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.transactionId}>
                  <span className={styles.transactionLabel}>Transaction ID:</span>
                  <span className={styles.transactionValue}>{payment.transactionId}</span>
                </div>

                <div className={styles.paymentActions}>
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => handleDelete(payment._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>💳 Process Payment</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Select Order:
                    <select 
                      name="orderId" 
                      value={form.orderId} 
                      onChange={handleInputChange}
                      required
                      className={styles.orderSelect}
                    >
                      <option value="">Choose an order</option>
                      {orders.map(order => (
                        <option key={order._id} value={order._id}>
                          Order #{order._id.slice(-8)} - ${order.totalAmount ? order.totalAmount.toFixed(2) : 
                            order.products.reduce((sum, { productId, quantity }) => 
                              sum + (productId.price * quantity), 0
                            ).toFixed(2)
                          }
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Payment Method:
                    <select 
                      name="paymentMethod" 
                      value={form.paymentMethod} 
                      onChange={handleInputChange}
                      required
                      className={styles.paymentMethodSelect}
                    >
                      <option value="credit_card">💳 Credit Card</option>
                      <option value="paypal">📱 PayPal</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                      <option value="crypto">₿ Cryptocurrency</option>
                    </select>
                  </label>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Amount:
                    <input 
                      type="number" 
                      name="amount" 
                      value={form.amount} 
                      onChange={handleInputChange}
                      required 
                      step="0.01"
                      min="0"
                      className={styles.amountInput}
                      placeholder="0.00"
                    />
                  </label>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>Customer Information:</label>
                  <div className={styles.customerFields}>
                    <input 
                      type="text" 
                      name="customerInfo.name" 
                      value={form.customerInfo.name} 
                      onChange={handleInputChange}
                      className={styles.customerInput}
                      placeholder="Full Name"
                    />
                    <input 
                      type="email" 
                      name="customerInfo.email" 
                      value={form.customerInfo.email} 
                      onChange={handleInputChange}
                      className={styles.customerInput}
                      placeholder="Email Address"
                    />
                    <input 
                      type="tel" 
                      name="customerInfo.phone" 
                      value={form.customerInfo.phone} 
                      onChange={handleInputChange}
                      className={styles.customerInput}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    💳 Process Payment
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className={styles.cancelBtn}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage; 