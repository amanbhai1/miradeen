import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/coupons — List all coupons (with optional ?active=true filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      ...(activeOnly ? { where: { isActive: true } } : {}),
    });

    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/admin/coupons — Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discount, type, minOrder, maxUses, isActive, startsAt, expiresAt } = body;

    if (!code || discount == null || !type) {
      return NextResponse.json({ error: 'Code, discount, and type are required' }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type,
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: isActive !== undefined ? isActive : true,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

// PUT /api/admin/coupons — Update coupon
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, discount, type, minOrder, maxUses, isActive, startsAt, expiresAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (discount !== undefined) updateData.discount = parseFloat(discount);
    if (type !== undefined) updateData.type = type;
    if (minOrder !== undefined) updateData.minOrder = minOrder ? parseFloat(minOrder) : null;
    if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons — Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
