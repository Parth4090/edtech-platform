import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createBoardSchema,
  createClassSchema,
  createSubjectSchema,
  createChapterSchema,
  createProductSchema,
  updateProductPriceSchema,
  createCouponSchema,
  grantAccessSchema,
  revokeAccessSchema,
} from '../validators/admin.validator';
import { OrderStatus, PaymentStatus, Role, EntitlementType } from '@prisma/client';
import { EntitlementService } from '../services/entitlement.service';
import fs from 'fs';
import path from 'path';

export class AdminController {
  /**
   * Analytics & KPI Overview
   */
  static async getDashboardMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const now = new Date();

    const [
      totalStudents,
      totalOrders,
      paidOrders,
      successfulPaymentsCount,
      failedPaymentsCount,
      activeSubscriptionsCount,
      recentOrders,
      topSellingItems,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: OrderStatus.PAID },
        select: { totalInPaise: true, createdAt: true },
      }),
      prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
      prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      prisma.entitlement.count({
        where: {
          type: EntitlementType.CLASS_PASS,
          validUntil: { gte: now },
        },
      }),
      prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: true,
          payments: { select: { method: true, status: true, razorpayPaymentId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'title', 'itemType'],
        _count: { id: true },
        _sum: { priceInPaise: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const totalRevenueInPaise = paidOrders.reduce((sum, o) => sum + o.totalInPaise, 0);

    // Group revenue by month for the chart (past 6 months)
    const revenueByMonth: Record<string, number> = {};
    for (const order of paidOrders) {
      const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.totalInPaise;
    }

    const chartData = Object.entries(revenueByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenueInPaise]) => ({
        month,
        revenueInRupees: Math.round(revenueInPaise / 100),
      }));

    res.json({
      metrics: {
        totalStudents,
        totalOrders,
        totalRevenueInPaise,
        totalRevenueInRupees: Math.round(totalRevenueInPaise / 100),
        successfulPaymentsCount,
        failedPaymentsCount,
        activeSubscriptionsCount,
      },
      chartData,
      recentOrders,
      topSellingItems,
    });
  }

  // --- Board CRUD ---
  static async getBoards(req: AuthenticatedRequest, res: Response): Promise<void> {
    const boards = await prisma.board.findMany({
      include: {
        classes: {
          include: {
            _count: { select: { subjects: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ boards });
  }

  static async createBoard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createBoardSchema.parse(req.body);
    const board = await prisma.board.create({ data: validated });
    res.status(201).json({ board });
  }

  static async updateBoard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validated = createBoardSchema.partial().parse(req.body);
    const board = await prisma.board.update({ where: { id }, data: validated });
    res.json({ board });
  }

  static async deleteBoard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await prisma.board.delete({ where: { id } });
    res.json({ message: 'Board deleted successfully' });
  }

  // --- Class CRUD ---
  static async getClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const classes = await prisma.class.findMany({
      include: {
        board: true,
        subjects: {
          include: { _count: { select: { chapters: true } } },
        },
      },
      orderBy: [{ board: { name: 'asc' } }, { order: 'asc' }],
    });
    res.json({ classes });
  }

  static async createClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createClassSchema.parse(req.body);
    const cls = await prisma.class.create({ data: validated });
    res.status(201).json({ class: cls });
  }

  static async updateClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validated = createClassSchema.partial().parse(req.body);
    const cls = await prisma.class.update({ where: { id }, data: validated });
    res.json({ class: cls });
  }

  static async deleteClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Class deleted successfully' });
  }

  // --- Subject CRUD ---
  static async getSubjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    const subjects = await prisma.subject.findMany({
      include: {
        class: { include: { board: true } },
        _count: { select: { chapters: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ subjects });
  }

  static async createSubject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createSubjectSchema.parse(req.body);
    const subject = await prisma.subject.create({ data: validated });
    res.status(201).json({ subject });
  }

  static async updateSubject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validated = createSubjectSchema.partial().parse(req.body);
    const subject = await prisma.subject.update({ where: { id }, data: validated });
    res.json({ subject });
  }

  static async deleteSubject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Subject deleted successfully' });
  }

  // --- Chapter CRUD ---
  static async getChapters(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { subjectId } = req.query;
    const chapters = await prisma.chapter.findMany({
      where: subjectId ? { subjectId: String(subjectId) } : undefined,
      include: {
        subject: { include: { class: true } },
        materials: true,
      },
      orderBy: { chapterNumber: 'asc' },
    });
    res.json({ chapters });
  }

  static async createChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createChapterSchema.parse(req.body);
    const chapter = await prisma.chapter.create({ data: validated });
    res.status(201).json({ chapter });
  }

  static async updateChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validated = createChapterSchema.partial().parse(req.body);
    const chapter = await prisma.chapter.update({ where: { id }, data: validated });
    res.json({ chapter });
  }

  static async deleteChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await prisma.chapter.delete({ where: { id } });
    res.json({ message: 'Chapter deleted successfully' });
  }

  static async toggleChapterFree(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { isFree } = req.body;

    const chapter = await prisma.chapter.update({
      where: { id },
      data: { isFree: Boolean(isFree) },
    });

    res.json({ chapter });
  }

  // --- Material Upload & Management ---
  static async uploadMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    const file = req.file;
    const { chapterId, title, description } = req.body;

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    if (!chapterId || !title) {
      res.status(400).json({ error: 'Chapter ID and title are required' });
      return;
    }

    const material = await prisma.material.create({
      data: {
        title,
        description,
        filePath: file.path,
        fileSize: file.size,
        pageCount: 2,
        chapterId,
      },
    });

    res.status(201).json({ material });
  }

  static async deleteMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const material = await prisma.material.findUnique({ where: { id } });

    if (material) {
      if (fs.existsSync(material.filePath)) {
        try {
          fs.unlinkSync(material.filePath);
        } catch (ignored) {}
      }
      await prisma.material.delete({ where: { id } });
    }

    res.json({ message: 'Study material removed successfully' });
  }

  // --- Product & Pricing Management ---
  static async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const products = await prisma.product.findMany({
      include: { class: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  }

  static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createProductSchema.parse(req.body);
    const product = await prisma.product.create({ data: validated });
    res.status(201).json({ product });
  }

  static async updateProductPrice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const validated = updateProductPriceSchema.parse(req.body);
    const product = await prisma.product.update({
      where: { id },
      data: validated,
    });
    res.json({ product });
  }

  // --- Orders & Payments Management ---
  static async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status, dateFrom, dateTo, search } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(String(dateFrom));
      if (dateTo) where.createdAt.lte = new Date(String(dateTo));
    }
    if (search) {
      const q = String(search);
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        payments: true,
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  }

  // --- Coupon Management ---
  static async getCoupons(req: AuthenticatedRequest, res: Response): Promise<void> {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ coupons });
  }

  static async createCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = createCouponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        ...validated,
        validUntil: new Date(validated.validUntil),
      },
    });
    res.status(201).json({ coupon });
  }

  static async toggleCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    res.json({ coupon: updated });
  }

  // --- Students & Access Management ---
  static async getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            entitlements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ students });
  }

  static async getStudentEntitlements(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ entitlements });
  }

  static async grantAccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    const adminId = req.user!.id;
    const validated = grantAccessSchema.parse(req.body);

    const entitlement = await EntitlementService.grantAdminAccess({
      adminId,
      userId: validated.userId,
      type: validated.type,
      targetId: validated.targetId,
      durationDays: validated.durationDays,
      reason: validated.reason,
    });

    res.status(201).json({
      message: 'Access granted successfully and audit logged.',
      entitlement,
    });
  }

  static async revokeAccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    const adminId = req.user!.id;
    const validated = revokeAccessSchema.parse(req.body);

    await EntitlementService.revokeAdminAccess({
      adminId,
      entitlementId: validated.entitlementId,
      reason: validated.reason,
    });

    res.json({ message: 'Access revoked successfully and audit logged.' });
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ auditLogs });
  }
}
