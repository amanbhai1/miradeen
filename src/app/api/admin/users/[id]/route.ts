import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Prevent self-deletion
    if (id === auth.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Check if user has orders
    const orderCount = await db.order.count({ where: { userId: id } });
    if (orderCount > 0) {
      // Block instead of delete
      await db.user.update({ where: { id }, data: { isBlocked: true } });
      return NextResponse.json({ message: 'User has existing orders and has been blocked instead of deleted' });
    }

    // Delete associated data first
    await db.review.deleteMany({ where: { userId: id } });
    await db.wishlist.deleteMany({ where: { userId: id } });
    await db.recentlyViewed.deleteMany({ where: { userId: id } });
    await db.contactMessage.deleteMany({ where: { userId: id } });
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
