import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, isBlocked: true, avatar: true, address: true, city: true, state: true, zipCode: true, country: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, city, state, zipCode, country } = body;

    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, isBlocked: true, avatar: true, address: true, city: true, state: true, zipCode: true, country: true, createdAt: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
