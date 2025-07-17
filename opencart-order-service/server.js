require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize database connection
let db = null;

(async () => {
  try {
    db = await connectDB(process.env.MONGODB_URI);
    console.log('Order Service: Connected to MongoDB');
  } catch (err) {
    console.error('Order Service: Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

// GET /orders - Get all orders with populated product details
app.get('/orders', async (req, res) => {
  try {
    const database = getDB();
    const orders = await database.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    
    // Populate product details for each order
    const populatedOrders = await Promise.all(orders.map(async (order) => {
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
        ...order,
        products: populatedProducts,
        totalAmount: populatedProducts.reduce((sum, product) => {
          return sum + (product.productId.price * product.quantity);
        }, 0)
      };
    }));
    
    res.json(populatedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// POST /orders - Create a new order
app.post('/orders', async (req, res) => {
  try {
    const { products, customerInfo } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and must not be empty' });
    }
    
    const database = getDB();
    
    // Validate that all products exist
    const productIds = products.map(p => p.id || p.productId);
    const existingProducts = await database.collection('products').find({
      _id: { $in: productIds.map(id => new ObjectId(id)) }
    }).toArray();
    
    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products not found' });
    }
    
    const order = {
      products: products.map(product => ({
        productId: product.id || product.productId,
        quantity: parseInt(product.quantity || product.qty) || 1,
        price: parseFloat(product.price) || 0
      })),
      customerInfo: customerInfo || {},
      status: 'pending',
      totalAmount: products.reduce((sum, product) => {
        return sum + (parseFloat(product.price) * (parseInt(product.quantity || product.qty) || 1));
      }, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await database.collection('orders').insertOne(order);
    const savedOrder = await database.collection('orders').findOne({ _id: result.insertedId });
    
    console.log('Order created successfully:', savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT /orders/:id - Update an order
app.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { products, status, customerInfo } = req.body;
    
    const database = getDB();
    const updateData = { updatedAt: new Date() };
    
    if (products) {
      updateData.products = products.map(product => ({
        productId: product.productId,
        quantity: parseInt(product.quantity) || 1,
        price: parseFloat(product.price) || 0
      }));
      
      // Recalculate total amount
      updateData.totalAmount = products.reduce((sum, product) => {
        return sum + (parseFloat(product.price) * (parseInt(product.quantity) || 1));
      }, 0);
    }
    
    if (status) updateData.status = status;
    if (customerInfo) updateData.customerInfo = customerInfo;
    
    const result = await database.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const updatedOrder = await database.collection('orders').findOne(
      { _id: new ObjectId(id) }
    );
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// DELETE /orders/:id - Delete an order
app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = getDB();
    
    const result = await database.collection('orders').deleteOne(
      { _id: new ObjectId(id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(400).json({ message: 'Error deleting order', error: error.message });
  }
});

// GET /products - Get all products (for order management)
app.get('/products', async (req, res) => {
  try {
    const database = getDB();
    const products = await database.collection('products').find({}).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
  });
}

module.exports = app;
