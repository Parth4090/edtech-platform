import { Request, Response } from 'express';
import { verifyPaymentSchema, failedPaymentSchema } from '../validators/cart.validator';
import { PaymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PaymentController {
  static async verify(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = verifyPaymentSchema.parse(req.body);

    const result = await PaymentService.verifyPayment({
      orderId: validated.orderId,
      razorpayOrderId: validated.razorpayOrderId,
      razorpayPaymentId: validated.razorpayPaymentId,
      razorpaySignature: validated.razorpaySignature,
      method: req.body.method,
    });

    res.json(result);
  }

  static async signTestPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId, razorpayOrderId, razorpayPaymentId } = req.body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      res.status(400).json({ error: 'Missing test payment parameters' });
      return;
    }

    const crypto = await import('crypto');
    const { env } = await import('../config/env');

    const signature = crypto.default
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    res.json({ signature });
  }

  static async reportFailure(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = failedPaymentSchema.parse(req.body);

    const result = await PaymentService.handleFailedPayment({
      orderId: validated.orderId,
      razorpayOrderId: validated.razorpayOrderId,
      razorpayPaymentId: validated.razorpayPaymentId,
      errorDescription: validated.errorDescription,
    });

    res.json(result);
  }

  static async webhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        res.status(400).json({ error: 'Missing x-razorpay-signature header' });
        return;
      }

      // rawBody is attached by express.json({ verify: ... })
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await PaymentService.processWebhook(rawBody, signature);
      res.json(result);
    } catch (error: any) {
      console.error('[Razorpay Webhook Error]', error);
      res.status(400).json({ error: error.message || 'Webhook processing failed' });
    }
  }
}
