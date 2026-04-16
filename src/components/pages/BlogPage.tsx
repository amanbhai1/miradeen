'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Clock,
  ChevronDown,
  Mail,
  Search,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════════ */

type ArticleCategory =
  | 'All'
  | 'Style Guides'
  | 'Trend Reports'
  | 'Behind the Scenes'
  | 'Interviews'
  | 'Lookbooks'
  | 'Seasonal';

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  author: string;
  authorInitials: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const CATEGORIES: ArticleCategory[] = [
  'All',
  'Style Guides',
  'Trend Reports',
  'Behind the Scenes',
  'Interviews',
  'Lookbooks',
  'Seasonal',
];

const FEATURED_ARTICLE: BlogArticle = {
  id: 'featured-1',
  title: 'The Art of Sustainable Luxury: A 2024 Perspective',
  excerpt:
    'Discover how the world\'s most prestigious fashion houses are redefining luxury through sustainable practices, ethical sourcing, and a commitment to craftsmanship that honours both people and the planet.',
  category: 'Style Guides',
  author: 'Ananya Kapoor',
  authorInitials: 'AK',
  date: 'January 15, 2024',
  readTime: '8 min read',
  image:
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=900&fit=crop&q=80',
  featured: true,
};

const ARTICLES: BlogArticle[] = [
  {
    id: 'art-1',
    title: 'Mastering the Capsule Wardrobe: 10 Essentials Every Woman Needs',
    excerpt:
      'Build a timeless collection of versatile pieces that transition seamlessly from day to night, season to season. Less truly is more.',
    category: 'Style Guides',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    date: 'January 12, 2024',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=800&fit=crop&q=80',
  },
  {
    id: 'art-2',
    title: 'Spring/Summer 2024: The Colour Trends Dominating the Runways',
    excerpt:
      'From buttery yellows to rich terracottas, this season\'s palette is a celebration of warmth, optimism, and understated elegance.',
    category: 'Trend Reports',
    author: 'Meera Joshi',
    authorInitials: 'MJ',
    date: 'January 8, 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80',
  },
  {
    id: 'art-3',
    title: 'Inside the Atelier: A Day with MIRADEEN\'s Master Tailors',
    excerpt:
      'Go behind the scenes of our Mumbai atelier where ancient hand-embroidery techniques meet modern design philosophy.',
    category: 'Behind the Scenes',
    author: 'Arjun Patel',
    authorInitials: 'AP',
    date: 'January 5, 2024',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop&q=80',
  },
  {
    id: 'art-4',
    title: 'Interview: Emerging Designer Rhea Mehra on Redefining Indian Couture',
    excerpt:
      'The young designer shares her journey from design school to dressing Bollywood\'s finest, and her vision for the future of Indian fashion.',
    category: 'Interviews',
    author: 'Vikram Singh',
    authorInitials: 'VS',
    date: 'December 28, 2023',
    readTime: '9 min read',
    image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80',
  },
  {
    id: 'art-5',
    title: 'Autumn/Winter Lookbook: Wrapped in Elegance',
    excerpt:
      'Luxurious cashmere, rich velvets, and deep jewel tones define this season\'s most captivating editorial looks.',
    category: 'Lookbooks',
    author: 'Sneha Reddy',
    authorInitials: 'SR',
    date: 'December 20, 2023',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop&q=80',
  },
  {
    id: 'art-6',
    title: 'The Holiday Gift Guide: Luxury Picks for Every Budget',
    excerpt:
      'Curated selections from our finest collections to help you find the perfect gift for the discerning loved ones in your life.',
    category: 'Seasonal',
    author: 'Ananya Kapoor',
    authorInitials: 'AK',
    date: 'December 15, 2023',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop&q=80',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
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

function GoldDiamond({ className = '' }: { className?: string }) {
  return (
    <div className={`w-3 h-3 bg-gold rotate-45 flex-shrink-0 ${className}`} />
  );
}

function SeparatorDiamond() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
      <div className="w-2 h-2 border border-gold/60 rotate-45" />
      <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO BANNER
   ═══════════════════════════════════════════════════════════════════════ */

function HeroBanner({ onScrollDown }: { onScrollDown: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <ParallaxHeroImage
        src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop&q=80"
        alt="MIRADEEN Journal Hero"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Animated Content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
      >
        {/* Gold Diamond Decorations */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-6 mb-8"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
          <GoldDiamond />
          <BookOpen className="h-5 w-5 text-gold" />
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
          Stories, Trends &amp; Inspiration
        </motion.p>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="heading-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-shimmer"
        >
          THE MIRADEEN JOURNAL
        </motion.h1>

        {/* Decorative Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-base md:text-lg tracking-[0.15em] font-light text-white/80 max-w-xl mx-auto"
        >
          Discover curated stories, exclusive interviews, and the latest trends
          shaping the world of luxury fashion
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
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
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — FEATURED ARTICLE
   ═══════════════════════════════════════════════════════════════════════ */

function FeaturedArticleCard({ article }: { article: BlogArticle }) {
  const { toast } = useToast();

  const handleReadArticle = () => {
    toast({
      title: 'Opening Article',
      description: `"${article.title}" — Full article view coming soon!`,
    });
  };

  return (
    <section className="relative py-0">
      <AnimatedSection>
        <div className="group relative w-full h-[70vh] min-h-[500px] md:h-[80vh] overflow-hidden cursor-pointer card-shine">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading="eager"
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />

          {/* Card Shine Effect (pseudo-element via CSS class) */}
          <div className="absolute inset-0 pointer-events-none card-shine" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-px bg-gold" />
                    <Badge className="bg-gold/90 text-background text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                      {article.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h2 className="heading-serif text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-4">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                    {article.excerpt}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-8">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gold/30 border border-gold/50 flex items-center justify-center text-xs font-semibold text-gold-light">
                      {article.authorInitials}
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-medium">
                        {article.author}
                      </p>
                      <div className="flex items-center gap-3 text-white/50 text-xs">
                        <span>{article.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={handleReadArticle}
                    className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                  >
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner Tag */}
          <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-white/40">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] tracking-wider uppercase">Featured</span>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — CATEGORY FILTER (rendered above the grid)
   ═══════════════════════════════════════════════════════════════════════ */

function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: ArticleCategory;
  onCategoryChange: (cat: ArticleCategory) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative mb-10">
      {/* Fade edges */}
      <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-medium transition-all duration-300 border ${
              activeCategory === cat
                ? 'bg-gold text-background border-gold shadow-luxury-sm'
                : 'bg-transparent text-muted-foreground border-border hover:border-gold/50 hover:text-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — ARTICLE CARD
   ═══════════════════════════════════════════════════════════════════════ */

function ArticleCard({ article, index }: { article: BlogArticle; index: number }) {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: 'Opening Article',
      description: `"${article.title}" — Full article view coming soon!`,
    });
  };

  return (
    <AnimatedSection delay={index * 0.08}>
      <article
        onClick={handleClick}
        className="group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border hover:border-gold/30 transition-all duration-500 hover-lift-sm h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Category Pill Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 dark:bg-black/80 backdrop-blur-sm text-gold border border-gold/30 text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5">
              {article.category}
            </Badge>
          </div>

          {/* Hover Read Indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <ArrowRight className="h-5 w-5 text-background" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title */}
          <h3 className="heading-serif text-base md:text-lg font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
            {article.excerpt}
          </p>

          {/* Author Meta */}
          <div className="flex items-center gap-3 pt-3 border-t border-border/50">
            {/* Avatar Initial Circle */}
            <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-[10px] font-semibold text-gold flex-shrink-0">
              {article.authorInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {article.author}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
                <span>{article.date}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — NEWSLETTER CTA
   ═══════════════════════════════════════════════════════════════════════ */

function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
        if (res.ok) {
          setIsSuccess(true);
          toast({
            title: 'Welcome to the Journal! ✨',
            description: 'You\'ll receive our latest stories directly in your inbox.',
          });
        } else {
          toast({
            title: 'Subscription failed',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Something went wrong',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, toast],
  );

  return (
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

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
        <AnimatedSection>
          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <GoldDiamond className="opacity-60" />
            <div className="w-16 h-px bg-gold/40" />
            <Mail className="h-5 w-5 text-gold" />
            <div className="w-16 h-px bg-gold/40" />
            <GoldDiamond className="opacity-60" />
          </div>

          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-3">
            The MIRADEEN Newsletter
          </p>

          <h2 className="heading-serif text-3xl md:text-5xl font-bold text-white mb-4">
            Stay Inspired
          </h2>

          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24 mx-auto mb-5" />

          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-10">
            Join 50,000+ fashion enthusiasts. Receive exclusive stories, trend
            forecasts, and early access to new collections — delivered weekly.
          </p>

          {/* Email Form */}
          {!isSuccess ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-gold focus:ring-gold/30 rounded-none pr-4 text-sm tracking-wide"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 bg-gold text-background hover:bg-gold-dark px-8 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                    />
                    Subscribing…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <p className="text-white font-medium text-lg heading-serif">
                You&apos;re Subscribed!
              </p>
              <p className="text-white/50 text-sm">
                Welcome to the MIRADEEN inner circle.
              </p>
            </motion.div>
          )}

          {/* Trust note */}
          <p className="text-white/30 text-[10px] mt-6 tracking-wider">
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </AnimatedSection>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — LOAD MORE BUTTON
   ═══════════════════════════════════════════════════════════════════════ */

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: 'More articles coming soon',
      description: 'We\'re curating more inspiring content for you.',
    });
    onClick();
  };

  return (
    <div className="flex justify-center pt-4 pb-2">
      <Button
        onClick={handleClick}
        variant="outline"
        className="border-gold/40 text-gold hover:bg-gold hover:text-background px-10 py-3 tracking-[0.15em] uppercase text-xs font-medium transition-all duration-300 group"
      >
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="inline-block"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
          Load More Articles
        </span>
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BLOG PAGE — MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const featuredRef = useRef<HTMLDivElement>(null);

  // Filter articles based on category
  const filteredArticles = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const displayedArticles = filteredArticles.slice(0, visibleCount);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 6);
  }, []);

  const handleScrollDown = useCallback(() => {
    if (featuredRef.current) {
      featuredRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <HeroBanner onScrollDown={handleScrollDown} />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — FEATURED ARTICLE
          ═══════════════════════════════════════════════════════════════ */}
      <div ref={featuredRef}>
        <FeaturedArticleCard article={FEATURED_ARTICLE} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTIONS 3 & 4 — ARTICLE GRID + CATEGORY FILTER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-gold/50" />
              <Search className="h-4 w-4 text-gold" />
              <div className="w-8 h-px bg-gold/50" />
            </div>
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
              Latest Stories
            </p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">
              Explore the Journal
            </h2>
            <SeparatorDiamond />
            <p className="text-muted-foreground text-sm max-w-md mx-auto mt-3">
              Curated insights on style, trends, and the art of living
              luxuriously
            </p>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={0.1}>
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </AnimatedSection>

          {/* Article Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="wait">
              {displayedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {displayedArticles.length === 0 && (
            <AnimatedSection className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="heading-serif text-xl font-semibold text-muted-foreground">
                  No Articles Found
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  We don&apos;t have any articles in this category yet. Check
                  back soon or explore other categories.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveCategory('All')}
                  className="border-gold/40 text-gold hover:bg-gold hover:text-background mt-2 tracking-[0.1em] uppercase text-xs"
                >
                  View All Articles
                </Button>
              </div>
            </AnimatedSection>
          )}

          {/* Load More */}
          {displayedArticles.length > 0 &&
            displayedArticles.length < filteredArticles.length && (
              <LoadMoreButton onClick={handleLoadMore} />
            )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — NEWSLETTER CTA
          ═══════════════════════════════════════════════════════════════ */}
      <NewsletterCTA />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — LOAD MORE (bottom, always visible for UX)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <LoadMoreButton onClick={handleLoadMore} />
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
