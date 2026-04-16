'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Eye, GitCompareArrows, Star, Check, Plus,
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

/* ─── 3D Tilt Hook (uses event.currentTarget, no ref needed) ────── */

function useTilt() {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // max ±6deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: 'transform 0.15s ease-out',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    });
  }, []);

  return { style, handleMouseMove, handleMouseLeave };
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
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-gold text-gold" />
        ))}
        {hasHalf && (
          <div className="relative h-3 w-3">
            <Star className="h-3 w-3 text-gold/30 absolute inset-0" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-3 w-3 fill-gold text-gold" />
            </div>
          </div>
        )}
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
        <Badge className="badge-shine bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
          NEW
        </Badge>
      )}
      {isOnSale && (
        <Badge className="badge-shine bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
          {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
        </Badge>
      )}
      {product.isBestseller && (
        <Badge className="badge-shine bg-gold text-background text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wider border-0 shadow-sm">
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

/* ─── Color Dots Component ────────────────────────────────────────── */

function ColorDots({ colors }: { colors: string[] }) {
  if (colors.length === 0) return null;

  const maxShow = 5;
  const visible = colors.slice(0, maxShow);
  const extra = colors.length - maxShow;

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {visible.map((color, i) => (
        <span
          key={i}
          className="color-swatch ring-1 ring-border/50 shrink-0"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-muted-foreground leading-none">+{extra}</span>
      )}
    </div>
  );
}

/* ─── Wishlist Heart Button ───────────────────────────────────────── */

function WishlistButton({
  productId,
  isWishlisted,
  onToggle,
  size = 'md',
}: {
  productId: string;
  isWishlisted: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}) {
  const sz = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={onToggle}
      className={`${sz} bg-background/90 dark:bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors shadow-sm border border-border/30`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.div
        animate={isWishlisted ? { scale: [1, 1.35, 0.95, 1.15, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 8, duration: 0.5 }}
      >
        <Heart
          className={`${iconSz} transition-colors duration-200 ${
            isWishlisted
              ? 'fill-red-500 text-red-500'
              : 'text-foreground/70'
          }`}
        />
      </motion.div>
    </motion.button>
  );
}

/* ─── Size Selector (Quick Add) ───────────────────────────────────── */

function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
}) {
  if (sizes.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto custom-scrollbar pb-0.5">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(size);
          }}
          className={`shrink-0 px-2.5 py-1 text-[10px] font-medium rounded border transition-all duration-200 ${
            selected === size
              ? 'bg-gold text-background border-gold'
              : 'bg-background/80 dark:bg-card/80 text-foreground border-border/50 hover:border-gold hover:text-gold'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

/* ─── Quick Add Overlay Component ─────────────────────────────────── */

function QuickAddOverlay({
  product,
  show,
}: {
  product: Product;
  show: boolean;
}) {
  const { addToCart, setQuickViewProductId } = useStore();
  const sizes = parseJsonField<string>(product.sizes);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }, [addToCart, product, selectedSize]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProductId(product.id);
  }, [setQuickViewProductId, product.id]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 z-20 flex flex-col justify-end bg-black/0 hover:bg-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-t from-black/75 via-black/45 to-transparent pt-16 pb-3 px-3">
            {/* Size selector */}
            <SizeSelector
              sizes={sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />

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
                className="btn-luxury flex-1 h-9 bg-gold text-background hover:bg-gold-dark text-[10px] font-semibold border-0 shadow-sm"
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
                      <Plus className="h-3 w-3" />
                      Quick Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Compare Button ──────────────────────────────────────────────── */

function CompareButton({
  productId,
  isCompared,
  onToggle,
}: {
  productId: string;
  isCompared: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm border border-border/30 ${
        isCompared
          ? 'bg-gold text-background'
          : 'bg-background/90 dark:bg-card/90 hover:bg-gold hover:text-background'
      }`}
      aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
    >
      <GitCompareArrows className="h-3.5 w-3.5" />
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT CARD — GRID VARIANT (DEFAULT)
   ═══════════════════════════════════════════════════════════════════ */

function GridCard({ product, showQuickActions, showRating, showBadges, showCompare, showWishlist }: Omit<ProductCardProps, 'variant' | 'className'>) {
  const { navigate, toggleWishlist, toggleCompare, wishlistIds, compareIds } = useStore();
  const images = parseJsonField<string>(product.images);
  const colors = parseJsonField<string>(product.colors);
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  const tilt = useTilt();

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  }, [toggleWishlist, product.id]);

  const handleToggleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  }, [toggleCompare, product.id]);

  return (
    <motion.div
      layout
      className="group cursor-pointer"
      onClick={() => navigate('product', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer wrapper for card-luxury border reveal + card-shine sweep */}
      <div
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        className="card-luxury card-shine rounded-lg overflow-hidden border border-border hover:shadow-[0_16px_48px_-8px_rgba(201,169,110,0.25)] dark:hover:shadow-[0_16px_48px_-8px_rgba(201,169,110,0.15)]"
        style={tilt.style}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Badges */}
          <ProductBadges product={product} show={showBadges} />

          {/* Gold border sweep overlay */}
          <div className="absolute inset-0 pointer-events-none z-[5]">
            <div
              className="absolute inset-0 rounded-lg transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(135deg, rgba(201,169,110,0) 30%, rgba(201,169,110,0.12) 50%, rgba(201,169,110,0) 70%)',
              }}
            />
          </div>

          {/* Always-visible wishlist button (top-right) */}
          {showWishlist && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <WishlistButton
                productId={product.id}
                isWishlisted={isWishlisted}
                onToggle={handleToggleWishlist}
              />
            </div>
          )}

          {/* Compare button (below wishlist on hover) */}
          <AnimatePresence>
            {showCompare && isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="absolute top-[52px] right-2.5 z-10"
              >
                <CompareButton
                  productId={product.id}
                  isCompared={isCompared}
                  onToggle={handleToggleCompare}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Add Overlay */}
          {showQuickActions && (
            <QuickAddOverlay product={product} show={isHovered} />
          )}
        </div>

        {/* Product Info */}
        <div className="p-3.5">
          {/* Category label */}
          <p className="text-[10px] text-muted-foreground tracking-[0.12em] uppercase mb-1">
            {product.category?.name}
          </p>

          {/* Product name */}
          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-gold transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Star rating */}
          {showRating && (
            <div className="mt-1.5">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          )}

          {/* Color dots */}
          <ColorDots colors={colors} />

          {/* Price */}
          <div className="mt-2">
            <PriceDisplay price={product.price} comparePrice={product.comparePrice} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT CARD — LIST VARIANT
   ═══════════════════════════════════════════════════════════════════ */

