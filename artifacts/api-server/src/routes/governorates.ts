import { Router, type IRouter } from "express";
import { listGovernoratesController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.get("/", asyncHandler(listGovernoratesController));

export default router;
