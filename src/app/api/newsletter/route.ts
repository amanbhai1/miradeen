import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.siteSetting.findUnique({
      where: { key: `newsletter_${email}` },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed', subscribed: true });
    }

    // Store newsletter subscription
    await db.siteSetting.create({
      data: {
        key: `newsletter_${email}`,
        value: JSON.stringify({ email, name: name || '', subscribedAt: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ message: 'Successfully subscribed!', subscribed: true });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await db.siteSetting.findMany({
      where: { key: { startsWith: 'newsletter_' } },
    });

    const emails = subscribers.map(s => {
      try {
        return JSON.parse(s.value);
      } catch {
        return { email: s.key.replace('newsletter_', '') };
      }
    });

    return NextResponse.json({ subscribers: emails, count: emails.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
