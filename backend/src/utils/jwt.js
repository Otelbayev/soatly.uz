import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TTL = process.env.JWT_TTL || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET .env faylida bo'lishi shart");
}

export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
