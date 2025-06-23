require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());

// Define Product model for populate
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number
});
mongoose.model('Product', productSchema);

// Define Order model
const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Define Payment model
const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentMethod: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

// POST /payments - process payment and update order status
app.post('/payments', async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'orderId, paymentMethod, and amount are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'paid';
    await order.save();

    const payment = new Payment({ orderId, paymentMethod, amount, status: 'completed' });
    const savedPayment = await payment.save();

    res.json({ message: 'Payment successful', payment: savedPayment, order });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error', error: error.message });
  }
});

// GET /payments - list all payments with order and product details
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        populate: { path: 'products.productId', select: 'name price' }
      });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
