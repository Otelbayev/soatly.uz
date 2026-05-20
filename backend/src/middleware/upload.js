import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isExtValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Faqat rasm formatidagi fayllar (jpg, png, webp) ruxsat etilgan!",
      ),
      false,
    );
  }
};

const makeUploader = (subfolder) => {
  const targetDir = path.join(uploadsRoot, subfolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
  });
};

export const uploadProducts = makeUploader("products");
export const uploadBrands = makeUploader("brands");
export const uploadCategories = makeUploader("categories");

// Eski default eksport — products uchun ishlatiladi (eskirgan kod buzilmasligi uchun)
export default uploadProducts;
