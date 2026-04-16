import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    /* Comprehensive size chart data (static, no DB dependency) */
    const sizeData = {
      mens: {
        label: "Men's Sizes",
        sizes: [
          { size: 'S',  chest: '36"',  waist: '30"',  shoulder: '17"', hip: '37"',  length: '27"',  us: 'S',  uk: 'S',  eu: '48', in: 'S' },
          { size: 'M',  chest: '38"',  waist: '32"',  shoulder: '18"', hip: '39"',  length: '28"', us: 'M',  uk: 'M',  eu: '50', in: 'M' },
          { size: 'L',  chest: '40"',  waist: '34"',  shoulder: '19"', hip: '41"',  length: '29"', us: 'L',  uk: 'L',  eu: '52', in: 'L' },
          { size: 'XL', chest: '42"',  waist: '36"',  shoulder: '20"', hip: '43"',  length: '30"', us: 'XL', uk: 'XL', eu: '54', in: 'XL' },
          { size: 'XXL', chest: '44"', waist: '38"',  shoulder: '21"', hip: '45"',  length: '31"', us: 'XXL', uk: 'XXL', eu: '56', in: 'XXL' },
        ],
      },
      womens: {
        label: "Women's Sizes",
        sizes: [
          { size: 'XS', chest: '31"', waist: '24"',  shoulder: '14.5"', hip: '34"',  length: '24"', us: '0-2',  uk: '4-6',  eu: '32-34', in: '32' },
          { size: 'S',  chest: '33"', waist: '26"',  shoulder: '15"', hip: '36"',  length: '25"', us: '4-6',  uk: '8-10',  eu: '36-38', in: '34' },
          { size: 'M',  chest: '35"', waist: '28"',  shoulder: '15.5"', hip: '38"',  length: '26"', us: '8-10', uk: '12-14',  eu: '40-42', in: '36' },
          { size: 'L',  chest: '37"', waist: '30"',  shoulder: '16"', hip: '40"',  length: '27"', us: '12-14', uk: '16-18',  eu: '44-46', in: '38' },
          { size: 'XL',  chest: '39"', waist: '32"',  shoulder: '16.5"', hip: '42"',  length: '28"', us: '16-18', uk: '20-22',  eu: '48-50', in: '40' },
          { size: 'XXL', chest: '41"', waist: '34"',  shoulder: '17"', hip: '44"',  length: '29"', us: '20',  uk: '24',  eu: '52', in: '42' },
        ],
      },
      conversion: {
        label: 'International Size Conversion',
        columns: ['Size', 'US', 'UK', 'EU', 'IN (Men)', 'IN (Women)'],
        rows: [
          ['Extra Small', 'XS / 0-2', '4-6', '32-34', 'S', 'XS / 32'],
          ['Small', 'S / 4-6', '8-10', '36-38', 'S / 36', 'S / 34'],
          ['Medium', 'M / 8-10', '12-14', '40-42', 'M / 38', 'M / 36'],
          ['Large', 'L / 12-14', '16-18', '44-46', 'L / 40', 'L / 38'],
          ['Extra Large', 'XL / 16-18', '20-22', '48-50', 'XL / 42', 'XL / 40'],
          ['2X Large', 'XXL / 20', '24', '52', 'XXL / 44', 'XXL / 42'],
        ],
      },
      tips: [
        'Measure yourself in light clothing for the most accurate results.',
        'Chest: Measure around the fullest part of your chest, keeping the tape level.',
        'Waist: Measure around your natural waistline (bend to one side to find it).',
        'Hip: Stand with feet together and measure around the fullest part of your hips.',
        'Shoulder: Measure from the edge of one shoulder to the edge of the other.',
        'Length: Measure from the highest point of the shoulder to the desired length.',
        'If you are between sizes, we recommend sizing up for a more comfortable fit.',
        'All measurements are in inches unless otherwise noted.',
      ],
    };

    // Filter by category if requested
    if (category) {
      const cat = category.toLowerCase();
      if (cat === 'mens' || cat === 'men') {
        return NextResponse.json({ ...sizeData, filtered: sizeData.mens });
      }
      if (cat === 'womens' || cat === 'women') {
        return NextResponse.json({ ...sizeData, filtered: sizeData.womens });
      }
      if (cat === 'conversion') {
        return NextResponse.json({ ...sizeData, filtered: sizeData.conversion });
      }
    }

    return NextResponse.json(sizeData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
