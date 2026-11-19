export type Role = 'STUDENT' | 'ADMIN';

export type ProductType = 'CHAPTER' | 'SUBJECT' | 'MONTHLY_PASS' | 'ANNUAL_PASS' | 'BUNDLE';

export type DiscountType = 'FLAT' | 'PERCENTAGE';

export type OrderStatus = 'CREATED' | 'PAID' | 'FAILED';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export type EntitlementType = 'CHAPTER' | 'SUBJECT' | 'CLASS_PASS';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  classes?: Class[];
}

export interface Class {
  id: string;
  name: string;
  slug: string;
  order: number;
  boardId: string;
  board?: Board;
  subjects?: Subject[];
  products?: Product[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  classId: string;
  class?: Class;
  chapters?: Chapter[];
  packageProduct?: Product;
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  chapterNumber: number;
  description?: string | null;
  isFree: boolean;
  subjectId: string;
  subject?: Subject;
  materials?: Material[];
  hasAccess?: boolean;
}

export interface Material {
  id: string;
  title: string;
  description?: string | null;
  fileSize: number;
  pageCount: number;
  chapterId: string;
  chapter?: Chapter;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string | null;
  type: ProductType;
  targetId: string;
  classId?: string | null;
  class?: Class | null;
  priceInPaise: number;
  originalPriceInPaise: number;
  isActive: boolean;
}

export interface CalculatedItem {
  productId: string;
  title: string;
  type: ProductType;
  targetId: string;
  priceInPaise: number;
  originalPriceInPaise: number;
  upgradeCreditInPaise: number;
  effectivePriceInPaise: number;
  isAlreadyOwned: boolean;
  ownershipReason?: string;
}

export interface CartCalculation {
  items: CalculatedItem[];
  subtotalInPaise: number;
  totalUpgradeCreditInPaise: number;
  subtotalAfterUpgradeInPaise: number;
  discountInPaise: number;
  taxableAmountInPaise: number;
  gstInPaise: number;
  cgstInPaise: number;
  sgstInPaise: number;
  finalPayableInPaise: number;
  couponCode?: string | null;
  couponApplied?: {
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
  } | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValueInPaise: number;
  maxDiscountInPaise?: number | null;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  title: string;
  itemType: ProductType;
  targetId: string;
  priceInPaise: number;
  originalPriceInPaise: number;
}

export interface Payment {
  id: string;
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  method: string;
  status: PaymentStatus;
  failureReason?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  razorpayOrderId?: string | null;
  subtotalInPaise: number;
  discountInPaise: number;
  upgradeCreditInPaise: number;
  gstInPaise: number;
  totalInPaise: number;
  status: OrderStatus;
  invoiceNumber?: string | null;
  coupon?: Coupon | null;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  type: EntitlementType;
  targetId: string;
  validUntil?: string | null;
  orderId?: string | null;
  grantedByAdmin: boolean;
  auditReason?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin?: { name: string; email: string };
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  metadata?: string | null;
  createdAt: string;
}
