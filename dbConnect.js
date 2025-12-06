const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
   cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
   const MONGO_URI = process.env.MONGO_URI;

   if (!MONGO_URI) {
      throw new Error(
         "Please define the MONGO_URI environment variable (set MONGO_URI in your deployment)."
      );
   }

   if (cached.conn) {
      return cached.conn;
   }

   if (!cached.promise) {
      cached.promise = mongoose
         .connect(MONGO_URI)
         .then((mongoose) => {
            console.log("MongoDB connected");
            return mongoose;
         })
         .catch((err) => {
            console.error("MongoDB connection error:", err);
            throw err;
         });
   }

   cached.conn = await cached.promise;
   return cached.conn;
}

module.exports = dbConnect;
