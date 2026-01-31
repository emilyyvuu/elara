import jwt from "jsonwebtoken";
import User from "../models/User.js";

const TOKEN_TTL = "7d";

/**
 * Sign a JWT token for the given user ID.
 */
function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment.");
  }
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/**
 * Options for setting the authentication cookie.
 */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

/**
 * Return a user object without sensitive fields.
 */
function safeUser(user) {
  const { password, ...rest } = user.toObject();
  return rest;
}

/**
 * Handle user signup.
 */
export async function signup(req, res) {
  try {
    const { email, password, ...profile } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const user = await User.create({ email, password, ...profile });
    const token = signToken(user._id.toString());
    res.cookie("token", token, cookieOptions());
    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Signup failed" });
  }
}

/**
 * Handle user login.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const ok = user && (await user.comparePassword(password));
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id.toString());
    res.cookie("token", token, cookieOptions());
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Handle user logout.
 */
export function logout(req, res) {
  res.clearCookie("token", cookieOptions());
  return res.json({ ok: true });
}

/**
 * Get the currently authenticated user's info.
 */
export async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load user" });
  }
}
