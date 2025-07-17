require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectDB, getDB } = require('./db');

const app = express();

// Configure CORS more explicitly
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
let db = null;

(async () => {
  try {
    db = await connectDB(process.env.DB_STRING || 'mongodb://mongo:27017/opencart');
    console.log('Payment Service: Connected to MongoDB');
  } catch (err) {
    console.error('Payment Service: Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    console.error('Request body:', req.body);
    console.error('Request headers:', req.headers);
    return res.status(400).json({ 
      message: 'Invalid JSON format', 
      error: err.message,
      receivedBody: req.body 
    });
  }
  next();
});

// Handle preflight requests
app.options('*', cors());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Payment service is working', timestamp: new Date().toISOString() });
});

// POST /payments - Process payment and update order status
app.post('/payments', async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { orderId, paymentMethod, amount, customerInfo } = req.body;
    
    console.log('Payment request received:', { orderId, paymentMethod, amount, customerInfo });
    console.log('Validation check:', {
      hasOrderId: !!orderId,
      hasPaymentMethod: !!paymentMethod,
      hasAmount: !!amount,
      orderIdType: typeof orderId,
      paymentMethodType: typeof paymentMethod,
      amountType: typeof amount
    });
    
    if (!orderId || !paymentMethod || !amount) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'orderId, paymentMethod, and amount are required',
        received: { orderId, paymentMethod, amount }
      });
    }

    const database = getDB();
    
    // Find the order
    const order = await database.collection('orders').findOne(
      { _id: new ObjectId(orderId) }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found:', { 
      orderId: order._id, 
      totalAmount: order.totalAmount, 
      productsCount: order.products?.length,
      status: order.status 
    });

    // Check if payment already exists for this order
    const existingPayment = await database.collection('payments').findOne({
      orderId: new ObjectId(orderId)
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this order' });
    }

    // Validate payment amount matches order total
    let orderTotal = 0;
    
    if (order.totalAmount) {
      orderTotal = order.totalAmount;
      console.log('Using order totalAmount:', orderTotal);
    } else if (order.products && Array.isArray(order.products)) {
      orderTotal = order.products.reduce((sum, product) => {
        const productPrice = parseFloat(product.price) || 0;
        const productQuantity = parseInt(product.quantity) || 0;
        const productTotal = productPrice * productQuantity;
        console.log('Product calculation:', { productPrice, productQuantity, productTotal });
        return sum + productTotal;
      }, 0);
      console.log('Calculated order total from products:', orderTotal);
    } else {
      return res.status(400).json({ 
        message: 'Order has invalid structure - missing products or totalAmount' 
      });
    }

    console.log('Payment validation:', { requestedAmount: amount, orderTotal, difference: Math.abs(parseFloat(amount) - orderTotal) });

    if (Math.abs(parseFloat(amount) - orderTotal) > 0.01) {
      return res.status(400).json({ 
        message: `Payment amount (${amount}) does not match order total (${orderTotal})` 
      });
    }

    // Create payment record
    const payment = {
      orderId: new ObjectId(orderId),
      paymentMethod,
      amount: parseFloat(amount),
      customerInfo: customerInfo || {},
      status: 'completed',
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await database.collection('payments').insertOne(payment);
    const savedPayment = await database.collection('payments').findOne({ _id: result.insertedId });

    // Update order status to paid
    await database.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: 'paid',
          updatedAt: new Date(),
          paymentId: savedPayment._id
        } 
      }
    );

    // Get updated order with populated products
    const updatedOrder = await database.collection('orders').findOne(
      { _id: new ObjectId(orderId) }
    );

    console.log('Payment processed successfully:', savedPayment._id);
    res.json({ 
      message: 'Payment successful', 
      payment: savedPayment, 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing error', error: error.message });
  }
});

// GET /payments - List all payments with order and product details
app.get('/payments', async (req, res) => {
  try {
    const database = getDB();
    const payments = await database.collection('payments').find({}).sort({ createdAt: -1 }).toArray();
    
    // Populate order and product details for each payment
    const populatedPayments = await Promise.all(payments.map(async (payment) => {
      try {
        const order = await database.collection('orders').findOne(
          { _id: payment.orderId }
        );
        
        if (order) {
          const populatedProducts = await Promise.all(order.products.map(async (product) => {
            try {
              const productDetails = await database.collection('products').findOne(
                { _id: new ObjectId(product.productId) },
                { projection: { name: 1, price: 1, image: 1 } }
              );
              return {
                ...product,
                productId: productDetails || { name: 'Product not found', price: 0, image: '' }
              };
            } catch (error) {
              console.error('Error populating product:', error);
              return {
                ...product,
                productId: { name: 'Product not found', price: 0, image: '' }
              };
            }
          }));
          
          return {
            ...payment,
            order: {
              ...order,
              products: populatedProducts
            }
          };
        }
        
        return {
          ...payment,
          order: null
        };
      } catch (error) {
        console.error('Error populating payment:', error);
        return {
          ...payment,
          order: null
        };
      }
    }));
    
    res.json(populatedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// GET /payments/:id - Get specific payment
app.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = getDB();
    
    const payment = await database.collection('payments').findOne(
      { _id: new ObjectId(id) }
    );
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
});

// PUT /payments/:id - Update payment status
app.put('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    
    console.log('Update request for payment:', id, 'with data:', req.body);
    
    const database = getDB();
    const updateData = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    
    console.log('Update data:', updateData);
    
    if (Object.keys(updateData).length === 1) { // only updatedAt present
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const result = await database.collection('payments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const updatedPayment = await database.collection('payments').findOne(
      { _id: new ObjectId(id) }
    );
    
    console.log('Payment updated successfully:', updatedPayment._id);
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({ message: 'Error updating payment', error: error.message });
  }
});

// DELETE /payments/:id - Delete payment
app.delete('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for payment:', id);
    const database = getDB();
    const result = await database.collection('payments').deleteOne(
      { _id: new ObjectId(id) }
    );
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    console.log('Payment deleted successfully:', id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(400).json({ message: 'Error deleting payment', error: error.message });
  }
});

const PORT = process.env.PORT || 3002;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
