import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Secure streaming endpoint for authenticated students / free sample access
router.get('/:id/stream', optionalAuthenticate, MaterialController.stream);
router.get('/:id/info', optionalAuthenticate, MaterialController.getInfo);

export default router;
