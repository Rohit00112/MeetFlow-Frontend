import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-mock';
import { hashPassword } from '@/lib/password';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  console.log('Register API called');
  try {
    const body = await request.json();
    const { name, email, password, profileImage } = body;
    console.log('Registration request received:', { name, email, hasPassword: !!password, hasProfileImage: !!profileImage });

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
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Process profile image if provided
    let avatarUrl = undefined;
    if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
      console.log('Processing profile image for registration');
      // In a real implementation, you would upload this to a storage service
      // For now, we'll just use the base64 string
      avatarUrl = profileImage;
      console.log('Profile image processed successfully for registration');
    } else if (!profileImage) {
      // If no profile image was uploaded, use UI Avatars API to generate one based on initials
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      console.log('Generated avatar URL from initials');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: avatarUrl,
      },
    });

    console.log('User created successfully with ID:', user.id);

    // Generate JWT token
    const token = signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
