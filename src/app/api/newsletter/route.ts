import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if already subscribed using NewsletterSubscriber table
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // If subscriber exists but is inactive, reactivate them
      if (!existing.isActive) {
        await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, name: name || existing.name },
        });
        return NextResponse.json({ message: 'Subscription reactivated!', subscribed: true });
      }
      return NextResponse.json({ message: 'Already subscribed', subscribed: true });
    }

    // Store newsletter subscription in proper table
    await db.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
      },
    });

    return NextResponse.json({ message: 'Successfully subscribed!', subscribed: true });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
