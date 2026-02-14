import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    energy: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    symptoms: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

checkInSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CheckIn", checkInSchema);
