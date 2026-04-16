'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Ruler, Shirt, Footprints, Watch } from 'lucide-react';

interface SizeChartRow {
  id: string;
  category: string;
  type: string;
  size: string;
  measurements: Record<string, string>;
}

const categoryLabels: Record<string, string> = {
  men: "Men's",
  women: "Women's",
  accessories: 'Accessories',
};

const typeLabels: Record<string, string> = {
  clothing: 'Clothing',
  shoes: 'Shoes',
  accessories: 'Accessories',
};

const typeIcons: Record<string, React.ReactNode> = {
  clothing: <Shirt className="h-4 w-4" />,
  shoes: <Footprints className="h-4 w-4" />,
  accessories: <Watch className="h-4 w-4" />,
};

export default function SizeGuideModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [charts, setCharts] = useState<SizeChartRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('men');

  const fetchSizeCharts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/size-guide?category=${activeCategory}`);
      const data = await res.json();
      setCharts(data.charts || []);
    } catch {
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (open) {
      fetchSizeCharts();
    }
  }, [open, fetchSizeCharts]);

  // Group charts by type
  const groupedByType = charts.reduce<Record<string, SizeChartRow[]>>((acc, chart) => {
    if (!acc[chart.type]) acc[chart.type] = [];
    acc[chart.type].push(chart);
    return acc;
  }, {});

  // Get measurement keys from the first chart entry for each type
  const getTypeColumns = (rows: SizeChartRow[]): string[] => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0].measurements);
  };

  // Format measurement key for display
  const formatKey = (key: string): string => {
    const labels: Record<string, string> = {
      chest: 'Chest',
      waist: 'Waist',
      shoulder: 'Shoulder',
      length: 'Length',
      bust: 'Bust',
      hips: 'Hips',
      footLength: 'Foot Length',
      usSize: 'US Size',
      note: 'Note',
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // How to measure instructions per type
  const measureInstructions: Record<string, { label: string; desc: string }[]> = {
    clothing: [
      { label: 'Chest/Bust', desc: 'Measure around the fullest part of your chest/bust.' },
      { label: 'Waist', desc: 'Measure around your natural waistline.' },
      { label: 'Shoulder', desc: 'Measure from one shoulder seam to the other.' },
      { label: 'Length', desc: 'Measure from the highest point of the shoulder to the hem.' },
      { label: 'Hips', desc: 'Measure around the fullest part of your hips.' },
    ],
    shoes: [
      { label: 'Foot Length', desc: 'Stand on a piece of paper and trace your foot. Measure from heel to longest toe.' },
      { label: 'US Size', desc: 'Refer to the US size equivalent for your fit.' },
    ],
    accessories: [
      { label: 'Note', desc: 'Most accessories feature adjustable or universal sizing.' },
    ],
  };

  const categories = ['men', 'women', 'accessories'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="heading-serif text-xl font-bold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-gold" /> Size Guide
          </DialogTitle>
          <DialogDescription>
            All measurements are in inches (inches for clothing, cm for shoes). For the best fit, measure your body and compare with our size chart.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gold text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-ring" />
              <span className="ml-3 text-sm text-muted-foreground">Loading size chart...</span>
            </div>
          ) : (
            <>
              {/* Render tables by type */}
              {Object.entries(groupedByType).map(([type, rows]) => (
                <div key={type} className="mb-8">
                  {/* Type header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gold">{typeIcons[type]}</span>
                    <h4 className="text-sm font-semibold text-foreground">
                      {typeLabels[type] || type}
                    </h4>
                  </div>

                  {/* Size table */}
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold border-b border-border">
                            Size
                          </th>
                          {getTypeColumns(rows).map((key) => (
                            <th
                              key={key}
                              className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold border-b border-border"
                            >
                              {formatKey(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr
                            key={row.id}
                            className={`${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-gold/5 transition-colors`}
                          >
                            <td className="py-2.5 px-3 font-medium text-foreground">{row.size}</td>
                            {getTypeColumns(rows).map((key) => (
                              <td key={key} className="py-2.5 px-3 text-muted-foreground">
                                {row.measurements[key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* How to measure */}
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold mb-3 text-gold">How to Measure</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  {(measureInstructions[activeCategory === 'accessories' ? 'accessories' : 'clothing'] || measureInstructions.clothing).map(
                    (item) => (
                      <li key={item.label}>
                        <span className="font-medium text-foreground">{item.label}:</span>{' '}
                        {item.desc}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {charts.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No size data available for this category.
                </div>
              )}
            </>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Still unsure? We offer free returns within 30 days. Contact us at{' '}
            <a href="https://wa.me/7683041486" className="text-gold hover:underline">WhatsApp</a> for personalized sizing advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
