import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./src/routes/routes.js";
import errorHandler from "./src/middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;


// Default app.use(cors()) o'rniga buni qo'ying:
app.use(cors({
  origin: '*', // Agar frontend manzili aniq bo'lsa (masalan: https://frontend.uz), '*' o'rniga o'shani yozgan ma'qul
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

// Ba'zi xostinglarda OPTIONS (preflight) so'rovlariga alohida javob qaytarish kerak bo'ladi
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

app.use("/api", router);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Watch Store API running on ${PORT}`));
