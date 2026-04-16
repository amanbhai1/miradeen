import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, string> = {};
    if (category) {
      where.category = category.toLowerCase();
    }

    const sizeCharts = await db.sizeChart.findMany({
      where,
      orderBy: { size: 'asc' },
    });

    // Parse measurements JSON for each chart entry
    const parsedCharts = sizeCharts.map((chart) => ({
      id: chart.id,
      category: chart.category,
      type: chart.type,
      size: chart.size,
      measurements: JSON.parse(chart.measurements),
    }));

    // Group by category and type
    const grouped: Record<string, Record<string, typeof parsedCharts>> = {};
    for (const chart of parsedCharts) {
      if (!grouped[chart.category]) {
        grouped[chart.category] = {};
      }
      if (!grouped[chart.category][chart.type]) {
        grouped[chart.category][chart.type] = [];
      }
      grouped[chart.category][chart.type].push(chart);
    }

    return NextResponse.json({
      charts: parsedCharts,
      grouped,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
