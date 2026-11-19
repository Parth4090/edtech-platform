import { Router } from 'express';
import authRoutes from './auth.routes';
import catalogueRoutes from './catalogue.routes';
import cartRoutes from './cart.routes';
import paymentRoutes from './payment.routes';
import libraryRoutes from './library.routes';
import materialRoutes from './material.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalogue', catalogueRoutes);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/library', libraryRoutes);
router.use('/materials', materialRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Ed-Tech API Platform',
  });
});

export default router;
