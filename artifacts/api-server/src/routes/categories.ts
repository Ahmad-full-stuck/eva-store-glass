import { Router, type IRouter } from "express";
import { listCategoriesController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.get("/", asyncHandler(listCategoriesController));

export default router;
