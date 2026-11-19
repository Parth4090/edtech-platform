import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { Role } from '@prisma/client';

describe('Phase 3 - Security & Access Control Tests', () => {
  let studentToken: string;
  let adminToken: string;
  let studentUser: any;
  let adminUser: any;
  let lockedMaterial: any;

  beforeAll(async () => {
    studentUser = await prisma.user.findUnique({
      where: { email: 'student@edtech.com' },
    });

    adminUser = await prisma.user.findUnique({
      where: { email: 'admin@edtech.com' },
    });

    studentToken = jwt.sign(
      { id: studentUser.id, email: studentUser.email, role: Role.STUDENT },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: Role.ADMIN },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Find a non-free chapter and its material
    const nonFreeChapter = await prisma.chapter.findFirst({
      where: { isFree: false, slug: 'class-11-chemistry-structure-of-atom' },
      include: { materials: true },
    });

    lockedMaterial = nonFreeChapter!.materials[0];

    // Ensure student does not have entitlement to this chapter
    await prisma.entitlement.deleteMany({
      where: {
        userId: studentUser.id,
        targetId: nonFreeChapter!.id,
      },
    });
  });

  // TEST 9: Locked PDF access
  test('9. Locked PDF access: rejects unauthorized student access with HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/materials/${lockedMaterial.id}/stream`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.locked).toBe(true);
    expect(res.body.error).toContain('Access Denied');
  });

  // TEST 10: Role-based authorization
  test('10. Role-based authorization: blocks student from accessing admin endpoints with HTTP 403', async () => {
    // Student attempting to access admin metrics
    const studentRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(studentRes.status).toBe(403);
    expect(studentRes.body.error).toContain('Forbidden. ADMIN access required.');

    // Admin accessing admin metrics
    const adminRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.metrics).toBeDefined();
    expect(adminRes.body.metrics.totalStudents).toBeGreaterThanOrEqual(1);
  });
});
