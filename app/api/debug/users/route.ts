import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-mock';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API: Listing all users');
    
    // Get all users
    const users = await prisma.user.findMany();
    
    // Return users without passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    return NextResponse.json({
      users: safeUsers,
      count: safeUsers.length,
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}
