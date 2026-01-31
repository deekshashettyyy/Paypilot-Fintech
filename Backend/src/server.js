import dotenv from "dotenv";
dotenv.config();
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);


import { connectDB } from "./config/db.js";
connectDB();


import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`PayPilot backend running on port ${env.port}`);
});