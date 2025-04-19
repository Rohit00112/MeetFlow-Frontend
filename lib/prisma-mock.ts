// Mock PrismaClient for development

// In-memory database for storing users
let users: any[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$GQH.xZm5FVH7JMfFGCU4WuQD3d5SZB.xQYS.mG/IdJDdFqS5Jvy8K', // hashed 'password123'
    avatar: 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff&size=200',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class MockPrismaClient {
  user: any;
  meeting: any;

  constructor() {
    this.user = {
      findUnique: async ({ where }: any) => {
        console.log('Mock Prisma findUnique called with:', where);

        // Find user by email or id
        let foundUser = null;

        if (where.email) {
          foundUser = users.find(user => user.email === where.email);
        } else if (where.id) {
          foundUser = users.find(user => user.id === where.id);
        }

        console.log('User found:', foundUser ? foundUser.email : 'No user found');
        return foundUser;
      },
      findFirst: async () => null,
      create: async ({ data }: any) => {
        console.log('Mock Prisma create user called with:', {
          name: data.name,
          email: data.email,
          hasPassword: !!data.password,
          hasAvatar: !!data.avatar
        });

        // Check if user with this email already exists
        const existingUser = users.find(user => user.email === data.email);
        if (existingUser) {
          console.log('User with this email already exists:', data.email);
          throw new Error('User with this email already exists');
        }

        // Generate a unique ID
        const userId = `user_${Date.now()}`;

        // Create a new user object
        const newUser = {
          id: userId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add user to our in-memory database
        users.push(newUser);

        console.log('Mock Prisma created user:', {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          hasAvatar: !!newUser.avatar
        });

        console.log('Total users in database:', users.length);

        return newUser;
      },
      findMany: async () => {
        console.log('Mock Prisma findMany called, returning all users');
        console.log('Total users in database:', users.length);
        return users;
      },

      update: async ({ where, data }: any) => {
        console.log('Mock Prisma update called with:', {
          where,
          data: {
            ...data,
            avatar: data.avatar ? 'base64_image_data_received' : null
          }
        });

        // Find the user to update
        const userIndex = users.findIndex(user => {
          if (where.id) return user.id === where.id;
          if (where.email) return user.email === where.email;
          return false;
        });

        if (userIndex === -1) {
          console.log('User not found for update');
          throw new Error('User not found');
        }

        // Create updated user object
        const updatedUser = {
          ...users[userIndex],
          ...data,
          updatedAt: new Date(),
        };

        // Update user in our in-memory database
        users[userIndex] = updatedUser;

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
