import { NextFunction, Request, Response } from "express";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import {
  CartItem,
  ProductPricingCache,
  Topping,
  ToppingPriceCache,
} from "../types";
import couponModel from "../coupon/couponModel";
import orderModel from "./orderModel";
import { OrderStatus, PaymentStatus } from "./orderTypes";

export class OrderController {
  create = async (req: Request, res: Response) => {
    const {
      cart,
      couponCode,
      tenantId,
      paymentaMode,
      customerId,
      comment,
      address,
    } = req.body;

    const totalPrice = await this.calculateTotal(cart);

    let discountPercentage = 0;

    if (couponCode) {
      discountPercentage = await this.getDiscountPercentage(
        couponCode,
        tenantId,
      );
    }

    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

    const priceAfterDiscount = totalPrice - discountAmount;

    const TAXES_PERCENT = 18;
    const taxes = Math.round((priceAfterDiscount * TAXES_PERCENT) / 100);

    const DELIVERY_CHARGES = 100;
    const finalTotal = priceAfterDiscount + taxes + DELIVERY_CHARGES;

    const newOrder = await orderModel.create({
      cart,
      address,
      comment,
      customerId,
      deliveryCharges: DELIVERY_CHARGES,
      discount: discountAmount,
      paymentaMode,
      orderStatus: OrderStatus.RECEIVED,
      paymentStatus: PaymentStatus.PENDING,
      taxes,
      tenantId,
      total: finalTotal,
    });

    return res.json({ newOrder });
  };

  private calculateTotal = async (cart: CartItem[]) => {
    const productIds = cart.map((item) => item._id);

    const productPricing = await productCacheModel.find({
      productId: {
        $in: productIds,
      },
    });

    const cartToppingsIds = cart.reduce((acc, item) => {
      return [
        ...acc,
        ...item.chosenConfiguration.selectedToppings.map(
          (topping) => topping.id,
        ),
      ];
    }, []);

    const toppingPricings = await toppingCacheModel.find({
      toppingId: {
        $in: cartToppingsIds,
      },
    });

    const totalPrice = cart.reduce((acc, curr) => {
      const cachedProductPrice = productPricing.find(
        (product) => product.productId === curr._id,
      );
      return (
        acc +
        curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPricings)
      );
    }, 0);

    return totalPrice;
  };

  private getItemTotal = (
    item: CartItem,
    cachedProductPrice: ProductPricingCache,
    toppingPricings: ToppingPriceCache[],
  ) => {
    const toppingsTotal = item.chosenConfiguration.selectedToppings.reduce(
      (acc, curr) => {
        return acc + this.getCurrentToppingPrice(curr, toppingPricings);
      },
      0,
    );

    const productTotal = Object.entries(
      item.chosenConfiguration.priceConfiguration,
    ).reduce((acc, [key, value]) => {
      const price =
        cachedProductPrice.priceConfiguration[key].availableOptions[value];
      return acc + price;
    }, 0);

    return productTotal + toppingsTotal;
  };

  private getCurrentToppingPrice = (
    topping: Topping,
    toppingPricing: ToppingPriceCache[],
  ) => {
    const currentTopping = toppingPricing.find(
      (current) => topping.id === current.toppingId,
    );

    if (!currentTopping) {
      return topping.price;
    }

    return currentTopping.price;
  };

  private getDiscountPercentage = async (
    couponCode: string,
    tenantId: string,
  ) => {
    const code = await couponModel.findOne({
      code: couponCode,
      tenantId,
    });

    if (!code) {
      return 0;
    }

    const currentDate = new Date();
    const couponDate = new Date(code.validUpto);

    if (currentDate <= couponDate) {
      return code.discount;
    }

    return 0;
  };
}
