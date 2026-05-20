import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteFile = async (relativeSizePath) => {
  if (!relativeSizePath) return;

  const absolutePath = path.join(__dirname, "../../", relativeSizePath);

  try {
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log(`Fayl diskdan o'chirildi: ${absolutePath}`);
  } catch (err) {
    console.error(`Faylni o'chirishda xato: ${err.message}`);
  }
};
