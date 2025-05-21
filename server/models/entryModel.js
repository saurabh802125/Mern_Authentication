import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to improve query performance
entrySchema.index({ user: 1, date: -1 });

export const Entry = mongoose.model("Entry", entrySchema);