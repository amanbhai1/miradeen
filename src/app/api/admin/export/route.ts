import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

type ExportType = 'products' | 'orders' | 'users' | 'messages' | 'all';
type ExportFormat = 'csv' | 'json';

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value instanceof Date) {
      result[newKey] = value.toISOString();
    } else if (Array.isArray(value)) {
      // Serialize arrays as JSON strings for CSV compatibility
      result[newKey] = JSON.stringify(value);
    } else if (value && typeof value === 'object') {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const flatData = data.map(item => flattenObject(item));
  const headers = Array.from(new Set(flatData.flatMap(item => Object.keys(item))));
  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = flatData.map(row =>
    headers.map(h => escapeCSV(row[h])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'all') as ExportType;
    const format = (searchParams.get('format') || 'json') as ExportFormat;

    const validTypes: ExportType[] = ['products', 'orders', 'users', 'messages', 'all'];
    const validFormats: ExportFormat[] = ['csv', 'json'];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }
    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: `Invalid format. Must be one of: ${validFormats.join(', ')}` }, { status: 400 });
    }

    const result: Record<string, unknown[]> = {};
    const typesToFetch = type === 'all' ? (['products', 'orders', 'users', 'messages'] as const) : ([type] as const);

    // Fetch products
    if (typesToFetch.includes('products' as const)) {
      const products = await db.product.findMany({
        include: { category: true, reviews: true },
        orderBy: { createdAt: 'desc' },
      });
      result.products = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        shortDesc: p.shortDesc || '',
        price: p.price,
        comparePrice: p.comparePrice,
        category: p.category?.name || '',
        categoryId: p.categoryId,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors || '',
        stock: p.stock,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
        tags: p.tags || '',
        rating: p.rating,
        reviewCount: p.reviewCount,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }

    // Fetch orders
    if (typesToFetch.includes('orders' as const)) {
      const orders = await db.order.findMany({
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      result.orders = orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        customerName: o.user?.name || o.shippingName,
        customerEmail: o.user?.email || o.shippingEmail,
        items: o.items.map(item => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
        })),
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        discount: o.discount,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        shippingName: o.shippingName,
        shippingPhone: o.shippingPhone,
        shippingAddress: o.shippingAddress,
        shippingCity: o.shippingCity,
        shippingState: o.shippingState,
        shippingZip: o.shippingZip,
        shippingCountry: o.shippingCountry,
        notes: o.notes || '',
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));
    }

    // Fetch users
    if (typesToFetch.includes('users' as const)) {
      const users = await db.user.findMany({
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          isBlocked: true, avatar: true, address: true, city: true,
          state: true, zipCode: true, country: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      result.users = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        isBlocked: u.isBlocked,
        address: u.address || '',
        city: u.city || '',
        state: u.state || '',
        zipCode: u.zipCode || '',
        country: u.country,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }));
    }

    // Fetch messages
    if (typesToFetch.includes('messages' as const)) {
      const messages = await db.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      result.messages = messages.map(m => ({
        id: m.id,
        userId: m.userId || '',
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        subject: m.subject || '',
        message: m.message,
        isRead: m.isRead,
        replied: m.replied,
        reply: m.reply || '',
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }));
    }

    if (format === 'json') {
      const jsonContent = type === 'all'
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result[type] || [], null, 2);

      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="miradeen-${type}-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // CSV format
    if (type === 'all') {
      // For "all" type with CSV, combine all data with a type prefix header
      const csvParts: string[] = [];
      for (const [key, data] of Object.entries(result)) {
        csvParts.push(`### ${key.toUpperCase()} ###`);
        csvParts.push(toCSV(data as Record<string, unknown>[]));
        csvParts.push('');
      }
      const csvContent = csvParts.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="miradeen-all-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const csvContent = toCSV((result[type] || []) as Record<string, unknown>[]);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="miradeen-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
