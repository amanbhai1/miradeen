import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [subscribers, total] = await Promise.all([
      db.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.newsletterSubscriber.count(),
    ]);

    const active = await db.newsletterSubscriber.count({ where: { isActive: true } });

    // Monthly trend (last 6 months) — group by year-month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentSubscribers = await db.newsletterSubscriber.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build monthly counts manually from fetched records
    const monthlyMap: Record<string, number> = {};
    for (const s of recentSubscribers) {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    }

    const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    return NextResponse.json({ subscribers, total, active, monthlyTrend, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for duplicate
    const existing = await db.newsletterSubscriber.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
    }

    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: body.email,
        name: body.name,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id, isActive, name } = await request.json();
    if (!id) return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });

    const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;

    const subscriber = await db.newsletterSubscriber.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ subscriber });
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
    if (!id) return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });

    const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    await db.newsletterSubscriber.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
