require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());


const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number
});
mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId', 'name price');
    res.json(orders);
  } catch (error) {
    console.log("___________________", error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }
    const order = new Order({ products });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
  });
}

module.exports = app;
