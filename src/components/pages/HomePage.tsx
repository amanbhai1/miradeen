'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Star, Heart, ShoppingBag, ArrowRight,
  Truck, Shield, RefreshCw, Headphones, Instagram, Sparkles,
  Eye, GitCompareArrows, MessageCircle, Clock, Scissors, Leaf, Landmark, Gift,
  Gem, RotateCcw, Crown, TrendingUp, ChevronLeft, ChevronRight,
  Quote, ExternalLink, Camera, CheckCircle, Package, Handshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';
import ProductCard from '@/components/shared/ProductCard';

/* ─── Animated Section Wrapper ──────────────────────────────────────── */

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── useCountUp Hook ──────────────────────────────────────────────── */

function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || isInView) {
      if (hasStarted.current) return;
      hasStarted.current = true;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, target, duration, startOnView]);

  return { count, ref };
}

/* ─── Countdown Timer Hook ──────────────────────────────────────────── */

function getInitialCountdown() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getInitialCountdown);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getInitialCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

/* ─── Parallax Image Component ──────────────────────────────────────── */

function ParallaxImage({ src, alt, speed = 0.3 }: { src: string; alt: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y, scale: 1.1 }}
      />
    </div>
  );
}

/* ─── Fade-In Stat Display ─────────────────────────────────────────── */

function FadeInStat({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="heading-serif text-2xl md:text-3xl font-bold text-gold"
    >
      {value}{suffix}
    </motion.span>
  );
}

/* ─── Countdown Digit ───────────────────────────────────────────────── */

function CountdownDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-foreground text-background flex items-center justify-center">
        <span className="heading-serif text-2xl md:text-3xl font-bold tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] tracking-wider uppercase text-muted-foreground mt-1.5">{label}</span>
    </div>
  );
}

/* ─── Instagram Grid Item ───────────────────────────────────────────── */

