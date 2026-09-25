import { Router, type IRouter } from "express";
import categoriesRouter from "./categories";
import contactRouter from "./contact";
import governoratesRouter from "./governorates";
import healthRouter from "./health";
import ordersRouter from "./orders";
import productsRouter from "./products";
import routesRouter from "./routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/routes", routesRouter);
router.use("/governorates", governoratesRouter);
router.use("/contact", contactRouter);
router.use("/orders", ordersRouter);

export default router;
