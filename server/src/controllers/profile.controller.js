import User from "../models/User.js";

function safeUser(user) {
  const { password, ...rest } = user.toObject();
  return rest;
}

/**
 * Sanitize and validate profile update data.
 */
function sanitizeProfileUpdate(body) {
  const update = {};
  if (body.firstName !== undefined) update.firstName = body.firstName;
  if (body.lastName !== undefined) update.lastName = body.lastName;
  if (body.height !== undefined) update.height = body.height;
  if (body.weight !== undefined) update.weight = body.weight;
  if (body.goals !== undefined) update.goals = body.goals;
  if (body.dietaryNeeds !== undefined) update.dietaryNeeds = body.dietaryNeeds;
  if (body.equipment !== undefined) update.equipment = body.equipment;
  if (body.cycleTracking !== undefined) update.cycleTracking = body.cycleTracking;
  if (body.cycleDetails !== undefined) update.cycleDetails = body.cycleDetails;
  return update;
}

/**
 * Validate profile update fields.
 */
function validateProfileUpdate(update) {
  const errors = [];
  if (update.firstName != null && typeof update.firstName !== "string") {
    errors.push("firstName must be a string");
  }
  if (update.lastName != null && typeof update.lastName !== "string") {
    errors.push("lastName must be a string");
  }
  if (update.height != null && typeof update.height !== "number") {
    errors.push("height must be a number");
  }
  if (update.weight != null && typeof update.weight !== "number") {
    errors.push("weight must be a number");
  }
  if (update.goals != null && !Array.isArray(update.goals)) {
    errors.push("goals must be an array of strings");
  }
  if (update.dietaryNeeds != null && !Array.isArray(update.dietaryNeeds)) {
    errors.push("dietaryNeeds must be an array of strings");
  }
  if (update.equipment != null && !["Gym", "Home", "None"].includes(update.equipment)) {
    errors.push("equipment must be Gym, Home, or None");
  }
  if (update.cycleTracking != null && typeof update.cycleTracking !== "boolean") {
    errors.push("cycleTracking must be boolean");
  }
  if (update.cycleDetails != null && typeof update.cycleDetails !== "object") {
    errors.push("cycleDetails must be an object");
  }
  return errors;
}

/**
 * Handle fetching user profile.
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
}

/**
 * Handle updating user profile.
 */
export async function updateProfile(req, res) {
  try {
    const update = sanitizeProfileUpdate(req.body || {});
    const errors = validateProfileUpdate(update);
    if (errors.length) return res.status(400).json({ error: "Invalid profile data", errors });

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
