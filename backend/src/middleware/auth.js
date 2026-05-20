import { verifyAccessToken } from "../utils/jwt.js";

const extractToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token muddati tugagan" });
    }
    return res.status(401).json({ error: "Yaroqsiz token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Ruxsat etilmagan" });
  }
  next();
};

export const requireAdmin = requireRole("admin");
