import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { calculateCartSchema, createCheckoutOrderSchema } from '../validators/cart.validator';
import { PricingService } from '../services/pricing.service';
import { PaymentService } from '../services/payment.service';
import { prisma } from '../config/prisma';

export class CartController {
  static async calculate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const validated = calculateCartSchema.parse(req.body);

    const calculation = await PricingService.calculateCart(
      userId,
      validated.productIds,
      validated.couponCode
    );

    res.json({ calculation });
  }

  static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const validated = createCheckoutOrderSchema.parse(req.body);

    const checkoutOrder = await PaymentService.createCheckoutOrder(
      userId,
      validated.productIds,
      validated.couponCode
    );

    res.status(201).json({ checkoutOrder });
  }

  static async getAvailableCoupons(req: AuthenticatedRequest, res: Response): Promise<void> {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: now },
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValueInPaise: true,
        maxDiscountInPaise: true,
        validUntil: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ coupons });
  }
}
