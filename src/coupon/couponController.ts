import { NextFunction, Request, Response } from "express";
import couponModel from "./couponModel";
import createHttpError from "http-errors";

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

  verify = async (req: Request, res: Response, next: NextFunction) => {
    const { code, tenantId } = req.body;

    const coupon = await couponModel.findOne({ code, tenantId });

    if (!coupon) {
      const error = createHttpError(400, "Coupon does not exists");
      return next(error);
    }

    const currentDate = new Date();
    const couponDate = new Date(coupon.validUpto);

    if (currentDate <= couponDate) {
      return res.json({ valid: true, discount: coupon.discount });
    }
    return res.json({ valid: false, discount: 0 });
  };
}
