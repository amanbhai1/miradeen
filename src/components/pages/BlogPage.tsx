'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ChevronDown,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════════ */

type ArticleCategory =
  | 'All'
  | 'Style Guides'
  | 'Behind the Scenes'
  | 'Fashion Trends'
  | 'Care Tips'
  | 'Brand Stories';

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
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
  'Behind the Scenes',
  'Fashion Trends',
  'Care Tips',
  'Brand Stories',
];

const FEATURED_ARTICLE: BlogArticle = {
  id: 'featured-1',
  title: 'The Art of Minimalist Luxury',
  excerpt:
    'Discover how the world\'s most discerning fashion enthusiasts are embracing the philosophy that less is truly more — and how MIRADEEN is leading this quiet revolution.',
  content: [
    'In an era defined by excess, a quiet revolution is reshaping the landscape of luxury fashion. Minimalist luxury — the art of achieving maximum impact through refined simplicity — has become the guiding philosophy for the world\'s most discerning dressers. At MIRADEEN, we believe that true elegance lies not in accumulation, but in the thoughtful curation of pieces that speak volumes through their restraint.',
    'The minimalist luxury wardrobe is built upon a foundation of exceptional craftsmanship and premium materials. Each piece is designed to stand on its own, free from superfluous embellishment. A perfectly tailored blazer in Italian wool, a silk charmeuse dress that drapes like liquid gold, a cashmere sweater of unparalleled softness — these are not merely garments; they are investments in enduring style that transcend seasonal trends.',
    'The colour palette of minimalist luxury draws from nature\'s most sophisticated hues: ivory, charcoal, camel, navy, and of course, our signature gold accents. These tones create a harmonious canvas that allows each piece to seamlessly integrate with your existing wardrobe, multiplying your styling possibilities while reducing clutter.',
    'At MIRADEEN, our commitment to minimalist luxury extends beyond aesthetics. We source only the finest fabrics from ethical mills, employ master artisans who understand that perfection lies in the details, and design each collection with the intention of creating timeless pieces that will be cherished for years to come. This is fashion that respects both the wearer and the world.',
  ],
  category: 'Style Guides',
  author: 'MIRADEEN Editorial Team',
  authorInitials: 'ME',
  date: 'June 15, 2024',
  readTime: '5 min read',
  image:
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=900&fit=crop&q=80',
  featured: true,
};

