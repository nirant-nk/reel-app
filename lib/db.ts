import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside @/.env"
  );
}

let cached = global.mongoose;

// if no cached, create one
if(!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
 
    const maxPoolSize= 10;

    // check if we have a connection already, then return it
    if (cached.conn) {
        return cached.conn;
    }

    // conn doesn't exist, check for promise (if conn in progress), create one
    if (!cached.promise) {
        const opts = {
        bufferCommands: false,
        maxPoolSize
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => mongoose.connection)
    }

    // wait for the promise to resolve and set conn, else throw error
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw new Error("Could not connect to database: "+(error instanceof Error ? error.message : String(error)));
    }
 
    return cached.conn;
}

export default connectToDatabase;