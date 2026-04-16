import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const banners = await db.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Banner title is required' }, { status: 400 });
    }
    if (!body.image) {
      return NextResponse.json({ error: 'Banner image is required' }, { status: 400 });
    }

    const validPositions = ['hero', 'mid', 'bottom'];
    if (body.position && !validPositions.includes(body.position)) {
      return NextResponse.json({ error: `Position must be one of: ${validPositions.join(', ')}` }, { status: 400 });
    }

    const banner = await db.banner.create({
      data: {
        title: body.title.trim(),
        subtitle: body.subtitle,
        image: body.image,
        link: body.link,
        position: body.position || 'hero',
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json({ banner }, { status: 201 });
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

    // Verify banner exists
    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Build update data with only allowed fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['title', 'subtitle', 'image', 'link', 'position', 'isActive', 'sortOrder'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
      }
    }

    const banner = await db.banner.update({ where: { id }, data: updateData });
    return NextResponse.json({ banner });
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
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });

    // Verify banner exists
    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
