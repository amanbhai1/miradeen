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

    const [userCount, orderCount, productCount, totalRevenue, recentOrders, recentMessages] = await Promise.all([
      db.user.count({ where: { role: 'user' } }),
      db.order.count(),
      db.product.count({ where: { isActive: true } }),
      db.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { total: true } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }),
      db.contactMessage.count({ where: { isRead: false } }),
    ]);

    const monthlyOrders = await db.order.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'asc' },
      select: { total: true, createdAt: true, paymentStatus: true },
    });

    return NextResponse.json({
      stats: {
        users: userCount,
        orders: orderCount,
        products: productCount,
        revenue: totalRevenue._sum.total || 0,
        unreadMessages: recentMessages,
      },
      recentOrders,
      monthlyOrders,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
