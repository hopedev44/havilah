/* global process */

// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//       useFindAndModify: false,
//     });
//     console.log("MongoDB connected.");
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse pending connection promise if one is already in flight
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // fail fast if DB unreachable
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected.");
    return cached.conn;
  } catch (error) {
    cached.promise = null; // reset so next call retries
    console.error(`DB Connection Error: ${error.message}`);
    throw error; // let the API route handle it gracefully
  }
};

export default connectDB;
