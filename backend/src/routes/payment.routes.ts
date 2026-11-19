import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { paymentRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/verify', authenticate, paymentRateLimiter, PaymentController.verify);
router.post('/sign-test', authenticate, PaymentController.signTestPayment);
router.post('/failed', authenticate, paymentRateLimiter, PaymentController.reportFailure);
router.post('/webhook', PaymentController.webhook);

export default router;
