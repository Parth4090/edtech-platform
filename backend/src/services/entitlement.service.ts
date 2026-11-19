import { EntitlementType } from '@prisma/client';
import { prisma } from '../config/prisma';

export class EntitlementService {
  /**
   * Check if a user has access to a specific chapter
   */
  static async hasAccessToChapter(userId: string | undefined, chapterId: string): Promise<{ hasAccess: boolean; reason: string }> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: {
          select: { id: true, classId: true },
        },
      },
    });

    if (!chapter) {
      return { hasAccess: false, reason: 'Chapter not found' };
    }

    // Free sample chapters require authentication but no purchase
    if (chapter.isFree) {
      if (userId) {
        return { hasAccess: true, reason: 'Free sample chapter' };
      } else {
        return { hasAccess: false, reason: 'Sign-in required to access free sample chapter' };
      }
    }

    if (!userId) {
      return { hasAccess: false, reason: 'Authentication required' };
    }

    const now = new Date();

    // Check direct chapter entitlement
    const chapterEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        type: EntitlementType.CHAPTER,
        targetId: chapterId,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    });

    if (chapterEntitlement) {
      return { hasAccess: true, reason: 'Chapter entitlement owned' };
    }

    // Check subject package entitlement
    const subjectEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        type: EntitlementType.SUBJECT,
        targetId: chapter.subject.id,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    });

    if (subjectEntitlement) {
      return { hasAccess: true, reason: 'Subject package owned' };
    }

    // Check class pass (monthly or annual) entitlement
    const classPassEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        type: EntitlementType.CLASS_PASS,
        targetId: chapter.subject.classId,
        validUntil: { gte: now },
      },
    });

    if (classPassEntitlement) {
      return { hasAccess: true, reason: 'Active class pass' };
    }

    return { hasAccess: false, reason: 'Material locked. Purchase required.' };
  }

  /**
   * Check if a user has access to a full subject
   */
  static async hasAccessToSubject(userId: string, subjectId: string): Promise<boolean> {
    const now = new Date();

    const subjectEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        type: EntitlementType.SUBJECT,
        targetId: subjectId,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    });

    if (subjectEntitlement) return true;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { classId: true },
    });

    if (!subject) return false;

    const classPass = await prisma.entitlement.findFirst({
      where: {
        userId,
        type: EntitlementType.CLASS_PASS,
        targetId: subject.classId,
        validUntil: { gte: now },
      },
    });

    return !!classPass;
  }

  /**
   * Get all active entitlements for a user
   */
  static async getUserEntitlements(userId: string) {
    const now = new Date();
    return prisma.entitlement.findMany({
      where: {
        userId,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Grant manual access from Admin with mandatory audit log
   */
  static async grantAdminAccess(params: {
    adminId: string;
    userId: string;
    type: EntitlementType;
    targetId: string;
    durationDays?: number | null;
    reason: string;
  }) {
    const { adminId, userId, type, targetId, durationDays, reason } = params;

    let validUntil: Date | null = null;
    if (durationDays && durationDays > 0) {
      validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + durationDays);
    }

    // Upsert entitlement
    const entitlement = await prisma.entitlement.upsert({
      where: {
        userId_type_targetId: {
          userId,
          type,
          targetId,
        },
      },
      update: {
        validUntil,
        grantedByAdmin: true,
        auditReason: reason,
      },
      create: {
        userId,
        type,
        targetId,
        validUntil,
        grantedByAdmin: true,
        auditReason: reason,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'GRANT_ENTITLEMENT',
        targetType: type,
        targetId,
        reason,
        metadata: JSON.stringify({ userId, validUntil, entitlementId: entitlement.id }),
      },
    });

    return entitlement;
  }

  /**
   * Revoke access from Admin with mandatory audit log
   */
  static async revokeAdminAccess(params: {
    adminId: string;
    entitlementId: string;
    reason: string;
  }) {
    const { adminId, entitlementId, reason } = params;

    const entitlement = await prisma.entitlement.findUnique({
      where: { id: entitlementId },
    });

    if (!entitlement) {
      throw new Error('Entitlement not found');
    }

    await prisma.entitlement.delete({
      where: { id: entitlementId },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'REVOKE_ENTITLEMENT',
        targetType: entitlement.type,
        targetId: entitlement.targetId,
        reason,
        metadata: JSON.stringify({ userId: entitlement.userId, deletedEntitlement: entitlement }),
      },
    });

    return { success: true };
  }
}
