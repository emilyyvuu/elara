import jwt from "jsonwebtoken";

/**
 * Middleware to protect routes that require authentication.
 * It checks for a JWT token in cookies or Authorization header,
 * verifies it, and attaches the user ID to the request object.
 */
export function requireAuth(req, res, next) {
  const tokenFromCookie = req.cookies?.token;
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
