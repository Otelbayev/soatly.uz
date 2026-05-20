import crypto from "crypto";
import { signToken } from "../utils/jwt.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error(
    "ADMIN_USERNAME va ADMIN_PASSWORD .env faylida bo'lishi shart",
  );
}

// Timing attack'dan himoyalanish uchun doimiy vaqtda taqqoslash
const safeEqual = (a, b) => {
  const ab = Buffer.from(String(a), "utf8");
  const bb = Buffer.from(String(b), "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

class AuthController {
  login = (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username va password majburiy" });
    }

    const userOk = safeEqual(username, ADMIN_USERNAME);
    const passOk = safeEqual(password, ADMIN_PASSWORD);

    if (!userOk || !passOk) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }

    const token = signToken({
      sub: "admin",
      username: ADMIN_USERNAME,
      role: "admin",
    });

    res.json({
      accessToken: token,
      user: { username: ADMIN_USERNAME, role: "admin" },
    });
  };

  me = (req, res) => {
    res.json({
      username: req.user.username,
      role: req.user.role,
    });
  };
}

export default new AuthController();
