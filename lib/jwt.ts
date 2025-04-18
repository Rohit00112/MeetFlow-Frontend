import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signJWT(payload: any, options?: jwt.SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

export function verifyJWT<T>(token: string): T | null {
  try {
    // Add more detailed logging for debugging
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    // Log the specific error for debugging
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT Expired:', error.message, error.expiredAt);
    } else if (error instanceof jwt.NotBeforeError) {
      console.error('JWT Not Before:', error.message, error.date);
    } else {
      console.error('Unknown JWT Error:', error);
    }
    return null;
  }
}
