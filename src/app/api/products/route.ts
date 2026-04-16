import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newArrivals = searchParams.get('newArrivals');
    const bestsellers = searchParams.get('bestsellers');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'latest';

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      const cat = await db.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (featured === 'true') where.isFeatured = true;
    if (newArrivals === 'true') where.isNewArrival = true;
    if (bestsellers === 'true') where.isBestseller = true;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { reviewCount: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
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

    const body = await request.json();
    const product = await db.product.create({
      data: {
        ...body,
        images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        sizes: typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []),
        colors: body.colors ? (typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors)) : null,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
