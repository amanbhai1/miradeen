import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isBlocked: true, avatar: true, address: true, city: true,
        state: true, zipCode: true, country: true, createdAt: true, updatedAt: true,
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const orders = await db.order.findMany({
      where: { userId: id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const wishlist = await db.wishlist.findMany({
      where: { userId: id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalSpent = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({ user, orders, wishlist, totalSpent });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