function ListCard({ product, showQuickActions, showRating, showBadges, showCompare, showWishlist }: Omit<ProductCardProps, 'variant' | 'className'>) {
  const { navigate, addToCart, toggleWishlist, toggleCompare, wishlistIds, compareIds, setQuickViewProductId } = useStore();
  const images = parseJsonField<string>(product.images);
  const colors = parseJsonField<string>(product.colors);
  const sizes = parseJsonField<string>(product.sizes);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = compareIds.includes(product.id);

  const tilt = useTilt();

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, sizes[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [addToCart, product, sizes]);

  return (
    <motion.div
      layout
      className="group cursor-pointer"
      onClick={() => navigate('product', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        className="card-luxury card-shine rounded-lg overflow-hidden border border-border hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.25)] dark:hover:shadow-[0_12px_40px_-8px_rgba(201,169,110,0.15)]"
        style={tilt.style}
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
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <ProductBadges product={product} show={showBadges} />

            {/* Gold border sweep */}
            <div className="absolute inset-0 pointer-events-none z-[5]">
              <div
                className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,169,110,0) 30%, rgba(201,169,110,0.12) 50%, rgba(201,169,110,0) 70%)',
                }}
              />
            </div>

            {/* Wishlist */}
            {showWishlist && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <WishlistButton
                  productId={product.id}
                  isWishlisted={isWishlisted}
                  onToggle={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  size="sm"
                />
              </div>
            )}
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
              <ColorDots colors={colors} />
            </div>

            <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
              <PriceDisplay price={product.price} comparePrice={product.comparePrice} />

              {showQuickActions && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setQuickViewProductId(product.id); }}
                    variant="outline"
                    className="btn-luxury h-8 px-3 text-[10px] border-border hover:border-gold hover:text-gold"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Quick View
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="btn-luxury h-8 px-3 text-[10px] bg-gold text-background hover:bg-gold-dark"
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
                          <Check className="h-3.5 w-3.5" />
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
                          <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                          Add to Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  {showWishlist && (
                    <WishlistButton
                      productId={product.id}
                      isWishlisted={isWishlisted}
                      onToggle={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      size="sm"
                    />
                  )}
                  {showCompare && (
                    <CompareButton
                      productId={product.id}
                      isCompared={isCompared}
                      onToggle={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                    />
                  )}
                </div>
              )}
            </div>
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
  const { navigate, addToCart, setQuickViewProductId, toggleWishlist, wishlistIds } = useStore();
  const images = parseJsonField<string>(product.images);
  const colors = parseJsonField<string>(product.colors);
  const sizes = parseJsonField<string>(product.sizes);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = wishlistIds.includes(product.id);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, sizes[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [addToCart, product, sizes]);

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border hover:shadow-[0_8px_30px_-6px_rgba(201,169,110,0.2)] dark:hover:shadow-[0_8px_30px_-6px_rgba(201,169,110,0.12)] min-w-[220px] max-w-[260px] shrink-0"
      onClick={() => navigate('product', product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <ProductBadges product={product} show={showBadges} />

        {/* Gold border sweep */}
        <div className="absolute inset-0 pointer-events-none z-[5]">
          <div
            className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,110,0) 30%, rgba(201,169,110,0.12) 50%, rgba(201,169,110,0) 70%)',
            }}
          />
        </div>

        {/* Quick Add overlay */}
        {showQuickActions && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent"
              >
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="btn-luxury w-full h-8 bg-gold text-background hover:bg-gold-dark text-[10px] font-semibold border-0"
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
                        <Plus className="h-3 w-3" />
                        Quick Add
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Wishlist button */}
        {showWishlist && (
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              productId={product.id}
              isWishlisted={isWishlisted}
              onToggle={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
              size="sm"
            />
          </div>
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
        <ColorDots colors={colors} />
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
