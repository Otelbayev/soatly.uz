// controllers/products.js
import db from "../config/database.js";
import { deleteFile } from "../utils/fileRemover.js";

const parseBoolean = (v) =>
  v === true || v === "true" || v === 1 || v === "1";

const parseJSONField = (v, fallback) => {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

const toImageArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseIdsArray = (v) => {
  if (v === undefined || v === null || v === "") return [];
  let arr = v;
  if (typeof v === "string") {
    try {
      arr = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  const ids = arr.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0);
  return Array.from(new Set(ids));
};

class ProductsController {
  // p.* hamma maydonlarini, brand JOIN va categories aggregate (array_agg)
  #SELECT_FIELDS = `
    p.*,
    b.name_uz AS brand_name_uz, b.name_ru AS brand_name_ru, b.slug AS brand_slug,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('id', c.id, 'slug', c.slug, 'name_uz', c.name_uz, 'name_ru', c.name_ru)
          ORDER BY c.name_uz
        )
        FROM product_categories pc
        JOIN categories c ON c.id = pc.category_id
        WHERE pc.product_id = p.id
      ),
      '[]'::json
    ) AS categories
  `;

  #FROM_JOIN = `
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
  `;

  #cleanupUploaded = async (files) => {
    if (!files || !files.length) return;
    await Promise.all(
      files.map((f) => deleteFile(`/uploads/products/${f.filename}`)),
    );
  };

  normalizeProduct = (p) => {
    if (!p) return p;
    return {
      ...p,
      price: p.price != null ? parseFloat(p.price) : 0,
      original_price:
        p.original_price != null ? parseFloat(p.original_price) : null,
      specifications:
        typeof p.specifications === "string"
          ? JSON.parse(p.specifications)
          : p.specifications,
      images: toImageArray(p.images),
      categories: Array.isArray(p.categories) ? p.categories : [],
    };
  };

  // Junction jadvalini yangilash uchun helper — tranzaktsiya ichida chaqiriladi
  #syncCategories = async (client, productId, categoryIds) => {
    await client.query(
      "DELETE FROM product_categories WHERE product_id = $1",
      [productId],
    );
    if (!categoryIds.length) return;

    // Massiv qiymatlarni VALUES ($1, $2), ($1, $3) ... ga aylantiramiz
    const placeholders = categoryIds
      .map((_, i) => `($1, $${i + 2})`)
      .join(", ");
    await client.query(
      `INSERT INTO product_categories (product_id, category_id)
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      [productId, ...categoryIds],
    );
  };

  // category_ids haqiqatdan mavjud-yoqligini tekshiramiz
  #validateCategoryIds = async (client, ids) => {
    if (!ids.length) return { ok: true };
    const { rows } = await client.query(
      "SELECT id FROM categories WHERE id = ANY($1::int[])",
      [ids],
    );
    const found = new Set(rows.map((r) => r.id));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length) {
      return { ok: false, missing };
    }
    return { ok: true };
  };

  getAll = async (req, res, next) => {
    try {
      const {
        category,
        brand,
        min_price,
        max_price,
        featured,
        search,
        sort = "created_at",
        order = "DESC",
        page = 1,
        limit = 12,
      } = req.query;

      const where = [];
      const params = [];
      let i = 1;

      // Bir nechta qiymatni vergul bilan ajratilgan holda qabul qilamiz
      // Misol: ?category=watches,smartwatches&brand=rolex,omega
      const splitParam = (v) =>
        String(v || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      if (category) {
        const slugs = splitParam(category);
        if (slugs.length) {
          where.push(`EXISTS (
            SELECT 1 FROM product_categories pc
            JOIN categories c ON c.id = pc.category_id
            WHERE pc.product_id = p.id AND c.slug = ANY($${i}::text[])
          )`);
          params.push(slugs);
          i++;
        }
      }
      if (brand) {
        const slugs = splitParam(brand);
        if (slugs.length) {
          where.push(`b.slug = ANY($${i}::text[])`);
          params.push(slugs);
          i++;
        }
      }
      if (min_price) {
        where.push(`p.price >= $${i++}`);
        params.push(Number(min_price));
      }
      if (max_price) {
        where.push(`p.price <= $${i++}`);
        params.push(Number(max_price));
      }
      if (featured === "true") where.push(`p.featured = true`);

      if (search) {
        where.push(`(p.name_uz ILIKE $${i} OR p.name_ru ILIKE $${i})`);
        params.push(`%${search}%`);
        i++;
      }

      const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const allowedSort = ["price", "created_at", "name_uz"];
      const sortCol = allowedSort.includes(sort) ? `p.${sort}` : "p.created_at";
      const sortDir = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 12));
      const offset = (pageNum - 1) * limitNum;

      const countQuery = `SELECT COUNT(*) ${this.#FROM_JOIN} ${whereClause}`;
      const dataQuery = `
        SELECT ${this.#SELECT_FIELDS}
        ${this.#FROM_JOIN}
        ${whereClause}
        ORDER BY ${sortCol} ${sortDir}
        LIMIT $${i} OFFSET $${i + 1}`;

      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery, params),
        db.query(dataQuery, [...params, limitNum, offset]),
      ]);

      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        products: dataResult.rows.map(this.normalizeProduct),
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      const { rows } = await db.query(
        `SELECT ${this.#SELECT_FIELDS} ${this.#FROM_JOIN} WHERE p.id=$1`,
        [id],
      );
      if (!rows.length)
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      res.json(this.normalizeProduct(rows[0]));
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    const client = await db.connect();
    try {
      const {
        name_uz,
        name_ru,
        description_uz,
        description_ru,
        price,
        original_price,
        specifications,
        category_ids,
        brand_id,
        stock,
        featured,
        badge,
      } = req.body;

      const categoryIds = parseIdsArray(category_ids);

      // 1. Majburiy maydonlarni tekshirish
      if (
        !name_uz ||
        price == null ||
        price === "" ||
        !brand_id ||
        !categoryIds.length
      ) {
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({
          error:
            "Majburiy maydonlar to'ldirilmagan (name_uz, price, brand_id, kamida 1 ta category)",
        });
      }

      // 2. Kamida bitta rasm majburiy (DB CHECK constraintga mos)
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "Kamida bitta rasm yuklash majburiy",
        });
      }

      await client.query("BEGIN");

      // 3. Category ID'larni tekshirish
      const check = await this.#validateCategoryIds(client, categoryIds);
      if (!check.ok) {
        await client.query("ROLLBACK");
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({
          error: `Kategoriyalar topilmadi: ${check.missing.join(", ")}`,
        });
      }

      const imagePaths = req.files.map((f) => `/uploads/products/${f.filename}`);

      // 4. Productni saqlash
      const { rows } = await client.query(
        `INSERT INTO products
         (name_uz, name_ru, description_uz, description_ru,
          price, original_price, specifications, images,
          brand_id, stock, featured, badge)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          name_uz,
          name_ru || "",
          description_uz || "",
          description_ru || "",
          Number(price),
          original_price !== undefined && original_price !== "" && original_price !== null
            ? Number(original_price)
            : null,
          JSON.stringify(parseJSONField(specifications, {})),
          JSON.stringify(imagePaths),
          Number(brand_id),
          stock !== undefined && stock !== "" && stock !== null ? Number(stock) : 0,
          parseBoolean(featured),
          badge ? String(badge) : null,
        ],
      );
      const productId = rows[0].id;

      // 5. Junction'ga kategoriyalarni yozish
      await this.#syncCategories(client, productId, categoryIds);

      await client.query("COMMIT");

      // 6. To'liq ma'lumotni qaytarish
      const fullProduct = await db.query(
        `SELECT ${this.#SELECT_FIELDS} ${this.#FROM_JOIN} WHERE p.id = $1`,
        [productId],
      );

      res.status(201).json(this.normalizeProduct(fullProduct.rows[0]));
    } catch (err) {
      try { await client.query("ROLLBACK"); } catch {}
      await this.#cleanupUploaded(req.files);
      next(err);
    } finally {
      client.release();
    }
  };

  update = async (req, res, next) => {
    const client = await db.connect();
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      const {
        name_uz,
        name_ru,
        description_uz,
        description_ru,
        price,
        original_price,
        specifications,
        category_ids,
        brand_id,
        stock,
        featured,
        badge,
        old_images,
      } = req.body;

      await client.query("BEGIN");

      const existing = await client.query(
        "SELECT * FROM products WHERE id = $1",
        [id],
      );
      if (existing.rowCount === 0) {
        await client.query("ROLLBACK");
        await this.#cleanupUploaded(req.files);
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }

      const current = existing.rows[0];
      const currentImages = toImageArray(current.images);

      // 1. Saqlanadigan eski rasmlarni aniqlash
      let keptImages;
      if (old_images !== undefined) {
        const parsed = parseJSONField(old_images, null);
        const requested = Array.isArray(parsed) ? parsed : [];
        keptImages = requested.filter((img) => currentImages.includes(img));
      } else {
        keptImages = [...currentImages];
      }

      const newPaths = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
      const finalImages = [...keptImages, ...newPaths];

      if (finalImages.length === 0) {
        await client.query("ROLLBACK");
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({
          error: "Mahsulotda kamida bitta rasm bo'lishi shart",
        });
      }

      // 2. Category IDs (agar yuborilgan bo'lsa)
      let categoryIds = null;
      if (category_ids !== undefined) {
        categoryIds = parseIdsArray(category_ids);
        if (categoryIds.length === 0) {
          await client.query("ROLLBACK");
          await this.#cleanupUploaded(req.files);
          return res.status(400).json({
            error: "Kamida 1 ta kategoriya tanlash shart",
          });
        }
        const check = await this.#validateCategoryIds(client, categoryIds);
        if (!check.ok) {
          await client.query("ROLLBACK");
          await this.#cleanupUploaded(req.files);
          return res.status(400).json({
            error: `Kategoriyalar topilmadi: ${check.missing.join(", ")}`,
          });
        }
      }

      // 3. Yangi qiymatlar (fallback to current)
      const next_name_uz =
        name_uz !== undefined && name_uz !== "" ? name_uz : current.name_uz;
      const next_name_ru = name_ru !== undefined ? name_ru || "" : current.name_ru;
      const next_desc_uz =
        description_uz !== undefined ? description_uz || "" : current.description_uz;
      const next_desc_ru =
        description_ru !== undefined ? description_ru || "" : current.description_ru;

      const next_price =
        price !== undefined && price !== "" && price !== null
          ? Number(price)
          : Number(current.price);

      let next_original_price;
      if (original_price === undefined) {
        next_original_price = current.original_price;
      } else if (original_price === "" || original_price === null) {
        next_original_price = null;
      } else {
        next_original_price = Number(original_price);
      }

      const next_specs =
        specifications !== undefined
          ? parseJSONField(specifications, {})
          : current.specifications || {};

      const next_brand_id =
        brand_id !== undefined && brand_id !== "" && brand_id !== null
          ? Number(brand_id)
          : current.brand_id;
      const next_stock =
        stock !== undefined && stock !== "" && stock !== null
          ? Number(stock)
          : current.stock;
      const next_featured =
        featured !== undefined ? parseBoolean(featured) : current.featured;
      const next_badge =
        badge !== undefined ? (badge ? String(badge) : null) : current.badge;

      if (Number.isNaN(next_price) || next_price < 0) {
        await client.query("ROLLBACK");
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({ error: "Narx noto'g'ri" });
      }
      if (
        next_original_price !== null &&
        (Number.isNaN(next_original_price) || next_original_price < 0)
      ) {
        await client.query("ROLLBACK");
        await this.#cleanupUploaded(req.files);
        return res.status(400).json({ error: "Asl narx noto'g'ri" });
      }

      // 4. UPDATE
      await client.query(
        `UPDATE products SET
          name_uz=$1, name_ru=$2, description_uz=$3, description_ru=$4,
          price=$5, original_price=$6, specifications=$7, images=$8,
          brand_id=$9, stock=$10, featured=$11, badge=$12,
          updated_at=NOW()
         WHERE id=$13`,
        [
          next_name_uz,
          next_name_ru,
          next_desc_uz,
          next_desc_ru,
          next_price,
          next_original_price,
          JSON.stringify(next_specs),
          JSON.stringify(finalImages),
          next_brand_id,
          next_stock,
          next_featured,
          next_badge,
          id,
        ],
      );

      // 5. Junction yangilash (faqat category_ids yuborilgan bo'lsa)
      if (categoryIds !== null) {
        await this.#syncCategories(client, id, categoryIds);
      }

      await client.query("COMMIT");

      // 6. Diskdan o'chirilgan rasmlarni tozalash
      const removedImages = currentImages.filter((img) => !keptImages.includes(img));
      if (removedImages.length) {
        await Promise.all(removedImages.map((img) => deleteFile(img)));
      }

      // 7. Yangilangan ma'lumotni qaytarish
      const fullProduct = await db.query(
        `SELECT ${this.#SELECT_FIELDS} ${this.#FROM_JOIN} WHERE p.id = $1`,
        [id],
      );
      res.json(this.normalizeProduct(fullProduct.rows[0]));
    } catch (err) {
      try { await client.query("ROLLBACK"); } catch {}
      await this.#cleanupUploaded(req.files);
      next(err);
    } finally {
      client.release();
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      const { rows } = await db.query(
        "DELETE FROM products WHERE id=$1 RETURNING images",
        [id],
      );
      if (!rows.length)
        return res.status(404).json({ error: "Mahsulot topilmadi" });

      const images = toImageArray(rows[0].images);
      if (images.length) {
        await Promise.all(images.map((img) => deleteFile(img)));
      }

      res.json({ success: true, message: "Mahsulot va rasmlar o'chirildi" });
    } catch (err) {
      next(err);
    }
  };
}

export default new ProductsController();
