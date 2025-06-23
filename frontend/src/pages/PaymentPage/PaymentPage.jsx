// src/pages/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './PaymentPage.module.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3002/payments';

const initialForm = { orderId: '', paymentMethod: 'credit_card', amount: '' };

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (payment) => {
    setForm({
      orderId: payment.orderId._id || payment.orderId,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
    });
    setEditingId(payment._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchPayments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: form.orderId,
        paymentMethod: form.paymentMethod,
        amount: parseFloat(form.amount),
      }),
    });
    setShowForm(false);
    setEditingId(null);
    fetchPayments();
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.container}>
        <h1 className={styles.title}>Payments</h1>
        <button className={styles.addButton} onClick={handleAdd}>Add Payment</button>
        {loading ? (
          <p>Loading payments...</p>
        ) : error ? (
          <p style={{ color: '#f66' }}>Error: {error}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment._id}</td>
                  <td>{payment.orderId._id || payment.orderId}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>${payment.amount.toFixed(2)}</td>
                  <td>{payment.status}</td>
                  <td>{new Date(payment.createdAt).toLocaleString()}</td>
                  <td>
                    <button className={styles.editButton} onClick={() => handleEdit(payment)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(payment._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{editingId ? 'Edit Payment' : 'Add Payment'}</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                  Order ID:
                  <input name="orderId" value={form.orderId} onChange={handleInputChange} required />
                </label>
                <label>
                  Payment Method:
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleInputChange}>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </label>
                <label>
                  Amount:
                  <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleInputChange} required />
                </label>
                <div className={styles.formActions}>
                  <button type="submit">{editingId ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
