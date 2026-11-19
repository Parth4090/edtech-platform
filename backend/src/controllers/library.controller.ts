import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EntitlementType, OrderStatus, ProductType } from '@prisma/client';

export class LibraryController {
  static async getMyLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const now = new Date();

    // 1. Fetch all active entitlements
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const chapterIds = entitlements
      .filter((e) => e.type === EntitlementType.CHAPTER)
      .map((e) => e.targetId);

    const subjectIds = entitlements
      .filter((e) => e.type === EntitlementType.SUBJECT)
      .map((e) => e.targetId);

    const classPasses = entitlements.filter((e) => e.type === EntitlementType.CLASS_PASS);
    const classPassClassIds = classPasses.map((e) => e.targetId);

    // Fetch classes details for active passes
    const passesWithDetails = await Promise.all(
      classPasses.map(async (pass) => {
        const cls = await prisma.class.findUnique({
          where: { id: pass.targetId },
          include: { board: true },
        });
        const daysLeft = pass.validUntil
          ? Math.max(0, Math.ceil((pass.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null;
        return {
          id: pass.id,
          class: cls,
          validUntil: pass.validUntil,
          daysLeft,
          createdAt: pass.createdAt,
        };
      })
    );

    // Fetch purchased subjects
    const subjects = await prisma.subject.findMany({
      where: {
        OR: [{ id: { in: subjectIds } }, { classId: { in: classPassClassIds } }],
      },
      include: {
        class: { include: { board: true } },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: {
            materials: true,
          },
        },
      },
    });

    // Fetch individual purchased chapters
    const chapters = await prisma.chapter.findMany({
      where: {
        id: { in: chapterIds },
      },
      include: {
        subject: {
          include: { class: { include: { board: true } } },
        },
        materials: true,
      },
    });

    // Recent purchases (last 3 paid orders)
    const recentOrders = await prisma.order.findMany({
      where: {
        userId,
        status: OrderStatus.PAID,
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Total counts
    const totalMaterials =
      chapters.reduce((sum, ch) => sum + ch.materials.length, 0) +
      subjects.reduce(
        (sum, s) => sum + s.chapters.reduce((csum, ch) => csum + ch.materials.length, 0),
        0
      );

    res.json({
      summary: {
        totalMaterials,
        activeSubscriptionsCount: classPasses.length,
        purchasedSubjectsCount: subjectIds.length,
        purchasedChaptersCount: chapterIds.length,
      },
      activePasses: passesWithDetails,
      subjects,
      individualChapters: chapters,
      recentOrders,
    });
  }

  static async getMyOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  }

  static async getOrderInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        payments: true,
        coupon: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ invoice: order });
  }
}
