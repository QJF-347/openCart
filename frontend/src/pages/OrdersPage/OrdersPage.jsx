import React, { useEffect, useState } from 'react';
import styles from './OrdersPage.module.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/orders';
const PRODUCTS_API = 'http://localhost:3001/products';

const initialForm = { products: '', status: 'pending' };
 
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setAllProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductChange = (idx, field, value) => {
    const productsArr = form.productsArr || [{ productId: '', quantity: 1 }];
    productsArr[idx][field] = value;
    setForm({ ...form, productsArr });
  };

  const handleAddProductRow = () => {
    setForm({ ...form, productsArr: [...(form.productsArr || []), { productId: '', quantity: 1 }] });
  };

  const handleRemoveProductRow = (idx) => {
    const productsArr = (form.productsArr || []).filter((_, i) => i !== idx);
    setForm({ ...form, productsArr });
  };

  const handleAdd = () => {
    setForm({ ...initialForm, productsArr: [{ productId: '', quantity: 1 }] });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (order) => {
    setForm({
      products: '',
      status: order.status,
      productsArr: order.products.map(p => ({ 
        productId: p.productId._id || p.productId, 
        quantity: p.quantity 
      }))
    });
    setEditingId(order._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const products = (form.productsArr || []).map(p => ({ 
        productId: p.productId, 
        quantity: parseInt(p.quantity, 10) 
      }));
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          status: form.status,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to save order');
      
      setShowForm(false);
      setEditingId(null);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'paid': return '#10b981';
      case 'shipped': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '✅';
      case 'shipped': return '🚚';
      default: return '❓';
    }
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📦 Order Management</h1>
          <button className={styles.addButton} onClick={handleAdd}>
            ➕ Add New Order
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>❌ Error: {error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No orders found</h3>
            <p>Create your first order to get started!</p>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderId}>
                    <span className={styles.orderLabel}>Order ID:</span>
                    <span className={styles.orderValue}>{order._id.slice(-8)}</span>
                  </div>
                  <div className={styles.orderStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                </div>

                <div className={styles.orderDate}>
                  📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </div>

                <div className={styles.orderProducts}>
                  <h4>Products:</h4>
                  <div className={styles.productsList}>
                    {order.products.map(({ productId, quantity }, index) => (
                      <div key={index} className={styles.productItem}>
                        <img 
                          src={productId.image || `https://source.unsplash.com/50x50/?${encodeURIComponent(productId.name)}`} 
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

                <div className={styles.orderTotal}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>
                    ${order.totalAmount ? order.totalAmount.toFixed(2) : 
                      order.products.reduce((sum, { productId, quantity }) => 
                        sum + (productId.price * quantity), 0).toFixed(2)
                    }
                  </span>
                </div>

                <div className={styles.orderActions}>
                  <button 
                    className={styles.editButton} 
                    onClick={() => handleEdit(order)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => handleDelete(order._id)}
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
              <h2>{editingId ? '✏️ Edit Order' : '➕ Add New Order'}</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Products:
                    {(form.productsArr || []).map((row, idx) => (
                      <div key={idx} className={styles.productRow}>
                        <select 
                          value={row.productId} 
                          onChange={e => handleProductChange(idx, 'productId', e.target.value)} 
                          required
                          className={styles.productSelect}
                        >
                          <option value="">Select product</option>
                          {allProducts.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name} (${p.price})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          min="1" 
                          value={row.quantity} 
                          onChange={e => handleProductChange(idx, 'quantity', e.target.value)} 
                          required 
                          className={styles.quantityInput}
                          placeholder="Qty"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveProductRow(idx)} 
                          className={styles.removeProductBtn}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={handleAddProductRow} 
                      className={styles.addProductBtn}
                    >
                      ➕ Add Product
                    </button>
                  </label>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>
                    Status:
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleInputChange}
                      className={styles.statusSelect}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="paid">✅ Paid</option>
                      <option value="shipped">🚚 Shipped</option>
                    </select>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    {editingId ? '💾 Update Order' : '➕ Create Order'}
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

export default OrdersPage;
