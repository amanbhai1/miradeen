/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, GitCompareArrows, Star, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

export default function CompareDrawer() {
  const { compareIds, clearCompare, toggleCompare, navigate, addToCart, wishlistIds, toggleWishlist, setQuickViewProductId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) { setProducts([]); return; }
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => setProducts((data.products || []).filter((p: Product) => compareIds.includes(p.id))))
      .catch(() => {});
  }, [compareIds]);

  const canCompare = compareIds.length >= 2;

  const handleCompare = () => {
    setOpen(true);
  };

  // Floating compare button
  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Floating compare bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="flex items-center gap-2 bg-card border border-border rounded-full shadow-xl px-4 py-2">
          <GitCompareArrows className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium">{compareIds.length}/3</span>
          <div className="flex gap-1">
            {products.slice(0, 3).map((p) => {
              const images = parseJsonField<string>(p.images);
              return (
                <div key={p.id} className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                  <img src={images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
          <Button
            size="sm"
            onClick={handleCompare}
            className="h-8 px-3 bg-gold text-background hover:bg-gold-dark text-xs rounded-full"
          >
            Compare
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearCompare}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>

      {/* Compare Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="heading-serif text-xl font-bold">Compare Products</SheetTitle>
          </SheetHeader>

          {!canCompare ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Add at least 2 products to compare.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left p-4 w-36 bg-muted/30 text-xs tracking-wider uppercase font-semibold">Feature</th>
                    {products.map((p) => (
                      <th key={p.id} className="text-center p-4 bg-muted/30">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative w-20 h-24 rounded-md overflow-hidden">
                            <img src={parseJsonField<string>(p.images)[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="font-medium text-xs leading-tight">{p.name}</p>
                          <button onClick={() => toggleCompare(p.id)} className="text-destructive hover:underline text-[10px]">Remove</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-muted-foreground text-xs">Price</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center font-semibold">₹{p.price.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border bg-muted/20">
                    <td className="p-3 text-muted-foreground text-xs">Rating</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span>{p.rating}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-muted-foreground text-xs">Category</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center text-xs">{p.category?.name}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border bg-muted/20">
                    <td className="p-3 text-muted-foreground text-xs">Sizes</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center text-xs">{parseJsonField<string>(p.sizes).join(', ')}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-muted-foreground text-xs">Colors</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center text-xs">{parseJsonField<string>(p.colors).join(', ') || '—'}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border bg-muted/20">
                    <td className="p-3 text-muted-foreground text-xs">Stock</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <Badge variant={p.stock > 0 ? 'secondary' : 'destructive'} className="text-[10px]">
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-muted-foreground text-xs">Badge</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {p.isNewArrival && <Badge className="bg-gold text-background text-[9px]">New</Badge>}
                          {p.isBestseller && <Badge variant="secondary" className="text-[9px]">Bestseller</Badge>}
                          {!p.isNewArrival && !p.isBestseller && <span className="text-muted-foreground text-xs">—</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground text-xs">Action</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <div className="flex flex-col gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 bg-gold text-background hover:bg-gold-dark text-xs"
                            onClick={() => {
                              const sizes = parseJsonField<string>(p.sizes);
                              addToCart(p, 1, sizes[0]);
                            }}
                          >
                            <ShoppingBag className="mr-1 h-3 w-3" /> Add to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { navigate('product', p.id); setOpen(false); }}
                          >
                            View Details
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
