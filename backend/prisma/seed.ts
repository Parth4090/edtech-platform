import { PrismaClient, Role, ProductType, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

// Helper to generate a realistic sample PDF with title, author, and structured content
async function generateSamplePdf(filePath: string, title: string, chapterNumber: number, subjectName: string, className: string, isFree: boolean): Promise<number> {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Cover & Table of contents / Intro
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header banner
  page1.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.06, 0.13, 0.28), // Navy blue
  });

  page1.drawText('EDTECH ACADEMY PREMIUM STUDY MATERIALS', {
    x: 50,
    y: height - 45,
    size: 14,
    font: boldFont,
    color: rgb(0.85, 0.9, 1.0),
  });

  page1.drawText(`${className.toUpperCase()} • ${subjectName.toUpperCase()}`, {
    x: 50,
    y: height - 70,
    size: 11,
    font: timesRomanFont,
    color: rgb(0.7, 0.8, 0.95),
  });

  if (isFree) {
    page1.drawRectangle({
      x: width - 150,
      y: height - 55,
      width: 100,
      height: 25,
      color: rgb(0.1, 0.7, 0.3),
    });
    page1.drawText('FREE SAMPLE', {
      x: width - 140,
      y: height - 47,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
  }

  // Chapter Title
  page1.drawText(`Chapter ${chapterNumber}: ${title}`, {
    x: 50,
    y: height - 160,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.15, 0.3),
  });

  // Comprehensive study content
  const notesText = [
    '1. CHAPTER OVERVIEW & LEARNING OBJECTIVES:',
    `In this chapter of ${subjectName}, students explore the fundamental concepts, mathematical formulations,`,
    'and practical applications essential for school examinations and competitive entrance preparation.',
    '',
    '2. KEY DEFINITIONS & THEORETICAL PRINCIPLES:',
    '• Principle 1: Every concept builds upon first principles with systematic axiomatic foundations.',
    '• Principle 2: Experimental validation and dimensional consistency must be maintained across equations.',
    '• Principle 3: Step-by-step analytical reasoning provides deeper conceptual mastery over memorization.',
    '',
    '3. IMPORTANT FORMULAE & MNEMONICS:',
    '• Fundamental relation: Delta_E = h * nu  (Energy-frequency duality)',
    '• Equilibrium condition: Sum of Forces = 0 and Sum of Torques = 0',
    '• Conservation law: Total energy before interaction = Total energy after interaction',
    '',
    '4. WORKED EXAMPLES & PROBLEM-SOLVING STRATEGIES:',
    'Problem 1: Given standard boundary conditions, derive the equilibrium state and analyze stability.',
    'Solution: Formulate the governing differential equation, substitute boundary limits, and solve.',
    'Key takeaway: Always verify limiting behavior when parameters approach zero or infinity.',
    '',
    '5. EXAM TIPS & HIGH-WEIGHTAGE TOPICS:',
    '• Pay special attention to graphical interpretations, derivation steps, and units of measurement.',
    '• Practice multi-concept questions that combine core principles with real-world applications.',
    '• Review common errors such as sign conventions and improper unit conversions before tests.'
  ];

  let yPos = height - 200;
  for (const line of notesText) {
    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) {
      page1.drawText(line, {
        x: 50,
        y: yPos,
        size: 12,
        font: boldFont,
        color: rgb(0.15, 0.25, 0.5),
      });
    } else {
      page1.drawText(line, {
        x: 50,
        y: yPos,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    yPos -= 22;
  }

  // Footer
  page1.drawText('Confidential • Authorized for registered Ed-Tech student use only • Protected PDF', {
    x: 50,
    y: 30,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Page 2: Practice Questions & Summary Sheet
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText(`Chapter ${chapterNumber} Practice Exercise & Self-Assessment Sheet`, {
    x: 50,
    y: height - 60,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.15, 0.3),
  });

  const page2Lines = [
    'Q1. Explain the underlying physical or mathematical intuition behind the central theorem.',
    'Q2. Derive the master equation from first principles and list three valid boundary conditions.',
    'Q3. A particle/system undergoes dynamic variation under constant constraints. Find the steady state.',
    'Q4. Compare and contrast theoretical predictions with experimental data under realistic conditions.',
    'Q5. Formulate a real-world scenario where this concept optimizes industrial or technological efficiency.',
    '',
    'REVISION CHECKLIST:',
    '[ ] Memorized key definitions and exact statements of laws',
    '[ ] Practiced all 5 standard textbook derivations step-by-step',
    '[ ] Completed 10 numerical problems without referencing hints',
    '[ ] Reviewed NCERT / Board exemplary problems and previous 5 years questions'
  ];

  let yPos2 = height - 100;
  for (const line of page2Lines) {
    const isHeader = line.startsWith('REVISION') || line.startsWith('Q');
    page2.drawText(line, {
      x: 50,
      y: yPos2,
      size: isHeader ? 11 : 10,
      font: isHeader ? boldFont : timesRomanFont,
      color: isHeader ? rgb(0.1, 0.2, 0.4) : rgb(0.3, 0.3, 0.3),
    });
    yPos2 -= 26;
  }

  page2.drawText('Page 2 of 2 • EdTech Academy', {
    x: 50,
    y: 30,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return pdfBytes.length;
}

async function main() {
  console.log('--- Starting Ed-Tech Database Seeding ---');

  // 1. Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.material.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing records');

  // 2. Create Users (Admin & Student)
  const passwordSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', passwordSalt);
  const studentPasswordHash = await bcrypt.hash('Student@12345', passwordSalt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@edtech.com',
      passwordHash: adminPasswordHash,
      name: 'Dr. Vikram Sharma (Admin)',
      phone: '+91 9876543210',
      role: Role.ADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@edtech.com',
      passwordHash: studentPasswordHash,
      name: 'Aarav Patel',
      phone: '+91 9812345678',
      role: Role.STUDENT,
    },
  });

  console.log(`✓ Created Users: Admin (${admin.email}) and Student (${student.email})`);

  // 3. Create Board
  const board = await prisma.board.create({
    data: {
      name: 'CBSE Board',
      slug: 'cbse',
      description: 'Central Board of Secondary Education - Standard National Curriculum',
      icon: 'BookOpen',
    },
  });

  console.log(`✓ Created Board: ${board.name}`);

  // 4. Create Classes
  const class10 = await prisma.class.create({
    data: {
      name: 'Class 10',
      slug: 'class-10',
      order: 10,
      boardId: board.id,
    },
  });

  const class11 = await prisma.class.create({
    data: {
      name: 'Class 11',
      slug: 'class-11',
      order: 11,
      boardId: board.id,
    },
  });

  console.log(`✓ Created Classes: ${class10.name}, ${class11.name}`);

  // Class Passes (Monthly & Annual)
  // Monthly Pass: 30 days
  await prisma.product.create({
    data: {
      title: 'Class 10 All-Access Monthly Pass',
      description: '30 days full unlimited access to all subjects, chapters, notes and sample papers for Class 10.',
      type: ProductType.MONTHLY_PASS,
      targetId: class10.id,
      classId: class10.id,
      priceInPaise: 49900, // ₹499
      originalPriceInPaise: 99900, // ₹999
      isActive: true,
    },
  });

  // Annual Pass: 365 days
  await prisma.product.create({
    data: {
      title: 'Class 10 All-Access Annual Pass',
      description: '365 days unlimited comprehensive access to all Class 10 subjects, complete chapter notes, and mock tests.',
      type: ProductType.ANNUAL_PASS,
      targetId: class10.id,
      classId: class10.id,
      priceInPaise: 249900, // ₹2,499
      originalPriceInPaise: 499900, // ₹4,999
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      title: 'Class 11 All-Access Monthly Pass',
      description: '30 days full unlimited access to all subjects, advanced chapter notes, and problem sets for Class 11.',
      type: ProductType.MONTHLY_PASS,
      targetId: class11.id,
      classId: class11.id,
      priceInPaise: 59900, // ₹599
      originalPriceInPaise: 119900, // ₹1,199
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      title: 'Class 11 All-Access Annual Pass',
      description: '365 days unlimited comprehensive access to all Class 11 subjects, foundational and competitive notes.',
      type: ProductType.ANNUAL_PASS,
      targetId: class11.id,
      classId: class11.id,
      priceInPaise: 299900, // ₹2,999
      originalPriceInPaise: 599900, // ₹5,999
      isActive: true,
    },
  });

  // 5. Structure Subjects & Chapters
  const curriculumData = [
    {
      classObj: class10,
      subjects: [
        {
          name: 'Mathematics',
          slug: 'class-10-mathematics',
          icon: 'Calculator',
          packagePrice: 39900, // ₹399
          packageOriginalPrice: 79900,
          chapters: [
            { title: 'Real Numbers & Fundamental Arithmetic', slug: 'real-numbers', num: 1, isFree: true },
            { title: 'Polynomials & Algebraic Equations', slug: 'polynomials', num: 2, isFree: false },
            { title: 'Linear Equations in Two Variables', slug: 'linear-equations', num: 3, isFree: false },
            { title: 'Quadratic Equations & Roots', slug: 'quadratic-equations', num: 4, isFree: false },
            { title: 'Arithmetic Progressions & Series', slug: 'arithmetic-progressions', num: 5, isFree: false },
          ],
        },
        {
          name: 'Science',
          slug: 'class-10-science',
          icon: 'Atom',
          packagePrice: 39900, // ₹399
          packageOriginalPrice: 79900,
          chapters: [
            { title: 'Chemical Reactions and Equations', slug: 'chemical-reactions', num: 1, isFree: true },
            { title: 'Acids, Bases and Salts', slug: 'acids-bases-salts', num: 2, isFree: false },
            { title: 'Metals and Non-Metals', slug: 'metals-non-metals', num: 3, isFree: false },
            { title: 'Carbon and its Compounds', slug: 'carbon-compounds', num: 4, isFree: false },
            { title: 'Life Processes & Cellular Respiration', slug: 'life-processes', num: 5, isFree: false },
          ],
        },
        {
          name: 'Social Science',
          slug: 'class-10-social-science',
          icon: 'Globe',
          packagePrice: 34900, // ₹349
          packageOriginalPrice: 69900,
          chapters: [
            { title: 'The Rise of Nationalism in Europe', slug: 'nationalism-europe', num: 1, isFree: true },
            { title: 'Resources and Sustainable Development', slug: 'resources-development', num: 2, isFree: false },
            { title: 'Power Sharing in Democracies', slug: 'power-sharing', num: 3, isFree: false },
            { title: 'Sectors of the Indian Economy', slug: 'sectors-indian-economy', num: 4, isFree: false },
            { title: 'Print Culture and the Modern World', slug: 'print-culture', num: 5, isFree: false },
          ],
        },
      ],
    },
    {
      classObj: class11,
      subjects: [
        {
          name: 'Physics',
          slug: 'class-11-physics',
          icon: 'Compass',
          packagePrice: 49900, // ₹499
          packageOriginalPrice: 99900,
          chapters: [
            { title: 'Units, Dimensions & Error Analysis', slug: 'units-dimensions', num: 1, isFree: true },
            { title: 'Motion in a Straight Line & Kinematics', slug: 'motion-straight-line', num: 2, isFree: false },
            { title: 'Newton Laws of Motion & Friction', slug: 'laws-of-motion', num: 3, isFree: false },
            { title: 'Work, Energy and Power Dynamics', slug: 'work-energy-power', num: 4, isFree: false },
            { title: 'Universal Gravitation & Planetary Motion', slug: 'gravitation', num: 5, isFree: false },
          ],
        },
        {
          name: 'Chemistry',
          slug: 'class-11-chemistry',
          icon: 'FlaskConical',
          packagePrice: 49900, // ₹499
          packageOriginalPrice: 99900,
          chapters: [
            { title: 'Some Basic Concepts of Chemistry & Mole Concept', slug: 'mole-concept', num: 1, isFree: true },
            { title: 'Structure of Atom & Quantum Numbers', slug: 'structure-of-atom', num: 2, isFree: false },
            { title: 'Classification of Elements & Periodic Properties', slug: 'periodic-classification', num: 3, isFree: false },
            { title: 'Chemical Bonding and Molecular Structure', slug: 'chemical-bonding', num: 4, isFree: false },
            { title: 'Chemical Thermodynamics and Enthalpy', slug: 'thermodynamics', num: 5, isFree: false },
          ],
        },
        {
          name: 'Mathematics',
          slug: 'class-11-mathematics',
          icon: 'Binary',
          packagePrice: 49900, // ₹499
          packageOriginalPrice: 99900,
          chapters: [
            { title: 'Sets, Relations and Functions', slug: 'sets-relations', num: 1, isFree: true },
            { title: 'Trigonometric Functions and Identites', slug: 'trigonometric-functions', num: 2, isFree: false },
            { title: 'Complex Numbers and Quadratic Equations', slug: 'complex-numbers', num: 3, isFree: false },
            { title: 'Permutations, Combinations & Factorials', slug: 'permutations-combinations', num: 4, isFree: false },
            { title: 'Sequences and Series (AP, GP, Special Series)', slug: 'sequences-series', num: 5, isFree: false },
          ],
        },
      ],
    },
  ];

  const uploadsDir = path.resolve(__dirname, '../uploads/materials');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  for (const classData of curriculumData) {
    for (const sub of classData.subjects) {
      const subject = await prisma.subject.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          description: `Comprehensive study package for ${classData.classObj.name} ${sub.name}`,
          icon: sub.icon,
          classId: classData.classObj.id,
        },
      });

      // Create Subject Package Product
      await prisma.product.create({
        data: {
          title: `${classData.classObj.name} ${sub.name} Complete Package`,
          description: `Includes all 5 chapters, detailed theory, solved exercises, formulae sheets, and revision mindmaps for ${sub.name}.`,
          type: ProductType.SUBJECT,
          targetId: subject.id,
          classId: classData.classObj.id,
          priceInPaise: sub.packagePrice,
          originalPriceInPaise: sub.packageOriginalPrice,
          isActive: true,
        },
      });

      for (const ch of sub.chapters) {
        const chapter = await prisma.chapter.create({
          data: {
            title: ch.title,
            slug: `${sub.slug}-${ch.slug}`,
            chapterNumber: ch.num,
            description: `Detailed chapter notes and study guide for Chapter ${ch.num}: ${ch.title}`,
            isFree: ch.isFree,
            subjectId: subject.id,
          },
        });

        // Generate real PDF file
        const pdfFileName = `${chapter.slug}.pdf`;
        const pdfFilePath = path.join(uploadsDir, pdfFileName);
        const fileSize = await generateSamplePdf(
          pdfFilePath,
          ch.title,
          ch.num,
          sub.name,
          classData.classObj.name,
          ch.isFree
        );

        // Create Material Record
        await prisma.material.create({
          data: {
            title: `${ch.title} - Official Notes`,
            description: `Full PDF revision notes, definitions, formula sheet, and solved problems for Chapter ${ch.num}.`,
            filePath: pdfFilePath,
            fileSize: fileSize,
            pageCount: 2,
            chapterId: chapter.id,
          },
        });

        // Create Chapter Product (even if free sample exists, student can buy standalone or it's listed with ₹99)
        await prisma.product.create({
          data: {
            title: `${classData.classObj.name} ${sub.name} - Ch ${ch.num}: ${ch.title}`,
            description: `Individual chapter notes covering ${ch.title} with formula sheet and practice question bank.`,
            type: ProductType.CHAPTER,
            targetId: chapter.id,
            classId: classData.classObj.id,
            priceInPaise: 9900, // ₹99
            originalPriceInPaise: 19900, // ₹199
            isActive: true,
          },
        });
      }
    }
  }

  console.log('✓ Created 6 Subjects and 30 Chapters with real PDF files and Products');

  // 6. Create Coupons
  const futureExpiry = new Date();
  futureExpiry.setDate(futureExpiry.getDate() + 90); // 90 days validity

  await prisma.coupon.create({
    data: {
      code: 'WELCOME50',
      description: '50% discount on orders above ₹200 (Max discount ₹200)',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 50,
      minOrderValueInPaise: 20000, // ₹200
      maxDiscountInPaise: 20000, // ₹200
      validUntil: futureExpiry,
      usageLimit: 500,
      timesUsed: 0,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FLAT100',
      description: 'Flat ₹100 instant discount on minimum purchase of ₹300',
      discountType: DiscountType.FLAT,
      discountValue: 10000, // ₹100
      minOrderValueInPaise: 30000, // ₹300
      maxDiscountInPaise: 10000,
      validUntil: futureExpiry,
      usageLimit: 250,
      timesUsed: 0,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'PASS20',
      description: '20% off on all monthly and annual passes (Max discount ₹500)',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderValueInPaise: 40000, // ₹400
      maxDiscountInPaise: 50000, // ₹500
      validUntil: futureExpiry,
      usageLimit: 1000,
      timesUsed: 0,
      isActive: true,
    },
  });

  console.log('✓ Created Coupons: WELCOME50, FLAT100, PASS20');
  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
