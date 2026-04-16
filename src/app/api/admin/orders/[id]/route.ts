import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Verify order exists
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate status values
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      if (!validPaymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json({ error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.paymentStatus = body.paymentStatus;
    }
    if (body.paymentId !== undefined) updateData.paymentId = body.paymentId;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
