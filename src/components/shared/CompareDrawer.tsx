/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GitCompareArrows,
  Star,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  navy: '#1e3a5f',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  brown: '#78350f',
  beige: '#d4c5a9',
  cream: '#fffdd0',
  grey: '#9ca3af',
  gray: '#9ca3af',
  pink: '#ec4899',
  purple: '#7c3aed',
  orange: '#ea580c',
  yellow: '#eab308',
  gold: '#c9a96e',
  silver: '#c0c0c0',
  maroon: '#7f1d1d',
  olive: '#4d5e15',
  teal: '#0d9488',
  burgundy: '#800020',
  tan: '#d2b48c',
  ivory: '#fffff0',
  charcoal: '#36454f',
  khaki: '#c3b091',
  rust: '#b7410e',
  coral: '#ff7f50',
  lavender: '#b57edc',
  mint: '#98fb98',
  peach: '#ffcba4',
  sage: '#bcb88a',
};

function getColorHex(name: string): string {
  return COLOR_HEX_MAP[name.toLowerCase().trim()] || '#cccccc';
}

function extractMaterial(description: string | null): string {
  if (!description) return '—';
  const lower = description.toLowerCase();
  const materials = ['silk', 'cotton', 'linen', 'wool', 'cashmere', 'leather', 'suede', 'velvet', 'satin', 'chiffon', 'denim', 'polyester', 'nylon', 'rayon', 'georgette', 'organza', 'lace'];
  const found = materials.find(m => lower.includes(m));
  if (found) {
    const idx = lower.indexOf(found);
    const snippet = description.substring(Math.max(0, idx - 5), Math.min(description.length, idx + found.length + 20));
    const words = snippet.replace(/[^a-zA-Z\s&]/g, '').trim().split(/\s+/);
    return words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return '—';
}

function getStockBadge(stock: number) {
  if (stock === 0) return <Badge variant="destructive" className="text-[10px] font-medium"><AlertCircle className="mr-1 h-3 w-3" /> Out of Stock</Badge>;
  if (stock <= 5) return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 text-[10px] font-medium border-0">Low Stock ({stock})</Badge>;
  return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[10px] font-medium border-0"><Check className="mr-1 h-3 w-3" /> In Stock ({stock})</Badge>;
}

interface ComparisonRow {
  label: string;
  getValue: (p: Product) => React.ReactNode;
}

export default function CompareDrawer() {
  const { compareIds, clearCompare, toggleCompare, navigate, addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) { setProducts([]); return; }
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => setProducts((data.products || []).filter((p: Product) => compareIds.includes(p.id))))
      .catch(() => {});
  }, [compareIds]);

  const canCompare = products.length >= 2;

  const handleCompare = () => {
    setOpen(true);
    setClearConfirm(false);
  };

  const handleClearAll = () => {
    if (clearConfirm) {
      clearCompare();
      setClearConfirm(false);
      setOpen(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  const comparisonRows: ComparisonRow[] = [
    {
      label: 'Price',
      getValue: (p) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold">₹{p.price.toLocaleString()}</span>
          {p.comparePrice && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{p.comparePrice.toLocaleString()}</span>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-[9px] border-0">
                -{Math.round((1 - p.price / p.comparePrice) * 100)}%
              </Badge>
            </>
          )}
        </div>
      ),
    },
    {
      label: 'Rating',
      getValue: (p) => (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-bold text-gold">{p.rating}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{p.reviewCount} reviews</span>
        </div>
      ),
    },
    {
      label: 'Category',
      getValue: (p) => (
        <Badge variant="outline" className="text-[10px] font-medium border-gold/30 text-gold">
          {p.category?.name || '—'}
        </Badge>
      ),
    },
    {
      label: 'Sizes Available',
      getValue: (p) => {
        const sizes = parseJsonField<string>(p.sizes);
        return sizes.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {sizes.map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-medium">{s}</span>
            ))}
          </div>
        ) : <span className="text-muted-foreground text-xs">One Size</span>;
      },
    },
    {
      label: 'Colors',
      getValue: (p) => {
        const colors = parseJsonField<string>(p.colors);
        return colors.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {colors.map(c => (
              <div
                key={c}
                className="w-6 h-6 rounded-full border border-border"
                style={{ backgroundColor: getColorHex(c) }}
                title={c}
              />
            ))}
            <span className="text-[10px] text-muted-foreground self-center ml-1">{colors.length} colors</span>
          </div>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      label: 'Stock Status',
      getValue: (p) => getStockBadge(p.stock),
    },
    {
      label: 'Material',
      getValue: (p) => (
        <span className="text-xs font-medium">{extractMaterial(p.description)}</span>
      ),
    },
    {
      label: 'Badge',
      getValue: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {p.isNewArrival && <Badge className="bg-gold text-background text-[9px] font-semibold">NEW</Badge>}
          {p.isBestseller && <Badge variant="secondary" className="text-[9px] font-semibold">BESTSELLER</Badge>}
          {p.isFeatured && <Badge variant="outline" className="text-[9px] border-gold/30 text-gold">FEATURED</Badge>}
          {!p.isNewArrival && !p.isBestseller && !p.isFeatured && <span className="text-muted-foreground text-xs">—</span>}
        </div>
      ),
    },
  ];

  // Floating compare button
  if (compareIds.length === 0) return null;

  const colCount = products.length;

  return (
    <>
      {/* Floating compare bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                <GitCompareArrows className="h-4 w-4 text-gold" />
              </div>
              <div>
                <span className="text-sm font-semibold">{compareIds.length}/3</span>
                <p className="text-[9px] text-muted-foreground">Products</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {products.slice(0, 3).map((p) => {
                const images = parseJsonField<string>(p.images);
                return (
                  <div key={p.id} className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gold/30">
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              onClick={handleCompare}
              className="h-9 px-4 bg-gold text-background hover:bg-gold-dark text-xs font-semibold rounded-xl"
            >
              Compare Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <button
              onClick={clearCompare}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Compare Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); setClearConfirm(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-[90vw] lg:max-w-5xl overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="heading-serif text-xl font-bold flex items-center gap-2">
                  <GitCompareArrows className="h-5 w-5 text-gold" />
                  Compare Products
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {products.length} product{products.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              {compareIds.length > 0 && (
                <Button
                  variant={clearConfirm ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={handleClearAll}
                  className={`h-9 text-xs font-medium ${clearConfirm ? '' : 'text-muted-foreground hover:text-destructive'}`}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {clearConfirm ? 'Confirm Clear All' : 'Clear All'}
                </Button>
              )}
            </div>
          </SheetHeader>

          {!canCompare ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <GitCompareArrows className="h-8 w-8 text-gold" />
              </div>
              <h3 className="heading-serif text-lg font-semibold mb-2">Need More Products</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Add at least {2 - products.length} more product{2 - products.length !== 1 ? 's' : ''} to start comparing.
              </p>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm min-w-[600px]">
                {/* Header with product images */}
                <thead>
                  <tr>
                    <th className="text-left p-4 w-40 bg-muted/30 sticky left-0 z-[1]">
                      <span className="sr-only">Feature</span>
                    </th>
                    {products.map((p) => {
                      const images = parseJsonField<string>(p.images);
                      return (
                        <th key={p.id} className="p-4 bg-muted/30 min-w-[200px]">
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                              <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-border hover:border-gold/50 transition-colors">
                                <img src={images[0]} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => {
                                  toggleCompare(p.id);
                                  if (products.length <= 2) setOpen(false);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => { navigate('product', p.id); setOpen(false); }}
                              className="text-center group"
                            >
                              <p className="font-semibold text-xs leading-tight group-hover:text-gold transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-gold font-bold mt-1">₹{p.price.toLocaleString()}</p>
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, rowIndex) => (
                    <tr
                      key={row.label}
                      className={`border-b border-border ${rowIndex % 2 === 1 ? 'bg-muted/20' : ''}`}
                    >
                      <td className="p-4 bg-muted/30 sticky left-0 z-[1]">
                        <span className="text-xs font-semibold tracking-wider uppercase text-gold">
                          {row.label}
                        </span>
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          {row.getValue(p)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Action row */}
                  <tr className="bg-muted/30">
                    <td className="p-4 sticky left-0 z-[1]">
                      <span className="text-xs font-semibold tracking-wider uppercase text-gold">Actions</span>
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-4 text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <Button
                            size="sm"
                            className="h-9 px-4 bg-gold text-background hover:bg-gold-dark text-xs font-semibold rounded-lg"
                            disabled={p.stock === 0}
                            onClick={() => {
                              const sizes = parseJsonField<string>(p.sizes);
                              addToCart(p, 1, sizes[0]);
                            }}
                          >
                            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] text-gold hover:text-gold-dark font-medium"
                            onClick={() => { navigate('product', p.id); setOpen(false); }}
                          >
                            View Full Details
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
