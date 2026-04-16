'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  ChevronLeft,
  Check,
  Package,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function stockStatus(stock: number) {
  if (stock <= 0)
    return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' };
  if (stock <= 5)
    return { label: `Only ${stock} left`, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' };
  return { label: 'In Stock', color: 'bg-green-500/10 text-green-600 dark:text-green-400', dot: 'bg-green-500' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, addToCart, navigate, isAuthenticated } =
    useStore();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sizeSelections, setSizeSelections] = useState<Record<string, string>>(
    {}
  );
  const [movingToCart, setMovingToCart] = useState<string | null>(null);

  /* ---------- fetch wishlist products ---------- */
  useEffect(() => {
    setLoading(true);
    fetch('/api/products?limit=100')
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = (data.products || []).filter((p: Product) =>
          wishlistIds.includes(p.id)
        );
        setProducts(list);
        // Auto-select first size for each product
        const initial: Record<string, string> = {};
        list.forEach((p) => {
          const sizes = parseJsonField<string>(p.sizes);
          if (sizes.length > 0) initial[p.id] = sizes[0];
        });
        setSizeSelections(initial);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  /* ---------- derived ---------- */
  const totalValue = products.reduce((s, p) => s + p.price, 0);

  const allSelected =
    products.length > 0 && selectedIds.size === products.length;

  /* ---------- selection helpers ---------- */
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ---------- actions ---------- */
  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
    toast({ title: 'Removed from wishlist' });
  };

  const handleMoveToCart = (product: Product) => {
    const size = sizeSelections[product.id];
    if (!size) {
      toast({ title: 'Please select a size', variant: 'destructive' });
      return;
    }
    setMovingToCart(product.id);
    addToCart(product, 1, size);
    // Small delay so user sees feedback
    setTimeout(() => {
      toggleWishlist(product.id);
      toast({ title: 'Moved to cart', description: `${product.name} (${size}) added to your cart.` });
      setMovingToCart(null);
    }, 400);
  };

  const handleBulkAddToCart = () => {
    let count = 0;
    selectedIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        const size = sizeSelections[id];
        if (size) {
          addToCart(product, 1, size);
          count++;
        }
      }
    });
    if (count > 0) {
      toast({ title: `${count} item${count > 1 ? 's' : ''} added to cart` });
      setSelectedIds(new Set());
    }
  };

  const handleBulkRemove = () => {
    selectedIds.forEach((id) => toggleWishlist(id));
    toast({ title: `${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''} removed` });
    setSelectedIds(new Set());
  };

  const handleClearAll = () => {
    products.forEach((p) => toggleWishlist(p.id));
    toast({ title: 'Wishlist cleared' });
    setSelectedIds(new Set());
  };

  const handleShare = async () => {
    const ids = products.map((p) => p.id).join(',');
    const url = `${window.location.origin}?wishlist=${encodeURIComponent(ids)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share this link with your friends.' });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen">
      {/* ────────── Page Header ────────── */}
      <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80"
          alt="Wishlist"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">
            Saved For You
          </p>
          <h1 className="heading-serif text-4xl md:text-5xl font-bold">
            My Wishlist
          </h1>
          <p className="text-sm text-primary-foreground/70 mt-2">
            {products.length} item{products.length !== 1 ? 's' : ''} in your
            wishlist
          </p>
        </div>
      </div>

      {/* ────────── Breadcrumb ────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <button
            onClick={() => navigate('home')}
            className="hover:text-gold transition-colors"
          >
            Home
          </button>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span className="text-gold font-medium">Wishlist</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ────────── Loading State ────────── */}
        {loading ? (
          <div className="space-y-6">
            {/* Stats skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          /* ────────── Empty State ────────── */
          <EmptyState onNavigate={navigate} />
        ) : (
          /* ────────── Wishlist Content ────────── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* ──── Stats Bar ──── */}
            <div className="bg-cream dark:bg-card/50 rounded-xl border border-border p-4 md:p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-gold" />
                    <span className="text-sm font-medium">
                      {products.length} item{products.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gold" />
                    <span className="text-sm font-medium">
                      Estimated Total:{' '}
                      <span className="text-gold">
                        ₹{totalValue.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="hover:border-gold hover:text-gold transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Wishlist
                </Button>
              </div>
            </div>

            {/* ──── Bulk Actions Bar ──── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                  <span className="text-sm text-muted-foreground">
                    Select All
                  </span>
                </div>
                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 ml-2"
                    >
                      <Badge variant="secondary" className="text-xs">
                        {selectedIds.size} selected
                      </Badge>
                      <Button
                        size="sm"
                        onClick={handleBulkAddToCart}
                        className="bg-gold text-background hover:bg-gold/90 h-8 text-xs"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                        Add Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkRemove}
                        className="hover:border-red-500 hover:text-red-500 h-8 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-red-500 h-8 text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            </div>

            {/* ──── Divider ──── */}
            <div className="divider-gold mb-6" />

            {/* ──── Product Grid ──── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <WishlistItemCard
                    key={product.id}
                    product={product}
                    index={i}
                    isSelected={selectedIds.has(product.id)}
                    onSelect={() => toggleSelect(product.id)}
                    selectedSize={sizeSelections[product.id]}
                    onSizeChange={(size) =>
                      setSizeSelections((prev) => ({ ...prev, [product.id]: size }))
                    }
                    onRemove={() => handleRemove(product.id)}
                    onMoveToCart={() => handleMoveToCart(product)}
                    onNavigate={() => navigate('product', product.id)}
                    isMovingToCart={movingToCart === product.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WishlistItemCard                                                  */
/* ================================================================== */

function WishlistItemCard({
  product,
  index,
  isSelected,
  onSelect,
  selectedSize,
  onSizeChange,
  onRemove,
  onMoveToCart,
  onNavigate,
  isMovingToCart,
}: {
  product: Product;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  selectedSize?: string;
  onSizeChange: (size: string) => void;
  onRemove: () => void;
  onMoveToCart: () => void;
  onNavigate: () => void;
  isMovingToCart: boolean;
}) {
  const images = parseJsonField<string>(product.images);
  const colors = parseJsonField<{ name: string; hex: string }>(product.colors);
  const sizes = parseJsonField<string>(product.sizes);
  const status = stockStatus(product.stock);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`product-card bg-card rounded-lg overflow-hidden border transition-all duration-300 ${
        isSelected
          ? 'border-gold shadow-[0_0_0_1px_var(--color-gold)]'
          : 'border-border'
      }`}
    >
      {/* ── Image ── */}
      <div className="relative aspect-[3/4] img-zoom cursor-pointer" onClick={onNavigate}>
        <img
          src={images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Discount badge */}
        {product.comparePrice && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0">
            -
            {Math.round((1 - product.price / product.comparePrice) * 100)}%
          </Badge>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Remove from wishlist"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Selection checkbox */}
        <div className="absolute bottom-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-background/80 backdrop-blur data-[state=checked]:bg-gold data-[state=checked]:border-gold border-white/50"
          />
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
          {product.category?.name}
        </p>

        {/* Name */}
        <h3
          className="text-sm font-medium leading-tight line-clamp-2 cursor-pointer hover:text-gold transition-colors"
          onClick={onNavigate}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {colors.slice(0, 6).map((c, ci) => (
              <span
                key={ci}
                title={c.name}
                className="w-4 h-4 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {colors.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{colors.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Stock status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Added date */}
        <p className="text-[11px] text-muted-foreground">
          Added {timeAgo(product.createdAt)}
        </p>

        {/* ── Size selector + Move to Cart ── */}
        {product.stock > 0 && (
          <div className="flex items-center gap-2 pt-1">
            {sizes.length > 0 && (
              <select
                value={selectedSize || ''}
                onChange={(e) => onSizeChange(e.target.value)}
                className="flex-1 h-9 text-xs border border-input rounded-md bg-background px-2 focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToCart();
              }}
              disabled={isMovingToCart || !selectedSize}
              className="btn-luxury flex-1 h-9 text-xs"
            >
              {isMovingToCart ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  Added
                </motion.span>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                  Move to Cart
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Empty State                                                        */
/* ================================================================== */

function EmptyState({ onNavigate }: { onNavigate: (page: 'shop') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
          <Heart className="h-10 w-10 text-gold" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center"
        >
          <Heart className="h-3 w-3 text-gold fill-gold" />
        </motion.div>
      </div>

      <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">
        Your Wishlist is Empty
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Save your favorite pieces here and revisit them anytime. Tap the heart
        icon on any product to add it to your wishlist.
      </p>

      <Button
        onClick={() => onNavigate('shop')}
        className="btn-luxury px-8"
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Start Shopping
      </Button>

      <div className="divider-gold w-48 my-10" />

      <div className="grid grid-cols-3 gap-8 text-center">
        <div>
          <Package className="h-6 w-6 text-gold mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Free Shipping</p>
        </div>
        <div>
          <Heart className="h-6 w-6 text-gold mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Easy Returns</p>
        </div>
        <div>
          <Share2 className="h-6 w-6 text-gold mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Share & Save</p>
        </div>
      </div>
    </motion.div>
  );
}
