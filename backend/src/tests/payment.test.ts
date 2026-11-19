import crypto from 'crypto';
import { PaymentService } from '../services/payment.service';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { OrderStatus, PaymentStatus, ProductType, EntitlementType } from '@prisma/client';

describe('Phase 3 - Payment & Webhook Tests', () => {
  let testStudent: any;
  let testChapterProduct: any;
  let testChapter: any;

  beforeAll(async () => {
    testStudent = await prisma.user.findUnique({
      where: { email: 'student@edtech.com' },
    });

    testChapter = await prisma.chapter.findFirst({
      where: { slug: 'class-10-mathematics-quadratic-equations' },
    });

    testChapterProduct = await prisma.product.findFirst({
      where: { targetId: testChapter.id, type: ProductType.CHAPTER },
    });
  });

  // TEST 5: Valid Razorpay signature verification
  test('5. Valid Razorpay signature: verifies valid HMAC-SHA256 signature and grants entitlement', async () => {
    // Ensure clean state for test chapter
    await prisma.entitlement.deleteMany({
      where: {
        userId: testStudent.id,
        targetId: testChapter.id,
      },
    });

    // Create an order
    const checkoutOrder = await PaymentService.createCheckoutOrder(testStudent.id, [
      testChapterProduct.id,
    ]);

    const razorpayOrderId = checkoutOrder.razorpayOrderId;
    const razorpayPaymentId = `pay_valid_${Date.now()}`;

    // Generate legitimate signature
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const result = await PaymentService.verifyPayment({
      orderId: checkoutOrder.orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
      method: 'upi',
    });

    expect(result.success).toBe(true);

    // Verify order status updated to PAID
    const updatedOrder = await prisma.order.findUnique({
      where: { id: checkoutOrder.orderId },
    });
    expect(updatedOrder?.status).toBe(OrderStatus.PAID);
    expect(updatedOrder?.invoiceNumber).toBeDefined();

    // Verify entitlement granted
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: testStudent.id,
        type: EntitlementType.CHAPTER,
        targetId: testChapter.id,
      },
    });
    expect(entitlement).toBeDefined();
  });

  // TEST 6: Tampered Razorpay signature
  test('6. Tampered Razorpay signature: rejects forged/tampered signature and creates FAILED payment record', async () => {
    // Use an unowned chapter for Test 6
    const unownedChapter = await prisma.chapter.findFirst({
      where: { slug: 'class-10-mathematics-arithmetic-progressions' },
    });
    await prisma.entitlement.deleteMany({
      where: {
        userId: testStudent.id,
        targetId: unownedChapter!.id,
      },
    });

    const unownedProduct = await prisma.product.findFirst({
      where: { targetId: unownedChapter!.id, type: ProductType.CHAPTER },
    });

    const checkoutOrder = await PaymentService.createCheckoutOrder(testStudent.id, [
      unownedProduct!.id,
    ]);

    const razorpayOrderId = checkoutOrder.razorpayOrderId;
    const razorpayPaymentId = `pay_tampered_${Date.now()}`;
    const tamperedSignature = 'corrupted_or_forged_signature_value_1234567890';

    await expect(
      PaymentService.verifyPayment({
        orderId: checkoutOrder.orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: tamperedSignature,
        method: 'card',
      })
    ).rejects.toThrow('Payment verification failed: Invalid signature');

    // Verify a failed payment record was stored for audit
    const failedPayment = await prisma.payment.findFirst({
      where: {
        orderId: checkoutOrder.orderId,
        status: PaymentStatus.FAILED,
      },
    });
    expect(failedPayment).toBeDefined();
    expect(failedPayment?.failureReason).toContain('Invalid payment signature');
  });

  // TEST 7: Duplicate webhook handling
  test('7. Duplicate webhook handling: processes first event and cleanly ignores duplicate event (idempotent)', async () => {
    const eventId = `evt_test_${Date.now()}`;
    const payload = JSON.stringify({
      id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: `order_webhook_${Date.now()}`,
            amount: 9900,
            method: 'upi',
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // First delivery
    const firstCall = await PaymentService.processWebhook(payload, signature);
    expect(firstCall.status).toBe('SUCCESS');

    // Duplicate delivery with same eventId
    const secondCall = await PaymentService.processWebhook(payload, signature);
    expect(secondCall.status).toBe('IGNORED');
    expect(secondCall.message).toContain('Duplicate webhook event already processed');
  });

  // TEST 8: Failed payment handling
  test('8. Failed payment handling: marks order as FAILED and never grants access', async () => {
    // Create new student and unowned chapter
    const failStudent = await prisma.user.create({
      data: {
        email: `failedpay_${Date.now()}@edtech.com`,
        passwordHash: 'hash',
        name: 'Failed Pay Student',
      },
    });

    const unownedChapter = await prisma.chapter.findFirst({
      where: { slug: 'class-11-physics-laws-of-motion' },
    });

    const unownedProduct = await prisma.product.findFirst({
      where: { targetId: unownedChapter!.id, type: ProductType.CHAPTER },
    });

    const checkoutOrder = await PaymentService.createCheckoutOrder(failStudent.id, [
      unownedProduct!.id,
    ]);

    // Report payment failure
    const failureReport = await PaymentService.handleFailedPayment({
      orderId: checkoutOrder.orderId,
      errorDescription: 'User cancelled UPI transaction on phone',
    });

    expect(failureReport.success).toBe(true);

    const failedOrder = await prisma.order.findUnique({
      where: { id: checkoutOrder.orderId },
    });
    expect(failedOrder?.status).toBe(OrderStatus.FAILED);

    // Verify access was NEVER granted
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: failStudent.id,
        type: EntitlementType.CHAPTER,
        targetId: unownedChapter!.id,
      },
    });
    expect(entitlement).toBeNull();

    // Clean up
    await prisma.user.delete({ where: { id: failStudent.id } });
  });
});
