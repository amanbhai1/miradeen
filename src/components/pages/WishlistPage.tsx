'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, addToCart, navigate, setQuickViewProductId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      setProducts((data.products || []).filter((p: Product) => wishlistIds.includes(p.id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground text-sm mb-8">{wishlistIds.length} items</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="heading-serif text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love and come back to them later.</p>
            <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark transition-colors">Browse Collection</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => {
              const images = parseJsonField<string>(product.images);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="product-card group cursor-pointer bg-card rounded-lg overflow-hidden border border-border" onClick={() => navigate('product', product.id)}>
                    <div className="relative aspect-[3/4] img-zoom">
                      <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button onClick={(e) => { e.stopPropagation(); setQuickViewProductId(product.id); }} className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]">
                          <Eye className="mr-0.5 h-3 w-3" /> View
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); const sizes = parseJsonField<string>(product.sizes); addToCart(product, 1, sizes[0]); }} className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]">
                          <ShoppingBag className="mr-0.5 h-3 w-3" /> Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{product.category?.name}</p>
                      <h3 className="text-sm font-medium truncate group-hover:text-gold transition-colors">{product.name}</h3>
                      <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
