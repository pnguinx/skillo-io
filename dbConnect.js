const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
   cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
   const MONGO_URI = process.env.MONGO_URI;

   if (!MONGO_URI) {
      const err = new Error(
         "Please define the MONGO_URI environment variable (set MONGO_URI in your deployment)."
      );
      console.error(err.message);
      throw err;
   }

   if (cached.conn) {
      return cached.conn;
   }

   // Provide sensible mongoose options and retry logic for flaky network/startup issues
   const mongooseOptions = {
      // useUnifiedTopology and useNewUrlParser are defaults in newer mongoose versions,
      // but keeping options explicit helps readability
      serverSelectionTimeoutMS: 10000, // 10s
      socketTimeoutMS: 45000,
   };

   const maxRetries = 3;
   let attempt = 0;

   const connectWithRetry = async () => {
      attempt += 1;
      try {
         const conn = await mongoose.connect(MONGO_URI, mongooseOptions);
         console.log("MongoDB connected");
         return conn;
      } catch (err) {
         console.error(`MongoDB connection error (attempt ${attempt}):`, err.message || err);
         if (attempt < maxRetries) {
            const delay = 1000 * Math.pow(2, attempt); // exponential backoff
            console.log(`Retrying MongoDB connection in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            return connectWithRetry();
         }
         // After retries are exhausted, include actionable advice
         console.error("Failed to connect to MongoDB after multiple attempts.");
         console.error(
            "Common causes: incorrect MONGO_URI, network restrictions, or Atlas IP whitelist."
         );
         console.error(
            "If using MongoDB Atlas, ensure your deployment's outgoing IP is allowed or use 0.0.0.0/0 for testing: https://www.mongodb.com/docs/atlas/security-whitelist/"
         );
         throw err;
      }
   };

   if (!cached.promise) {
      cached.promise = connectWithRetry();
   }

   cached.conn = await cached.promise;
   return cached.conn;
}

module.exports = dbConnect;
