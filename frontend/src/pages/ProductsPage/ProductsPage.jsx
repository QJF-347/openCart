import React, { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css';
import { useCart } from '../../components/CartContext';

const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(['All', ...data]);
      } catch (err) {
        setCategories(['All']);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category or search changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let url = 'http://localhost:3000/products?';
        if (selectedCategory && selectedCategory !== 'All') {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (search) {
          url += `search=${encodeURIComponent(search)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, search]);

  return (
    <div className={styles.shopBg}>
      <header className={styles.header}>
        <h1 className={styles.shopTitle}>Shop Products</h1>
        <div className={styles.filterRow}>
          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>
      <main className={styles.gridWrap}>
        {loading ? (
          <p className={styles.loading}>Loading products...</p>
        ) : error ? (
          <p className={styles.error}>Error: {error}</p>
        ) : (
          <div className={styles.grid}>
            {products.map(({ _id, name, description, price, image }) => (
              <div key={_id} className={styles.card}>
                <div className={styles.imageWrap}>
                  <img src={image || `https://source.unsplash.com/400x300/?${encodeURIComponent(name)}` || placeholder} alt={name} />
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.productName}>{name}</h2>
                  <p className={styles.productDesc}>{description || 'No description available.'}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>Ksh {price.toFixed(2)}</span>
                    <button className={styles.cartBtn} onClick={() => addToCart({ id: _id, name, price })}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage; 