import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-mock';
import { verifyJWT } from '@/lib/jwt';

interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export async function PUT(request: NextRequest) {
  console.log('Update profile API called');
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = verifyJWT<JWTPayload>(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, profileImage } = body;
    console.log('Profile update request received:', { name, email, hasImage: !!profileImage });

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== payload.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== payload.id) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 409 }
        );
      }
    }

    // Process profile image if provided
    let avatarUrl = undefined;
    if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
      console.log('Processing profile image');
      // In a real implementation, you would upload this to a storage service
      // For now, we'll just use the base64 string
      avatarUrl = profileImage;
      console.log('Profile image processed successfully');
    } else if (profileImage) {
      console.log('Invalid profile image format:', typeof profileImage);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name,
        email,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });

    console.log('User profile updated successfully');

    // Return updated user data (excluding password)
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    );
  }
}
