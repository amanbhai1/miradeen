import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const body = await request.json();

    // Support single key-value update or batch updates
    if (body.key && body.value !== undefined) {
      // Single setting update
      const key = body.key.trim();
      if (!key) {
        return NextResponse.json({ error: 'Key required' }, { status: 400 });
      }

      const setting = await db.siteSetting.upsert({
        where: { key },
        update: { value: String(body.value) },
        create: { key, value: String(body.value) },
      });

      return NextResponse.json({ setting });
    }

    // Batch update
    if (body.settings && typeof body.settings === 'object') {
      const entries = Object.entries(body.settings) as [string, string][];
      if (entries.length === 0) {
        return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
      }

      const results = await Promise.all(
        entries.map(([key, value]) =>
          db.siteSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          })
        )
      );

      return NextResponse.json({ settings: results, message: 'Settings updated successfully' });
    }

    return NextResponse.json({ error: 'Provide either { key, value } or { settings: { key: value } }' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
