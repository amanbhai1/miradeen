'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X,
  Heart, Truck, Shield, RefreshCw, Clock, ChevronDown, ChevronUp,
  Star, ChevronRight, CheckCircle2, AlertCircle, Sparkles,
  Package, Gift, Lock, Award, Loader2, Zap, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { parseJsonField } from '@/types';
import type { Product, CartItem } from '@/types';

/* ─── Color Hex Mapping ──────────────────────────────────────────── */

const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a', white: '#ffffff', navy: '#1e3a5f', red: '#dc2626',
  green: '#16a34a', beige: '#d4c5a9', brown: '#78350f', gold: '#c9a96e',
  blue: '#2563eb', gray: '#6b7280', grey: '#6b7280', maroon: '#7c2d12',
  cream: '#f5f0e1', olive: '#5c6b3c', teal: '#0d9488', purple: '#7c3aed',
  pink: '#ec4899', orange: '#ea580c', coral: '#f87171', burgundy: '#7f1d1d',
  charcoal: '#36454f', khaki: '#c3b091', rust: '#b7410e', peach: '#fbbf24',
  ivory: '#fffff0', silver: '#c0c0c0', tan: '#d2b48c', camel: '#c19a6b',
  mustard: '#e1ad01', lavender: '#b57edc', mauve: '#e0b0ff', mint: '#98fb98',
  wine: '#722f37', forest: '#228b22', copper: '#b87333', bronze: '#cd7f32',
};

