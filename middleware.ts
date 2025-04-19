import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the request is for an API route that requires authentication
  if (request.nextUrl.pathname.startsWith('/api/auth/me') ||
      request.nextUrl.pathname.startsWith('/api/auth/update-profile')) {
    
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
    const payload = verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/auth/me',
    '/api/auth/update-profile',
  ],
};
