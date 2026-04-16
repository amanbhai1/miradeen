'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Eye, GitCompareArrows, Star, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

/* ─── Props Interface ─────────────────────────────────────────────── */

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list' | 'horizontal';
  showQuickActions?: boolean;
  showRating?: boolean;
  showBadges?: boolean;
  showCompare?: boolean;
  showWishlist?: boolean;
  className?: string;
}

/* ─── Star Rating Component ───────────────────────────────────────── */

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  if (rating <= 0) return null;

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {/* Filled Stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-gold text-gold" />
        ))}
        {/* Half Star */}
        {hasHalf && (
          <div className="relative h-3 w-3">
            <Star className="h-3 w-3 text-gold/30 absolute inset-0" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-3 w-3 fill-gold text-gold" />
            </div>
          </div>
        )}
        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3 w-3 text-gold/30" />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">({reviewCount})</span>
    </div>
  );
}

/* ─── Product Badges Component ────────────────────────────────────── */

function ProductBadges({ product, show }: { product: Product; show: boolean }) {
  if (!show) return null;

  const isOnSale = product.comparePrice !== null && product.comparePrice > product.price;

  return (
    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
      {product.isNewArrival && (
        <Badge className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
          NEW
        </Badge>
      )}
      {isOnSale && (
        <Badge className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
          SALE
        </Badge>
      )}
      {product.isBestseller && (
        <Badge className="bg-gold text-background text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
          BESTSELLER
        </Badge>
      )}
    </div>
  );
}

/* ─── Price Display Component ─────────────────────────────────────── */

function PriceDisplay({ price, comparePrice }: { price: number; comparePrice: number | null }) {
  const isOnSale = comparePrice !== null && comparePrice > price;

  if (isOnSale) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-red-600 dark:text-red-400">
          ₹{price.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground line-through">
          ₹{comparePrice!.toLocaleString()}
        </span>
        <span className="text-[9px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded">
          {Math.round(((comparePrice! - price) / comparePrice!) * 100)}% OFF
        </span>
      </div>
    );
  }

  return (
    <span className="text-sm font-semibold">₹{price.toLocaleString()}</span>
  );
}

/* ─── Quick Actions Overlay ───────────────────────────────────────── */

