import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@in.ink' },
    update: {},
    create: {
      email: 'admin@in.ink',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create merchants
  const maap = await prisma.merchant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'MAAP',
      email: 'fulfillment@maap.cc',
      phone: '+1 (555) 123-4567',
      address: '123 Cycling Lane, Melbourne VIC 3000, Australia',
      currentInventory: 8,
      lastRefillDate: new Date('2026-01-17'),
      totalStickersUsed: 42,
      alertThreshold: 5,
    },
  });
  console.log('Created merchant:', maap.name);

  const kylie = await prisma.merchant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Kylie Cosmetics',
      email: 'logistics@kyliecosmetics.com',
      phone: '+1 (555) 987-6543',
      address: '456 Beauty Blvd, Los Angeles CA 90210, USA',
      currentInventory: 2,
      lastRefillDate: new Date('2025-12-31'),
      totalStickersUsed: 98,
      alertThreshold: 5,
    },
  });
  console.log('Created merchant:', kylie.name);

  // Create usage records for MAAP
  const maapUsage = [
    { date: new Date('2026-01-30'), stickersUsed: 3 },
    { date: new Date('2026-01-28'), stickersUsed: 2 },
    { date: new Date('2026-01-25'), stickersUsed: 4 },
    { date: new Date('2026-01-22'), stickersUsed: 2 },
    { date: new Date('2026-01-19'), stickersUsed: 3 },
  ];

  for (const usage of maapUsage) {
    await prisma.usageRecord.upsert({
      where: {
        merchantId_date: {
          merchantId: maap.id,
          date: usage.date,
        },
      },
      update: {},
      create: {
        merchantId: maap.id,
        date: usage.date,
        stickersUsed: usage.stickersUsed,
      },
    });
  }
  console.log('Created usage records for MAAP');

  // Create usage records for Kylie Cosmetics
  const kylieUsage = [
    { date: new Date('2026-01-30'), stickersUsed: 5 },
    { date: new Date('2026-01-29'), stickersUsed: 4 },
    { date: new Date('2026-01-27'), stickersUsed: 6 },
    { date: new Date('2026-01-25'), stickersUsed: 3 },
    { date: new Date('2026-01-23'), stickersUsed: 5 },
  ];

  for (const usage of kylieUsage) {
    await prisma.usageRecord.upsert({
      where: {
        merchantId_date: {
          merchantId: kylie.id,
          date: usage.date,
        },
      },
      update: {},
      create: {
        merchantId: kylie.id,
        date: usage.date,
        stickersUsed: usage.stickersUsed,
      },
    });
  }
  console.log('Created usage records for Kylie Cosmetics');

  // Create fulfillment orders
  await prisma.fulfillmentOrder.upsert({
    where: { id: 'FO001' },
    update: {},
    create: {
      id: 'FO001',
      merchantId: kylie.id,
      orderDate: new Date('2026-01-30'),
      quantity: 25,
      shippingAddress: '456 Beauty Blvd, Los Angeles CA 90210, USA',
      status: 'pending',
    },
  });

  await prisma.fulfillmentOrder.upsert({
    where: { id: 'FO002' },
    update: {},
    create: {
      id: 'FO002',
      merchantId: maap.id,
      orderDate: new Date('2026-01-29'),
      quantity: 15,
      shippingAddress: '123 Cycling Lane, Melbourne VIC 3000, Australia',
      status: 'packed',
      packedAt: new Date('2026-01-29T14:30:00Z'),
    },
  });
  console.log('Created fulfillment orders');

  // Create merchant videos
  await prisma.merchantVideo.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      merchantName: 'MAAP',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: '',
      fileSize: 862208,
      format: 'MP4',
      isLooping: true,
    },
  });

  await prisma.merchantVideo.upsert({
    where: { id: '00000000-0000-0000-0000-000000000102' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      merchantName: 'Kylie Cosmetics',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: '',
      fileSize: 693248,
      format: 'MP4',
      isLooping: true,
    },
  });
  console.log('Created merchant videos');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
