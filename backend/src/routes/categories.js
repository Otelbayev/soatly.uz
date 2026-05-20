import { Router } from "express";
import CategoryController from "../controllers/categories.js";
import { cleanFileAfterDelete } from "../middleware/deleteFileMiddleware.js";
import { uploadCategories } from "../middleware/upload.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — saytga kerakli
router.get("/", CategoryController.getAll);
router.get("/:slug", CategoryController.getBySlug);

// Admin — JWT himoyalangan
router.post(
  "/",
  authenticate,
  requireAdmin,
  uploadCategories.single("icon"),
  CategoryController.create,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  uploadCategories.single("icon"),
  CategoryController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  CategoryController.delete,
  cleanFileAfterDelete("icon"),
);

export default router;
