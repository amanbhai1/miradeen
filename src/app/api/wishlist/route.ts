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

// GET: Return user's wishlist items (requires auth)
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlistItems = await db.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: wishlistItems });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add item to wishlist (requires auth)
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

    // Upsert: add if not exists, return existing if already in wishlist
    const wishlistItem = await db.wishlist.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ item: wishlistItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Sync wishlist (bulk replace user's wishlist with provided productIds) — requires auth
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 });
    }

    // Delete all existing wishlist items for this user
    await db.wishlist.deleteMany({ where: { userId } });

    // Create new wishlist entries
    if (productIds.length > 0) {
      await db.wishlist.createMany({
        data: productIds.map((productId: string) => ({ userId, productId })),
        skipDuplicates: true,
      });
    }

    // Return the synced items
    const syncedItems = await db.wishlist.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: syncedItems, synced: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove item from wishlist (requires auth)
export async function DELETE(request: NextRequest) {
  try {
    const userId = getAuthPayload(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.wishlist.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
