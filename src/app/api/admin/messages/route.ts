import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, isRead, reply } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isRead === 'boolean') updateData.isRead = isRead;
    if (reply !== undefined) {
      updateData.reply = reply;
      updateData.replied = true;
    }

    const message = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
