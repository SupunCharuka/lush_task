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
    // proceed anyway; requests may fail if DB not connected
  }

  try {
    // serverless-http returns a function compatible with (req, res)
    return await handler(req, res);
  } catch (err) {
    // Catch unexpected errors and return a clean 500 with details in logs
    console.error('Unhandled error in serverless handler:', err && err.stack ? err.stack : err);
    try {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    } catch (e) {
      // If even writing response fails, just log
      console.error('Failed to send error response from serverless handler', e);
    }
    return;
  }
}
