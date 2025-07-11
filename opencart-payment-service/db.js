const mongoose = require('mongoose');

const connectDB = async (uri) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectDB, closeDB };
