const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    }
    throw new Error('MONGO_URI is not configured');
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.warn('Attempting local MongoDB at mongodb://127.0.0.1:27017/e-comm');
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/e-comm');
      console.log(`Connected to local MongoDB: ${localConn.connection.host}`);
      return;
    } catch (localErr) {
      console.warn(`Local MongoDB connect failed: ${localErr.message}`);
      console.warn('Falling back to in-memory MongoDB.');

      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-memory MongoDB started: ${conn.connection.host}`);
    }
  }
};

module.exports = connectDB;
