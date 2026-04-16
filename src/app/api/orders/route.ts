import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MRD-';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping, shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, shippingState, shippingZip, shippingCountry, notes, discount, couponCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      
      const images = JSON.parse(product.images || '[]');
      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: images[0] || '',
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      // Decrease stock
      await db.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Apply coupon if provided
    let appliedDiscount = discount || 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          return NextResponse.json({ error: `Minimum order amount for this coupon is ₹${coupon.minOrder}` }, { status: 400 });
        }
        appliedDiscount = coupon.type === 'percentage' ? (subtotal * coupon.discount) / 100 : coupon.discount;
        await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const total = subtotal - appliedDiscount + (shipping || 0);

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: payload.userId,
        subtotal,
        shipping: shipping || 0,
        tax: 0,
        discount: appliedDiscount,
        total,
        shippingName,
        shippingEmail,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry: shippingCountry || 'India',
        notes,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Allow unauthenticated search by order number
    if (search) {
      const order = await db.order.findFirst({
        where: { orderNumber: { contains: search.toUpperCase() } },
        include: { items: true },
      });
      return NextResponse.json({ orders: order ? [order] : [] });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (payload.role !== 'admin') {
      where.userId = payload.userId;
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
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

    const { id, status, paymentStatus, paymentId } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentId) updateData.paymentId = paymentId;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
