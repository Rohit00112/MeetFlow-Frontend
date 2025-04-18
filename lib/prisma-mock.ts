// Mock PrismaClient for development
export class MockPrismaClient {
  user: any;
  meeting: any;

  constructor() {
    this.user = {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
    };

    this.meeting = {
      findUnique: async () => null,
      findFirst: async () => null,
      create: async (data: any) => data.data,
      update: async (data: any) => data.data,
    };
  }
}

// This is a temporary solution until Prisma is properly set up
const globalForPrisma = global as unknown as { prisma: MockPrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new MockPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
