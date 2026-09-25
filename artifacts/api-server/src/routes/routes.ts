import { Router, type IRouter } from "express";
import { listRoutesController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.get("/", asyncHandler(listRoutesController));

export default router;
