import db from "../config/database.js";
import { deleteFile } from "../utils/fileRemover.js";

class BrandController {
  async getAll(req, res, next) {
    try {
      const { rows } = await db.query(
        "SELECT id, slug, name_uz, name_ru, icon FROM brands ORDER BY name_uz ASC",
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
  async getBySlug(req, res, next) {
    try {
      const { rows } = await db.query(
        "SELECT id, slug, name_uz, name_ru, icon FROM brands WHERE slug=$1",
        [req.params.slug],
      );
      if (!rows.length)
        return res.status(404).json({ error: "Brand not found" });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      const { slug, name_uz, name_ru } = req.body;
      if (!slug || !name_uz)
        return res.status(400).json({ error: "slug and name_uz required" });

      // Agar rasm yuklangan bo'lsa yo'lini saqlaymiz, bo'lmasa bo'sh string
      const iconPath = req.file ? `/uploads/brands/${req.file.filename}` : "";

      const { rows } = await db.query(
        `INSERT INTO brands (slug, name_uz, name_ru, icon)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [slug, name_uz, name_ru || "", iconPath],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { slug, name_uz, name_ru } = req.body;

      // 1. Validatsiya
      if (!slug || !name_uz) {
        // Agar rasm yuklangan bo'lsa-yu, ma'lumot chala bo'lsa ham rasmni o'chiramiz
        if (req.file) await deleteFile(`/uploads/brands/${req.file.filename}`);
        return res.status(400).json({ error: "slug and name_uz required" });
      }

      // 2. Bazadan eski ma'lumotni tekshiramiz
      const oldData = await db.query("SELECT icon FROM brands WHERE id=$1", [
        id,
      ]);

      if (oldData.rowCount === 0) {
        // BUG FIX: ID topilmasa, multer yuklab qo'ygan yangi faylni tozalaymiz
        if (req.file) {
          await deleteFile(`/uploads/brands/${req.file.filename}`);
        }
        return res.status(404).json({ error: "Brand not found" });
      }

      const oldIconPath = oldData.rows[0].icon;

      // 3. Dinamik SQL so'rovi
      let query = `UPDATE brands SET slug=$1, name_uz=$2, name_ru=$3`;
      let params = [slug, name_uz, name_ru || ""];

      if (req.file) {
        const newIconPath = `/uploads/brands/${req.file.filename}`;
        query += `, icon=$4 WHERE id=$5 RETURNING *`;
        params.push(newIconPath, id);
      } else {
        query += ` WHERE id=$4 RETURNING *`;
        params.push(id);
      }

      // 4. Bazani yangilash
      const { rows } = await db.query(query, params);

      // 5. Muvaffaqiyatli yangilangandan so'ng eski rasmni o'chirish
      if (req.file && oldIconPath) {
        await deleteFile(oldIconPath);
      }

      res.json(rows[0]);
    } catch (err) {
      // 6. Kutilmagan xato (Database error va h.k.) bo'lsa yangi rasmni o'chirish
      if (req.file) {
        await deleteFile(`/uploads/brands/${req.file.filename}`);
      }
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // 1. Mahsulotlar bog'langan-yoqligini tekshirish
      const usage = await db.query(
        "SELECT COUNT(*)::int AS count FROM products WHERE brand_id = $1",
        [id],
      );
      if (usage.rows[0].count > 0) {
        return res.status(409).json({
          error: `Bu brendga ${usage.rows[0].count} ta mahsulot bog'langan. Avval mahsulotlarni o'chiring yoki boshqa brendga ko'chiring.`,
          productsCount: usage.rows[0].count,
        });
      }

      // 2. Brendni o'chirish
      const { rows } = await db.query(
        "DELETE FROM brands WHERE id=$1 RETURNING *",
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Brend topilmadi" });
      }

      res.locals.deletedData = rows[0];
      next();
    } catch (err) {
      next(err);
    }
  }
}

export default new BrandController();
