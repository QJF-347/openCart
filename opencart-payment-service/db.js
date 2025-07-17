const { MongoClient } = require('mongodb');

let db = null;

const connectDB = async (uri) => {
  if (db) {
    return db;
  }
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  return db;
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (db) {
    await db.client.close();
    db = null;
  }
};

module.exports = { connectDB, getDB, closeDB };
