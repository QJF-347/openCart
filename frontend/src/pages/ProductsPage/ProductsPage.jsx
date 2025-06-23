import React, { useEffect, useState } from 'react';
import styles from './ProductsPage.module.css';
import { useCart } from '../../components/CartContext';

const placeholder = 'https://via.placeholder.com/400x300?text=No+Image';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:3000/products');
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
  }, []);

  return (
    <div className={styles.shopBg}>
      <header className={styles.header}>
        <h1 className={styles.shopTitle}>Shop Products</h1>
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