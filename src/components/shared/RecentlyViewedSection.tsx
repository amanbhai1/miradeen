'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Heart,
  Eye,
  GitCompareArrows,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

export default function RecentlyViewedSection() {
  const {
    recentlyViewedIds,
    clearRecentlyViewed,
    navigate,
    addToCart,
    toggleWishlist,
    wishlistIds,
    toggleCompare,
    compareIds,
    setQuickViewProductId,
  } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleClearHistory = () => {
    if (showClearConfirm) {
      clearRecentlyViewed();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const sizes = parseJsonField<string>(product.sizes);
    addToCart(product, 1, sizes[0] || undefined);
  };

  // Show empty state only if there were previously viewed products but now cleared
  if (recentlyViewedIds.length === 0 && products.length === 0) return null;

  // If we have IDs but no loaded products yet, show loading or nothing
  if (recentlyViewedIds.length > 0 && products.length === 0) return null;

  // Need at least 2 products
  if (products.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="py-12 bg-cream/50 dark:bg-card/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Your History
              </p>
              <h2 className="heading-serif text-2xl md:text-3xl font-bold">Recently Viewed</h2>
              <div className="divider-gold w-20 mt-2.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {products.length} products
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className={`h-8 text-[11px] font-medium transition-colors ${
                  showClearConfirm
                    ? 'text-destructive hover:text-destructive bg-destructive/10'
                    : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                {showClearConfirm ? (
                  <><Trash2 className="mr-1.5 h-3 w-3" /> Confirm Clear</>
                ) : (
                  <><Trash2 className="mr-1.5 h-3 w-3" /> Clear History</>
                )}
              </Button>
            </div>
          </div>

          {/* Scroll Controls + Product Cards */}
          <div className="relative group">
            {/* Left scroll button */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-background hover:border-gold"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Right scroll button */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-background hover:border-gold"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem', WebkitOverflowScrolling: 'touch' }}
            >
              {products.slice(0, 10).map((product, index) => {
                const images = parseJsonField<string>(product.images);
                const isWishlisted = wishlistIds.includes(product.id);
                const isComparing = compareIds.includes(product.id);
                const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start"
                  >
                    <div
                      className="group cursor-pointer bg-background dark:bg-card rounded-xl overflow-hidden border border-border product-card h-full"
                      onClick={() => navigate('product', product.id)}
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] img-zoom">
                        <img
                          src={images[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Discount badge */}
                        {discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-semibold px-1.5">
                            -{discount}%
                          </Badge>
                        )}

                        {/* Stock indicator */}
                        {product.stock === 0 && (
                          <Badge variant="destructive" className="absolute top-2 right-2 text-[9px] px-1.5">
                            <Package className="mr-0.5 h-2.5 w-2.5" /> Sold Out
                          </Badge>
                        )}

                        {/* Wishlist button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-all duration-200"
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>

                        {/* Hover overlay with actions */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <div className="flex gap-1.5">
                            <Button
                              onClick={(e) => { e.stopPropagation(); setQuickViewProductId(product.id); }}
                              size="sm"
                              className="flex-1 h-7 bg-white text-foreground hover:bg-gold hover:text-background text-[10px] font-medium rounded-lg"
                            >
                              <Eye className="h-3 w-3 mr-1" /> Quick View
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(product.id);
                              }}
                              size="icon"
                              variant="ghost"
                              className={`h-7 w-7 rounded-lg ${isComparing ? 'text-gold' : 'text-white hover:text-white'}`}
                            >
                              <GitCompareArrows className="h-3 w-3" />
                            </Button>
                          </div>
                          {/* Quick Add to Cart on hover */}
                          {product.stock > 0 && (
                            <Button
                              onClick={(e) => handleQuickAddToCart(e, product)}
                              size="sm"
                              className="w-full h-7 mt-1.5 bg-gold text-background hover:bg-gold-dark text-[10px] font-semibold rounded-lg"
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" /> Add to Cart
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-3">
                        <p className="text-[9px] text-gold tracking-wider uppercase truncate font-medium">
                          {product.category?.name}
                        </p>
                        <h3 className="text-xs font-semibold truncate mt-0.5 group-hover:text-gold transition-colors duration-200 leading-tight">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span className="text-[10px] text-muted-foreground">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                          {product.comparePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ₹{product.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {product.isNewArrival && (
                          <Badge className="bg-gold/10 text-gold text-[8px] border-0 mt-2 font-medium">
                            New Arrival
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Scroll fade indicators */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-cream/80 to-transparent dark:from-card/80 dark:to-transparent z-[5]" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-cream/80 to-transparent dark:from-card/80 dark:to-transparent z-[5]" />
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
