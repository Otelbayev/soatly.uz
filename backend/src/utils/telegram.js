// Telegram bot yordamida xabarlarni yuborish.
//
// .env sozlamalari:
//   TELEGRAM_BOT_TOKEN — BotFather'dan olingan token
//   TELEGRAM_CHAT_ID   — bir yoki bir nechta chat ID, vergul bilan ajratiladi
//                         (masalan: -1001234567890,123456789,@kanalim)
//
// Eslatma: bot @username'ga to'g'ridan-to'g'ri yozolmaydi. Foydalanuvchi
// avval botga /start yozishi yoki uni guruh/kanalda admin qilish kerak.

const TELEGRAM_API = "https://api.telegram.org";

const getChatIds = () => {
  const raw = process.env.TELEGRAM_CHAT_ID || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const formatPrice = (n) => {
  const num = Number(n) || 0;
  return num.toLocaleString("uz-UZ") + " so'm";
};

const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sendOne = async (chatId, text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN sozlanmagan");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Telegram API: ${data.description || "noma'lum xato"}`);
    }
    return data.result;
  } finally {
    clearTimeout(timeout);
  }
};

// Mavjud barcha chat ID'larga yuborish. Bitta chat'ga yuborish xato bersa,
// boshqalari to'xtatilmaydi. Order yaratish jarayoni ham buzilmasligi kerak.
export const sendTelegramMessage = async (text) => {
  const chatIds = getChatIds();
  if (!chatIds.length) {
    console.warn("⚠️  TELEGRAM_CHAT_ID sozlanmagan — xabar yuborilmadi");
    return [];
  }

  const results = await Promise.allSettled(
    chatIds.map((id) => sendOne(id, text)),
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `❌ Telegram xato (chat ${chatIds[i]}):`,
        r.reason?.message || r.reason,
      );
    }
  });
  return results;
};

export const formatOrderForTelegram = (order, items) => {
  const lines = [];
  lines.push(`🛒 <b>YANGI BUYURTMA #${order.id}</b>`);
  lines.push("");
  lines.push(`👤 <b>Mijoz:</b> ${escapeHtml(order.customer_name)}`);
  lines.push(`📞 <b>Telefon:</b> ${escapeHtml(order.customer_phone)}`);
  if (order.customer_telegram) {
    const tg = order.customer_telegram.startsWith("@")
      ? order.customer_telegram
      : `@${order.customer_telegram}`;
    lines.push(`💬 <b>Telegram:</b> ${escapeHtml(tg)}`);
  }
  if (order.customer_address) {
    lines.push(`📍 <b>Manzil:</b> ${escapeHtml(order.customer_address)}`);
  }
  if (order.notes) {
    lines.push(`📝 <b>Izoh:</b> ${escapeHtml(order.notes)}`);
  }
  lines.push("");
  lines.push("📦 <b>Mahsulotlar:</b>");
  items.forEach((it, idx) => {
    lines.push(
      `${idx + 1}. ${escapeHtml(it.product_name)} × ${it.quantity} — ${formatPrice(
        it.subtotal,
      )}`,
    );
  });
  lines.push("");
  lines.push(`💰 <b>Jami:</b> ${formatPrice(order.total_amount)}`);
  lines.push(`🕐 <b>Vaqt:</b> ${formatDate(order.created_at)}`);

  return lines.join("\n");
};

export const formatOrderStatusForTelegram = (order, newStatus) => {
  const labelMap = {
    pending: "🟡 Kutilmoqda",
    sold: "✅ Sotildi",
    cancelled: "❌ Bekor qilindi",
  };
  return [
    `🔔 <b>Buyurtma #${order.id} statusi yangilandi</b>`,
    ``,
    `👤 ${escapeHtml(order.customer_name)} — ${escapeHtml(order.customer_phone)}`,
    `📊 Status: <b>${labelMap[newStatus] || newStatus}</b>`,
    `💰 Summa: ${formatPrice(order.total_amount)}`,
  ].join("\n");
};
