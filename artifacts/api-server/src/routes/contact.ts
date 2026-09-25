import { Router, type IRouter } from "express";
import { contactController } from "../controllers";
import { asyncHandler } from "../lib/http";

const router: IRouter = Router();

router.post("/", asyncHandler(contactController));

export default router;
