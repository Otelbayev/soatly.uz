// routes/products.js
import { Router } from "express";
import ProductsController from "../controllers/products.js";
import { uploadProducts } from "../middleware/upload.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — saytga kerakli
router.get("/", ProductsController.getAll);
router.get("/:id", ProductsController.getById);

// Admin — JWT himoyalangan
router.post(
  "/",
  authenticate,
  requireAdmin,
  uploadProducts.array("images", 10),
  ProductsController.create,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  uploadProducts.array("images", 10),
  ProductsController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  ProductsController.delete,
);

export default router;
