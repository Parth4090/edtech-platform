import { ProductType, DiscountType, OrderStatus, EntitlementType } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface CalculatedItem {
  productId: string;
  title: string;
  type: ProductType;
  targetId: string;
  priceInPaise: number;
  originalPriceInPaise: number;
  upgradeCreditInPaise: number;
  effectivePriceInPaise: number;
  isAlreadyOwned: boolean;
  ownershipReason?: string;
}

export interface PricingCalculationResult {
  items: CalculatedItem[];
  subtotalInPaise: number;
  totalUpgradeCreditInPaise: number;
  subtotalAfterUpgradeInPaise: number;
  discountInPaise: number;
  taxableAmountInPaise: number;
  gstInPaise: number; // 18% GST included
  cgstInPaise: number; // 9%
  sgstInPaise: number; // 9%
  finalPayableInPaise: number;
  couponCode?: string | null;
  couponApplied?: {
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
  } | null;
}

export class PricingService {
  /**
   * Independently calculate prices, upgrade credits, coupon discounts and GST
   */
  static async calculateCart(
    userId: string,
    productIds: string[],
    couponCode?: string | null
  ): Promise<PricingCalculationResult> {
    if (!productIds || productIds.length === 0) {
      throw new Error('No products in cart');
    }

    // 1. Fetch products
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length === 0) {
      throw new Error('No active products found for provided IDs');
    }

    const now = new Date();

