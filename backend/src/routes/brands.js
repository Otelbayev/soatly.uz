import { Router } from "express";
import { uploadBrands } from "../middleware/upload.js";
import BrandController from "../controllers/brands.js";
import { cleanFileAfterDelete } from "../middleware/deleteFileMiddleware.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — saytga kerakli
router.get("/", BrandController.getAll);
router.get("/:slug", BrandController.getBySlug);

// Admin — JWT himoyalangan
router.post(
  "/",
  authenticate,
  requireAdmin,
  uploadBrands.single("icon"),
  BrandController.create,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  uploadBrands.single("icon"),
  BrandController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  BrandController.delete,
  cleanFileAfterDelete("icon"),
);

export default router;
