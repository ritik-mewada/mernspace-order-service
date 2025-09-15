import { Request, Response } from "express";
import couponModel from "./couponModel";

export class CouponController {
  create = async (req: Request, res: Response) => {
    const { title, code, validUpto, discount, tenantId } = req.body;

    const coupon = await couponModel.create({
      title,
      code,
      validUpto,
      discount,
      tenantId,
    });

    return res.json(coupon);
  };
}
