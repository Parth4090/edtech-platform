import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ProductType } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EntitlementService } from '../services/entitlement.service';

export class CatalogueController {
  static async getBoards(req: Request, res: Response): Promise<void> {
    const boards = await prisma.board.findMany({
      include: {
        classes: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { subjects: true },
            },
          },
        },
      },
    });

    res.json({ boards });
  }

  static async getClasses(req: Request, res: Response): Promise<void> {
    const { boardId } = req.query;

    const classes = await prisma.class.findMany({
      where: boardId ? { boardId: String(boardId) } : undefined,
      orderBy: { order: 'asc' },
      include: {
        board: { select: { id: true, name: true, slug: true } },
        subjects: {
          include: {
            _count: { select: { chapters: true } },
          },
        },
        products: {
          where: {
            isActive: true,
            type: { in: [ProductType.MONTHLY_PASS, ProductType.ANNUAL_PASS] },
          },
        },
      },
    });

    res.json({ classes });
  }

  static async getSubjects(req: Request, res: Response): Promise<void> {
    const { classId } = req.query;

    const subjects = await prisma.subject.findMany({
      where: classId ? { classId: String(classId) } : undefined,
      include: {
        class: {
          include: { board: true },
        },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            chapterNumber: true,
            isFree: true,
            _count: { select: { materials: true } },
          },
        },
      },
    });

    res.json({ subjects });
  }

  static async getSubjectDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    const subject = await prisma.subject.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        class: {
          include: { board: true },
        },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: {
            materials: {
              select: {
                id: true,
                title: true,
                description: true,
                fileSize: true,
                pageCount: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    // Get subject package product
    const packageProduct = await prisma.product.findFirst({
      where: {
        targetId: subject.id,
        type: ProductType.SUBJECT,
        isActive: true,
      },
    });

    // Check user entitlements if logged in
    let hasSubjectAccess = false;
    let ownedChapterIds = new Set<string>();

    if (userId) {
      hasSubjectAccess = await EntitlementService.hasAccessToSubject(userId, subject.id);
      const userEntitlements = await EntitlementService.getUserEntitlements(userId);
      ownedChapterIds = new Set(
        userEntitlements.filter((e) => e.type === 'CHAPTER').map((e) => e.targetId)
      );
    }

    const chaptersWithAccess = subject.chapters.map((ch) => {
      const hasAccess = hasSubjectAccess || ch.isFree || ownedChapterIds.has(ch.id);
      return {
        ...ch,
        hasAccess,
      };
    });

    res.json({
      subject: {
        ...subject,
        chapters: chaptersWithAccess,
      },
      packageProduct,
      userAccess: {
        hasSubjectAccess,
      },
    });
  }

  static async getChapterDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    const chapter = await prisma.chapter.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        subject: {
          include: {
            class: {
              include: { board: true },
            },
          },
        },
        materials: {
          select: {
            id: true,
            title: true,
            description: true,
            fileSize: true,
            pageCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    // Get chapter product
    const product = await prisma.product.findFirst({
      where: {
        targetId: chapter.id,
        type: ProductType.CHAPTER,
        isActive: true,
      },
    });

    const accessInfo = await EntitlementService.hasAccessToChapter(userId, chapter.id);

    res.json({
      chapter,
      product,
      hasAccess: accessInfo.hasAccess,
      accessReason: accessInfo.reason,
    });
  }

  static async getProducts(req: Request, res: Response): Promise<void> {
    const { type, classId } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        type: type ? (String(type) as ProductType) : undefined,
        classId: classId ? String(classId) : undefined,
      },
      include: {
        class: true,
      },
      orderBy: { priceInPaise: 'asc' },
    });

    res.json({ products });
  }

  static async search(req: Request, res: Response): Promise<void> {
    const query = String(req.query.q || '').trim();
    if (!query) {
      res.json({ results: { chapters: [], subjects: [], products: [] } });
      return;
    }

    const [chapters, subjects, products] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          subject: { include: { class: true } },
        },
        take: 10,
      }),
      prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { class: true },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { class: true },
        take: 10,
      }),
    ]);

    res.json({ results: { chapters, subjects, products } });
  }
}
