// lib/mongodb.js
import mongoose from "mongoose";

export async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) {
    return; // ถ้าการเชื่อมต่อแล้วจะไม่เชื่อมใหม่
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
    });
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}
