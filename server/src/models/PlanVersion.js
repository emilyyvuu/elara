import mongoose from "mongoose";

const planVersionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    source: {
      type: String,
      enum: ["initial", "checkin", "profile_update"],
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    checkInSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    profileSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    diffFromPrevious: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    whyChanged: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

planVersionSchema.index({ userId: 1, createdAt: -1 });
planVersionSchema.index({ userId: 1, version: -1 }, { unique: true });

export default mongoose.model("PlanVersion", planVersionSchema);