const ARTICLES: BlogArticle[] = [
  {
    id: 'art-1',
    title: 'The Art of Minimalist Luxury',
    excerpt:
      'Discover how the world\'s most discerning fashion enthusiasts are embracing the philosophy that less is truly more — and how MIRADEEN is leading this quiet revolution.',
    content: [
      'In an era defined by excess, a quiet revolution is reshaping the landscape of luxury fashion. Minimalist luxury — the art of achieving maximum impact through refined simplicity — has become the guiding philosophy for the world\'s most discerning dressers. At MIRADEEN, we believe that true elegance lies not in accumulation, but in the thoughtful curation of pieces that speak volumes through their restraint.',
      'The minimalist luxury wardrobe is built upon a foundation of exceptional craftsmanship and premium materials. Each piece is designed to stand on its own, free from superfluous embellishment. A perfectly tailored blazer in Italian wool, a silk charmeuse dress that drapes like liquid gold, a cashmere sweater of unparalleled softness — these are not merely garments; they are investments in enduring style that transcend seasonal trends.',
      'The colour palette of minimalist luxury draws from nature\'s most sophisticated hues: ivory, charcoal, camel, navy, and of course, our signature gold accents. These tones create a harmonious canvas that allows each piece to seamlessly integrate with your existing wardrobe, multiplying your styling possibilities while reducing clutter.',
      'At MIRADEEN, our commitment to minimalist luxury extends beyond aesthetics. We source only the finest fabrics from ethical mills, employ master artisans who understand that perfection lies in the details, and design each collection with the intention of creating timeless pieces that will be cherished for years to come. This is fashion that respects both the wearer and the world.',
    ],
    category: 'Style Guides',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'June 15, 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'art-2',
    title: 'Behind the Seams: Our Craftsmanship Process',
    excerpt:
      'Go behind the scenes of our atelier where ancient hand-embroidery techniques meet modern design philosophy. Every stitch tells a story of dedication and artistry.',
    content: [
      'Step inside the MIRADEEN atelier, and you\'ll discover a world where time moves differently. Here, master artisans with decades of experience work alongside contemporary designers, creating a unique fusion of traditional craftsmanship and modern sensibility. Each garment begins its journey as a sketch, but it is the human touch that transforms it into a work of wearable art.',
      'Our embroidery artisans are the custodians of centuries-old techniques passed down through generations. Using needle and thread, they create intricate patterns that can take up to 200 hours to complete on a single garment. From delicate zardozi work to precise French knots, each stitch is placed with intention, building textures and dimensions that no machine could replicate.',
      'The pattern-making process at MIRADEEN is equally meticulous. Our head pattern maker works with a combination of traditional draping techniques and advanced 3D modelling software, ensuring that every garment achieves the perfect balance of structure and fluidity. Each pattern is tested through multiple iterations — we typically create three toiles (test garments) before arriving at the final version.',
      'Quality control at MIRADEEN is not a department — it\'s a culture. Every team member, from the initial fabric inspection to the final steam press, takes personal responsibility for the piece passing through their hands. The result is clothing that not only looks exquisite but feels extraordinary, with a attention to detail that reveals itself more with every wearing.',
    ],
    category: 'Behind the Scenes',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'June 10, 2024',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'art-3',
    title: '5 Ways to Style a Blazer for Every Occasion',
    excerpt:
      'The blazer is the ultimate sartorial chameleon. From boardroom power dressing to weekend brunch chic, master these five styling formulas to unlock its full potential.',
    content: [
      'The blazer occupies a unique position in the modern wardrobe — it is simultaneously the most versatile and the most underestimated garment you can own. At MIRADEEN, we design our blazers to be the cornerstone of countless outfits, and today we\'re sharing five definitive ways to style them for any occasion on your calendar.',
      'For the office, pair your blazer with tailored trousers and a silk camisole for a look that commands respect without sacrificing femininity. Roll the sleeves to reveal a hint of wrist jewellery, and add pointed-toe heels for an elongated silhouette. This is power dressing redefined — confident, polished, and unmistakably refined.',
      'For weekend elegance, throw your blazer over a simple white tee and dark denim. The contrast between the structured blazer and relaxed basics creates an effortlessly cool aesthetic that transitions seamlessly from brunch to an afternoon gallery visit. Complete the look with leather loafers and a structured tote.',
      'For evening events, drape your blazer over a slip dress or pair it with high-waisted wide-leg trousers and a statement belt. The key to evening blazer styling is in the accessories — gold jewellery, a sleek clutch, and strappy sandals elevate the look from day to night. At MIRADEEN, our blazers are designed with this versatility in mind, ensuring you\'re prepared for whatever the day — or night — may bring.',
    ],
    category: 'Fashion Trends',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'June 5, 2024',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'art-4',
    title: 'Caring for Your Premium Fabrics',
    excerpt:
      'Your luxury garments deserve luxury care. Learn the expert techniques for maintaining silk, cashmere, wool, and other premium fabrics so they remain exquisite for years to come.',
    content: [
      'Investing in premium fabrics is a commitment to quality, and proper care is essential to preserving the beauty and longevity of your luxury garments. At MIRADEEN, we want every piece you own to look and feel as extraordinary years from now as it did on the day you first wore it. Here is our comprehensive guide to caring for the finest fabrics.',
      'Silk, the queen of fabrics, requires gentle handling. Always dry clean or hand wash in cold water using a dedicated silk detergent. Avoid wringing or twisting — instead, lay the garment flat between clean towels and press gently to remove excess water. Store silk items rolled rather than hung to prevent stretching, and keep them away from direct sunlight which can cause fading.',
      'Cashmere demands similar reverence. Hand wash in lukewarm water with a pH-neutral wool detergent, and never hang a wet cashmere garment — the weight of the water will permanently distort its shape. Instead, reshape gently and dry flat on a clean towel. To store, fold your cashmere with cedar blocks or lavender sachets to naturally deter moths. Between wears, give your cashmere a 24-hour rest to allow the fibres to recover their natural shape.',
      'For structured wool garments like our signature blazers, invest in quality wooden hangers that support the shoulder line, and use a garment bag for storage. Brush wool regularly with a natural bristle brush to remove surface dust and refresh the fibres. With proper care, your MIRADEEN pieces will age beautifully, developing the rich patina that comes only with garments of genuine quality.',
    ],
    category: 'Care Tips',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'May 28, 2024',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'art-5',
    title: 'The MIRADEEN Story: From Vision to Reality',
    excerpt:
      'From a small studio to an internationally recognised luxury brand, discover the inspiring journey of MIRADEEN — a story of passion, perseverance, and the pursuit of uncompromising excellence.',
    content: [
      'MIRADEEN was born from a simple yet powerful conviction: that luxury fashion should be accessible without compromising on craftsmanship, and timeless without being predictable. What began as a small design studio with a handful of artisans has grown into an internationally recognised brand, but our founding principles remain unchanged.',
      'Our founder\'s journey started with a deep appreciation for the textiles and craftsmanship traditions of South Asia, combined with a vision for contemporary design that could resonate globally. The first MIRADEEN collection, launched with just twelve pieces, was an instant sensation — praised for its fusion of heritage techniques with modern silhouettes, and its commitment to using only the finest natural fabrics.',
      'The growth of MIRADEEN has been deliberate and purposeful. Rather than chasing rapid expansion, we chose to invest in our supply chain, building direct relationships with the finest mills and artisan workshops. This approach allows us to maintain exceptional quality control while ensuring fair wages and sustainable practices throughout our production chain.',
      'Today, MIRADEEN dresses discerning customers across thirty countries, but we still operate with the same attention to detail and personal touch that defined our earliest days. Every collection begins with the same question: would we be proud to wear this piece ourselves? It is a standard that has guided us from our founding and will continue to shape our future as we write the next chapter of the MIRADEEN story.',
    ],
    category: 'Brand Stories',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'May 20, 2024',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'art-6',
    title: 'Summer 2024: Trends That Define Luxury Fashion',
    excerpt:
      'From fluid silhouettes to sun-kissed metallics, explore the defining trends of Summer 2024 and learn how MIRADEEN is interpreting them with signature elegance.',
    content: [
      'Summer 2024 heralds a return to sensual, unapologetic luxury. After seasons of restrained minimalism, the runway has embraced a new confidence — one that celebrates fluid movement, tactile richness, and the art of dressing with intention. At MIRADEEN, we\'ve distilled these trends into a collection that feels both of the moment and timeless.',
      'The dominant silhouette of the season is fluid and column-like — think bias-cut dresses that skim the body, wide-leg trousers that pool elegantly at the ankle, and oversized blazers worn as dresses. This relaxed approach to tailoring speaks to a broader shift in how we approach luxury: comfort and elegance are no longer mutually exclusive. Our silk charmeuse pieces embody this trend perfectly.',
      'Colour for Summer 2024 is all about warm sophistication. Rich terracotta, deep olive, dusty rose, and champagne gold dominate the palette, creating a sense of warmth and richness that feels both luxurious and grounded. Metallic accents — particularly in gold and bronze — add a sun-drenched glamour that transitions beautifully from day to evening.',
      'Perhaps the most significant trend of Summer 2024 is the conscious consumer\'s embrace of quality over quantity. Investment pieces — the kind that MIRADEEN has always specialised in — are being celebrated as the antidote to fast fashion. Shoppers are choosing fewer, better pieces that tell a story and last a lifetime, and we couldn\'t be more aligned with this philosophy.',
    ],
    category: 'Fashion Trends',
    author: 'MIRADEEN Editorial Team',
    authorInitials: 'ME',
    date: 'May 12, 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop&q=80',
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
          Stories, Style &amp; Inspiration from MIRADEEN
        </motion.p>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="heading-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-shimmer"
        >
          THE JOURNAL
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
          Discover curated stories, exclusive style guides, and the latest trends
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

function FeaturedArticleCard({
  article,
  onSelectArticle,
}: {
  article: BlogArticle;
  onSelectArticle: (article: BlogArticle) => void;
}) {
  return (
    <section className="relative py-0">
      <AnimatedSection>
        <div
          onClick={() => onSelectArticle(article)}
          className="group relative w-full h-[70vh] min-h-[500px] md:h-[80vh] overflow-hidden cursor-pointer card-shine"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading="eager"
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />

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

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-8">
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
                  <Button className="bg-gold text-background hover:bg-gold-dark px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold btn-luxury">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Featured Tag */}
          <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-white/40">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] tracking-wider uppercase">Featured</span>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — CATEGORY FILTER
   ═══════════════════════════════════════════════════════════════════════ */

function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: ArticleCategory;
  onCategoryChange: (cat: ArticleCategory) => void;
}) {
  return (
    <div className="relative mb-10">
      {/* Fade edges */}
      <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      <div
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
   SECTION 4 — ARTICLE CARD
   ═══════════════════════════════════════════════════════════════════════ */

function ArticleCard({
  article,
  index,
  onSelectArticle,
}: {
  article: BlogArticle;
  index: number;
  onSelectArticle: (article: BlogArticle) => void;
}) {
  return (
    <AnimatedSection delay={index * 0.1}>
      <article
        onClick={() => onSelectArticle(article)}
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
          {/* Meta row */}
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] mb-2">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {article.readTime}
            </span>
          </div>

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
            <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-[10px] font-semibold text-gold flex-shrink-0">
              {article.authorInitials}
            </div>
            <p className="text-xs font-medium text-foreground truncate">
              {article.author}
            </p>
          </div>
        </div>
      </article>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — BLOG DETAIL VIEW
   ═══════════════════════════════════════════════════════════════════════ */

function BlogDetail({
  article,
  onBack,
}: {
  article: BlogArticle;
  onBack: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div ref={scrollRef}>
      {/* Hero Image */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-6 left-6 z-20"
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className="bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-white border border-white/20 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs tracking-[0.1em] uppercase">Back to Journal</span>
          </Button>
        </motion.div>

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 lg:px-12 pb-10 md:pb-16">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Badge className="bg-gold/90 text-background text-[10px] tracking-[0.2em] uppercase px-3 py-1 mb-4">
                {article.category}
              </Badge>
              <h1 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/30 border border-gold/50 flex items-center justify-center text-xs font-semibold text-gold-light">
                    {article.authorInitials}
                  </div>
                  <span className="text-white/90">{article.author}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{article.date}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Gold Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24 mb-10" />

          {/* Article Paragraphs */}
          <div className="space-y-6 md:space-y-8">
            {article.content.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
                className="text-base md:text-lg leading-relaxed md:leading-[1.85] text-foreground/85"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Bottom Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24 mt-10 mb-10" />

          {/* Author Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-4 p-6 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="w-14 h-14 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center text-lg font-bold text-gold heading-serif flex-shrink-0">
              {article.authorInitials}
            </div>
            <div>
              <p className="heading-serif text-lg font-semibold text-foreground">
                {article.author}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                The MIRADEEN editorial team brings together fashion expertise, cultural insight, and a deep appreciation for the art of luxury living.
              </p>
            </div>
          </motion.div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold hover:text-background px-10 py-3 tracking-[0.15em] uppercase text-xs font-medium transition-all duration-300 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Journal
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — NEWSLETTER CTA
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
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gold gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-background to-gold/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-gold/[0.06] to-transparent" />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

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

          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            The MIRADEEN Newsletter
          </p>

          <h2 className="heading-serif text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Stay Inspired
          </h2>

          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent w-24 mx-auto mb-5" />

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md mx-auto mb-10">
            Subscribe to our journal for the latest in luxury fashion, style
            guides, and exclusive offers delivered directly to your inbox.
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
                  className="h-12 bg-background border-gold/30 text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/30 rounded-none pr-4 text-sm tracking-wide"
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
              <p className="text-foreground font-medium text-lg heading-serif">
                You&apos;re Subscribed!
              </p>
              <p className="text-muted-foreground text-sm">
                Welcome to the MIRADEEN inner circle.
              </p>
            </motion.div>
          )}

          {/* Trust note */}
          <p className="text-muted-foreground/50 text-[10px] mt-6 tracking-wider">
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 7 — LOAD MORE BUTTON
   ═══════════════════════════════════════════════════════════════════════ */

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center pt-4 pb-2">
      <Button
        onClick={onClick}
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
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  // Filter articles based on category
  const filteredArticles = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = displayedArticles.length < filteredArticles.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 3);
  }, []);

  const handleSelectArticle = useCallback((article: BlogArticle) => {
    setSelectedArticle(article);
  }, []);

  const handleBackToJournal = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  const handleScrollDown = useCallback(() => {
    if (featuredRef.current) {
      featuredRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCategoryChange = useCallback((cat: ArticleCategory) => {
    setActiveCategory(cat);
    setVisibleCount(3);
  }, []);

  // If a blog article is selected, show the detail view
  if (selectedArticle) {
    return (
      <div className="bg-background min-h-screen">
        <BlogDetail article={selectedArticle} onBack={handleBackToJournal} />
      </div>
    );
  }

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
        <FeaturedArticleCard
          article={FEATURED_ARTICLE}
          onSelectArticle={handleSelectArticle}
        />
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
              <BookOpen className="h-4 w-4 text-gold" />
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
              Curated insights on style, craftsmanship, and the art of living
              luxuriously
            </p>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={0.1}>
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
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
                  onSelectArticle={handleSelectArticle}
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
          {displayedArticles.length > 0 && hasMore && (
            <LoadMoreButton onClick={handleLoadMore} />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — NEWSLETTER CTA
          ═══════════════════════════════════════════════════════════════ */}
      <NewsletterCTA />
    </div>
  );
}
