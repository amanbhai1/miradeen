import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export interface AdminAuthResult {
  success: true;
  userId: string;
  email: string;
  role: string;
}

export interface AdminAuthError {
  success: false;
  response: NextResponse;
}

type AdminAuth = AdminAuthResult | AdminAuthError;

/**
 * Verify that the request is from an authenticated admin user.
 * Returns the user payload on success, or a NextResponse error on failure.
 */
export async function verifyAdmin(request: NextRequest): Promise<AdminAuth> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  if (payload.role !== 'admin') {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  // Double-check user still exists and is not blocked
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isBlocked: true },
  });

  if (!user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      ),
    };
  }

  if (user.isBlocked) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Account has been blocked' },
        { status: 403 }
      ),
    };
  }

  if (user.role !== 'admin') {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Verify that the request is from an authenticated user (any role).
 * Returns the user payload on success, or a NextResponse error on failure.
 */
export async function verifyUser(request: NextRequest): Promise<AdminAuth> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isBlocked: true },
  });

  if (!user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      ),
    };
  }

  if (user.isBlocked) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Account has been blocked' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}
