import { Router } from "express";
import OrdersController from "../controllers/orders.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — sayt mijozi buyurtma yaratadi
router.post("/", OrdersController.create);

// Admin — JWT himoyalangan
router.get("/", authenticate, requireAdmin, OrdersController.list);
router.get("/stats", authenticate, requireAdmin, OrdersController.stats);
router.get("/:id", authenticate, requireAdmin, OrdersController.getById);
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  OrdersController.updateStatus,
);
router.delete("/:id", authenticate, requireAdmin, OrdersController.delete);

export default router;
