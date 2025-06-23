import React, { useEffect, useState } from 'react';
import styles from './ProductManagementPage.module.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/products';

const initialForm = { name: '', description: '', price: '', stock: '', image: '' };

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        image: form.image,
      }),
    });
    setShowForm(false);
    setEditingId(null);
    fetchProducts();
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.container}>
        <h1 className={styles.title}>Products</h1>
        <button className={styles.addButton} onClick={handleAdd}>Add Product</button>
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p style={{ color: '#f66' }}>Error: {error}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px' }} />
                  </td>
                  <td>
                    <button className={styles.editButton} onClick={() => handleEdit(product)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(product._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <label>
                  Name:
                  <input name="name" value={form.name} onChange={handleInputChange} required />
                </label>
                <label>
                  Description:
                  <input name="description" value={form.description} onChange={handleInputChange} />
                </label>
                <label>
                  Price:
                  <input name="price" type="number" step="0.01" value={form.price} onChange={handleInputChange} required />
                </label>
                <label>
                  Stock:
                  <input name="stock" type="number" value={form.stock} onChange={handleInputChange} required />
                </label>
                <label>
                  Image URL:
                  <input name="image" value={form.image} onChange={handleInputChange} />
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

export default ProductsPage;
