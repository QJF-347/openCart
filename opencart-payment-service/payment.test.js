const request = require('supertest');
const app = require('./server');
const { connectDB, closeDB } = require('./db');

describe('Payment Service API', () => {
  beforeAll(async () => {
    await connectDB(process.env.DB_STRING_TEST || 'mongodb://127.0.0.1:27017/opencart_payment_test');
  });

  afterAll(async () => {
    await closeDB();
  });

  it('GET /payments should return empty array initially', async () => {
    const res = await request(app).get('/payments');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /payments should fail without required fields', async () => {
    const res = await request(app).post('/payments').send({});
    expect(res.statusCode).toBe(400);
  });
});
