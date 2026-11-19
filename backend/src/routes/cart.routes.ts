import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/calculate', authenticate, CartController.calculate);
router.post('/checkout', authenticate, CartController.createOrder);
router.get('/coupons', authenticate, CartController.getAvailableCoupons);

export default router;
