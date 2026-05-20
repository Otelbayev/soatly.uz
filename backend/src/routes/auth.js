import { Router } from "express";
import AuthController from "../controllers/auth.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post("/logout-all", authenticate, AuthController.logoutAll);
router.get("/me", authenticate, AuthController.me);
router.post("/change-password", authenticate, AuthController.changePassword);

export default router;
