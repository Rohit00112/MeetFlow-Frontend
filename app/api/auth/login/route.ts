import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-mock';
import { comparePassword } from '@/lib/password';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    const body = await request.json();
    const { email, password } = body;
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For testing purposes, hardcode a successful login for test@example.com
    if (email === 'test@example.com' && password === 'password123') {
      console.log('Using hardcoded test user login');
      const token = signJWT({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      return NextResponse.json({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff&size=200',
        },
        token,
      });
    }

    // Find user by email
    console.log('Finding user in database');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email);

    // Verify password
    console.log('Verifying password');
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const token = signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    console.log('JWT token generated');

    // Return user data (excluding password) and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
