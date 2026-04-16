import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check for name/slug uniqueness
    const nameExists = await db.category.findUnique({ where: { name: body.name.trim() } });
    if (nameExists) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }
    const slugExists = await db.category.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description,
        image: body.image,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Verify category exists
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Build update data with only allowed fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'slug', 'description', 'image', 'sortOrder', 'isActive'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    }

    // Normalize slug
    if (updateData.slug) {
      updateData.slug = (updateData.slug as string).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Check uniqueness if name or slug is being changed
    if (updateData.name && updateData.name !== existing.name) {
      const nameExists = await db.category.findUnique({ where: { name: updateData.name as string } });
      if (nameExists) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
      }
    }
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await db.category.findUnique({ where: { slug: updateData.slug as string } });
      if (slugExists) {
        return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
      }
    }

    const category = await db.category.update({ where: { id }, data: updateData });
    return NextResponse.json({ category });
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
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    // Check category exists
    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check for products in this category
    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${existing._count.products} products. Move or delete products first.` },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
