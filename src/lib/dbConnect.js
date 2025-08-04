import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adoptme';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, uri: null };
}

export async function dbConnect() {
  const currentURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adoptme';
  
  // If URI changed, clear the cache
  if (cached.uri && cached.uri !== currentURI) {
    if (cached.conn) {
      await cached.conn.disconnect();
    }
    cached.conn = null;
    cached.promise = null;
  }
  
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.uri = currentURI;
    cached.promise = mongoose.connect(currentURI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