    // 2. Fetch existing user entitlements to check ownership
    const userEntitlements = await prisma.entitlement.findMany({
      where: {
        userId,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    });

    const ownedChapterIds = new Set(
      userEntitlements.filter((e) => e.type === EntitlementType.CHAPTER).map((e) => e.targetId)
    );
    const ownedSubjectIds = new Set(
      userEntitlements.filter((e) => e.type === EntitlementType.SUBJECT).map((e) => e.targetId)
    );
    const ownedClassPassIds = new Set(
      userEntitlements.filter((e) => e.type === EntitlementType.CLASS_PASS).map((e) => e.targetId)
    );

    // 3. Fetch past paid order items to compute upgrade credits
    const pastPaidOrders = await prisma.order.findMany({
      where: {
        userId,
        status: OrderStatus.PAID,
      },
      include: {
        items: true,
      },
    });

    const pastPaidChapterItems = pastPaidOrders.flatMap((o) =>
      o.items.filter((item) => item.itemType === ProductType.CHAPTER)
    );

    let subtotalInPaise = 0;
    let totalUpgradeCreditInPaise = 0;
    const calculatedItems: CalculatedItem[] = [];

    for (const product of products) {
      let isAlreadyOwned = false;
      let ownershipReason: string | undefined;
      let upgradeCreditInPaise = 0;

      if (product.type === ProductType.CHAPTER) {
        // Find subject & class of this chapter
        const chapter = await prisma.chapter.findUnique({
          where: { id: product.targetId },
          include: { subject: true },
        });

        if (chapter) {
          if (ownedClassPassIds.has(chapter.subject.classId)) {
            isAlreadyOwned = true;
            ownershipReason = 'Covered under your active Class Pass';
          } else if (ownedSubjectIds.has(chapter.subject.id)) {
            isAlreadyOwned = true;
            ownershipReason = 'Covered under your owned Subject Package';
          } else if (ownedChapterIds.has(chapter.id)) {
            isAlreadyOwned = true;
            ownershipReason = 'You already own this chapter';
          }
        }
      } else if (product.type === ProductType.SUBJECT) {
        const subject = await prisma.subject.findUnique({
          where: { id: product.targetId },
          include: { chapters: true },
        });

        if (subject) {
          if (ownedClassPassIds.has(subject.classId)) {
            isAlreadyOwned = true;
            ownershipReason = 'Covered under your active Class Pass';
          } else if (ownedSubjectIds.has(subject.id)) {
            isAlreadyOwned = true;
            ownershipReason = 'You already own this Subject Package';
          } else {
            // Calculate UPGRADE CREDIT:
            // Find all chapters of this subject the student has already purchased
            const chapterIdsInSubject = new Set(subject.chapters.map((c) => c.id));
            const purchasedChaptersForSubject = pastPaidChapterItems.filter((item) =>
              chapterIdsInSubject.has(item.targetId)
            );

            // Sum the amount already paid for individual chapters
            const creditSum = purchasedChaptersForSubject.reduce(
              (acc, item) => acc + item.priceInPaise,
              0
            );

            // Cannot exceed product price
            upgradeCreditInPaise = Math.min(product.priceInPaise, creditSum);
          }
        }
      } else if (
        product.type === ProductType.MONTHLY_PASS ||
        product.type === ProductType.ANNUAL_PASS
      ) {
        // Passes can be purchased or renewed (renewal extends validity)
        // If renewing, not blocked
      }

      if (isAlreadyOwned) {
        throw new Error(
          `Cannot purchase "${product.title}": ${ownershipReason}. Please remove it from your cart.`
        );
      }

      const effectivePrice = Math.max(0, product.priceInPaise - upgradeCreditInPaise);

      subtotalInPaise += product.priceInPaise;
      totalUpgradeCreditInPaise += upgradeCreditInPaise;

      calculatedItems.push({
        productId: product.id,
        title: product.title,
        type: product.type,
        targetId: product.targetId,
        priceInPaise: product.priceInPaise,
        originalPriceInPaise: product.originalPriceInPaise,
        upgradeCreditInPaise,
        effectivePriceInPaise: effectivePrice,
        isAlreadyOwned,
        ownershipReason,
      });
    }

    const subtotalAfterUpgrade = Math.max(0, subtotalInPaise - totalUpgradeCreditInPaise);

    // 4. Coupon Validation & Discount Calculation
    let discountInPaise = 0;
    let couponApplied: PricingCalculationResult['couponApplied'] = null;

    if (couponCode && couponCode.trim()) {
      const codeUpper = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: codeUpper },
      });

      if (!coupon) {
        throw new Error(`Coupon "${codeUpper}" does not exist.`);
      }

      if (!coupon.isActive) {
        throw new Error(`Coupon "${codeUpper}" is inactive.`);
      }

      if (now > coupon.validUntil) {
        throw new Error(`Coupon "${codeUpper}" has expired.`);
      }

      if (coupon.timesUsed >= coupon.usageLimit) {
        throw new Error(`Coupon "${codeUpper}" usage limit has been reached.`);
      }

      if (subtotalAfterUpgrade < coupon.minOrderValueInPaise) {
        const minRupees = (coupon.minOrderValueInPaise / 100).toFixed(0);
        throw new Error(
          `Coupon "${codeUpper}" requires a minimum order value of ₹${minRupees}.`
        );
      }

      if (coupon.discountType === DiscountType.FLAT) {
        discountInPaise = Math.min(coupon.discountValue, subtotalAfterUpgrade);
      } else if (coupon.discountType === DiscountType.PERCENTAGE) {
        const rawDiscount = Math.floor((subtotalAfterUpgrade * coupon.discountValue) / 100);
        discountInPaise = coupon.maxDiscountInPaise
          ? Math.min(rawDiscount, coupon.maxDiscountInPaise)
          : rawDiscount;
        discountInPaise = Math.min(discountInPaise, subtotalAfterUpgrade);
      }

      couponApplied = {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    const finalPayableInPaise = Math.max(0, subtotalAfterUpgrade - discountInPaise);

    // 5. 18% GST Calculation (Prices inclusive of GST)
    // Inclusive: finalPayable = taxableBase * 1.18 => taxableBase = Math.round(finalPayable / 1.18)
    const taxableAmountInPaise = Math.round(finalPayableInPaise / 1.18);
    const gstInPaise = finalPayableInPaise - taxableAmountInPaise;
    const cgstInPaise = Math.floor(gstInPaise / 2);
    const sgstInPaise = gstInPaise - cgstInPaise;

    return {
      items: calculatedItems,
      subtotalInPaise,
      totalUpgradeCreditInPaise,
      subtotalAfterUpgradeInPaise: subtotalAfterUpgrade,
      discountInPaise,
      taxableAmountInPaise,
      gstInPaise,
      cgstInPaise,
      sgstInPaise,
      finalPayableInPaise,
      couponCode: couponApplied ? couponApplied.code : null,
      couponApplied,
    };
  }
}
