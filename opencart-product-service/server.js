require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String
});

const Product = mongoose.model('Product', productSchema);

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;
    const newProduct = new Product({ name, description, price, stock, image });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error adding product', error: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock, image },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
const DB_STRING = process.env.DB_STRING || 'mongodb://mongo:27017/opencart';

if (require.main === module) {
  connectDB(DB_STRING).then(() => {
    app.listen(PORT, () => {
      console.log(`Product service running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
}

module.exports = app;
