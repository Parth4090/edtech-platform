import { z } from 'zod';

export const calculateCartSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Cart must contain at least one product'),
  couponCode: z.string().optional().nullable(),
});

export const createCheckoutOrderSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Cart must contain at least one product'),
  couponCode: z.string().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

export const failedPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  errorDescription: z.string().optional(),
});
