import { Router } from "express";
import authRouter from "./auth.js";
import brandsRouter from "./brands.js";
import categoriesRouter from "./categories.js";
import ordersRouter from "./orders.js";
import productsRouter from "./products.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/brands", brandsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);

export default router;
