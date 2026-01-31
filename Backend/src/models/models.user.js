import mongoose from "mongoose";

const overrideSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  riskScore: Number,
  decision: String
});

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  overrides: [overrideSchema],
  trustScore: {
    type: Number,
    default: 100
  },
  lastOverrideAt: {
    type: Date,
    default: null
  }
});


export default mongoose.model("User", userSchema);
