import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin product get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for slug uniqueness if changing
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugExists = await db.product.findUnique({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Check if category exists if changing
    if (body.categoryId && body.categoryId !== existingProduct.categoryId) {
      const category = await db.category.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'slug', 'description', 'shortDesc', 'price', 'comparePrice',
      'categoryId', 'stock', 'isFeatured', 'isNewArrival', 'isBestseller',
      'tags', 'isActive',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['price', 'comparePrice', 'stock'].includes(field)) {
          updateData[field] = field === 'stock' ? parseInt(body[field]) : parseFloat(body[field]);
        } else {
          updateData[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
        }
      }
    }

    // Handle JSON fields
    if (body.images !== undefined) {
      updateData.images = JSON.stringify(body.images);
    }
    if (body.sizes !== undefined) {
      updateData.sizes = JSON.stringify(body.sizes);
    }
    if (body.colors !== undefined) {
      updateData.colors = body.colors ? JSON.stringify(body.colors) : null;
    }

    // Normalize slug
    if (updateData.slug) {
      updateData.slug = (updateData.slug as string).trim().toLowerCase();
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is referenced in orders (productId is a plain field, not a Prisma relation)
    const orderItemCount = await db.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      // Soft delete: set isActive to false instead of deleting
      await db.product.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: 'Product has existing orders and has been deactivated instead of deleted',
      });
    }

    // Delete associated reviews, wishlists, and recently viewed first
    await db.review.deleteMany({ where: { productId: id } });
    await db.wishlist.deleteMany({ where: { productId: id } });
    await db.recentlyViewed.deleteMany({ where: { productId: id } });

    // Delete product
    await db.product.delete({ where: { id } });

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
