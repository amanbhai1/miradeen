'use client';

import { useEffect, useState } from 'react';
import { Star, ShoppingBag, Heart, Eye, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

export default function RecentlyViewedSection() {
  const { recentlyViewedIds, navigate, addToCart, toggleWishlist, wishlistIds, toggleCompare, compareIds, setQuickViewProductId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (recentlyViewedIds.length === 0) return;
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        const allProducts = data.products || [];
        setProducts(
          recentlyViewedIds
            .map(id => allProducts.find((p: Product) => p.id === id))
            .filter(Boolean) as Product[]
        );
      })
      .catch(() => {});
  }, [recentlyViewedIds]);

  if (products.length < 2) return null;

  return (
    <section className="py-12 bg-cream dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Your History</p>
          <h2 className="heading-serif text-2xl font-bold">Recently Viewed</h2>
          <div className="divider-gold w-16 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {products.slice(0, 6).map((product) => {
            const images = parseJsonField<string>(product.images);
            return (
              <div
                key={product.id}
                className="group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border product-card"
                onClick={() => navigate('product', product.id)}
              >
                <div className="relative aspect-[3/4] img-zoom">
                  <img
                    src={images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                  >
                    <Heart className={`h-3.5 w-3.5 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProductId(product.id);
                      }}
                      size="sm"
                      className="flex-1 h-7 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                    >
                      <Eye className="h-3 w-3 mr-0.5" /> Quick View
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      size="icon"
                      variant="ghost"
                      className={`h-7 w-7 ${compareIds.includes(product.id) ? 'text-gold' : ''}`}
                    >
                      <GitCompareArrows className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[9px] text-muted-foreground tracking-wider uppercase truncate">{product.category?.name}</p>
                  <h3 className="text-xs font-medium truncate group-hover:text-gold transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold">₹{product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="text-[10px] text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
