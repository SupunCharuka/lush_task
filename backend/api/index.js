import serverless from 'serverless-http';
import mongoose from 'mongoose';
import app from '../app.js';
import { mongoDBURL } from '../config.js';

// Simple mongoose connection caching for serverless
const cached = global.__mongoose_cache || (global.__mongoose_cache = { conn: null, promise: null });

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoDBURL).then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const handler = serverless(app);

export default async function (req, res) {
  try {
    await connectToDatabase();
  } catch (e) {
    console.error('MongoDB connection error in serverless handler', e);
    // proceed anyway; requests will likely fail if DB not connected
  }
  return handler(req, res);
}
