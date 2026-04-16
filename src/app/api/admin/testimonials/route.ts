import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const testimonials = await db.testimonial.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const body = await request.json();

    if (!body.author) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }
    if (!body.text) {
      return NextResponse.json({ error: 'Testimonial text is required' }, { status: 400 });
    }

    const rating = body.rating ? parseInt(body.rating) : 5;
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        author: body.author.trim(),
        role: body.role,
        company: body.company,
        avatar: body.avatar,
        rating,
        text: body.text.trim(),
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder || 0,
      },
    });
    return NextResponse.json({ testimonial }, { status: 201 });
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

    // Verify testimonial exists
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    // Build update data with only allowed fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['author', 'role', 'company', 'avatar', 'rating', 'text', 'isFeatured', 'isActive', 'sortOrder'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'rating') {
          const parsed = parseInt(data[field]);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
            updateData[field] = parsed;
          }
        } else {
          updateData[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
        }
      }
    }

    const testimonial = await db.testimonial.update({ where: { id }, data: updateData });
    return NextResponse.json({ testimonial });
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
    if (!id) return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });

    // Verify testimonial exists
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
