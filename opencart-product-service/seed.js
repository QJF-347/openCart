require('dotenv').config();
const { connectDB, closeDB } = require('./db');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String
});

const Product = mongoose.model('Product', productSchema);

const dummyProducts = [
  { name: 'Sample Product 1', description: 'A great product', price: 19.99, stock: 10, image: 'https://images.unsplash.com/photo-1513708927688-890fe41c2e99?auto=format&fit=crop&w=400&q=80' },
  { name: 'Sample Product 2', description: 'Another great product', price: 29.99, stock: 5, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Sample Product 3', description: 'Yet another product', price: 9.99, stock: 20, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' }
];

async function seed() {
  const DB_STRING = process.env.DB_STRING || 'mongodb://mongo:27017/opencart';
  await connectDB(DB_STRING);
  await Product.deleteMany({});
  await Product.insertMany(dummyProducts);
  console.log('Dummy products inserted!');
  await closeDB();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}); 