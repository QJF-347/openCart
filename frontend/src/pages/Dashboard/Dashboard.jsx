import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

const PRODUCTS_API = 'http://localhost:3001/products';
const ORDERS_API = 'http://localhost:3001/orders';
const PAYMENTS_API = 'http://localhost:3002/payments';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, paymentsRes] = await Promise.all([
        fetch(PRODUCTS_API),
        fetch(ORDERS_API),
        fetch(PAYMENTS_API)
      ]);

      if (!productsRes.ok || !ordersRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [products, orders, payments] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        paymentsRes.json()
      ]);

      const totalRevenue = payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const completedPayments = payments.filter(payment => payment.status === 'completed').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        totalRevenue,
        pendingOrders,
        completedPayments
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className={styles.statCard} style={{ '--card-color': color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <h3 className={styles.statTitle}>{title}</h3>
        <p className={styles.statValue}>{value}</p>
      </div>
      <div className={styles.statArrow}>→</div>
    </Link>
  );

  const QuickAction = ({ title, description, icon, link, color }) => (
    <Link to={link} className={styles.quickAction} style={{ '--action-color': color }}>
      <div className={styles.actionIcon}>{icon}</div>
      <div className={styles.actionContent}>
        <h4 className={styles.actionTitle}>{title}</h4>
        <p className={styles.actionDescription}>{description}</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>❌ Error: {error}</p>
            <button onClick={fetchStats} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullscreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Dashboard</h1>
          <p className={styles.subtitle}>Welcome to your OpenCart management console</p>
        </div>

        <div className={styles.statsGrid}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="📦"
            color="#3b82f6"
            link="/manage-products"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📋"
            color="#10b981"
            link="/orders"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            color="#fbbf24"
            link="/orders"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="#8b5cf6"
            link="/payments"
          />
          <StatCard
            title="Completed Payments"
            value={stats.completedPayments}
            icon="✅"
            color="#059669"
            link="/payments"
          />
          <StatCard
            title="Total Payments"
            value={stats.totalPayments}
            icon="💳"
            color="#ef4444"
            link="/payments"
          />
        </div>

        <div className={styles.sections}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🚀 Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              <QuickAction
                title="Add New Product"
                description="Create and manage your product catalog"
                icon="➕"
                link="/manage-products"
                color="#3b82f6"
              />
              <QuickAction
                title="View Orders"
                description="Monitor and manage customer orders"
                icon="📋"
                link="/orders"
                color="#10b981"
              />
              <QuickAction
                title="Process Payments"
                description="Handle payment transactions"
                icon="💳"
                link="/payments"
                color="#8b5cf6"
              />
              <QuickAction
                title="Shop Products"
                description="Browse your product catalog"
                icon="🛍️"
                link="/products"
                color="#f59e0b"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📈 Recent Activity</h2>
            <div className={styles.activityCard}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>📦</div>
                <div className={styles.activityContent}>
                  <h4>Product Management</h4>
                  <p>Manage your product catalog with ease</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>📋</div>
                <div className={styles.activityContent}>
                  <h4>Order Processing</h4>
                  <p>Track and fulfill customer orders</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>💳</div>
                <div className={styles.activityContent}>
                  <h4>Payment Processing</h4>
                  <p>Handle secure payment transactions</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>🛒</div>
                <div className={styles.activityContent}>
                  <h4>Shopping Cart</h4>
                  <p>Manage customer shopping experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerCard}>
            <h3>🎯 System Status</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                <span>Products Service</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                <span>Orders Service</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                <span>Payments Service</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                <span>Frontend Application</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 