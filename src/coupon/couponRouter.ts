import express from "express";
import { CouponController } from "./couponController";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";

const router = express.Router();
const couponController = new CouponController();

router.post("/", authenticate, asyncWrapper(couponController.create));
router.post("/verify", authenticate, asyncWrapper(couponController.verify));

export default router;
