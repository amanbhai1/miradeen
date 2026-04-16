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

    const products = await db.product.findMany({
      include: { category: true, reviews: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        shortDesc: body.shortDesc,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        categoryId: body.categoryId,
        images: JSON.stringify(body.images || []),
        sizes: JSON.stringify(body.sizes || []),
        colors: body.colors ? JSON.stringify(body.colors) : null,
        stock: parseInt(body.stock) || 0,
        isFeatured: body.isFeatured || false,
        isNewArrival: body.isNewArrival || false,
        isBestseller: body.isBestseller || false,
        tags: body.tags,
        isActive: body.isActive !== false,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
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

    const { id, ...data } = await request.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = ['name', 'slug', 'description', 'shortDesc', 'price', 'comparePrice', 'categoryId', 'stock', 'isFeatured', 'isNewArrival', 'isBestseller', 'tags', 'isActive'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = field === 'price' || field === 'comparePrice' || field === 'stock' ? parseFloat(data[field]) : data[field];
      }
    }
    if (data.images) updateData.images = JSON.stringify(data.images);
    if (data.sizes) updateData.sizes = JSON.stringify(data.sizes);
    if (data.colors) updateData.colors = JSON.stringify(data.colors);

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.replace('Bearer ', ''));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
