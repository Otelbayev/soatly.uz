import db from "../config/database.js";
import { deleteFile } from "../utils/fileRemover.js";

class CategoryController {
  async getAll(req, res, next) {
    try {
      const { rows } = await db.query(
        "SELECT * FROM categories ORDER BY name_uz ASC",
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
  async getBySlug(req, res, next) {
    try {
      const { rows } = await db.query(
        "SELECT * FROM categories WHERE slug=$1",
        [req.params.slug],
      );
      if (!rows.length)
        return res.status(404).json({ error: "Category not found" });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      const { slug, name_uz, name_ru, description_uz, description_ru } =
        req.body;
      if (!slug || !name_uz)
        return res.status(400).json({ error: "slug and name_uz required" });

      // Agar rasm yuklangan bo'lsa yo'lini saqlaymiz, bo'lmasa bo'sh string
      const iconPath = req.file ? `/uploads/categories/${req.file.filename}` : "";

      const { rows } = await db.query(
        `INSERT INTO categories (slug, name_uz, name_ru, description_uz, description_ru, icon)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          slug,
          name_uz,
          name_ru || "",
          description_uz || "",
          description_ru || "",
          iconPath,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { slug, name_uz, name_ru, description_uz, description_ru } =
        req.body;

      // 1. Avval ID bo'yicha bazada borligini tekshiramiz
      const oldData = await db.query(
        "SELECT icon FROM categories WHERE id=$1",
        [id],
      );

      if (oldData.rowCount === 0) {
        // MUHIM: Agar ID topilmasa va multer rasm yuklagan bo'lsa, uni o'chirib tashlaymiz
        if (req.file) {
          await deleteFile(`/uploads/categories/${req.file.filename}`);
        }
        return res.status(404).json({ error: "Category not found" });
      }

      const oldIconPath = oldData.rows[0].icon;

      // 2. SQL so'rovini tayyorlaymiz
      let query = `UPDATE categories SET slug=$1, name_uz=$2, name_ru=$3, description_uz=$4, description_ru=$5`;
      let params = [
        slug,
        name_uz,
        name_ru || "",
        description_uz || "",
        description_ru || "",
      ];

      if (req.file) {
        const iconPath = `/uploads/categories/${req.file.filename}`;
        query += `, icon=$6 WHERE id=$7 RETURNING *`;
        params.push(iconPath, id);
      } else {
        query += ` WHERE id=$6 RETURNING *`;
        params.push(id);
      }

      // 3. Bazani yangilaymiz
      const { rows } = await db.query(query, params);

      // 4. Muvaffaqiyatli yangilangandan keyin eski rasmni o'chiramiz
      if (req.file && oldIconPath) {
        await deleteFile(oldIconPath);
      }

      res.json(rows[0]);
    } catch (err) {
      // 5. Agar kutilmagan xato (masalan, bazaga ulanish) yuz bersa,
      // yangi yuklangan faylni diskda qoldirmaslik kerak
      if (req.file) {
        await deleteFile(`/uploads/categories/${req.file.filename}`);
      }
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // 1. Mahsulotlar bog'langan-yoqligini tekshirish (junction orqali)
      const usage = await db.query(
        "SELECT COUNT(*)::int AS count FROM product_categories WHERE category_id = $1",
        [id],
      );
      if (usage.rows[0].count > 0) {
        return res.status(409).json({
          error: `Bu kategoriyaga ${usage.rows[0].count} ta mahsulot bog'langan. Avval mahsulotlarni o'chiring yoki boshqa kategoriyaga ko'chiring.`,
          productsCount: usage.rows[0].count,
        });
      }

      // 2. Kategoriyani o'chirish
      const { rows } = await db.query(
        "DELETE FROM categories WHERE id=$1 RETURNING *",
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Kategoriya topilmadi" });
      }

      res.locals.deletedData = rows[0];
      next();
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
