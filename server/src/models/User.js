import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

const cycleDetailsSchema = new mongoose.Schema(
  {
    lastPeriodDate: { type: Date },
    avgCycleLength: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    height: { type: Number },
    weight: { type: Number },
    goals: { type: [String], default: [] },
    dietaryNeeds: { type: [String], default: [] },
    equipment: { type: String, enum: ["Gym", "Home", "None"], default: "None" },
    cycleTracking: { type: Boolean, default: false },
    cycleDetails: { type: cycleDetailsSchema },
    currentPlan: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

/**
 * Hash the user's password before saving to the database.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
