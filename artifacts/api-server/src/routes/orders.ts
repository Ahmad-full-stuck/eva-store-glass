import { Router, type IRouter } from "express";
import { createOrderController, getOrderController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.post("/", asyncHandler(createOrderController));
router.get("/:orderNumber", asyncHandler(getOrderController));

export default router;
