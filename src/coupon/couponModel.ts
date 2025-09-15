import mongoose from "mongoose";
import { Coupon } from "./couponTypes";

const couponModel = new mongoose.Schema<Coupon>(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    validUpto: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    tenantId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

couponModel.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model("Coupon", couponModel);
