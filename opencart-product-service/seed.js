require('dotenv').config();
const { connectDB, getDB, closeDB } = require('./db');

const dummyProducts = [
  { 
    name: 'Laptop Pro', 
    description: 'High-performance laptop with latest specs', 
    price: 129999, 
    stock: 15, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1513708927688-890fe41c2e99?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Wireless Headphones', 
    description: 'Premium noise-cancelling headphones', 
    price: 29999, 
    stock: 25, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Smartphone X', 
    description: 'Latest smartphone with advanced features', 
    price: 89999, 
    stock: 30, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Gaming Mouse', 
    description: 'High-precision gaming mouse with RGB', 
    price: 7999, 
    stock: 50, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Mechanical Keyboard', 
    description: 'Premium mechanical keyboard with tactile switches', 
    price: 14999, 
    stock: 20, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Nike Running Shoes', 
    description: 'Comfortable running shoes for all terrains', 
    price: 15999, 
    stock: 40, 
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Leather Jacket', 
    description: 'Classic leather jacket for men', 
    price: 24999, 
    stock: 15, 
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Designer Handbag', 
    description: 'Elegant designer handbag for women', 
    price: 34999, 
    stock: 10, 
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Coffee Maker', 
    description: 'Automatic coffee maker for home use', 
    price: 8999, 
    stock: 35, 
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Blender', 
    description: 'High-speed blender for smoothies and juices', 
    price: 5999, 
    stock: 25, 
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Yoga Mat', 
    description: 'Non-slip yoga mat for home workouts', 
    price: 2999, 
    stock: 60, 
    category: 'Sports & Fitness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Dumbbells Set', 
    description: 'Adjustable dumbbells set for strength training', 
    price: 19999, 
    stock: 20, 
    category: 'Sports & Fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Novel Collection', 
    description: 'Bestselling novels collection', 
    price: 3999, 
    stock: 100, 
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Cookbook', 
    description: 'Comprehensive cookbook with 500+ recipes', 
    price: 2499, 
    stock: 75, 
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  },
  { 
    name: 'Gaming Console', 
    description: 'Next-gen gaming console with controller', 
    price: 49999, 
    stock: 12, 
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date()
  }
];

async function seed() {
  try {
    const DB_STRING = process.env.DB_STRING || 'mongodb://localhost:27017/opencart';
    await connectDB(DB_STRING);
    
    const database = getDB();
    
    // Clear existing products
    await database.collection('products').deleteMany({});
    
    // Insert dummy products
    const result = await database.collection('products').insertMany(dummyProducts);
    
    console.log(`Successfully inserted ${result.insertedCount} products!`);
    console.log('Products added:');
    dummyProducts.forEach(product => {
      console.log(`- ${product.name}: KES ${product.price}`);
    });
    
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed(); 