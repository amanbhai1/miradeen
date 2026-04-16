'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Camera, Sparkles, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';

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

/* ─── Parallax Hero Background ──────────────────────────────────────── */

function ParallaxHeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y, scale }}
      />
    </div>
  );
}

/* ─── Gold Diamond Decorative Element ───────────────────────────────── */

function GoldDiamond({ className = '' }: { className?: string }) {
  return (
    <div className={`w-3 h-3 bg-gold rotate-45 flex-shrink-0 ${className}`} />
  );
}

/* ─── Lookbook Grid Item ────────────────────────────────────────────── */

interface LookbookItem {
  id: number;
  image: string;
  name: string;
  season: string;
  tags: string[];
  spanClass: string;
}

function LookbookGridItem({ item, index }: { item: LookbookItem; index: number }) {
  const { navigate } = useStore();
  return (
    <AnimatedSection delay={index * 0.1}>
      <div className={`group relative overflow-hidden cursor-pointer ${item.spanClass}`}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
          <Badge className="bg-gold/90 text-background text-[10px] tracking-wider uppercase mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {item.season}
          </Badge>
          <h3 className="heading-serif text-xl md:text-2xl text-white font-semibold mb-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
            {item.name}
          </h3>
          <div className="flex flex-wrap justify-center gap-1.5 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] tracking-wider uppercase text-white/80 border border-white/30 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <Button
            onClick={() => navigate('shop')}
            size="sm"
            className="bg-gold text-background hover:bg-gold-dark text-[10px] tracking-[0.15em] uppercase px-5 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200 btn-luxury"
          >
            Shop the Look
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
        {/* Subtle gold border on hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 transition-colors duration-500 pointer-events-none" />
      </div>
    </AnimatedSection>
  );
}

/* ─── Seasonal Carousel Card ────────────────────────────────────────── */

interface SeasonalLook {
  id: number;
  image: string;
  season: string;
  description: string;
}

function SeasonalCarouselCard({ look }: { look: SeasonalLook }) {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[340px] lg:w-[380px] group">
      <div className="card-luxury bg-background dark:bg-card rounded-lg overflow-hidden border border-border">
        <div className="relative aspect-[3/4] img-zoom">
          <img
            src={look.image}
            alt={look.season}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <Badge className="bg-gold/90 text-background text-[10px] tracking-wider uppercase mb-2">
              {look.season}
            </Badge>
            <h3 className="heading-serif text-xl text-white font-semibold mb-1">{look.season} Collection</h3>
            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{look.description}</p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full border-gold/40 text-gold hover:bg-gold hover:text-background tracking-[0.15em] uppercase text-[10px] transition-all duration-300 btn-luxury"
          >
            Explore
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   LOOKBOOK PAGE
   ═════════════════════════════════════════════════════════════════════ */

export default function LookbookPage() {
  const { navigate } = useStore();

  // ── Editorial Grid Data ──
  const lookbookItems: LookbookItem[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
      name: 'Urban Elegance',
      season: 'Spring 2024',
      tags: ['Blazer', 'Tailored', 'Minimalist'],
      spanClass: 'aspect-[3/4] md:row-span-2',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=900&fit=crop',
      name: 'Golden Hour',
      season: 'Summer 2024',
      tags: ['Evening Wear', 'Linen', 'Draped'],
      spanClass: 'aspect-[3/4]',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop',
      name: 'Street Luxe',
      season: 'Autumn 2024',
      tags: ['Streetwear', 'Layered', 'Bold'],
      spanClass: 'aspect-square md:col-span-2',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop',
      name: 'Midnight Edit',
      season: 'Winter 2024',
      tags: ['Silk', 'Structured', 'Dark'],
      spanClass: 'aspect-[3/4]',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop',
      name: 'Avant-Garde',
      season: 'Resort 2024',
      tags: ['Asymmetric', 'Fluid', 'Artistic'],
      spanClass: 'aspect-square',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=900&fit=crop',
      name: 'Heritage Reimagined',
      season: 'Pre-Fall 2024',
      tags: ['Embroidered', 'Classic', 'Regal'],
      spanClass: 'aspect-[3/4]',
    },
  ];

  // ── Seasonal Carousel Data ──
  const seasonalLooks: SeasonalLook[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop',
      season: 'Spring/Summer',
      description: 'Flowing silhouettes and sun-kissed palettes define the warm-weather collection. Linen, cotton, and silk in earthy tones.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=800&fit=crop',
      season: 'Autumn/Winter',
      description: 'Rich textures and layered forms for the cooler months. Cashmere, wool, and velvet in deep jewel tones.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=800&fit=crop',
      season: 'Resort',
      description: 'Effortless elegance for escapes and getaways. Lightweight fabrics in breezy silhouettes with tropical influences.',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&h=800&fit=crop',
      season: 'Pre-Fall',
      description: 'Transitional pieces that bridge seasons. Neutral foundations with statement accessories and outerwear.',
    },
  ];

  // ── Carousel State ──
  const [activeSeason, setActiveSeason] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.querySelector<HTMLElement>('.flex-shrink-0')?.offsetWidth || 340;
    const scrollAmount = cardWidth + 24; // card width + gap
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // ── Parallax Scroll for Hero ──
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 1], [1, 1.1]);

  return (
    <div className="bg-background">

      {/* ═══════════════════════════════════════════════════════════════
          1. FULL-SCREEN HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <ParallaxHeroImage
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
          alt="MIRADEEN Lookbook Hero"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Animated Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          {/* Gold Diamond Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-6 mb-8"
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <GoldDiamond />
            <Camera className="h-5 w-5 text-gold" />
            <GoldDiamond />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xs md:text-sm tracking-[0.4em] uppercase mb-4 text-gold-light"
          >
            Editorial Collection 2024
          </motion.p>

          {/* Title with Gold Shimmer */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="heading-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-shimmer"
          >
            MIRADEEN LOOKBOOK
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"
          />

          {/* Subtitle Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-base md:text-lg tracking-[0.15em] font-light text-white/80 max-w-xl mx-auto"
          >
            A visual journey through our most iconic editorial moments
          </motion.p>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">Scroll to Explore</span>
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
          2. FEATURED LOOK - FULL WIDTH EDITORIAL
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-0">
        <AnimatedSection>
          <div className="group relative w-full h-[70vh] min-h-[500px] md:h-[80vh] overflow-hidden cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop"
              alt="Featured Editorial Look"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Editorial Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
                <div className="max-w-lg">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-px bg-gold" />
                      <span className="text-[10px] tracking-[0.3em] uppercase text-gold-light">Featured Editorial</span>
                    </div>
                    <h2 className="heading-serif text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-4">
                      The Art of
                      <br />
                      <span className="text-gold-gradient">Timeless Style</span>
                    </h2>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                      Explore our curated selection of editorial pieces that define the MIRADEEN aesthetic — where heritage craftsmanship meets contemporary vision.
                    </p>
                    <Button
                      onClick={() => navigate('shop')}
                      className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                    >
                      View Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Corner Decoration */}
            <div className="absolute top-6 right-6 hidden md:block">
              <div className="flex items-center gap-2 text-white/40">
                <Eye className="h-4 w-4" />
                <span className="text-[10px] tracking-wider uppercase">Editorial</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. EDITORIAL GRID (Masonry-like Layout)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold/50" />
              <Sparkles className="h-4 w-4 text-gold" />
              <div className="w-8 h-px bg-gold/50" />
            </div>
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Curated Looks</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Editorial Grid</h2>
            <div className="divider-gold w-20 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Six signature looks that capture the essence of MIRADEEN's editorial vision
            </p>
          </AnimatedSection>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-auto">
            {lookbookItems.map((item, index) => (
              <LookbookGridItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. BEHIND THE SCENES SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-cream dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">The Process</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Behind the Scenes</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image Column */}
            <AnimatedSection delay={0.1}>
              <div className="relative group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop"
                    alt="Behind the Scenes - Craftsmanship"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 md:bottom-6 md:right-6 bg-gold text-background px-4 py-2 rounded-sm">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">Est. 2020</span>
                </div>
                {/* Gold corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/50 rounded-tl-lg" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/50 rounded-br-lg" />
              </div>
            </AnimatedSection>

            {/* Text Column */}
            <AnimatedSection delay={0.3}>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-gold" />
                  <span className="text-xs tracking-[0.2em] uppercase text-gold">Craftsmanship Story</span>
                </div>

                <h3 className="heading-serif text-2xl md:text-3xl font-bold leading-snug">
                  Where Vision Meets
                  <br />
                  <span className="text-gold-gradient">Meticulous Artistry</span>
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every MIRADEEN collection begins with a story — a narrative woven from the finest fabrics, 
                  shaped by master artisans who have dedicated their lives to the craft of luxury fashion. 
                  From the first sketch to the final stitch, each piece undergoes a rigorous journey of 
                  refinement and perfection.
                </p>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our atelier in Mumbai brings together traditional Indian embroidery techniques with 
                  contemporary design sensibilities, creating garments that honor the past while embracing 
                  the future. Every detail is considered, every fabric is hand-selected, and every silhouette 
                  is sculpted to celebrate the human form.
                </p>

                {/* Pull Quote */}
                <div className="relative pl-6 py-4 border-l-2 border-gold">
                  <div className="absolute -left-2 top-4 w-4 h-4 bg-gold rotate-45" />
                  <p className="heading-serif text-lg md:text-xl italic text-foreground/80 leading-relaxed">
                    &ldquo;Fashion is not just about clothes. It&apos;s about a vision of life.&rdquo;
                  </p>
                  <p className="text-xs text-gold mt-2 tracking-wider uppercase">— MIRADEEN Design Philosophy</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => navigate('about')}
                    className="bg-foreground text-background hover:bg-foreground/90 px-6 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                  >
                    Our Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('shop')}
                    className="border-border hover:border-gold hover:text-gold px-6 py-3 tracking-[0.15em] uppercase text-xs transition-all duration-300"
                  >
                    View Collections
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. SEASONAL COLLECTION SHOWCASE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <GoldDiamond />
                <span className="text-xs tracking-[0.3em] uppercase text-gold">Collections</span>
              </div>
              <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-2">Seasonal Showcase</h2>
              <div className="divider-gold w-20 mb-3" />
              <p className="text-muted-foreground text-sm max-w-md">
                Explore our collections through the seasons, each telling a unique story of style and sophistication.
              </p>
            </div>
            {/* Navigation Arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </AnimatedSection>

          {/* Horizontal Scrollable Carousel */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {seasonalLooks.map((look, index) => (
                <div key={look.id} className="snap-start">
                  <AnimatedSection delay={index * 0.1}>
                    <SeasonalCarouselCard look={look} />
                  </AnimatedSection>
                </div>
              ))}
            </div>

            {/* Fade edges */}
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {seasonalLooks.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (carouselRef.current) {
                    const cards = carouselRef.current.querySelectorAll('.flex-shrink-0');
                    const targetCard = cards[i] as HTMLElement;
                    if (targetCard) {
                      carouselRef.current.scrollTo({
                        left: targetCard.offsetLeft - carouselRef.current.offsetLeft,
                        behavior: 'smooth',
                      });
                    }
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSeason === i ? 'bg-gold w-6' : 'bg-border hover:bg-gold/50 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. CTA SECTION — GET THE LOOK
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-charcoal">
        {/* Noise Texture */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Decorative gold corners */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-gold/30 hidden md:block" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-gold/30 hidden md:block" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-gold/30 hidden md:block" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-gold/30 hidden md:block" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <GoldDiamond className="opacity-60" />
              <div className="w-16 h-px bg-gold/40" />
              <Sparkles className="h-5 w-5 text-gold" />
              <div className="w-16 h-px bg-gold/40" />
              <GoldDiamond className="opacity-60" />
            </div>

            <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-4">
              Ready to Elevate Your Wardrobe?
            </p>

            <h2 className="heading-serif text-3xl md:text-5xl font-bold text-white mb-6">
              Get the Look
            </h2>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-32 mx-auto mb-6" />

            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10">
              Discover the pieces that define luxury. From our latest editorial collections 
              to timeless essentials — find your signature style with MIRADEEN.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('shop')}
                className="bg-gold text-background hover:bg-gold-dark px-10 py-3.5 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('contact')}
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-10 py-3.5 tracking-[0.15em] uppercase text-xs transition-all duration-300"
              >
                Contact Stylist
              </Button>
            </div>

            {/* Subtle gold divider at bottom */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-gold/20" />
              <GoldDiamond className="opacity-40 w-2 h-2" />
              <div className="w-12 h-px bg-gold/20" />
            </div>
          </AnimatedSection>
        </div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>
    </div>
  );
}