function InstagramGridItem({ src, index }: { src: string; index: number }) {
  return (
    <AnimatedSection delay={index * 0.05}>
      <div className="group relative aspect-square overflow-hidden cursor-pointer">
        <img
          src={src}
          alt={`Instagram ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Instagram-style hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white">
              <Heart className="h-5 w-5 fill-white" />
              <span className="text-sm font-semibold">1.2K</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <MessageCircle className="h-5 w-5 fill-white" />
              <span className="text-sm font-semibold">48</span>
            </div>
          </div>
          <Instagram className="h-4 w-4 text-white/70 mt-1" />
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   HOME PAGE
   ═════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { navigate, addToCart, loyaltyPoints, getLoyaltyTier, getLoyaltyProgress, redeemableRewards } = useStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialHovered, setTestimonialHovered] = useState(false);
  const trendingRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  const timeLeft = useCountdown();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products?sort=latest&limit=4')
      .then(res => res.json())
      .then(data => setNewArrivals(data.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products?sort=popular&limit=4')
      .then(res => res.json())
      .then(data => setTrendingProducts(data.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (testimonialHovered) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialHovered]);

  const categories = [
    { name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop' },
    { name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', role: 'Fashion Blogger', rating: 5, verified: true, text: 'The quality is beyond anything I\'ve experienced. MIRADEEN has set a new standard for luxury fashion in India. Every piece feels like it was made just for me.' },
    { name: 'Arjun Mehta', location: 'Delhi', role: 'Creative Director', rating: 5, verified: true, text: 'From the packaging to the fabric quality, everything screams premium. The Sovereign Blazer is now my go-to for every important occasion.' },
    { name: 'Ananya Patel', location: 'Bangalore', role: 'Interior Designer', rating: 5, verified: false, text: 'I\'ve been a loyal customer for over a year. The craftsmanship is consistently exceptional. MIRADEEN truly redefines luxury fashion.' },
    { name: 'Vikram Rao', location: 'Chennai', role: 'Entrepreneur', rating: 5, verified: true, text: 'The attention to detail is impeccable. From stitching to fabric choice, every element reflects true luxury. MIRADEEN is my wardrobe staple now.' },
    { name: 'Meera Kapoor', location: 'Hyderabad', role: 'Style Consultant', rating: 5, verified: false, text: 'I recommend MIRADEEN to all my clients. The timeless designs and premium quality make every outfit feel effortlessly elegant.' },
    { name: 'Rohan Desai', location: 'Pune', role: 'Photographer', rating: 5, verified: true, text: 'As someone who works in fashion, I appreciate the thought behind each collection. MIRADEEN delivers sophistication with every piece.' },
  ];

  const instagramImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  ];

  const tierColors: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#C9A96E',
    Platinum: '#E5E4E2',
  };

  const tierEmojis: Record<string, string> = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
  };

  const loyaltyTier = getLoyaltyTier();
  const loyaltyProgress = getLoyaltyProgress();
  const nextTier = loyaltyTier === 'Bronze' ? 'Silver' : loyaltyTier === 'Silver' ? 'Gold' : loyaltyTier === 'Gold' ? 'Platinum' : null;

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹2,000' },
    { icon: Shield, title: 'Secure Payment', desc: 'PayPal & SSL secured' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'WhatsApp & email' },
  ];

  const brandValues = [
    {
      icon: Scissors,
      title: 'Craftsmanship',
      description: 'Every stitch tells a story of dedication and mastery',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to ethical sourcing and responsible luxury',
    },
    {
      icon: Landmark,
      title: 'Heritage',
      description: 'Blending traditional Indian artistry with modern design',
    },
  ];

  // Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 180 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="mx-auto mb-6"
          >
            <div className="w-8 h-8 border border-gold/40 rotate-45 mx-auto" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="heading-serif text-5xl md:text-7xl font-bold tracking-[0.3em] mb-4 text-gold-gradient"
          >
            MIRADEEN
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 160 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs tracking-[0.4em] uppercase text-muted-foreground mt-4"
          >
            Redefining Luxury Fashion
          </motion.p>
          <motion.div className="mt-8 w-32 h-0.5 bg-muted rounded-full mx-auto overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, delay: 1.4, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920"
            alt="Luxury Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-xs md:text-sm tracking-[0.4em] uppercase mb-4 text-gold-light">
              New Collection 2024
            </p>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="heading-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            MIRADEEN
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="h-px bg-gold mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl tracking-[0.15em] mb-10 font-light"
          >
            Redefining Luxury Fashion
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('shop')}
              className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate('about')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold"
            >
              Our Story
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-12 bg-white/40 mx-auto"
          />
        </motion.div>
      </section>

      {/* ═══ Features Bar ═══ */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.1}>
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Explore</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Collections</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <AnimatedSection key={cat.name} delay={i * 0.15}>
                <button
                  onClick={() => navigate('shop')}
                  className="group relative aspect-[3/4] w-full overflow-hidden block"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <p className="text-xs tracking-[0.3em] uppercase mb-2">Collection</p>
                    <h3 className="heading-serif text-3xl font-bold mb-4">{cat.name}</h3>
                    <span className="flex items-center gap-2 text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Shop Now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why MIRADEEN ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Our Promise</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3 text-gold-gradient">Why MIRADEEN</h2>
            <p className="text-sm text-muted-foreground">An unparalleled luxury shopping experience</p>
            <div className="divider-gold w-20 mx-auto mt-4" />
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[
              { icon: Gem, title: 'Premium Quality', desc: 'Handcrafted with the finest materials sourced from around the world' },
              { icon: Truck, title: 'Free Shipping', desc: 'Complimentary delivery on all orders over ₹2,000' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free returns with free return shipping' },
              { icon: Shield, title: 'Secure Payment', desc: 'Multiple payment options with 100% secure encryption' },
              { icon: Sparkles, title: 'Expert Styling', desc: 'Personal style consultations with our fashion experts' },
              { icon: Crown, title: 'Exclusive Access', desc: 'Early access to new collections and member-only events' },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.08}>
                <div className="card-luxury text-center p-5 md:p-6 h-full group cursor-default">
                  <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-4 group-hover:border-gold group-hover:bg-gold/10 transition-all duration-300">
                    <feature.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-xs font-semibold tracking-wider uppercase mb-2">{feature.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ As Seen In ═══ */}
      <section className="py-12 border-y border-border overflow-hidden">
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <AnimatedSection className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Featured In</p>
            <h2 className="heading-serif text-xl md:text-2xl font-bold">As Featured In</h2>
          </AnimatedSection>

          <div className="flex animate-marquee whitespace-nowrap">
            {['VOGUE', "Harper's BAZAAR", 'ELLE', 'GQ', 'ESQUIRE', "L'OFFICIEL", 'VOGUE', "Harper's BAZAAR", 'ELLE', 'GQ', 'ESQUIRE', "L'OFFICIEL"].map((brand, i) => (
              <span key={i} className="mx-10 md:mx-16 text-muted-foreground/60 text-sm md:text-base tracking-[0.3em] uppercase font-light shrink-0">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ New Arrivals Section ═══ */}
      <section className="py-20 bg-cream dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Just Dropped</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">New Arrivals</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          {newArrivals.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product, i) => (
                <AnimatedSection key={product.id} delay={i * 0.08}>
                  <ProductCard product={product} />
                </AnimatedSection>
              ))}
            </div>
          )}

          <AnimatedSection className="text-center mt-10" delay={0.4}>
            <Button
              onClick={() => navigate('shop')}
              variant="outline"
              className="border-foreground hover:bg-foreground hover:text-background tracking-[0.15em] uppercase text-xs px-8 py-3 transition-all duration-300"
            >
              View All New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Trending Now ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-gold mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs tracking-[0.3em] uppercase">Popular Right Now</p>
            </div>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Trending Now</h2>
            <p className="text-sm text-muted-foreground">What everyone's loving this season</p>
            <div className="divider-gold w-20 mx-auto mt-4" />
          </AnimatedSection>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="relative">
            <div ref={trendingRef} className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0">
              {trendingProducts.length === 0 ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3 min-w-[260px] lg:min-w-0 shrink-0 snap-start">
                      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </>
              ) : (
                trendingProducts.map((product, i) => (
                    <AnimatedSection key={product.id} delay={i * 0.1}>
                      <ProductCard product={product} variant="horizontal" />
                    </AnimatedSection>
                  ))
              )}
              {/* View All card */}
              <AnimatedSection delay={0.4}>
                <div className="min-w-[200px] lg:min-w-0 shrink-0 snap-start flex items-center justify-center">
                  <Button
                    onClick={() => navigate('shop')}
                    variant="outline"
                    className="border-foreground hover:bg-foreground hover:text-background tracking-[0.15em] uppercase text-xs px-6 py-3 transition-all duration-300 w-full"
                  >
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Featured Products ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Handpicked</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Curated For You</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          {products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((product, i) => (
                <AnimatedSection key={product.id} delay={i * 0.08}>
                  <ProductCard product={product} />
                </AnimatedSection>
              ))}
            </div>
          )}

          <AnimatedSection className="text-center mt-12" delay={0.4}>
            <Button
              onClick={() => navigate('shop')}
              variant="outline"
              className="border-foreground hover:bg-foreground hover:text-background tracking-[0.15em] uppercase text-xs px-8 py-3 transition-all duration-300"
            >
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Parallax Banner (Enhanced with Parallax Scroll) ═══ */}
      <section className="relative py-32 overflow-hidden">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920"
          alt="Luxury"
          speed={0.3}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <AnimatedSection>
            <Sparkles className="h-8 w-8 text-gold mx-auto mb-6" />
            <p className="text-xs tracking-[0.4em] uppercase text-gold-light mb-4">The Art of Luxury</p>
            <h2 className="heading-serif text-4xl md:text-5xl font-bold mb-6">
              Where Craftsmanship<br />Meets Artistry
            </h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Each piece in our collection is a testament to the art of luxury fashion — handcrafted with the finest materials and an unwavering commitment to excellence.
            </p>
            <Button
              onClick={() => navigate('shop')}
              className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
            >
              Discover More
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Brand Values Section ═══ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Our Promise</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Brand Values</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brandValues.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.15}>
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 transition-colors duration-300">
                    <value.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="heading-serif text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Style Quiz CTA ═══ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="card-luxury grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
              {/* Left - Image */}
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=500&fit=crop"
                  alt="Discover Your Style"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 md:bg-gradient-to-l md:from-transparent md:to-background/20" />
              </div>
              {/* Right - Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-5 w-fit">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-gold text-xs tracking-[0.15em] uppercase font-medium">Personalized</span>
                </div>
                <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-4">
                  Discover Your <span className="text-gold">Style</span>
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Take our curated style quiz and let us help you find the perfect pieces that match your personality. Answer a few simple questions and receive personalized recommendations crafted just for you.
                </p>
                <div>
                  <Button
                    onClick={() => navigate('style-quiz')}
                    className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                  >
                    Take the Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-20 bg-cream dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Testimonials</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">What Our Clients Say</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div
            className="max-w-2xl mx-auto relative"
            onMouseEnter={() => setTestimonialHovered(true)}
            onMouseLeave={() => setTestimonialHovered(false)}
          >
            {/* Navigation Arrows (desktop only) */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 z-10 hidden md:flex w-10 h-10 rounded-full bg-background/60 dark:bg-card/60 backdrop-blur-md border border-gold/20 hover:border-gold/60 hover:bg-gold/10 items-center justify-center transition-all duration-300 shadow-luxury-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4 text-gold" />
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 z-10 hidden md:flex w-10 h-10 rounded-full bg-background/60 dark:bg-card/60 backdrop-blur-md border border-gold/20 hover:border-gold/60 hover:bg-gold/10 items-center justify-center transition-all duration-300 shadow-luxury-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4 text-gold" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="heading-serif text-xl md:text-2xl leading-relaxed mb-6 italic">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </p>
                <p className="font-semibold text-sm">{testimonials[currentTestimonial].name}</p>
                <p className="text-xs text-muted-foreground">{testimonials[currentTestimonial].location}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentTestimonial ? 'bg-gold w-6' : 'bg-border hover:bg-gold/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Shop The Look ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Inspiration</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3 text-gold-gradient">SHOP THE LOOK</h2>
            <div className="separator-diamond w-40 mx-auto mt-4">
              <div className="diamond" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Evening Elegance',
                image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
              },
              {
                title: 'Summer Breeze',
                image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop',
              },
              {
                title: 'Classic Power',
                image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop',
              },
            ].map((look, i) => (
              <AnimatedSection key={look.title} delay={i * 0.15}>
                <button
                  onClick={() => navigate('shop')}
                  className="group relative aspect-[3/4] w-full overflow-hidden block card-luxury card-shine rounded-lg"
                >
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-white">
                    <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Collection</p>
                    <h3 className="heading-serif text-2xl font-bold mb-4">{look.title}</h3>
                    <span className="inline-flex items-center gap-2 text-xs tracking-wider uppercase bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                      Shop This Look <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Instagram Gallery (Enhanced with Hover Overlays) ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Instagram className="h-6 w-6 text-gold mx-auto mb-3" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Follow Us</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">@MIRADEEN</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            {instagramImages.map((img, i) => (
              <InstagramGridItem key={i} src={img} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Gift Guide ═══ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Curated Gifts</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Gift Guide</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'For Him', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop' },
              { title: 'For Her', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop' },
              { title: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' },
              { title: 'Gift Cards', image: null },
            ].map((gift, i) => (
              <AnimatedSection key={gift.title} delay={i * 0.1}>
                <button
                  onClick={() => navigate('shop')}
                  className="group relative aspect-square w-full overflow-hidden block rounded-lg"
                >
                  {gift.image ? (
                    <img
                      src={gift.image}
                      alt={gift.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 40%, #C9A96E 70%, #A68B4B 100%)' }}>
                      <Gift className="h-12 w-12 text-background" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-white">
                      <span className="text-xs tracking-[0.15em] uppercase font-medium">Shop Gifts</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  {/* Title bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="heading-serif text-sm md:text-base font-semibold text-white">{gift.title}</h3>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Trust Badges (Enhanced with Fade-In Stats) ═══ */}
      <section className="py-16 bg-cream dark:bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Happy Customers', sublabel: 'and counting' },
              { value: '500+', label: 'Products', sublabel: 'curated collection' },
              { value: '4.9★', label: 'Average Rating', sublabel: 'from 10K+ reviews' },
              { value: '30+', label: 'Countries', sublabel: 'worldwide delivery' },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="mb-1">
                    <FadeInStat value={stat.value} />
                  </p>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Loyalty Rewards Section ═══ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
              }}
            >
              {/* Gold accent border glow */}
              <div className="absolute inset-0 rounded-2xl border border-gold/20 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-gold text-xs tracking-[0.2em] uppercase font-medium">Loyalty Rewards</span>
                  </div>
                  <h2 className="heading-serif text-3xl md:text-4xl font-bold text-white mb-3">
                    Earn Points. <span className="text-gold">Unlock Rewards.</span>
                  </h2>
                  <p className="text-white/60 text-sm max-w-lg mx-auto">
                    Every purchase earns you loyalty points. Redeem them for exclusive discounts and free shipping.
                  </p>
                </div>

                {/* Tier & Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Current Tier Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                    <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-3">Your Tier</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">{tierEmojis[loyaltyTier]}</span>
                      <h3
                        className="heading-serif text-2xl md:text-3xl font-bold"
                        style={{ color: tierColors[loyaltyTier] }}
                      >
                        {loyaltyTier}
                      </h3>
                    </div>
                    <p className="text-gold text-sm font-medium">{loyaltyPoints} Points</p>
                  </div>

                  {/* Progress to Next Tier */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs tracking-[0.2em] uppercase text-white/50">Progress</p>
                      {nextTier && (
                        <span className="text-xs text-gold/70">Next: {nextTier}</span>
                      )}
                    </div>
                    {nextTier ? (
                      <>
                        <p className="text-white text-sm mb-3">
                          <span className="font-semibold text-gold">{loyaltyProgress.current}</span>
                          <span className="text-white/40"> / {loyaltyProgress.target} points</span>
                        </p>
                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${loyaltyProgress.percentage}%`,
                              background: `linear-gradient(90deg, ${tierColors[loyaltyTier]}, ${tierColors[nextTier]})`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-white/30 mt-1.5">{loyaltyProgress.percentage}% to next tier</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <p className="text-white text-sm">Maximum tier achieved!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Rewards */}
                <div className="mb-8">
                  <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4 text-center">Available Rewards</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {redeemableRewards.filter((r) => r.isActive).map((reward) => {
                      const canRedeem = loyaltyPoints >= reward.pointsRequired;
                      return (
                        <div
                          key={reward.id}
                          className={`relative bg-white/5 border rounded-xl p-4 text-center transition-all duration-300 ${
                            canRedeem
                              ? 'border-gold/30 hover:border-gold/60 hover:bg-gold/5'
                              : 'border-white/10 opacity-60'
                          }`}
                        >
                          <h4 className="text-white font-semibold text-sm mb-1">{reward.title}</h4>
                          <p className="text-white/40 text-[10px] mb-3">{reward.description}</p>
                          <div className="inline-flex items-center gap-1 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                            <span className="text-gold text-xs font-medium">{reward.pointsRequired} pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button
                    onClick={() => navigate('shop')}
                    className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                  >
                    {loyaltyPoints > 0 ? 'View Rewards' : 'Join Rewards'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Customer Love (Enhanced Carousel) ═══ */}
      <section className="py-20 bg-cream dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Customer Love</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">What Our Customers Say</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="max-w-4xl mx-auto relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-12 z-10 w-10 h-10 rounded-full bg-background dark:bg-card border border-border hover:border-gold hover:bg-gold/10 flex items-center justify-center transition-all duration-300 shadow-luxury-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4 text-gold" />
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-12 z-10 w-10 h-10 rounded-full bg-background dark:bg-card border border-border hover:border-gold hover:bg-gold/10 flex items-center justify-center transition-all duration-300 shadow-luxury-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4 text-gold" />
            </button>

            {/* Carousel */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="border-l-2 border-gold bg-background dark:bg-card rounded-r-lg p-6 md:p-8 shadow-luxury-sm relative overflow-hidden">
                    {/* Decorative quote mark */}
                    <div className="absolute top-3 right-4 text-gold/10 text-7xl heading-serif leading-none select-none pointer-events-none">
                      <Quote className="w-16 h-16" />
                    </div>

                    <div className="relative z-10">
                      {/* Star rating */}
                      <div className="flex items-center gap-0.5 mb-4">
                        {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                        ))}
                      </div>

                      {/* Quote text */}
                      <p className="heading-serif text-base md:text-lg leading-relaxed text-foreground/80 italic mb-5">
                        <span className="text-gold text-2xl mr-1">&ldquo;</span>
                        {testimonials[currentTestimonial].text}
                        <span className="text-gold text-2xl ml-1">&rdquo;</span>
                      </p>

                      {/* Author info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-sm font-semibold heading-serif">
                          {testimonials[currentTestimonial].name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{testimonials[currentTestimonial].name}</p>
                            {testimonials[currentTestimonial].verified && (
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[9px] px-1.5 py-0 gap-0.5">
                                <CheckCircle className="h-2.5 w-2.5" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentTestimonial
                      ? 'bg-gold w-8 h-2'
                      : 'bg-border hover:bg-gold/50 w-2 h-2'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Brand Partners (Our Partners) ═══ */}
      <section className="py-16 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Trusted Worldwide</p>
            <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-3">Our Partners</h2>
            <p className="text-sm text-background/50 max-w-md mx-auto">As featured in the world&rsquo;s leading fashion and lifestyle publications</p>
          </AnimatedSection>
        </div>

        {/* Marquee row 1 */}
        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-foreground to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-foreground to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee whitespace-nowrap gap-6 md:gap-8">
            {['VOGUE', "Harper's BAZAAR", 'ELLE', 'GQ', 'ESQUIRE', "L'Officiel", 'Forbes', 'Tatler', 'VOGUE', "Harper's BAZAAR", 'ELLE', 'GQ', 'ESQUIRE', "L'Officiel", 'Forbes', 'Tatler'].map((brand, i) => (
              <div
                key={`r1-${i}`}
                className="glass-card border border-white/10 rounded-lg px-6 md:px-8 py-3 md:py-4 shrink-0 flex items-center justify-center hover:border-gold/30 transition-colors duration-300"
              >
                <span className="text-xs md:text-sm tracking-[0.2em] uppercase text-background/70 font-light whitespace-nowrap">{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee row 2 (reverse) */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-foreground to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-foreground to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee whitespace-nowrap gap-6 md:gap-8" style={{ animationDirection: 'reverse' }}>
            {['Tatler', 'Forbes', "L'Officiel", 'ESQUIRE', 'GQ', 'ELLE', "Harper's BAZAAR", 'VOGUE', 'Tatler', 'Forbes', "L'Officiel", 'ESQUIRE', 'GQ', 'ELLE', "Harper's BAZAAR", 'VOGUE'].map((brand, i) => (
              <div
                key={`r2-${i}`}
                className="glass-card border border-white/10 rounded-lg px-6 md:px-8 py-3 md:py-4 shrink-0 flex items-center justify-center hover:border-gold/30 transition-colors duration-300"
              >
                <span className="text-xs md:text-sm tracking-[0.2em] uppercase text-background/70 font-light whitespace-nowrap">{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gold accent line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </div>
      </section>

      {/* ═══ Instagram Feed (Enhanced Masonry) ═══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <Instagram className="h-6 w-6 text-gold" />
              <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium">@MIRADEEN</span>
            </div>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Follow Us on Instagram</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Stay inspired with our latest looks, behind-the-scenes moments, and curated style inspiration</p>
            <div className="divider-gold w-20 mx-auto mt-4" />
          </AnimatedSection>

          {/* Masonry-like grid: 2 rows, varying heights */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop', likes: '2.4K', comments: '89', tall: true },
              { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop', likes: '1.8K', comments: '52', tall: false },
              { src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop', likes: '3.1K', comments: '124', tall: true },
              { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop', likes: '1.5K', comments: '38', tall: false },
              { src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=750&fit=crop', likes: '2.7K', comments: '97', tall: true },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', likes: '2.0K', comments: '63', tall: false },
            ].map((post, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={`group relative overflow-hidden cursor-pointer ${post.tall ? 'aspect-[4/5]' : 'aspect-square'} rounded-lg`}>
                  <img
                    src={post.src}
                    alt={`MIRADEEN Instagram post ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-white">
                        <Heart className="h-4 w-4 fill-white" />
                        <span className="text-xs font-semibold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span className="text-xs font-semibold">{post.comments}</span>
                      </div>
                    </div>
                    <Instagram className="h-5 w-5 text-white/80" />
                  </div>
                  {/* Gold corner accent on hover */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-2 border-l-2 border-transparent group-hover:border-gold group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-b-2 border-r-2 border-transparent group-hover:border-gold group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA Button */}
          <AnimatedSection className="text-center mt-10" delay={0.6}>
            <Button
              onClick={() => window.open('https://instagram.com/miradeen', '_blank')}
              className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury gap-2"
            >
              <Instagram className="h-4 w-4" />
              Follow Us on Instagram
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </AnimatedSection>

          {/* Decorative gold elements */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-8 h-px bg-gold/30" />
            <Camera className="h-3.5 w-3.5 text-gold/40" />
            <div className="w-8 h-px bg-gold/30" />
          </div>
        </div>
      </section>

      {/* ═══ Sustainability Promise ═══ */}
      <section className="py-24 bg-gradient-to-br from-foreground to-foreground/90 relative overflow-hidden">
        {/* Subtle gold particle decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[10%] w-1.5 h-1.5 rounded-full bg-gold/40"
          />
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[20%] right-[15%] w-1 h-1 rounded-full bg-gold/30"
          />
          <motion.div
            animate={{ y: [0, -25, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[15%] left-[20%] w-2 h-2 rounded-full bg-gold/25"
          />
          <motion.div
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.35, 0.1] }}
            transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-[50%] left-[80%] w-1.5 h-1.5 rounded-full bg-gold/30"
          />
          <motion.div
            animate={{ y: [0, -12, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-[25%] right-[25%] w-1 h-1 rounded-full bg-gold/35"
          />
          <motion.div
            animate={{ y: [0, -22, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 7.5, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-[35%] left-[45%] w-1.5 h-1.5 rounded-full bg-gold/20"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Our Commitment</p>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-shimmer">
              OUR SUSTAINABILITY PROMISE
            </h2>
            <div className="separator-diamond w-48 mx-auto">
              <div className="diamond" />
            </div>
            <p className="text-primary-foreground/60 text-sm max-w-xl mx-auto mt-6 leading-relaxed">
              Luxury should never come at the cost of our planet. We are committed to making every step of our journey sustainable, ethical, and transparent.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: Leaf,
                title: 'Ethical Sourcing',
                description: 'Every material is responsibly sourced from certified suppliers who share our values of fair labor and environmental stewardship.',
              },
              {
                icon: Package,
                title: 'Eco Packaging',
                description: 'Our packaging is crafted from recycled and biodegradable materials, designed to be as beautiful as it is kind to the earth.',
              },
              {
                icon: Handshake,
                title: 'Fair Trade',
                description: 'We ensure fair wages and safe working conditions for every artisan and craftsman who brings our vision to life.',
              },
            ].map((pillar, i) => (
              <AnimatedSection key={pillar.title} delay={i * 0.2}>
                <div className="text-center group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-full border-2 border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-6 group-hover:border-gold/60 group-hover:bg-gold/10 transition-all duration-300"
                  >
                    <pillar.icon className="h-7 w-7 text-gold" />
                  </motion.div>
                  <h3 className="heading-serif text-lg font-semibold text-primary-foreground mb-3">{pillar.title}</h3>
                  <p className="text-primary-foreground/50 text-sm leading-relaxed">{pillar.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-14" delay={0.6}>
            <Button
              onClick={() => navigate('about')}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/60 px-8 py-3 tracking-[0.15em] uppercase text-xs transition-all duration-300"
            >
              Learn More About Our Values
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Bottom CTA (Enhanced with Countdown Timer) ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <div className="w-12 h-px bg-gold mx-auto mb-6" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Limited Time Offer</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Join the MIRADEEN family and enjoy exclusive savings on your first purchase. Use code{' '}
              <span className="font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">MIRADEEN20</span>{' '}
              at checkout
            </p>

            {/* Countdown Timer */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5 text-gold" />
                <p className="text-xs tracking-wider uppercase text-muted-foreground">Offer ends in</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CountdownDigit value={timeLeft.hours} label="Hours" />
                <span className="heading-serif text-2xl font-bold text-foreground/30 mb-5">:</span>
                <CountdownDigit value={timeLeft.minutes} label="Minutes" />
                <span className="heading-serif text-2xl font-bold text-foreground/30 mb-5">:</span>
                <CountdownDigit value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('shop')}
                className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
              >
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('auth')}
                className="border-border hover:border-gold hover:text-gold px-8 py-3 tracking-[0.15em] uppercase text-xs transition-all duration-300"
              >
                Create Account
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

/* ─── Rating Counter (separate component for decimal support) ───────── */

function RatingCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isInView && !hasStarted.current) {
      hasStarted.current = true;
      const duration = 2200;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(parseFloat((eased * target).toFixed(1)));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, target]);

  return (
    <span ref={ref} className="heading-serif text-2xl md:text-3xl font-bold text-gold">
      {count}★
    </span>
  );
}
