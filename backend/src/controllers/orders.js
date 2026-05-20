// controllers/orders.js
import db from "../config/database.js";
import {
  sendTelegramMessage,
  formatOrderForTelegram,
  formatOrderStatusForTelegram,
} from "../utils/telegram.js";

const ALLOWED_STATUSES = ["pending", "sold", "cancelled"];

const normalizePhone = (raw) => {
  if (!raw) return "";
  // Faqat raqamlar va boshidagi + saqlanadi
  const trimmed = String(raw).trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return (hasPlus ? "+" : "") + digits;
};

const normalizeOrder = (o) => {
  if (!o) return o;
  return {
    ...o,
    total_amount: o.total_amount != null ? parseFloat(o.total_amount) : 0,
  };
};

const normalizeItem = (it) => ({
  ...it,
  unit_price: it.unit_price != null ? parseFloat(it.unit_price) : 0,
  subtotal: it.subtotal != null ? parseFloat(it.subtotal) : 0,
});

class OrdersController {
  /**
   * PUBLIC — sayt mijozi buyurtma yaratadi.
   * Body: {
   *   customer_name, customer_phone, customer_address?, customer_telegram?, notes?,
   *   items: [{ product_id, quantity }]
   * }
   */
  create = async (req, res, next) => {
    const client = await db.connect();
    try {
      const {
        customer_name,
        customer_phone,
        customer_address,
        customer_telegram,
        notes,
        items,
      } = req.body;

      // 1. Validatsiya
      if (!customer_name || String(customer_name).trim().length < 2) {
        return res.status(400).json({ error: "Ism kamida 2 ta belgi bo'lishi shart" });
      }
      const phone = normalizePhone(customer_phone);
      if (!phone || phone.replace(/\D/g, "").length < 7) {
        return res.status(400).json({ error: "Telefon raqami noto'g'ri" });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Kamida bitta mahsulot tanlash shart" });
      }

      // Itemlarni tozalash + dublikatlarni birlashtirish
      const itemMap = new Map();
      for (const raw of items) {
        const pid = Number(raw?.product_id);
        const qty = Number(raw?.quantity);
        if (!Number.isInteger(pid) || pid <= 0) {
          return res.status(400).json({ error: "product_id noto'g'ri" });
        }
        if (!Number.isInteger(qty) || qty <= 0) {
          return res.status(400).json({ error: "quantity 1 dan kichik bo'lmasin" });
        }
        itemMap.set(pid, (itemMap.get(pid) || 0) + qty);
      }
      const cleanItems = Array.from(itemMap.entries()).map(([pid, qty]) => ({
        product_id: pid,
        quantity: qty,
      }));

      // 2. Tranzaktsiya — stockni atomik tekshirib kamaytirish
      await client.query("BEGIN");

      const productIds = cleanItems.map((i) => i.product_id);
      const productsRes = await client.query(
        `SELECT id, name_uz, price, stock
         FROM products
         WHERE id = ANY($1::int[])
         FOR UPDATE`,
        [productIds],
      );

      const productsById = new Map(productsRes.rows.map((p) => [p.id, p]));

      // Topilmagan mahsulotlar
      for (const it of cleanItems) {
        if (!productsById.has(it.product_id)) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Mahsulot topilmadi (ID: ${it.product_id})`,
          });
        }
      }

      // Stock tekshirish va order_items yozuvlarini tayyorlash
      const preparedItems = [];
      let totalAmount = 0;
      for (const it of cleanItems) {
        const p = productsById.get(it.product_id);
        if (p.stock < it.quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `"${p.name_uz}" yetarli emas (qoldiq: ${p.stock})`,
          });
        }
        const unitPrice = parseFloat(p.price);
        const subtotal = unitPrice * it.quantity;
        totalAmount += subtotal;
        preparedItems.push({
          product_id: p.id,
          product_name: p.name_uz,
          unit_price: unitPrice,
          quantity: it.quantity,
          subtotal,
        });
      }

      // 3. Order yozuvini yaratish
      const orderRes = await client.query(
        `INSERT INTO orders
          (customer_name, customer_phone, customer_address, customer_telegram,
           notes, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [
          String(customer_name).trim(),
          phone,
          customer_address ? String(customer_address).trim() : null,
          customer_telegram ? String(customer_telegram).trim().replace(/^@/, "") : null,
          notes ? String(notes).trim() : null,
          totalAmount,
        ],
      );
      const order = orderRes.rows[0];

      // 4. order_items va stock yangilash
      for (const it of preparedItems) {
        await client.query(
          `INSERT INTO order_items
            (order_id, product_id, product_name, unit_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            it.product_id,
            it.product_name,
            it.unit_price,
            it.quantity,
            it.subtotal,
          ],
        );
        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [it.quantity, it.product_id],
        );
      }

      await client.query("COMMIT");

      const normalized = normalizeOrder(order);
      const items_out = preparedItems.map((it) => normalizeItem({ ...it }));

      // 5. Telegram'ga yuborish — javobni bloklamasligi uchun await ham qilmasak bo'ladi,
      // ammo logging uchun await qilamiz va xato bo'lsa ham order yaratilgan bo'ladi.
      sendTelegramMessage(formatOrderForTelegram(normalized, items_out)).catch(
        (e) => console.error("Telegram yuborish xatosi:", e.message),
      );

      res.status(201).json({ ...normalized, items: items_out });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      next(err);
    } finally {
      client.release();
    }
  };

  /**
   * ADMIN — buyurtmalar ro'yxati. Filter: status, search (ism/telefon), date range.
   */
  list = async (req, res, next) => {
    try {
      const {
        status,
        search,
        from,
        to,
        page = 1,
        limit = 20,
      } = req.query;

      const where = [];
      const params = [];
      let i = 1;

      if (status && ALLOWED_STATUSES.includes(status)) {
        where.push(`status = $${i++}`);
        params.push(status);
      }
      if (search) {
        where.push(`(customer_name ILIKE $${i} OR customer_phone ILIKE $${i})`);
        params.push(`%${search}%`);
        i++;
      }
      if (from) {
        where.push(`created_at >= $${i++}`);
        params.push(from);
      }
      if (to) {
        where.push(`created_at <= $${i++}`);
        params.push(to);
      }

      const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
      const offset = (pageNum - 1) * limitNum;

      const [countRes, listRes] = await Promise.all([
        db.query(`SELECT COUNT(*) FROM orders ${whereClause}`, params),
        db.query(
          `SELECT * FROM orders ${whereClause}
           ORDER BY created_at DESC
           LIMIT $${i} OFFSET $${i + 1}`,
          [...params, limitNum, offset],
        ),
      ]);

      const total = parseInt(countRes.rows[0].count, 10);
      res.json({
        orders: listRes.rows.map(normalizeOrder),
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * ADMIN — bitta buyurtma + uning mahsulotlari
   */
  getById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      const orderRes = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
      if (!orderRes.rowCount) {
        return res.status(404).json({ error: "Buyurtma topilmadi" });
      }
      const itemsRes = await db.query(
        `SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC`,
        [id],
      );

      res.json({
        ...normalizeOrder(orderRes.rows[0]),
        items: itemsRes.rows.map(normalizeItem),
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * ADMIN — buyurtma statusini o'zgartirish.
   * Stock logikasi:
   *   - eski != cancelled, yangi == cancelled → stockni qaytaramiz
   *   - eski == cancelled, yangi != cancelled → stockni yana kamaytiramiz (yetarli bo'lsa)
   *   - boshqa hollarda stock o'zgarmaydi
   */
  updateStatus = async (req, res, next) => {
    const client = await db.connect();
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      const { status } = req.body;
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `status faqat quyidagilardan biri: ${ALLOWED_STATUSES.join(", ")}`,
        });
      }

      await client.query("BEGIN");

      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [id],
      );
      if (!orderRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Buyurtma topilmadi" });
      }
      const current = orderRes.rows[0];

      if (current.status === status) {
        await client.query("COMMIT");
        return res.json(normalizeOrder(current));
      }

      const itemsRes = await client.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
        [id],
      );
      const orderItems = itemsRes.rows.filter((it) => it.product_id);

      const goingToCancelled = status === "cancelled" && current.status !== "cancelled";
      const leavingCancelled = current.status === "cancelled" && status !== "cancelled";

      if (goingToCancelled) {
        // Stockni qaytaramiz
        for (const it of orderItems) {
          await client.query(
            "UPDATE products SET stock = stock + $1 WHERE id = $2",
            [it.quantity, it.product_id],
          );
        }
      } else if (leavingCancelled) {
        // Stockni yana kamaytiramiz — avval yetarliligini tekshiramiz
        const pids = orderItems.map((i) => i.product_id);
        if (pids.length) {
          const stockRes = await client.query(
            `SELECT id, name_uz, stock FROM products
             WHERE id = ANY($1::int[]) FOR UPDATE`,
            [pids],
          );
          const byId = new Map(stockRes.rows.map((p) => [p.id, p]));
          for (const it of orderItems) {
            const p = byId.get(it.product_id);
            if (!p || p.stock < it.quantity) {
              await client.query("ROLLBACK");
              return res.status(400).json({
                error: `"${p?.name_uz || "Mahsulot"}" yetarli emas (qoldiq: ${
                  p?.stock ?? 0
                })`,
              });
            }
          }
          for (const it of orderItems) {
            await client.query(
              "UPDATE products SET stock = stock - $1 WHERE id = $2",
              [it.quantity, it.product_id],
            );
          }
        }
      }

      const updatedRes = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [status, id],
      );

      await client.query("COMMIT");

      const updated = normalizeOrder(updatedRes.rows[0]);

      // Telegram'ga statusni xabar qilamiz (xato bo'lsa ham ishni bloklamasin)
      sendTelegramMessage(formatOrderStatusForTelegram(updated, status)).catch(
        (e) => console.error("Telegram yuborish xatosi:", e.message),
      );

      res.json(updated);
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      next(err);
    } finally {
      client.release();
    }
  };

  /**
   * ADMIN — buyurtmani o'chirish. Agar status cancelled bo'lmasa, stock qaytariladi.
   */
  delete = async (req, res, next) => {
    const client = await db.connect();
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
      }

      await client.query("BEGIN");

      const orderRes = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [id],
      );
      if (!orderRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Buyurtma topilmadi" });
      }
      const order = orderRes.rows[0];

      // Cancel qilinmagan bo'lsa, stockni qaytaramiz
      if (order.status !== "cancelled") {
        const itemsRes = await client.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
          [id],
        );
        for (const it of itemsRes.rows) {
          if (it.product_id) {
            await client.query(
              "UPDATE products SET stock = stock + $1 WHERE id = $2",
              [it.quantity, it.product_id],
            );
          }
        }
      }

      await client.query("DELETE FROM orders WHERE id = $1", [id]);
      await client.query("COMMIT");

      res.json({ success: true });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      next(err);
    } finally {
      client.release();
    }
  };

  /**
   * ADMIN — buyurtmalar statistikasi (dashboard uchun)
   */
  stats = async (req, res, next) => {
    try {
      const { rows } = await db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
          COUNT(*) FILTER (WHERE status = 'sold')      AS sold,
          COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
          COUNT(*) AS total,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'sold'), 0) AS revenue
        FROM orders
      `);
      const r = rows[0];
      res.json({
        pending: Number(r.pending),
        sold: Number(r.sold),
        cancelled: Number(r.cancelled),
        total: Number(r.total),
        revenue: parseFloat(r.revenue),
      });
    } catch (err) {
      next(err);
    }
  };
}

export default new OrdersController();
