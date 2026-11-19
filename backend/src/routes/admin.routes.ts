import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Role } from '@prisma/client';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Configure multer storage for materials
const uploadDir = path.resolve(__dirname, '../../uploads/materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `material-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed'));
    }
  },
});

// All admin routes require ADMIN role
router.use(authenticate, requireRole(Role.ADMIN));

// Overview
router.get('/metrics', AdminController.getDashboardMetrics);

// Board management
router.get('/boards', AdminController.getBoards);
router.post('/boards', AdminController.createBoard);
router.put('/boards/:id', AdminController.updateBoard);
router.delete('/boards/:id', AdminController.deleteBoard);

// Class management
router.get('/classes', AdminController.getClasses);
router.post('/classes', AdminController.createClass);
router.put('/classes/:id', AdminController.updateClass);
router.delete('/classes/:id', AdminController.deleteClass);

// Subject management
router.get('/subjects', AdminController.getSubjects);
router.post('/subjects', AdminController.createSubject);
router.put('/subjects/:id', AdminController.updateSubject);
router.delete('/subjects/:id', AdminController.deleteSubject);

// Chapter management
router.get('/chapters', AdminController.getChapters);
router.post('/chapters', AdminController.createChapter);
router.put('/chapters/:id', AdminController.updateChapter);
router.delete('/chapters/:id', AdminController.deleteChapter);
router.patch('/chapters/:id/free', AdminController.toggleChapterFree);

// Material upload & delete
router.post('/materials/upload', upload.single('file'), AdminController.uploadMaterial);
router.delete('/materials/:id', AdminController.deleteMaterial);

// Product & Pricing management
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.createProduct);
router.patch('/products/:id/price', AdminController.updateProductPrice);

// Orders & Payments
router.get('/orders', AdminController.getOrders);

// Coupon management
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', AdminController.createCoupon);
router.patch('/coupons/:id/toggle', AdminController.toggleCoupon);

// Students & Access Entitlements
router.get('/students', AdminController.getStudents);
router.get('/students/:userId/entitlements', AdminController.getStudentEntitlements);
router.post('/access/grant', AdminController.grantAccess);
router.post('/access/revoke', AdminController.revokeAccess);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
