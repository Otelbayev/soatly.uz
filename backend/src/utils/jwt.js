import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // Server boshlanishida darrov xato berishini ta'minlash
  throw new Error(
    "JWT_ACCESS_SECRET va JWT_REFRESH_SECRET .env faylida bo'lishi shart",
  );
}

export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

// Refresh tokenni DBga saqlash uchun hash (xom token bazaga yozilmaydi)
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
