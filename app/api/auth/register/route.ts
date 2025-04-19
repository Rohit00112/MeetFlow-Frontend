import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  console.log('Register API called');
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password, avatar } = body;
    console.log('Registration request received:', { name, email, hasPassword: !!password, hasAvatar: !!avatar });
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Process avatar if provided
    let avatarUrl = avatar;
    if (!avatarUrl) {
      // If no avatar was uploaded, use UI Avatars API to generate one based on initials
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      console.log('Generated avatar URL from initials');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');
    
    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatar: avatarUrl,
        },
      });
      
      console.log('User created successfully with ID:', user.id);
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: createError instanceof Error ? createError.message : 'Failed to create user' },
        { status: 500 }
      );
    }
    
    // Generate JWT token
    const token = signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    
    // Return user data and token
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
