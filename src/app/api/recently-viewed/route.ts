import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getAuthPayload(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// GET: Return recently viewed products (requires auth)
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const recentlyViewed = await db.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: limit,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ items: recentlyViewed });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add product to recently viewed (requires auth)
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Upsert: update viewedAt timestamp if already exists
    const recentItem = await db.recentlyViewed.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: { viewedAt: new Date() },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ item: recentItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
