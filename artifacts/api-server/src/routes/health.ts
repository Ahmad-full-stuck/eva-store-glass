import { Router, type IRouter } from "express";
import { healthController, readinessController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.get("/healthz", asyncHandler(healthController));
router.get("/readyz", asyncHandler(readinessController));

export default router;
