require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Initialize database connection
let db = null;

(async () => {
  try {
    db = await connectDB(process.env.DB_STRING || 'mongodb://mongo:27017/opencart');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON format', error: err.message });
  }
  next();
});

app.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const database = getDB();
    
    let filter = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Search by name or description if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await database.collection('products').find(filter).toArray();
    res.json(products);
  } catch (error) {
    console.log('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    const database = getDB();
    const product = {
      name,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image: image || '',
      category: category || 'Uncategorized',
      createdAt: new Date()
    };
    
    const result = await database.collection('products').insertOne(product);
    const savedProduct = await database.collection('products').findOne({ _id: result.insertedId });
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.log('Error creating product:', error);
    res.status(400).json({ message: 'Error adding product', error: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, category } = req.body;
    
    console.log('Update request for product:', id, 'with data:', req.body);
    
    const database = getDB();
    const updateData = {};
    
    // Only update fields that are provided and not undefined
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    
    console.log('Update data:', updateData);
    
    // Validate that we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const result = await database.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updatedProduct = await database.collection('products').findOne(
      { _id: new ObjectId(id) }
    );
    
    console.log('Product updated successfully:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for product:', id);
    
    const database = getDB();
    
    const result = await database.collection('products').deleteOne(
      { _id: new ObjectId(id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product deleted successfully:', id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: 'Error deleting product', error: error.message });
  }
});

// GET /categories - Get all unique categories
app.get('/categories', async (req, res) => {
  try {
    const database = getDB();
    const categories = await database.collection('products').distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
  });
}

module.exports = app;
