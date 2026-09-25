import { Router, type IRouter } from "express";
import { getProductController, listProductsController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.get("/", asyncHandler(listProductsController));
router.get("/:id", asyncHandler(getProductController));

export default router;
