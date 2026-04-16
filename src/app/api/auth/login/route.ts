import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'Account has been blocked' }, { status: 403 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ token, user: safeUser });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
