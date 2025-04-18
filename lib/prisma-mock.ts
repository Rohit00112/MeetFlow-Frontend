// Mock PrismaClient for development
export class MockPrismaClient {
  user: any;
  meeting: any;

  constructor() {
    this.user = {
      findUnique: async ({ where }: any) => {
        // For testing purposes, return a mock user for a specific email
        if (where.email === 'test@example.com') {
          return {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            password: '$2a$10$GQH.xZm5FVH7JMfFGCU4WuQD3d5SZB.xQYS.mG/IdJDdFqS5Jvy8K', // hashed 'password123'
            avatar: 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff&size=200',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return null;
      },
      findFirst: async () => null,
      create: async ({ data }: any) => {
        console.log('Mock Prisma create user called with:', {
          name: data.name,
          email: data.email,
          hasPassword: !!data.password,
          hasAvatar: !!data.avatar
        });

        // Generate a unique ID
        const userId = `user_${Date.now()}`;

        // Create a new user object
        const newUser = {
          id: userId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('Mock Prisma created user:', {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          hasAvatar: !!newUser.avatar
        });

        return newUser;
      },
      update: async ({ where, data }: any) => {
        console.log('Mock Prisma update called with:', {
          where,
          data: {
            ...data,
            avatar: data.avatar ? 'base64_image_data_received' : null
          }
        });

        // For testing purposes, simulate a successful update
        const updatedUser = {
          id: where?.id || '1',
          name: data.name || 'Test User',
          email: data.email || 'test@example.com',
          password: data.password || '$2a$10$GQH.xZm5FVH7JMfFGCU4WuQD3d5SZB.xQYS.mG/IdJDdFqS5Jvy8K',
          avatar: data.avatar || 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff&size=200',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('Mock Prisma update returning:', {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          hasAvatar: !!updatedUser.avatar
        });

        return updatedUser;
      },
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
