const request = require('supertest');
const app = require('./server');
const { connectDB, closeDB } = require('./db');

describe('Order Service API', () => {
  beforeAll(async () => {
    await connectDB(process.env.DB_STRING_TEST || 'mongodb://127.0.0.1:27017/opencart_order_test');
  });

  afterAll(async () => {
    await closeDB();
  });

  it('GET /orders should return empty array initially', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /orders should create a new order', async () => {
    // First create a product to reference
    const productRes = await request(app).post('/orders').send({
      products: [
        { productId: '507f1f77bcf86cd799439011', quantity: 2 }
      ]
    });
    expect(productRes.statusCode).toBe(201);
  });
});
