import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

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
    const payload = verifyJWT<{ id: string }>(token);
    
    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, avatar } = body;
    console.log('Profile update request received:', { name, email, hasAvatar: !!avatar });
    
    // Process avatar if provided
    let avatarUrl = undefined;
    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image')) {
      console.log('Processing profile image');
      // In a real implementation, you would upload this to a storage service
      // For now, we'll just use the base64 string
      avatarUrl = avatar;
      console.log('Profile image processed successfully');
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
    
    // Return updated user data
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
