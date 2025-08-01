// server.js
require('dotenv').config(); // Load environment variables from .env (still useful for DB_STRING, PORT, etc.)
const express = require('express');
const axios = require('axios'); // For making HTTP requests to M-Pesa API
const cors = require('cors');
const { ObjectId } = require('mongodb'); // For MongoDB ObjectId
const { connectDB, getDB } = require('./db'); // Your database connection module

const app = express();

// --- Middleware ---
// Configure CORS explicitly
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000', // Your frontend URL from .env or default
    'http://localhost:5173',
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5173/cart'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
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
    process.exit(1); // Exit if DB connection fails
  }
})();

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    console.error('Request body (truncated for log):', JSON.stringify(req.body).substring(0, 200));
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

const mpesaConfig = {
  consumerKey: "6U8UmjMUtn7MgUs2FiFEU9wG0GhrSNXSXMaXw5ikxnIzzlaG",
  consumerSecret: "PaM9cBZpk9MC2NEFXQChRmMvS21mebZUMMpRZYdVxUVmrApdkEwvXImJVV8vhxcG",
  shortcode: "174379",
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  callbackURL: "https://webhook.site/#!/view/75cb3e81-404b-4c4d-bd45-ae386b91333e" // This must be a publicly accessible URL for your backend
};

// --- Test endpoint ---
app.get('/test', (req, res) => {
  res.json({ message: 'Payment service is working', timestamp: new Date().toISOString() });
});

app.post('/orders', async (req, res) => {
  try {
    const { products, customerInfo } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and must not be empty' });
    }

    const database = getDB();

    // Validate that all products exist (optional, but good practice)
    const productIds = products.map(p => p.id || p.productId);
    const existingProducts = await database.collection('products').find({
      _id: { $in: productIds.map(id => new ObjectId(id)) }
    }).toArray();

    if (existingProducts.length !== productIds.length) {
      // You might want to return which specific products were not found for better debugging
      return res.status(400).json({ message: 'One or more products not found in the database.' });
    }

    // Construct the order object
    const order = {
      products: products.map(product => ({
        productId: new ObjectId(product.id || product.productId), // Ensure productId is stored as ObjectId
        quantity: parseInt(product.quantity || product.qty) || 1,
        price: parseFloat(product.price) || 0
      })),
      customerInfo: customerInfo || {},
      status: 'pending', // Initial status for a newly created order
      totalAmount: products.reduce((sum, product) => {
        return sum + (parseFloat(product.price) * (parseInt(product.quantity || product.qty) || 1));
      }, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.collection('orders').insertOne(order);
    const savedOrder = await database.collection('orders').findOne({ _id: result.insertedId });

    console.log('Order created successfully:', savedOrder._id);
    res.status(201).json(savedOrder); // Return the full saved order, including its _id

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message }); // Changed to 500 for server errors
  }
});

app.post('/api/mpesa/stkpush', async (req, res) => {
  const { amount, phoneNumber } = req.body; // Removed orderId from destructuring

  // Input validation
  if (!amount || !phoneNumber) {
    return res.status(400).json({ message: "Amount and phoneNumber are required." });
  }

  // Basic phone number format validation (M-Pesa expects 2547XXXXXXXX)
  if (!phoneNumber.startsWith('254') || phoneNumber.length !== 12 || isNaN(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format. Must be 12 digits starting with '254'." });
  }

  // All order and orderId related logic has been removed as requested.
  // This endpoint now solely focuses on initiating the STK push with M-Pesa.

  try {
    // 1. Get M-Pesa Access Token
    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        auth: {
          username: mpesaConfig.consumerKey,
          password: mpesaConfig.consumerSecret
        }
      }
    );
    const accessToken = authResponse.data.access_token;
    if (!accessToken) {
      throw new Error("Failed to retrieve M-Pesa access token.");
    }
    console.log("M-Pesa Access Token obtained.");

    // 2. Generate the M-Pesa Password
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const dataToEncode = mpesaConfig.shortcode + mpesaConfig.passkey + timestamp;
    const encodedPassword = Buffer.from(dataToEncode).toString('base64');
    console.log(`M-Pesa Password generated for timestamp: ${timestamp}`);

    // 3. Prepare the STK Push Request Payload
    const payload = {
      "BusinessShortCode": mpesaConfig.shortcode,
      "Password": encodedPassword,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": Number(amount),
      "PartyA": phoneNumber,
      "PartyB": mpesaConfig.shortcode,
      "PhoneNumber": phoneNumber,
      "CallBackURL": mpesaConfig.callbackURL,
      "AccountReference": `GENERIC_PAYMENT_${Date.now()}`, // Generic reference
      "TransactionDesc": `Generic Payment` // Generic description
    };

    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };

    // 4. Make the STK Push Request to Safaricom
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers }
    );

    console.log("STK Push request sent. M-Pesa response:", stkResponse.data);


    res.status(200).json(stkResponse.data); // Send M-Pesa response to frontend

  } catch (error) {
    console.error("Error during M-Pesa STK Push initiation:");
    if (error.response) {
      console.error("M-Pesa API Error Data:", error.response.data);
      res.status(error.response.status || 500).json({
        message: "Failed to initiate STK Push with M-Pesa.",
        error: error.response.data
      });
    } else if (error.request) {
      console.error("No response received from M-Pesa API:", error.message);
      res.status(500).json({
        message: "No response from M-Pesa API. Check network or API availability.",
        error: error.message
      });
    } else {
      console.error("Error setting up M-Pesa API request:", error.message);
      res.status(500).json({
        message: "Internal server error during STK Push setup.",
        error: error.message
      });
    }
  }
});

