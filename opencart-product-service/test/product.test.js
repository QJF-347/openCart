const request = require('supertest');
const app = require('../server');
const { connectDB, closeDB } = require('../db');

describe('Product Service API', () => {
  before(async () => {
    await connectDB(process.env.DB_STRING_TEST || 'mongodb://127.0.0.1:27017/opencart_test');
  });

  after(async () => {
    await closeDB();
  });

  it('GET /products should return empty array initially', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('POST /products should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 9.99,
      stock: 10
    };

    const res = await request(app).post('/products').send(productData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe(productData.name);
    expect(res.body.price).toBe(productData.price);
  });
});
