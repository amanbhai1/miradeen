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
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'asc' },
      select: { total: true, createdAt: true, paymentStatus: true },
    });

    // Stock alerts - products with low stock (< 5)
    const lowStockProducts = await db.product.findMany({
      where: { stock: { lt: 5 }, isActive: true },
      include: { category: true },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    // Customer analytics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await db.user.count({
      where: { role: 'user', createdAt: { gte: thirtyDaysAgo } },
    });
    const returningCustomers = await db.order.groupBy({
      by: ['userId'],
      where: { paymentStatus: 'paid' },
      _count: true,
      having: { orders: { every: { _count: { gt: 1 } } } },
    });

    const topSpenders = await db.order.groupBy({
      by: ['userId'],
      where: { paymentStatus: 'paid' },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    const topSpendersWithDetails = await Promise.all(
      topSpenders.map(async (s) => {
        const u = await db.user.findUnique({ where: { id: s.userId }, select: { name: true, email: true } });
        return { name: u?.name || 'Unknown', email: u?.email || '', total: s._sum.total || 0, orderCount: s._count };
      })
    );

    const avgOrderValue = await db.order.aggregate({
      where: { paymentStatus: 'paid' },
      _avg: { total: true },
    });

    const newsletterCount = await db.newsletterSubscriber.count({ where: { isActive: true } });

    return NextResponse.json({
      stats: {
        users: userCount,
        orders: orderCount,
        products: productCount,
        revenue: totalRevenue._sum.total || 0,
        unreadMessages: recentMessages,
        newCustomers,
        avgOrderValue: avgOrderValue._avg.total || 0,
        newsletterSubscribers: newsletterCount,
      },
      recentOrders,
      monthlyOrders,
      lowStockProducts,
      customerAnalytics: {
        newCustomers,
        returningCustomers: returningCustomers.length,
        topSpenders: topSpendersWithDetails,
        avgOrderValue: avgOrderValue._avg.total || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
