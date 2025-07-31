import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useCart } from './CartContext';

const Navbar = () => {
  const { totalCount } = useCart();
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <NavLink to="/" className={({isActive}) => isActive ? styles.active : ''}>Dashboard</NavLink>
        <NavLink to="/products" className={({isActive}) => isActive ? styles.active : ''}>Shop</NavLink>
        <NavLink to="/manage-products" className={({isActive}) => isActive ? styles.active : ''}>Manage Products</NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? styles.active : ''}>Orders</NavLink>
        {/* <NavLink to="/payments" className={({isActive}) => isActive ? styles.active : ''}>Payments</NavLink> */}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <NavLink to="/cart" className={({isActive}) => isActive ? styles.active : ''} style={{ position: 'relative', fontSize: '1.5rem', textDecoration: 'none' }}>
          🛒
          {totalCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-0.3rem',
              right: '-0.7rem',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              fontSize: '0.8rem',
              padding: '0.1rem 0.5rem',
              fontWeight: 700
            }}>{totalCount}</span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar; 