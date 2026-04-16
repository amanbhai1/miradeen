import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    });

    const formatted = testimonials.map((t) => ({
      id: t.id,
      author: t.author,
      role: t.role || '',
      company: t.company || '',
      avatar: t.avatar || null,
      rating: t.rating,
      text: t.text,
      isFeatured: t.isFeatured,
    }));

    return NextResponse.json({ testimonials: formatted });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ testimonials: [] }, { status: 200 });
  }
}
