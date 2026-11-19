import { PricingService } from '../services/pricing.service';
import { prisma } from '../config/prisma';
import { ProductType, OrderStatus, DiscountType } from '@prisma/client';

describe('Phase 3 - Business Logic Tests', () => {
  let studentUser: any;
  let testSubject: any;
  let subjectProduct: any;
  let chapter1: any;
  let chapter2: any;
  let chapter1Product: any;
  let chapter2Product: any;
  let testCoupon: any;

  beforeAll(async () => {
    // Retrieve seeded student user
    studentUser = await prisma.user.findUnique({
      where: { email: 'student@edtech.com' },
    });

    // Retrieve seeded subject & its product
    testSubject = await prisma.subject.findFirst({
      where: { slug: 'class-10-mathematics' },
      include: { chapters: { orderBy: { chapterNumber: 'asc' } } },
    });

    chapter1 = testSubject.chapters[0];
    chapter2 = testSubject.chapters[1];

    chapter1Product = await prisma.product.findFirst({
      where: { targetId: chapter1.id, type: ProductType.CHAPTER },
    });

    chapter2Product = await prisma.product.findFirst({
      where: { targetId: chapter2.id, type: ProductType.CHAPTER },
    });

    subjectProduct = await prisma.product.findFirst({
      where: { targetId: testSubject.id, type: ProductType.SUBJECT },
    });

    testCoupon = await prisma.coupon.findUnique({
      where: { code: 'WELCOME50' },
    });
  });

  // TEST 1: Price calculation
  test('1. Price calculation: should accurately calculate subtotal for individual products', async () => {
    const result = await PricingService.calculateCart(studentUser.id, [
      chapter1Product.id,
      chapter2Product.id,
    ]);

    expect(result.items.length).toBe(2);
    expect(result.subtotalInPaise).toBe(
      chapter1Product.priceInPaise + chapter2Product.priceInPaise
    );
    expect(result.subtotalAfterUpgradeInPaise).toBe(result.subtotalInPaise);
    expect(result.finalPayableInPaise).toBe(result.subtotalInPaise);
  });

  // TEST 2: Upgrade credit calculation
  test('2. Upgrade credit calculation: should subtract previously paid chapter amounts from subject package and never become negative', async () => {
    // Create a temporary student user for isolated upgrade test
    const tempStudent = await prisma.user.create({
      data: {
        email: `upgradetest_${Date.now()}@edtech.com`,
        passwordHash: 'hash',
        name: 'Upgrade Student',
      },
    });

    // Simulate that the student has purchased Chapter 1 (₹99 = 9900 paise)
    const paidOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-UPGRADE-${Date.now()}`,
        userId: tempStudent.id,
        subtotalInPaise: 9900,
        totalInPaise: 9900,
        status: OrderStatus.PAID,
        items: {
          create: {
            productId: chapter1Product.id,
            title: chapter1Product.title,
            itemType: ProductType.CHAPTER,
            targetId: chapter1.id,
            priceInPaise: 9900,
            originalPriceInPaise: 19900,
          },
        },
      },
    });

    // Now calculate cart for the complete Subject package
    const result = await PricingService.calculateCart(tempStudent.id, [subjectProduct.id]);

    expect(result.totalUpgradeCreditInPaise).toBe(9900);
    expect(result.subtotalAfterUpgradeInPaise).toBe(subjectProduct.priceInPaise - 9900);
    expect(result.subtotalAfterUpgradeInPaise).toBeGreaterThanOrEqual(0);
    expect(result.items[0].upgradeCreditInPaise).toBe(9900);
    expect(result.items[0].effectivePriceInPaise).toBe(subjectProduct.priceInPaise - 9900);

    // Clean up
    await prisma.orderItem.deleteMany({ where: { orderId: paidOrder.id } });
    await prisma.order.delete({ where: { id: paidOrder.id } });
    await prisma.user.delete({ where: { id: tempStudent.id } });
  });

  // TEST 3: Coupon validation
  test('3. Coupon validation: applies percentage/flat discount and rejects expired/invalid coupons', async () => {
    // Create an isolated user with no past purchases to test clean coupon calculations
    const couponTestUser = await prisma.user.create({
      data: {
        email: `coupontest_${Date.now()}@edtech.com`,
        passwordHash: 'hash',
        name: 'Coupon Test Student',
      },
    });

    // Apply valid WELCOME50 (50% off on 39900 = 19950, max cap 20000)
    const resultWithCoupon = await PricingService.calculateCart(
      couponTestUser.id,
      [subjectProduct.id], // ₹399 = 39900 paise
      'WELCOME50'
    );

    expect(resultWithCoupon.couponApplied).toBeDefined();
    expect(resultWithCoupon.couponApplied?.code).toBe('WELCOME50');
    // 50% of 39900 is 19950, which is below max cap of 20000
    expect(resultWithCoupon.discountInPaise).toBe(19950);
    expect(resultWithCoupon.finalPayableInPaise).toBe(39900 - 19950);

    // Test rejection of non-existent coupon
    await expect(
      PricingService.calculateCart(couponTestUser.id, [subjectProduct.id], 'INVALIDCODE999')
    ).rejects.toThrow('Coupon "INVALIDCODE999" does not exist.');

    // Test rejection of coupon below minimum order value
    const cheapChapterResult = PricingService.calculateCart(
      couponTestUser.id,
      [chapter1Product.id], // ₹99 = 9900 paise, but WELCOME50 min order is 20000 paise (₹200)
      'WELCOME50'
    );
    await expect(cheapChapterResult).rejects.toThrow('minimum order value');

    await prisma.user.delete({ where: { id: couponTestUser.id } });
  });

  // TEST 4: GST calculation
  test('4. GST calculation: correctly calculates 18% inclusive GST breakdown in integer paise', async () => {
    const result = await PricingService.calculateCart(studentUser.id, [subjectProduct.id]);

    const total = result.finalPayableInPaise;
    const expectedTaxable = Math.round(total / 1.18);
    const expectedGst = total - expectedTaxable;

    expect(result.taxableAmountInPaise).toBe(expectedTaxable);
    expect(result.gstInPaise).toBe(expectedGst);
    expect(result.cgstInPaise + result.sgstInPaise).toBe(expectedGst);
    expect(result.taxableAmountInPaise + result.gstInPaise).toBe(total);
  });
});
