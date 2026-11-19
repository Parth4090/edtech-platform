import { Router } from 'express';
import { LibraryController } from '../controllers/library.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-library', authenticate, LibraryController.getMyLibrary);
router.get('/my-orders', authenticate, LibraryController.getMyOrders);
router.get('/orders/:orderId/invoice', authenticate, LibraryController.getOrderInvoice);

export default router;
