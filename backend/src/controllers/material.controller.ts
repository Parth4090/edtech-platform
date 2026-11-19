import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EntitlementService } from '../services/entitlement.service';

export class MaterialController {
  /**
   * Secure PDF streaming endpoint
   * Accessible only if the user has entitlement or material belongs to a free chapter (with auth)
   */
  static async stream(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: {
              include: { class: true },
            },
          },
        },
      },
    });

    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    // Verify access via EntitlementService
    const accessCheck = await EntitlementService.hasAccessToChapter(userId, material.chapterId);

    if (!accessCheck.hasAccess) {
      res.status(403).json({
        error: 'Access Denied: This PDF is locked. You must purchase this study material or an all-access pass to view it.',
        locked: true,
        reason: accessCheck.reason,
      });
      return;
    }

    // Check if physical file exists
    const filePath = path.resolve(material.filePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Study material file is not available on server storage' });
      return;
    }

    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': `inline; filename="${encodeURIComponent(path.basename(filePath))}"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  }

  /**
   * Get material info and verification status
   */
  static async getInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: {
              include: { class: { include: { board: true } } },
            },
          },
        },
      },
    });

    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    const accessCheck = await EntitlementService.hasAccessToChapter(userId, material.chapterId);

    res.json({
      material: {
        id: material.id,
        title: material.title,
        description: material.description,
        fileSize: material.fileSize,
        pageCount: material.pageCount,
        chapter: {
          id: material.chapter.id,
          title: material.chapter.title,
          chapterNumber: material.chapter.chapterNumber,
          isFree: material.chapter.isFree,
          subject: material.chapter.subject,
        },
      },
      hasAccess: accessCheck.hasAccess,
      accessReason: accessCheck.reason,
    });
  }
}
