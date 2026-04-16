'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Sparkles,
  Crown,
  Heart,
  Gem,
  Shirt,
  Briefcase,
  Umbrella,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from '@/types';
import type { Product } from '@/types';

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED ANIMATED SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function useScrollOnView(ref: React.RefObject<HTMLDivElement | null>) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useScrollOnView(ref);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GOLD DIAMOND DECORATION
   ═══════════════════════════════════════════════════════════════════════ */

function GoldDiamond({ className = '' }: { className?: string }) {
  return (
    <div className={`w-3 h-3 bg-gold rotate-45 flex-shrink-0 ${className}`} />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA — SEASONAL COLLECTIONS
   ═══════════════════════════════════════════════════════════════════════ */

const seasonalCollections = [
  {
    id: 1,
    name: 'Summer 2024',
    pieces: 24,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop',
    description: 'Sun-drenched silhouettes in linen and silk',
  },
  {
    id: 2,
    name: 'Autumn Essentials',
    pieces: 32,
    image:
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop',
    description: 'Warm tones and layered textures',
  },
  {
    id: 3,
    name: 'Winter Luxe',
    pieces: 28,
    image:
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&h=1000&fit=crop',
    description: 'Cashmere, velvet, and deep jewel tones',
  },
  {
    id: 4,
    name: 'Spring Bloom',
    pieces: 20,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
    description: 'Floral-inspired pieces with fluid forms',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   DATA — FEATURED COLLECTION SPOTLIGHT
   ═══════════════════════════════════════════════════════════════════════ */

const keyPieces = [
  'Silk Charmeuse Draped Gown — ₹18,500',
  'Cashmere-Wool Tailored Blazer — ₹12,900',
  'Hand-Embroidered Clutch — ₹6,800',
  'Italian Leather Ankle Boots — ₹14,200',
];

/* ═══════════════════════════════════════════════════════════════════════
   DATA — COLLECTION CATEGORIES
   ═══════════════════════════════════════════════════════════════════════ */

const categories: {
  name: string;
  description: string;
  pieces: number;
  icon: LucideIcon;
}[] = [
  {
    name: 'Bridal',
    description: 'Exquisite bridal wear for your most magical day',
    pieces: 18,
    icon: Gem,
  },
  {
    name: 'Evening Wear',
    description: 'Show-stopping pieces for unforgettable nights',
    pieces: 24,
    icon: Crown,
  },
  {
    name: 'Casual Luxury',
    description: 'Effortlessly refined everyday essentials',
    pieces: 36,
    icon: Shirt,
  },
  {
    name: 'Office Chic',
    description: 'Command attention in the boardroom',
    pieces: 22,
    icon: Briefcase,
  },
  {
    name: 'Resort Wear',
    description: 'Vacation-ready looks with effortless elegance',
    pieces: 16,
    icon: Umbrella,
  },
  {
    name: 'Street Style',
    description: 'Bold, contemporary, and unapologetically chic',
    pieces: 30,
    icon: Flame,
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   DATA — EDITORIAL LOOKBOOK CAROUSEL
   ═══════════════════════════════════════════════════════════════════════ */

const editorialSlides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=900&fit=crop',
    collection: 'The Noir Edit',
    description:
      'A celebration of monochromatic elegance — structured silhouettes in midnight black and charcoal.',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&h=900&fit=crop',
    collection: 'Golden Hour',
    description:
      'Pieces bathed in warm amber and champagne tones, inspired by the magic of twilight.',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=900&fit=crop',
    collection: 'Avant-Garde',
    description:
      'Pushing boundaries with asymmetric cuts, fluid draping, and artistic expression.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCT CARD WITH RATING
   ═══════════════════════════════════════════════════════════════════════ */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating)
              ? 'fill-gold text-gold'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart } = useStore();
  const { toast } = useToast();
  const images = parseJsonField<string[]>(product.images);
  const productImage = images[0] || '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div
      variants={scaleIn}
      className="group relative"
    >
      <div className="card-luxury glass-card rounded-xl overflow-hidden border border-border hover:border-gold/30 transition-all duration-500">
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] overflow-hidden cursor-pointer"
          onClick={() => navigate('product', product.id)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${productImage})` }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />

          {/* Quick Actions Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-gold text-background hover:bg-gold-dark tracking-[0.12em] uppercase text-[10px] font-semibold px-5 btn-luxury"
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>

          {/* Badges */}
          {(product.isNewArrival || product.isBestseller) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNewArrival && (
                <Badge className="bg-gold/90 text-background text-[9px] tracking-wider uppercase">
                  New
                </Badge>
              )}
              {product.isBestseller && (
                <Badge className="bg-background/90 text-foreground text-[9px] tracking-wider uppercase backdrop-blur-sm">
                  Bestseller
                </Badge>
              )}
            </div>
          )}

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-background"
            onClick={(e) => {
              e.stopPropagation();
              useStore.getState().toggleWishlist(product.id);
              toast({
                title: 'Wishlist Updated',
                description: `${product.name} ${useStore.getState().isInWishlist(product.id) ? 'added to' : 'removed from'} wishlist.`,
              });
            }}
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h4
            className="text-sm font-medium line-clamp-1 cursor-pointer hover:text-gold transition-colors duration-300"
            onClick={() => navigate('product', product.id)}
          >
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-gold font-semibold text-sm">
              ₹{product.price.toLocaleString()}
            </span>
            {product.comparePrice && (
              <span className="text-muted-foreground line-through text-xs">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <RatingStars rating={product.rating} />
            <span className="text-muted-foreground text-[10px]">
              ({product.reviewCount})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SKELETON LOADING GRID
   ═══════════════════════════════════════════════════════════════════════ */

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card-luxury rounded-xl overflow-hidden border border-border">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COLLECTIONS PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function CollectionsPage() {
  const navigate = useStore((s) => s.navigate);

  /* ─── Hero Parallax ─── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* ─── Trending Products State ─── */
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?sort=popular&limit=8')
      .then((r) => r.json())
      .then((data) => {
        setTrendingProducts(data.products ?? data ?? []);
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  /* ─── Carousel State ─── */
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % editorialSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + editorialSlides.length) % editorialSlides.length,
    );
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    carouselTimerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [nextSlide]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background Image */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=1080&fit=crop)',
            }}
          />
        </motion.div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        {/* Animated Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          {/* Gold Diamond Decorations */}
          <motion.div
            className="flex items-center justify-center gap-5 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <GoldDiamond />
            <Gem className="h-5 w-5 text-gold" />
            <GoldDiamond />
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xs md:text-sm tracking-[0.4em] uppercase mb-4 text-gold-light"
          >
            MIRADEEN
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="heading-serif text-shimmer text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            COLLECTIONS
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-base md:text-lg tracking-[0.15em] font-light text-white/80 max-w-xl mx-auto"
          >
            Curated for the Discerning
          </motion.p>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">
            Scroll to Explore
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-1 h-2 rounded-full bg-gold"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — SEASONAL COLLECTIONS GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Explore by Season
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Seasonal <span className="text-gold-gradient">Collections</span>
            </h2>
            <div className="divider-gold w-20 mx-auto mt-4 mb-3" />
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Each collection tells a story — discover the season that speaks to your
              style.
            </p>
          </AnimatedSection>

          {/* 2x2 Grid on Desktop, 1 col on Mobile */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {seasonalCollections.map((collection, i) => (
              <motion.div
                key={collection.id}
                variants={fadeUp}
                custom={i}
                className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-xl cursor-pointer card-shine"
                onClick={() => navigate('shop')}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${collection.image})` }}
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/60" />

                {/* Gold Accent Border on Hover */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold/40 transition-colors duration-500 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                  <div>
                    <p className="text-gold text-xs tracking-[0.2em] uppercase mb-1.5 font-medium">
                      {collection.pieces} Pieces
                    </p>
                    <h3 className="heading-serif text-white text-2xl md:text-3xl font-bold mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-5 max-w-xs">
                      {collection.description}
                    </p>

                    {/* Hover Button */}
                    <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                      <Button
                        size="sm"
                        className="bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-[10px] font-semibold px-5 btn-luxury"
                      >
                        Explore Collection
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — FEATURED COLLECTION SPOTLIGHT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-charcoal overflow-hidden">
        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gold accent lines top/bottom */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Side — Editorial Image with Gold Frame */}
            <AnimatedSection delay={0.1}>
              <div className="relative group">
                {/* Gold frame border */}
                <div className="relative p-2 md:p-3">
                  <div className="absolute inset-0 border border-gold/30 rounded-lg" />
                  <div className="absolute -inset-1 border border-gold/10 rounded-lg" />

                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=1100&fit=crop)',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold translate-x-1 translate-y-1" />
              </div>
            </AnimatedSection>

            {/* Right Side — Collection Info */}
            <AnimatedSection delay={0.3}>
              <div className="space-y-6">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-gold" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold-light font-medium">
                    Featured Collection
                  </span>
                </div>

                {/* Heading */}
                <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight">
                  The Capsule
                  <br />
                  <span className="text-gold-gradient">Collection</span>
                </h2>

                {/* Gold line */}
                <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />

                {/* Description */}
                <p className="text-white/65 text-sm md:text-base leading-relaxed">
                  Introducing MAISON MIRADEEN&apos;s latest capsule — a tightly curated
                  selection of 12 essential pieces that form the foundation of a
                  modern luxury wardrobe. Each garment is crafted from the finest
                  materials sourced from Italy, Japan, and India, designed to
                  transcend seasons and trends.
                </p>

                {/* Key Pieces */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4">
                    Key Pieces
                  </h4>
                  {keyPieces.map((piece, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 group/piece cursor-pointer"
                      onClick={() => navigate('shop')}
                    >
                      <div className="w-1.5 h-1.5 bg-gold/60 rotate-45 mt-1.5 flex-shrink-0 group-hover/piece:bg-gold transition-colors duration-300" />
                      <span className="text-white/75 text-sm group-hover/piece:text-gold transition-colors duration-300">
                        {piece}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => navigate('shop')}
                    className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('lookbook')}
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-8 py-3 tracking-[0.15em] uppercase text-xs transition-all duration-300"
                  >
                    View Lookbook
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — COLLECTION CATEGORIES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-beige/30 dark:bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Browse by Category
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Collection <span className="text-gold-gradient">Categories</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              From bridal couture to everyday luxury — find your perfect
              collection.
            </p>
          </AnimatedSection>

          {/* Categories Grid — Horizontal scroll on mobile, 3-col on desktop */}
          <motion.div
            className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory custom-scrollbar"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  variants={fadeUp}
                  custom={i}
                  className="snap-start flex-shrink-0 w-[280px] md:w-auto"
                >
                  <div className="card-luxury group relative rounded-xl border border-border bg-background p-6 md:p-8 h-full hover:border-gold/40 transition-all duration-500 hover-lift-sm cursor-pointer"
                    onClick={() => navigate('shop')}
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors duration-500">
                      <IconComp className="w-5 h-5 text-gold" />
                    </div>

                    {/* Name */}
                    <h3 className="heading-serif text-lg md:text-xl font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                      {cat.name}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {cat.description}
                    </p>

                    {/* Piece count & gold underline */}
                    <div className="flex items-center justify-between">
                      <span className="text-gold text-xs tracking-[0.15em] uppercase font-medium">
                        {cat.pieces} Pieces
                      </span>
                      <div className="h-px flex-1 ml-4 bg-transparent group-hover:bg-gradient-to-r group-hover:from-gold/40 group-hover:to-transparent transition-all duration-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — TRENDING PICKS FROM COLLECTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <span className="separator-diamond mb-4 inline-flex items-center gap-2">
                <span className="diamond" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                  Most Loved
                </span>
                <span className="diamond" />
              </span>
              <h2 className="heading-serif text-3xl md:text-4xl font-bold mt-4">
                Trending <span className="text-gold-gradient">Picks</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                The pieces everyone is adding to their wishlist right now.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('shop')}
              className="border-border hover:border-gold hover:text-gold tracking-[0.15em] uppercase text-[10px] transition-all duration-300 btn-luxury self-start md:self-auto"
            >
              View All
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </AnimatedSection>

          {/* Products Grid */}
          {productsLoading ? (
            <ProductSkeletonGrid />
          ) : trendingProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {trendingProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <AnimatedSection>
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  No trending products found at the moment.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('shop')}
                  className="mt-4 border-gold/30 text-gold hover:bg-gold hover:text-background tracking-[0.15em] uppercase text-[10px] transition-all duration-300"
                >
                  Browse All Products
                </Button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — EDITORIAL LOOKBOOK CAROUSEL
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-charcoal overflow-hidden relative">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Visual Stories
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4 text-white">
              Editorial <span className="text-gold-gradient">Lookbook</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-md mx-auto">
              Immerse yourself in the visual narrative of our latest collections.
            </p>
          </AnimatedSection>

          {/* Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden"
              >
                {/* Slide Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${editorialSlides[currentSlide].image})`,
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Slide Content */}
                <div className="absolute inset-0 flex items-end md:items-center p-6 md:p-12">
                  <div className="max-w-lg">
                    <Badge className="bg-gold/90 text-background text-[10px] tracking-wider uppercase mb-3">
                      {editorialSlides[currentSlide].collection}
                    </Badge>
                    <h3 className="heading-serif text-white text-2xl md:text-4xl font-bold mb-3">
                      {editorialSlides[currentSlide].collection}
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
                      {editorialSlides[currentSlide].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:border-gold hover:bg-gold/20 transition-all duration-300 z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:border-gold hover:bg-gold/20 transition-all duration-300 z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2.5 mt-8">
            {editorialSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i
                    ? 'bg-gold w-8'
                    : 'bg-white/20 hover:bg-white/40 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — CTA: JOIN THE INNER CIRCLE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-luxury-gradient">
        {/* Decorative particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-gold/20 particle" />
          <div
            className="absolute top-1/2 left-[30%] w-1.5 h-1.5 rounded-full bg-gold/15 particle"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/3 right-[20%] w-2.5 h-2.5 rounded-full bg-gold/10 particle"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-1/4 right-[15%] w-1 h-1 rounded-full bg-gold/25 particle"
            style={{ animationDelay: '3s' }}
          />
        </div>

        {/* Decorative corners */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-gold/20 hidden md:block" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-gold/20 hidden md:block" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-gold/20 hidden md:block" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-gold/20 hidden md:block" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <GoldDiamond className="opacity-60" />
              <div className="w-16 h-px bg-gold/40" />
              <Sparkles className="h-5 w-5 text-gold" />
              <div className="w-16 h-px bg-gold/40" />
              <GoldDiamond className="opacity-60" />
            </div>

            <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-4">
              Exclusive Access
            </p>

            <h2 className="heading-serif text-shimmer text-3xl md:text-5xl font-bold text-white mb-6">
              Join the MIRADEEN
              <br />
              Inner Circle
            </h2>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-32 mx-auto mb-6" />

            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10">
              Be the first to explore new collections, receive exclusive style
              advice, and enjoy members-only access to limited-edition pieces.
              Elevate your wardrobe with privileges reserved for the discerning
              few.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('shop')}
                className="bg-gold text-background hover:bg-gold-dark px-10 py-3.5 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
              >
                Shop Collections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('style-quiz')}
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-10 py-3.5 tracking-[0.15em] uppercase text-xs transition-all duration-300"
              >
                Get Style Advice
              </Button>
            </div>

            {/* Subtle gold divider at bottom */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-gold/20" />
              <GoldDiamond className="opacity-40 w-2 h-2" />
              <div className="w-12 h-px bg-gold/20" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