function getColorHex(name: string): string {
  const n = name.toLowerCase().replace(/[^a-z]/g, '');
  if (COLOR_HEX[n]) return COLOR_HEX[n];
  for (const [key, val] of Object.entries(COLOR_HEX)) {
    if (n.includes(key) || key.includes(n)) return val;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 45%, 50%)`;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ─── Stock Badge ────────────────────────────────────────────────── */

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Out of Stock
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-orange-500 font-medium bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        Only {stock} left
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-medium bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      In Stock
    </span>
  );
}

/* ─── Recommendation Product Card ────────────────────────────────── */

function RecommendationCard({ product }: { product: Product }) {
  const { navigate, addToCart } = useStore();
  const images = parseJsonField<string>(product.images);
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border shrink-0 w-[180px] sm:w-auto hover:shadow-md transition-shadow duration-300"
      onClick={() => navigate('product', product.id)}
    >
      <div className="relative aspect-[3/4] img-zoom overflow-hidden">
        <img
          src={images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0 font-semibold shadow-sm">
            -{discount}%
          </Badge>
        )}
        {product.isNewArrival && (
          <Badge className="absolute top-2 right-2 bg-gold text-background text-[9px] px-1.5 py-0 font-semibold">
            New
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full h-8 bg-white text-foreground hover:bg-gold hover:text-background text-[10px] font-medium shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              const sizes = parseJsonField<string>(product.sizes);
              addToCart(product, 1, sizes[0]);
            }}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-0.5 truncate">
          {product.category?.name}
        </p>
        <h4 className="text-sm font-medium truncate group-hover:text-gold transition-colors duration-200">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   CART PAGE
   ═════════════════════════════════════════════════════════════════════ */

export default function CartPage() {
  const {
    cart, removeFromCart, updateCartQuantity, clearCart,
    getCartSubtotal, getCartTotal, getCartCount,
    couponCode, couponDiscount, applyCoupon, removeCoupon,
    navigate, addToCart, recentlyViewedIds
  } = useStore();

  // ── Local state ─────────────────────────────────────────────────
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [showSavedForLater, setShowSavedForLater] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  // ── Calculations ────────────────────────────────────────────────
  const subtotal = getCartSubtotal();
  const totalAfterDiscount = getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 149;
  const tax = Math.round(totalAfterDiscount * 0.05);
  const finalTotal = totalAfterDiscount + shipping + tax;
  const freeShippingRemaining = Math.max(0, 2000 - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / 2000) * 100);
  const hasFreeShipping = subtotal >= 2000;

  const deliveryMin = addBusinessDays(new Date(), 5);
  const deliveryMax = addBusinessDays(new Date(), 7);

  // ── Fetch recommendations ───────────────────────────────────────
  useEffect(() => {
    fetch('/api/products?limit=4&featured=true')
      .then(r => r.json())
      .then(data => {
        const products = (data.products || []).filter(
          (p: Product) => !cart.some(item => item.product.id === p.id)
        );
        setRecommendations(products.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, []);

  // ── Fetch recently viewed (for empty cart) ──────────────────────
  useEffect(() => {
    if (recentlyViewedIds.length === 0) return;
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        const all = data.products || [];
        setRecentlyViewed(
          recentlyViewedIds
            .map(id => all.find((p: Product) => p.id === id))
            .filter(Boolean) as Product[]
        );
      })
      .catch(() => {});
  }, [recentlyViewedIds]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleSaveForLater = useCallback((item: CartItem) => {
    removeFromCart(item.product.id, item.size);
    setSavedForLater(prev => [...prev, item]);
  }, [removeFromCart]);

  const handleMoveToCart = useCallback((item: CartItem) => {
    addToCart(item.product, item.quantity, item.size, item.color);
    setSavedForLater(prev => prev.filter(
      si => !(si.product.id === item.product.id && si.size === item.size)
    ));
  }, [addToCart]);

  const handleMoveAllToCart = useCallback(() => {
    savedForLater.forEach(item => {
      addToCart(item.product, item.quantity, item.size, item.color);
    });
    setSavedForLater([]);
  }, [savedForLater, addToCart]);

  const handleApplyCoupon = useCallback(() => {
    setCouponError('');
    setCouponSuccess(false);
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    setTimeout(() => {
      if (applyCoupon(couponInput)) {
        setCouponSuccess(true);
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code. Please try again.');
        setCouponSuccess(false);
      }
      setCouponLoading(false);
    }, 600);
  }, [couponInput, applyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    setCouponSuccess(false);
    setCouponError('');
  }, [removeCoupon]);

  // ════════════════════════════════════════════════════════════════
  //  EMPTY CART VIEW
  // ════════════════════════════════════════════════════════════════

  const isEmpty = cart.length === 0 && savedForLater.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* ── Empty Cart Hero ─────────────────────────────────────── */}
        <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80"
            alt="Shopping Cart"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
          <div className="relative z-10 text-center text-white">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2"
            >
              Your Selection
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="heading-serif text-4xl md:text-5xl font-bold"
            >
              Shopping Cart
            </motion.h1>
          </div>
        </div>

        {/* ── Empty State ─────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            {/* Animated Shopping Bag Illustration */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative mx-auto mb-10"
            >
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gold/10 via-gold/5 to-transparent flex items-center justify-center mx-auto ring-1 ring-gold/20">
                <ShoppingBag className="h-18 w-18 text-gold/40" strokeWidth={1} />
              </div>

              {/* Floating sparkle decorations */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.3, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2"
              >
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
                  <X className="h-4 w-4 text-gold/50" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.8, ease: 'easeInOut' }}
                className="absolute top-6 -left-4"
              >
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-gold/40" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, delay: 1.2, ease: 'easeInOut' }}
                className="absolute bottom-8 -right-6"
              >
                <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center">
                  <Heart className="h-2.5 w-2.5 text-gold/40" />
                </div>
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="heading-serif text-3xl md:text-4xl font-bold mb-4"
            >
              Your Cart is Empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-10 text-sm leading-relaxed"
            >
              Looks like you haven&apos;t added anything yet.<br />
              Explore our luxury collection and find something you love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={() => navigate('shop')}
                className="bg-gold text-background hover:bg-gold-dark px-8 h-12 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury shadow-lg shadow-gold/20"
              >
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('shop')}
                variant="outline"
                className="border-border hover:border-gold hover:text-gold px-8 h-12 tracking-[0.15em] uppercase text-xs transition-all duration-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />View New Arrivals
              </Button>
            </motion.div>

            {/* Trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-[11px] text-muted-foreground flex items-center justify-center gap-4"
            >
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-gold/60" />Secure Checkout</span>
              <span className="flex items-center gap-1"><Truck className="h-3 w-3 text-gold/60" />Free Shipping 2K+</span>
              <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 text-gold/60" />Easy Returns</span>
            </motion.p>
          </motion.div>
        </div>

        {/* ── Recently Viewed ─────────────────────────────────────── */}
        {recentlyViewed.length >= 2 && (
          <section className="py-12 bg-cream/50 dark:bg-card/30 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Your History</p>
                <h2 className="heading-serif text-2xl font-bold">Recently Viewed</h2>
                <div className="divider-gold w-16 mx-auto mt-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {recentlyViewed.slice(0, 6).map(product => {
                  const images = parseJsonField<string>(product.images);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border product-card hover:shadow-sm transition-shadow"
                      onClick={() => navigate('product', product.id)}
                    >
                      <div className="relative aspect-[3/4] img-zoom">
                        <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-[9px] text-muted-foreground tracking-wider uppercase truncate">{product.category?.name}</p>
                        <h3 className="text-xs font-medium truncate group-hover:text-gold transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-semibold">₹{product.price.toLocaleString()}</span>
                          {product.comparePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ₹{product.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  NON-EMPTY CART VIEW
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="relative h-48 md:h-56 lg:h-64 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80"
          alt="Shopping Cart"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/65" />
        <div className="relative z-10 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2"
          >
            Your Selection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="heading-serif text-4xl md:text-5xl font-bold"
          >
            Shopping Cart
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-2 mt-3"
          >
            <motion.span
              key={getCartCount()}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-gold text-background text-xs font-bold rounded-full"
            >
              {getCartCount()}
            </motion.span>
            <span className="text-sm text-primary-foreground/70">
              item{getCartCount() !== 1 ? 's' : ''} in your cart
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <button onClick={() => navigate('home')} className="hover:text-gold transition-colors">Home</button>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* ── Free Shipping Progress Banner ───────────────────────── */}
        <AnimatePresence mode="wait">
          {cart.length > 0 && !hasFreeShipping && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-gold/5 via-gold/[0.08] to-gold/5 border border-gold/20"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">
                  <Truck className="inline h-3.5 w-3.5 mr-1.5 text-gold" />
                  Add <span className="text-gold font-bold">₹{freeShippingRemaining.toLocaleString()}</span> more for free shipping!
                </p>
                <span className="text-[11px] font-medium text-gold/80">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-border/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
          {cart.length > 0 && hasFreeShipping && (
            <motion.div
              key="achieved"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mb-6 p-3.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                You&apos;ve earned <span className="font-bold">free shipping</span> on this order!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid: Cart Items + Order Summary ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* ── Cart Items Column ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-serif text-xl font-bold">
                Cart Items
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({getCartCount()})
                </span>
              </h2>
              <Button
                variant="ghost"
                className="text-destructive text-xs hover:text-destructive hover:bg-destructive/5 transition-colors h-8"
                onClick={clearCart}
              >
                <Trash2 className="mr-1 h-3 w-3" />Clear Cart
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const images = parseJsonField<string>(item.product.images);
                const itemTotal = item.product.price * item.quantity;
                const originalTotal = item.product.comparePrice ? item.product.comparePrice * item.quantity : 0;
                const itemSavings = originalTotal - itemTotal;
                const itemDiscount = item.product.comparePrice
                  ? Math.round((1 - item.product.price / item.product.comparePrice) * 100)
                  : 0;
                const isOutOfStock = item.product.stock === 0;

                return (
                  <motion.div
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.3 } }}
                    className="flex flex-col sm:flex-row gap-4 p-4 md:p-5 border border-border rounded-xl bg-card hover:shadow-md transition-all duration-300 group"
                  >
                    {/* ── Product Image ─────────────────────────────── */}
                    <div className="w-full sm:w-28 md:w-32 h-44 sm:h-36 md:h-40 rounded-lg overflow-hidden shrink-0 bg-muted relative">
                      <img
                        src={images[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                        onClick={() => navigate('product', item.product.id)}
                      />
                      {/* Discount badge on image */}
                      {itemDiscount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0 font-semibold shadow-sm">
                          -{itemDiscount}%
                        </Badge>
                      )}
                      {/* Quick view overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                    </div>

                    {/* ── Details ───────────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Top Row: Name + Delete */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                            {item.product.category?.name}
                          </p>
                          <h3
                            className="text-sm font-semibold truncate cursor-pointer hover:text-gold transition-colors duration-200 mt-0.5"
                            onClick={() => navigate('product', item.product.id)}
                          >
                            {item.product.name}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Size & Color Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.size && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium px-2 py-0 h-5 bg-muted/80 hover:bg-muted"
                          >
                            Size: {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0 h-5 rounded-full border border-border bg-muted/50">
                            <span
                              className="w-3 h-3 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: getColorHex(item.color) }}
                            />
                            {item.color}
                          </span>
                        )}
                        <StockBadge stock={item.product.stock} />
                      </div>

                      {/* Savings tag */}
                      {itemSavings > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-2"
                        >
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                            <Tag className="h-2.5 w-2.5" />
                            You save ₹{itemSavings.toLocaleString()} ({itemDiscount}% off)
                          </span>
                        </motion.div>
                      )}

                      {/* Bottom: Price + Quantity + Save */}
                      <div className="flex items-end justify-between mt-auto pt-3 gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted transition-colors rounded-none"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)}
                            disabled={item.quantity <= 1 || isOutOfStock}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3, color: 'rgb(201,169,110)' }}
                            animate={{ scale: 1, color: 'inherit' }}
                            transition={{ duration: 0.2 }}
                            className="w-8 text-center text-sm font-semibold tabular-nums select-none"
                          >
                            {item.quantity}
                          </motion.span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted transition-colors rounded-none"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)}
                            disabled={item.quantity >= item.product.stock || isOutOfStock}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price + Actions */}
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="flex items-baseline gap-2">
                            <motion.span
                              key={itemTotal}
                              initial={{ scale: 1.05 }}
                              animate={{ scale: 1 }}
                              className="text-base font-bold"
                            >
                              ₹{itemTotal.toLocaleString()}
                            </motion.span>
                            {item.product.comparePrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{originalTotal.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {!isOutOfStock && (
                            <button
                              onClick={() => handleSaveForLater(item)}
                              className="text-[10px] text-muted-foreground hover:text-gold transition-colors flex items-center gap-1 group/btn"
                            >
                              <Heart className="h-3 w-3 group-hover/btn:fill-gold/30 transition-all" />
                              Save for Later
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Cart-only empty state (when items removed but saved items exist) */}
            {cart.length === 0 && savedForLater.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/20"
              >
                <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">All items moved or removed</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Your saved items are below, or{' '}
                  <button onClick={() => navigate('shop')} className="text-gold hover:underline">
                    continue shopping
                  </button>
                </p>
              </motion.div>
            )}
          </div>

          {/* ── Order Summary Sidebar ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <div className="border border-border rounded-xl p-5 md:p-6 bg-card shadow-sm space-y-5">
                <h3 className="heading-serif text-xl font-bold">Order Summary</h3>

                {/* ── Itemized List with Thumbnails ──────────────── */}
                <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {cart.map(item => {
                    const images = parseJsonField<string>(item.product.images);
                    return (
                      <div
                        key={`summary-${item.product.id}-${item.size}`}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-muted border border-border/50">
                          <img
                            src={images[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate font-medium leading-tight">{item.product.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' · '}
                            {item.color && item.color}
                            {' · '}<span className="font-medium">×{item.quantity}</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold shrink-0 tabular-nums">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="divider-gold" />

                {/* ── Coupon System ───────────────────────────────── */}
                {couponCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg px-3.5 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 tracking-wide">
                          {couponCode}
                        </span>
                        <span className="text-[10px] text-green-600 dark:text-green-500 ml-1.5 font-medium">
                          (-₹{couponDiscount.toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      onClick={handleRemoveCoupon}
                      aria-label="Remove coupon"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Coupon code"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="h-9 text-sm pl-8 uppercase tracking-wider focus:border-gold"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          disabled={couponLoading}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="h-9 text-xs hover:border-gold hover:text-gold transition-colors min-w-[64px]"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {couponError}
                      </motion.p>
                    )}
                    {couponSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-green-600 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Coupon applied successfully!
                      </motion.p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3 w-3 text-gold/50" />
                      Try: <span className="font-semibold text-gold cursor-pointer hover:underline" onClick={() => { setCouponInput('MIRADEEN20'); setCouponError(''); }}>MIRADEEN20</span> for 20% off
                    </p>
                  </div>
                )}

                {/* ── Price Breakdown ─────────────────────────────── */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between text-green-600"
                    >
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Coupon Discount
                      </span>
                      <span className="font-medium">-₹{couponDiscount.toLocaleString()}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span className="font-medium">₹{shipping}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST 5%)</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>

                  <div className="divider-gold" />

                  <div className="flex justify-between items-baseline text-lg font-bold">
                    <span>Total</span>
                    <motion.span
                      key={finalTotal}
                      initial={{ scale: 1.05, color: 'rgb(201,169,110)' }}
                      animate={{ scale: 1, color: 'rgb(201,169,110)' }}
                      transition={{ duration: 0.3 }}
                      className="text-gold"
                    >
                      ₹{finalTotal.toLocaleString()}
                    </motion.span>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3.5 py-2.5">
                  <Clock className="h-4 w-4 text-gold shrink-0" />
                  <span>
                    Estimated delivery:{' '}
                    <span className="font-semibold text-foreground">
                      {formatDate(deliveryMin)} – {formatDate(deliveryMax)}
                    </span>
                  </span>
                </div>

                {/* Trust Badges Row */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { icon: Shield, label: 'SSL Secure' },
                    { icon: Lock, label: 'Safe Pay' },
                    { icon: RefreshCw, label: 'Returns' },
                    { icon: Truck, label: 'Delivery' },
                  ].map(badge => (
                    <div key={badge.label} className="flex flex-col items-center gap-1 text-center py-1">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <badge.icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      </div>
                      <span className="text-[8px] text-muted-foreground font-medium tracking-wide uppercase leading-tight">
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Secure checkout note */}
                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  256-bit SSL encrypted checkout
                </p>

                {/* CTAs */}
                <Button
                  onClick={() => navigate('checkout')}
                  className="w-full h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury shadow-lg shadow-gold/15"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('shop')}
                  className="w-full h-10 border-border hover:border-gold hover:text-gold tracking-wider uppercase text-xs transition-all duration-300"
                >
                  <ArrowRight className="mr-2 h-3 w-3 rotate-180" />
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Saved for Later Section ────────────────────────────── */}
        <AnimatePresence>
          {savedForLater.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-10 border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setShowSavedForLater(!showSavedForLater)}
                className="w-full flex items-center justify-between px-5 md:px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-gold" />
                  </div>
                  <div className="text-left">
                    <h3 className="heading-serif text-lg font-bold">
                      Saved for Later
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {savedForLater.length} item{savedForLater.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {showSavedForLater && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] text-gold font-medium hidden sm:block"
                    >
                      Move All to Cart
                    </motion.span>
                  )}
                  {showSavedForLater
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
              </button>

              <AnimatePresence>
                {showSavedForLater && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {/* Move All button (mobile visible) */}
                    <div className="px-5 py-2 flex items-center justify-between border-b border-border bg-gold/[0.03]">
                      <p className="text-[10px] text-muted-foreground">
                        Total value: <span className="font-semibold text-foreground">
                          ₹{savedForLater.reduce((s, i) => s + i.product.price * i.quantity, 0).toLocaleString()}
                        </span>
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMoveAllToCart}
                        className="h-7 text-[10px] text-gold hover:text-gold hover:bg-gold/10 font-medium sm:hidden"
                      >
                        Move All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMoveAllToCart}
                        className="h-7 text-[10px] text-gold hover:text-gold hover:bg-gold/10 font-medium hidden sm:flex items-center gap-1"
                      >
                        <ShoppingBag className="h-3 w-3" />Move All to Cart
                      </Button>
                    </div>
                    <div className="divide-y divide-border">
                      {savedForLater.map((item) => {
                        const images = parseJsonField<string>(item.product.images);
                        return (
                          <motion.div
                            key={`saved-${item.product.id}-${item.size}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-4 px-5 md:px-6 py-4 hover:bg-muted/20 transition-colors"
                          >
                            <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-muted border border-border/50">
                              <img
                                src={images[0] || '/placeholder.jpg'}
                                alt={item.product.name}
                                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                                onClick={() => navigate('product', item.product.id)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className="text-sm font-medium truncate cursor-pointer hover:text-gold transition-colors"
                                onClick={() => navigate('product', item.product.id)}
                              >
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' · '}
                                {item.color && item.color}
                                {item.quantity > 1 && <span className="ml-1">· Qty: {item.quantity}</span>}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-bold">₹{item.product.price.toLocaleString()}</span>
                                {item.product.comparePrice && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ₹{item.product.comparePrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleMoveToCart(item)}
                                className="h-8 text-xs bg-gold text-background hover:bg-gold-dark transition-colors font-medium px-4"
                              >
                                <ShoppingBag className="h-3 w-3 mr-1" />Move to Cart
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSavedForLater(prev => prev.filter(
                                  si => !(si.product.id === item.product.id && si.size === item.size)
                                ))}
                                className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3 mr-0.5" />Remove
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── You Might Also Like ────────────────────────────────── */}
        <section className="mt-16 mb-10">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Recommended</p>
            <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">You Might Also Like</h2>
            <div className="divider-gold w-16 mx-auto" />
          </div>

          {recLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-3 w-16 mx-3" />
                  <Skeleton className="h-4 w-32 mx-3" />
                  <Skeleton className="h-4 w-20 mx-3" />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <>
              {/* Mobile: Horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-4 md:hidden -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
                {recommendations.map(product => (
                  <RecommendationCard key={product.id} product={product} />
                ))}
              </div>
              {/* Desktop: Grid */}
              <div className="hidden md:grid md:grid-cols-4 gap-4 lg:gap-6">
                {recommendations.map(product => (
                  <RecommendationCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No recommendations available right now.
            </p>
          )}

          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('shop')}
              variant="outline"
              className="border-border hover:border-gold hover:text-gold tracking-[0.15em] uppercase text-xs px-8 py-3 transition-all duration-300"
            >
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      {/* ── Mobile Cart Summary Bar ──────────────────────────────── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          >
            <div className="bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              {/* Free shipping mini bar */}
              {!hasFreeShipping && (
                <div className="px-4 pt-2">
                  <div className="w-full h-1 bg-border/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {getCartCount()} item{getCartCount() !== 1 ? 's' : ''}
                    </span>
                    {couponDiscount > 0 && (
                      <Badge className="h-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] px-1.5 py-0 font-medium">
                        -₹{couponDiscount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">
                    Total: <span className="text-gold">₹{finalTotal.toLocaleString()}</span>
                  </p>
                </div>
                <Button
                  onClick={() => navigate('checkout')}
                  className="bg-gold text-background hover:bg-gold-dark px-6 h-11 tracking-wider uppercase text-xs font-semibold btn-luxury shrink-0 shadow-lg shadow-gold/20"
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                  Checkout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
