import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/paypilot");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};