// --- M-Pesa Callback Endpoint (Simplified) ---
// This endpoint receives transaction status updates from M-Pesa.
// It now only logs the callback and sends a 200 OK.
app.post('/api/mpesa/callback', async (req, res) => {
    console.log("--- M-Pesa Callback Received ---");
    console.log(JSON.stringify(req.body, null, 2)); // Log full callback body

    // All payment and order record update logic has been removed as requested.
    // This endpoint no longer interacts with the database.

    const callbackData = req.body.Body && req.body.Body.stkCallback;

    if (callbackData) {
        const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = callbackData;

        // You can still log these details for debugging purposes
        console.log(`M-Pesa Callback - ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}, CheckoutRequestID: ${CheckoutRequestID}`);
        if (CallbackMetadata && CallbackMetadata.Item && Array.isArray(CallbackMetadata.Item)) {
            const mpesaReceiptNumber = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const transactionAmount = CallbackMetadata.Item.find(item => item.Name === 'Amount')?.Value;
            const transactionPhoneNumber = CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber')?.Value;
            console.log(`M-Pesa Callback - Receipt: ${mpesaReceiptNumber}, Amount: ${transactionAmount}, Phone: ${transactionPhoneNumber}`);
        }
    } else {
        console.warn("M-Pesa callback received, but 'stkCallback' data is missing or malformed.");
    }

    // Always respond with a 200 OK to M-Pesa to acknowledge receipt of the callback.
    // If you don't, M-Pesa might retry sending the callback.
    res.status(200).send('Callback received successfully');
});


// --- POST /payments - Process payment and update order status (Generic) ---
// This endpoint can be used for other payment methods or to initially create a pending payment record.
app.post('/payments', async (req, res) => {
  try {
    console.log('Raw request body for /payments:', req.body);

    const { orderId, paymentMethod, amount, customerInfo, transactionId } = req.body;

    if (!orderId || !paymentMethod || !amount) {
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

    // Check if payment already exists for this order for this method (to prevent duplicates)
    const existingPayment = await database.collection('payments').findOne({
      orderId: new ObjectId(orderId),
      paymentMethod: paymentMethod,
      // For M-Pesa, you'd check for status 'completed' or 'pending' with CheckoutRequestID
    });

    if (existingPayment && paymentMethod !== 'M-Pesa') { // Allow re-initiation for M-Pesa via /api/mpesa/stkpush
      return res.status(400).json({ message: 'Payment already exists for this order and method.' });
    }

    // Validate payment amount matches order total
    let orderTotal = 0;
    if (order.totalAmount) {
      orderTotal = order.totalAmount;
    } else if (order.products && Array.isArray(order.products)) {
      orderTotal = order.products.reduce((sum, product) => {
        const productPrice = parseFloat(product.price) || 0;
        const productQuantity = parseInt(product.quantity) || 0;
        return sum + (productPrice * productQuantity);
      }, 0);
    } else {
      return res.status(400).json({
        message: 'Order has invalid structure - missing products or totalAmount'
      });
    }

    if (Math.abs(parseFloat(amount) - orderTotal) > 0.01) {
      return res.status(400).json({
        message: `Payment amount (${amount}) does not match order total (${orderTotal})`
      });
    }

    // Determine initial status based on payment method
    // For M-Pesa, the actual completion comes from the callback.
    const initialStatus = (paymentMethod === 'M-Pesa') ? 'pending' : 'completed';

    // Create payment record
    const payment = {
      orderId: new ObjectId(orderId),
      paymentMethod,
      amount: parseFloat(amount),
      customerInfo: customerInfo || {},
      status: initialStatus,
      transactionId: transactionId || (initialStatus === 'completed' ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.collection('payments').insertOne(payment);
    const savedPayment = await database.collection('payments').findOne({ _id: result.insertedId });

    // Update order status only if payment is immediately completed (not for M-Pesa initiated here)
    if (initialStatus === 'completed') {
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
    }
    // For M-Pesa, the order status update happens in the /api/mpesa/callback endpoint

    console.log('Payment record created successfully:', savedPayment._id);
    res.json({
      message: 'Payment record created',
      payment: savedPayment,
      orderStatus: initialStatus === 'completed' ? 'paid' : order.status // Reflect current order status
    });
  } catch (error) {
    console.error('Payment processing error in /payments endpoint:', error);
    res.status(500).json({ message: 'Payment processing error', error: error.message });
  }
});

// --- GET /payments - List all payments with order and product details ---
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

// --- GET /payments/:id - Get specific payment ---
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

// --- PUT /payments/:id - Update payment status ---
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

// --- DELETE /payments/:id - Delete payment ---
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
