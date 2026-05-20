import bcrypt from "bcrypt";
import db from "../config/database.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/jwt.js";

const REFRESH_DAYS = 7; // JWT_REFRESH_TTL bilan mos kelishi kerak

const buildTokensFor = async (user) => {
  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });
  const refreshHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshHash, expiresAt],
  );

  return { accessToken, refreshToken };
};

class AuthController {
  login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "username va password majburiy" });
      }

      const { rows } = await db.query(
        `SELECT id, username, password_hash, role, is_active
         FROM users WHERE username = $1`,
        [username],
      );
      const user = rows[0];

      // Bir xil javob — username/parolni ajratib bo'lmasligi uchun
      if (!user || !user.is_active) {
        return res
          .status(401)
          .json({ error: "Login yoki parol noto'g'ri" });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res
          .status(401)
          .json({ error: "Login yoki parol noto'g'ri" });
      }

      const tokens = await buildTokensFor(user);

      res.json({
        ...tokens,
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken majburiy" });
      }

      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch {
        return res.status(401).json({ error: "Yaroqsiz refresh token" });
      }

      const tokenHash = hashToken(refreshToken);

      // Bazadan tekshirish — bekor qilinmagan va muddati tugamagan bo'lishi kerak
      const { rows } = await db.query(
        `SELECT rt.id, rt.revoked_at, rt.expires_at, u.id AS user_id,
                u.username, u.role, u.is_active
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = $1`,
        [tokenHash],
      );
      const record = rows[0];

      if (!record) {
        return res.status(401).json({ error: "Token topilmadi" });
      }
      if (record.revoked_at) {
        // Qayta foydalanish urinishi — xavfsizlik uchun ushbu foydalanuvchining
        // barcha refresh tokenlarini bekor qilamiz
        await db.query(
          `UPDATE refresh_tokens SET revoked_at = NOW()
           WHERE user_id = $1 AND revoked_at IS NULL`,
          [record.user_id],
        );
        return res
          .status(401)
          .json({ error: "Token allaqachon bekor qilingan" });
      }
      if (new Date(record.expires_at) <= new Date()) {
        return res.status(401).json({ error: "Token muddati tugagan" });
      }
      if (!record.is_active) {
        return res.status(403).json({ error: "Foydalanuvchi faol emas" });
      }

      // Rotation — eski tokenni bekor qilamiz va yangi juftlik beramiz
      await db.query(
        `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
        [record.id],
      );

      const tokens = await buildTokensFor({
        id: record.user_id,
        username: record.username,
        role: record.role,
      });

      res.json(tokens);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken majburiy" });
      }
      const tokenHash = hashToken(refreshToken);
      await db.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE token_hash = $1 AND revoked_at IS NULL`,
        [tokenHash],
      );
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req, res, next) => {
    try {
      await db.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [req.user.id],
      );
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      const { rows } = await db.query(
        `SELECT id, username, role, is_active, created_at
         FROM users WHERE id = $1`,
        [req.user.id],
      );
      if (!rows.length) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "oldPassword va newPassword majburiy" });
      }
      if (String(newPassword).length < 8) {
        return res
          .status(400)
          .json({ error: "Yangi parol kamida 8 ta belgi" });
      }

      const { rows } = await db.query(
        `SELECT password_hash FROM users WHERE id = $1`,
        [req.user.id],
      );
      if (!rows.length) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const ok = await bcrypt.compare(oldPassword, rows[0].password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Eski parol noto'g'ri" });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await db.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW()
         WHERE id = $2`,
        [newHash, req.user.id],
      );

      // Parol o'zgargandan keyin barcha eski refresh tokenlarni bekor qilish
      await db.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [req.user.id],
      );

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}

export default new AuthController();
