import { z } from 'zod';
import { ProductType, DiscountType, EntitlementType } from '@prisma/client';

export const createBoardSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createClassSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  order: z.number().int().default(0),
  boardId: z.string().uuid(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  classId: z.string().uuid(),
});

export const createChapterSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  chapterNumber: z.number().int().min(1),
  description: z.string().optional(),
  isFree: z.boolean().default(false),
  subjectId: z.string().uuid(),
});

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType),
  targetId: z.string().uuid(),
  classId: z.string().uuid().optional(),
  priceInPaise: z.number().int().min(0),
  originalPriceInPaise: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const updateProductPriceSchema = z.object({
  priceInPaise: z.number().int().min(0),
  originalPriceInPaise: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().int().min(1),
  minOrderValueInPaise: z.number().int().min(0).default(0),
  maxDiscountInPaise: z.number().int().min(0).optional().nullable(),
  validUntil: z.string().datetime(),
  usageLimit: z.number().int().min(1).default(100),
  isActive: z.boolean().default(true),
});

export const grantAccessSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(EntitlementType),
  targetId: z.string().uuid(),
  durationDays: z.number().int().positive().nullable().optional(),
  reason: z.string().min(3, 'Audit reason is required for access modification'),
});

export const revokeAccessSchema = z.object({
  entitlementId: z.string().uuid(),
  reason: z.string().min(3, 'Audit reason is required for access revocation'),
});
