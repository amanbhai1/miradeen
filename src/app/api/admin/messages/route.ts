import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

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
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id, isRead, reply } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    // Verify message exists
    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
