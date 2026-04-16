'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from '@/types';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingBag,
  Flame,
  Clock,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Copy,
  Check,
  Zap,
  ChevronDown,
  Tag,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Animation helpers
// ═══════════════════════════════════════════════════════════════
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ═══════════════════════════════════════════════════════════════
// Intersection observer helper
// ═══════════════════════════════════════════════════════════════
function useScrollOnView(ref: React.RefObject<HTMLDivElement | null>) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useScrollOnView(ref);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Countdown Timer Hook
// ═══════════════════════════════════════════════════════════════
function useCountdown(targetDate: Date) {
  const calc = useCallback(() => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calc);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [calc]);

  return timeLeft;
}

function CountdownDisplay({ hours, minutes, seconds, size = 'md' }: { hours: number; minutes: number; seconds: number; size?: 'sm' | 'md' | 'lg' }) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const numClass = size === 'lg'
    ? 'text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums'
    : size === 'sm'
      ? 'text-lg font-bold tabular-nums'
      : 'text-2xl sm:text-3xl font-bold tabular-nums';
  const labelClass = size === 'lg' ? 'text-[10px]' : size === 'sm' ? 'text-[8px]' : 'text-[9px]';

  return (
    <div className="flex items-center gap-2">
      {[
        { val: hours, label: 'HRS' },
        { val: minutes, label: 'MIN' },
        { val: seconds, label: 'SEC' },
      ].map((unit, idx) => (
        <React.Fragment key={unit.label}>
          {idx > 0 && (
            <span className={`text-gold/60 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>:</span>
          )}
          <div className="flex flex-col items-center">
            <div className="bg-black/50 border border-gold/20 rounded-lg px-3 py-1.5 min-w-[3rem] flex items-center justify-center">
              <span className={`${numClass} text-gold-gradient`}>{pad(unit.val)}</span>
            </div>
            <span className={`${labelClass} text-gold/50 tracking-[0.15em] mt-1`}>{unit.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Section Header
// ═══════════════════════════════════════════════════════════════
function SectionHeader({ label, title, highlight, description }: { label: string; title: string; highlight: string; description?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <span className="separator-diamond mb-4 inline-flex items-center gap-2">
        <span className="diamond" />
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">{label}</span>
        <span className="diamond" />
      </span>
      <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
        {title} <span className="text-gold-gradient">{highlight}</span>
      </h2>
      {description && <p className="text-muted-foreground mt-4 max-w-lg mx-auto">{description}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════════════════
const saleCategories = [
  {
    name: "Women's Sale",
    discount: 'Up to 40% Off',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
    color: 'from-rose-900/60',
  },
  {
    name: "Men's Sale",
    discount: 'Up to 35% Off',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    color: 'from-slate-900/60',
  },
  {
    name: 'Accessories Sale',
    discount: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    color: 'from-amber-900/60',
  },
  {
    name: 'New Arrivals On Sale',
    discount: 'Up to 25% Off',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    color: 'from-emerald-900/60',
  },
];

const flashDeals = [
  {
    name: 'Italian Leather Crossbody Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    originalPrice: 12999,
    salePrice: 6499,
    discount: 50,
    hoursFromNow: 2,
    claimed: 72,
  },
  {
    name: 'Cashmere Blend Overcoat',
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600',
    originalPrice: 18999,
    salePrice: 11399,
    discount: 40,
    hoursFromNow: 4,
    claimed: 58,
  },
  {
    name: 'Silk Evening Gown',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
    originalPrice: 24999,
    salePrice: 16249,
    discount: 35,
    hoursFromNow: 6,
    claimed: 45,
  },
];

const coupons = [
  { code: 'MIRADEEN20', discount: '20% off', minOrder: '₹2,000', description: 'Sitewide discount' },
  { code: 'EXTRA500', discount: '₹500 off', minOrder: '₹3,000', description: 'Flat discount' },
  { code: 'LUXURY30', discount: '30% off', minOrder: '₹5,000', description: 'Premium discount' },
];

const saleBenefits = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    description: 'Complimentary express delivery on all sale orders. No minimum purchase required.',
  },
  {
    icon: RotateCcw,
    title: 'Easy 30-Day Returns',
    description: 'Changed your mind? No worries. Hassle-free returns within 30 days of purchase.',
  },
  {
    icon: ShieldCheck,
    title: 'Lowest Price Guarantee',
    description: 'If you find the same item cheaper elsewhere, we\'ll match the price. No questions asked.',
  },
];

const sortOptions = [
  { value: 'best-discount', label: 'Best Discount' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

// ═══════════════════════════════════════════════════════════════
// Main SalePage
// ═══════════════════════════════════════════════════════════════
export default function SalePage() {
  const { navigate, addToCart } = useStore();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Flash sale countdown — ends 12 hours from now
  const saleEndRef = useRef(new Date(Date.now() + 12 * 60 * 60 * 1000));
  const saleCountdown = useCountdown(saleEndRef.current);

  // Products
  const [products, setProducts] = useState<(Product & { saleDiscount: number; salePrice: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('best-discount');

  useEffect(() => {
    fetch('/api/products?limit=12')
      .then((r) => r.json())
      .then((data) => {
        const items: Product[] = data.products || data || [];
        const enriched = items.map((p) => {
          const discount = Math.floor(Math.random() * 26) + 15; // 15-40%
          return { ...p, saleDiscount: discount, salePrice: Math.round(p.price * (1 - discount / 100)) };
        });
        setProducts(enriched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'best-discount': return b.saleDiscount - a.saleDiscount;
      case 'price-low-high': return a.salePrice - b.salePrice;
      case 'price-high-low': return b.salePrice - a.salePrice;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
  });

  // Add to cart handler
  const handleAddToCart = useCallback((product: Product, salePrice?: number) => {
    const p = { ...product, price: salePrice ?? product.price };
    addToCart(p, 1);
    toast({ title: 'Added to cart', description: `${product.name} has been added to your cart.` });
  }, [addToCart, toast]);

  // Coupon copy handler
  const handleCopyCoupon = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({ title: 'Coupon copied!', description: `Code "${code}" copied to clipboard.` });
      if (useStore.getState().applyCoupon(code)) {
        toast({ title: 'Coupon applied!', description: `${code} has been applied to your cart.` });
      }
    }).catch(() => {
      toast({ title: 'Copy failed', description: 'Please copy the code manually.', variant: 'destructive' });
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — Flash Sale Hero
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[560px] overflow-hidden">
        {/* Background */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920)' }}
          />
        </motion.div>

        {/* Dark gradient overlay with red/gold accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Gold sparkle particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full bg-gold/40"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-gold/30"
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-[60%] left-[70%] w-1 h-1 rounded-full bg-gold/35"
            animate={{ y: [0, -25, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.div
            className="absolute top-[45%] left-[40%] w-0.5 h-0.5 rounded-full bg-gold/50"
            animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
          style={{ opacity: heroOpacity }}
        >
          {/* Top label */}
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-10 h-px bg-gold/50" />
            <Flame className="w-5 h-5 text-red-500" />
            <span className="w-10 h-px bg-gold/50" />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="heading-serif text-shimmer text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            THE MIRADEEN SALE
          </motion.h1>

          {/* Discount badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-full shadow-lg shadow-red-600/30">
              <Zap className="w-5 h-5" />
              <span className="text-xl sm:text-2xl font-bold tracking-wide">Up to 50% Off</span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-white/70 text-base sm:text-lg max-w-xl tracking-wide mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Limited Time Offers on Premium Fashion
          </motion.p>

          {/* Countdown */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-gold/60 text-xs tracking-[0.25em] uppercase mb-3">Sale ends in</p>
            <CountdownDisplay
              hours={saleCountdown.hours}
              minutes={saleCountdown.minutes}
              seconds={saleCountdown.seconds}
              size="lg"
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <button
              onClick={() => navigate('shop')}
              className="btn-luxury bg-gold text-black px-10 py-3.5 rounded-full text-sm font-semibold hover:bg-gold-light transition-colors duration-500 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop the Sale
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => document.getElementById('sale-categories')?.scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-white/40 text-xs tracking-[0.2em] uppercase">Explore</span>
            <ChevronDown className="w-5 h-5 text-gold animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — Sale Categories
      ═══════════════════════════════════════════════════════════════ */}
      <section id="sale-categories" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Categories" title="Shop by" highlight="Category" description="Explore curated collections across every department at exceptional prices." />
          </AnimatedSection>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {saleCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={scaleIn}
                custom={i}
                className="group relative h-72 md:h-80 rounded-xl overflow-hidden cursor-pointer card-shine"
                onClick={() => navigate('shop')}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-black/50 transition-colors duration-500 group-hover:to-black/70`} />
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold/30 transition-colors duration-500" />

                {/* Discount badge */}
                <div className="absolute top-5 right-5">
                  <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-lg shadow-red-600/30">
                    {cat.discount}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                  <h3 className="heading-serif text-white text-2xl md:text-3xl font-bold mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — Flash Deals
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-beige/40 dark:bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Limited Time" title="Flash" highlight="Deals" description="Hurry! These deals won't last long. Grab them before they're gone." />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashDeals.map((deal, i) => (
              <FlashDealCard key={deal.name} deal={deal} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — Sale Products Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Best Prices" title="All Products" highlight="On Sale" description="Handpicked pieces at unbeatable prices. Quality meets value." />
          </AnimatedSection>

          {/* Sort dropdown */}
          <div className="flex justify-end mb-8">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] border-gold/20 focus:border-gold/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {sortedProducts.map((product, i) => {
                const images = parseJsonField<string>(product.images);
                const imageUrl = images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
                return (
                  <motion.div
                    key={product.id}
                    variants={fadeUp}
                    custom={i}
                    className="card-luxury rounded-xl border border-gold/10 bg-card overflow-hidden hover:border-gold/30 transition-all duration-500 group hover-lift-sm"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                      onClick={() => navigate('product', product.id)}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                      {/* SALE badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-600 text-white border-0 font-bold text-[10px] tracking-wider px-2 py-0.5">
                          SALE
                        </Badge>
                      </div>

                      {/* Discount badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gold text-black border-0 font-bold text-[10px] tracking-wider px-2 py-0.5">
                          -{product.saleDiscount}%
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4">
                      <h3
                        className="font-medium text-sm mb-2 line-clamp-1 cursor-pointer hover:text-gold transition-colors duration-300"
                        onClick={() => navigate('product', product.id)}
                      >
                        {product.name}
                      </h3>

                      {/* Prices */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base font-bold">₹{product.salePrice.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                      </div>

                      {/* Add to cart */}
                      <Button
                        size="sm"
                        className="w-full bg-foreground text-background hover:bg-gold hover:text-black rounded-lg text-xs font-medium transition-colors duration-300"
                        onClick={() => handleAddToCart(product, product.salePrice)}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — Coupon Banner
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-luxury-gradient text-white relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gold/5 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Extra Savings" title="Exclusive Sale" highlight="Coupons" />
          </AnimatedSection>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {coupons.map((coupon, i) => (
              <CouponCard key={coupon.code} coupon={coupon} index={i} onCopy={handleCopyCoupon} />
            ))}
          </motion.div>

          {/* Terms */}
          <AnimatedSection className="text-center mt-10" delay={0.5}>
            <p className="text-white/30 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Terms &amp; Conditions apply. Coupons cannot be combined.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — Deal of the Day
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Don't Miss" title="Deal of the" highlight="Day" />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="card-luxury rounded-2xl border border-gold/20 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left — Image */}
              <div className="relative h-72 md:h-auto min-h-[400px] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:bg-gradient-to-l md:to-black/20" />

                {/* Ribbon */}
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    DEAL OF THE DAY
                  </div>
                </div>
              </div>

              {/* Right — Details */}
              <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-card to-background">
                <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-medium tracking-wider mb-4 self-start">
                  <Sparkles className="w-3 h-3" />
                  PREMIUM SELECTION
                </div>

                <h3 className="heading-serif text-2xl md:text-3xl font-bold mb-3">
                  Handcrafted Italian Silk Blazer
                </h3>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'text-gold fill-gold' : 'text-gold/30'}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.0 · 128 reviews)</span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Exquisitely tailored from the finest Italian silk, this blazer features a modern slim fit with hand-stitched lapels. A timeless piece for the discerning wardrobe.
                </p>

                {/* Prices */}
                <div className="mb-2">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-red-600">₹15,999</span>
                    <span className="text-lg text-muted-foreground line-through mb-0.5">₹24,999</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs font-semibold">
                      You save ₹9,000
                    </Badge>
                    <span className="text-xs text-muted-foreground">(36% off)</span>
                  </div>
                </div>

                {/* Stock urgency */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-full ${i < 2 ? 'bg-red-500' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-red-500 font-medium">
                    Only <strong>3 left</strong> in stock
                  </span>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-2 mb-8">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-xs text-muted-foreground tracking-wider uppercase mr-2">Ends in</span>
                  <DealCountdown />
                </div>

                {/* CTA */}
                <Button
                  className="bg-gold text-black hover:bg-gold-light rounded-lg font-semibold transition-colors duration-300 h-12 text-sm"
                  onClick={() => toast({ title: 'Added to cart!', description: 'Handcrafted Italian Silk Blazer has been added.' })}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — Sale Benefits
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-beige/40 dark:bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader label="Why Buy" title="Sale" highlight="Benefits" description="Every sale purchase comes with our full luxury service promise." />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {saleBenefits.map((benefit, i) => {
              const IconComp = benefit.icon;
              return (
                <AnimatedSection key={benefit.title} delay={i * 0.12}>
                  <div className="card-luxury rounded-xl border border-gold/10 bg-card p-6 md:p-8 text-center h-full hover:border-gold/30 transition-colors duration-500">
                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                      <IconComp className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="heading-serif text-lg font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════
function FlashDealCard({ deal, index }: { deal: typeof flashDeals[number]; index: number }) {
  const { toast } = useToast();
  const dealEnd = useRef(new Date(Date.now() + deal.hoursFromNow * 60 * 60 * 1000));
  const countdown = useCountdown(dealEnd.current);

  return (
    <AnimatedSection delay={index * 0.12}>
      <div className="card-luxury relative rounded-xl border border-gold/15 bg-card overflow-hidden hover:border-gold/40 transition-all duration-500 group">
        {/* HOT badge on first deal */}
        {index === 0 && (
          <motion.div
            className="absolute top-4 left-4 z-20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Badge className="bg-red-600 text-white border-0 px-3 py-1 text-xs font-bold tracking-wider shadow-lg shadow-red-600/40 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              HOT
            </Badge>
          </motion.div>
        )}

        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${deal.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-4 right-4">
            <div className="bg-gold text-black px-2.5 py-1 rounded-full text-xs font-bold">
              -{deal.discount}%
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="heading-serif text-lg font-bold mb-2 line-clamp-1">{deal.name}</h3>

          {/* Prices */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-red-600">₹{deal.salePrice.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground line-through">₹{deal.originalPrice.toLocaleString()}</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
              Save ₹{(deal.originalPrice - deal.salePrice).toLocaleString()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{deal.claimed}% claimed</span>
              <span className="text-red-500 font-medium">Selling fast</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${deal.claimed}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-3.5 h-3.5 text-gold mr-2" />
            <CountdownDisplay hours={countdown.hours} minutes={countdown.minutes} seconds={countdown.seconds} size="sm" />
          </div>

          {/* CTA */}
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
            onClick={() => {
              toast({ title: 'Deal added!', description: `${deal.name} has been added to your cart.` });
            }}
          >
            <Zap className="w-4 h-4" />
            Grab Deal
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}

function CouponCard({ coupon, index, onCopy }: { coupon: typeof coupons[number]; index: number; onCopy: (code: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      className="glass-card rounded-xl border border-gold/20 p-6 text-center relative overflow-hidden group hover:border-gold/40 transition-colors duration-500"
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/30 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/30 rounded-br-xl" />

      <Tag className="w-6 h-6 text-gold mx-auto mb-4" />

      {/* Discount */}
      <p className="text-2xl font-bold text-gold-gradient mb-1">{coupon.discount}</p>
      <p className="text-white/40 text-xs tracking-[0.15em] uppercase mb-4">{coupon.description}</p>

      {/* Coupon code */}
      <div className="bg-black/30 border border-dashed border-gold/30 rounded-lg px-4 py-3 mb-4">
        <span className="font-mono text-gold text-sm tracking-[0.2em]">{coupon.code}</span>
      </div>

      {/* Min order */}
      <p className="text-white/40 text-xs mb-4">Min. order {coupon.minOrder}</p>

      {/* Copy button */}
      <Button
        size="sm"
        variant="outline"
        className="w-full border-gold/30 text-gold hover:bg-gold hover:text-black rounded-lg text-xs font-medium transition-all duration-300"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy Code'}
      </Button>
    </motion.div>
  );
}

function DealCountdown() {
  const targetRef = useRef(new Date(Date.now() + 8 * 60 * 60 * 1000));
  const { hours, minutes, seconds } = useCountdown(targetRef.current);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: hours, label: 'h' },
        { val: minutes, label: 'm' },
        { val: seconds, label: 's' },
      ].map((unit, idx) => (
        <React.Fragment key={unit.label}>
          {idx > 0 && <span className="text-muted-foreground">:</span>}
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold tabular-nums">{pad(unit.val)}</span>
            <span className="text-[10px] text-muted-foreground">{unit.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
