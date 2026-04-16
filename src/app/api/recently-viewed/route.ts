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

// GET: Return recently viewed products
// Supports two modes:
//   1. Authenticated: Returns user's recently viewed from DB (with `limit` query)
//   2. Public: Accepts `productIds` comma-separated query param to fetch product details by IDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Public mode: fetch products by IDs (no auth required)
    const productIdsParam = searchParams.get('productIds');
    if (productIdsParam) {
      const ids = productIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ products: [] });
      }

      const products = await db.product.findMany({
        where: { id: { in: ids }, isActive: true },
        include: { category: true },
      });

      // Preserve the order from the requested IDs
      const ordered = ids
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);

      return NextResponse.json({ products: ordered });
    }

    // Authenticated mode: return user's recently viewed from DB
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
