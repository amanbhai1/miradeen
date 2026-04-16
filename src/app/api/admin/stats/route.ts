import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const [userCount, orderCount, productCount, totalRevenue, recentOrders, unreadMessages] = await Promise.all([
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

    // Count users with more than 1 paid order (returning customers)
    const allPaidOrders = await db.order.groupBy({
      by: ['userId'],
      where: { paymentStatus: 'paid' },
      _count: true,
    });
    const returningCustomers = allPaidOrders.filter(o => o._count > 1).length;

    const topSpenders = await db.order.groupBy({
      by: ['userId'],
      where: { paymentStatus: 'paid' },
      _sum: { total: true },
      _count: true,
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

    // Order status breakdown
    const orderStatusCounts = await db.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      stats: {
        users: userCount,
        orders: orderCount,
        products: productCount,
        revenue: totalRevenue._sum.total || 0,
        unreadMessages,
        newCustomers,
        avgOrderValue: avgOrderValue._avg.total || 0,
        newsletterSubscribers: newsletterCount,
      },
      recentOrders,
      monthlyOrders,
      lowStockProducts,
      orderStatusCounts,
      customerAnalytics: {
        newCustomers,
        returningCustomers,
        topSpenders: topSpendersWithDetails,
        avgOrderValue: avgOrderValue._avg.total || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