function QuickActionsOverlay({
  product,
  show,
  showWishlist,
  showCompare,
}: {
  product: Product;
  show: boolean;
  showWishlist: boolean;
  showCompare: boolean;
}) {
  const { addToCart, toggleWishlist, toggleCompare, setQuickViewProductId, wishlistIds, compareIds } = useStore();
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const sizes = parseJsonField<string>(product.sizes);
    addToCart(product, 1, sizes[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [addToCart, product]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProductId(product.id);
  }, [setQuickViewProductId, product.id]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  }, [toggleWishlist, product.id]);

  const handleToggleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  }, [toggleCompare, product.id]);

  return (
    <>
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-12 pb-3 px-3">
          <div className="flex gap-1.5">
            <Button
              onClick={handleQuickView}
              size="sm"
              className="flex-1 h-9 bg-white/95 text-foreground hover:bg-gold hover:text-background text-[10px] font-medium backdrop-blur-sm border-0"
            >
              <Eye className="h-3 w-3 mr-1" />
              Quick View
            </Button>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex-1 h-9 bg-gold text-background hover:bg-gold-dark text-[10px] font-semibold border-0 shadow-sm"
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Added!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Right side action buttons */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <AnimatePresence>
          {show && (
            <>
              {showWishlist && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  onClick={handleToggleWishlist}
                  className="w-8 h-8 bg-background/90 dark:bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors shadow-sm border border-border/30"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <motion.div
                    animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isWishlisted ? 'fill-gold text-gold' : ''
                      }`}
                    />
                  </motion.div>
                </motion.button>
              )}
              {showCompare && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  onClick={handleToggleCompare}
                  className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm border border-border/30 ${
                    isCompared
                      ? 'bg-gold text-background'
                      : 'bg-background/90 dark:bg-card/90 hover:bg-gold hover:text-background'
                  }`}
                  aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
                >
                  <GitCompareArrows className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT CARD — GRID VARIANT (DEFAULT)
   ═══════════════════════════════════════════════════════════════════ */

function GridCard({ product, showQuickActions, showRating, showBadges, showCompare, showWishlist }: Omit<ProductCardProps, 'variant' | 'className'>) {
  const { navigate } = useStore();
  const images = parseJsonField<string>(product.images);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.25)] dark:hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.15)]"
      onClick={() => navigate('product', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.img
          src={images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Badges */}
        <ProductBadges product={product} show={showBadges} />

        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <QuickActionsOverlay
            product={product}
            show={isHovered}
            showWishlist={showWishlist}
            showCompare={showCompare}
          />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5">
        <p className="text-[10px] text-muted-foreground tracking-[0.12em] uppercase mb-1">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-gold transition-colors leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>
        {showRating && (
          <div className="mt-1.5">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}
        <div className="mt-2">
          <PriceDisplay price={product.price} comparePrice={product.comparePrice} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT CARD — LIST VARIANT
   ═══════════════════════════════════════════════════════════════════ */

function ListCard({ product, showQuickActions, showRating, showBadges, showCompare, showWishlist }: Omit<ProductCardProps, 'variant' | 'className'>) {
  const { navigate } = useStore();
  const images = parseJsonField<string>(product.images);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.25)] dark:hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.15)]"
      onClick={() => navigate('product', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Container */}
        <div className="relative w-full sm:w-56 lg:w-64 aspect-[4/5] sm:aspect-auto sm:min-h-[220px] overflow-hidden shrink-0">
          <motion.img
            src={images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <ProductBadges product={product} show={showBadges} />
        </div>

        {/* Details */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground tracking-[0.12em] uppercase mb-1">
              {product.category?.name}
            </p>
            <h3 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-gold transition-colors leading-snug">
              {product.name}
            </h3>
            {product.shortDesc && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
                {product.shortDesc}
              </p>
            )}
            {showRating && (
              <div className="mt-2">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
            <PriceDisplay price={product.price} comparePrice={product.comparePrice} />

            {showQuickActions && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); useStore.getState().setQuickViewProductId(product.id); }}
                  variant="outline"
                  className="h-8 px-3 text-[10px] border-border hover:border-gold hover:text-gold"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Quick View
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const sizes = parseJsonField<string>(product.sizes);
                    useStore.getState().addToCart(product, 1, sizes[0]);
                  }}
                  className="h-8 px-3 text-[10px] bg-gold text-background hover:bg-gold-dark"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                  Add to Cart
                </Button>
                {showWishlist && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); useStore.getState().toggleWishlist(product.id); }}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-colors"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`h-4 w-4 ${useStore.getState().isInWishlist(product.id) ? 'fill-gold text-gold' : ''}`} />
                  </motion.button>
                )}
                {showCompare && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); useStore.getState().toggleCompare(product.id); }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      useStore.getState().isInCompare(product.id) ? 'border-gold bg-gold/10 text-gold' : 'border-border hover:border-gold hover:bg-gold/10'
                    }`}
                    aria-label="Toggle compare"
                  >
                    <GitCompareArrows className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT CARD — HORIZONTAL VARIANT
   ═══════════════════════════════════════════════════════════════════ */

function HorizontalCard({ product, showQuickActions, showRating, showBadges, showWishlist }: Omit<ProductCardProps, 'variant' | 'className'>) {
  const { navigate, addToCart, setQuickViewProductId, toggleWishlist } = useStore();
  const images = parseJsonField<string>(product.images);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const sizes = parseJsonField<string>(product.sizes);
    addToCart(product, 1, sizes[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [addToCart, product]);

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border hover:shadow-[0_8px_30px_-6px_rgba(201,169,110,0.2)] dark:hover:shadow-[0_8px_30px_-6px_rgba(201,169,110,0.12)] min-w-[220px] max-w-[260px] shrink-0"
      onClick={() => navigate('product', product.id)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
        />
        <ProductBadges product={product} show={showBadges} />

        {/* Quick Add overlay */}
        {showQuickActions && (
          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full h-8 bg-gold text-background hover:bg-gold-dark text-[10px] font-semibold border-0"
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Added!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        )}

        {/* Wishlist button */}
        {showWishlist && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 w-7 h-7 bg-background/80 dark:bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors shadow-sm"
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${
              useStore.getState().isInWishlist(product.id) ? 'fill-gold text-gold' : ''
            }`} />
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[9px] text-muted-foreground tracking-[0.12em] uppercase mb-0.5">
          {product.category?.name}
        </p>
        <h3 className="text-xs font-medium truncate group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        {showRating && product.rating > 0 && (
          <div className="flex items-center gap-0.5 mt-1">
            <Star className="h-2.5 w-2.5 fill-gold text-gold" />
            <span className="text-[10px] text-muted-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-1.5">
          <PriceDisplay price={product.price} comparePrice={product.comparePrice} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PRODUCT CARD EXPORT
   ═══════════════════════════════════════════════════════════════════ */

export default function ProductCard({
  product,
  variant = 'grid',
  showQuickActions = true,
  showRating = true,
  showBadges = true,
  showCompare = true,
  showWishlist = true,
  className = '',
}: ProductCardProps) {
  const cardProps = {
    product,
    showQuickActions,
    showRating,
    showBadges,
    showCompare,
    showWishlist,
  };

  return (
    <div className={className}>
      {variant === 'grid' && <GridCard {...cardProps} />}
      {variant === 'list' && <ListCard {...cardProps} />}
      {variant === 'horizontal' && <HorizontalCard {...cardProps} />}
    </div>
  );
}
