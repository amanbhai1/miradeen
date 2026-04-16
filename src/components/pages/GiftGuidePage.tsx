'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  Gift,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Heart,
  Clock,
  Star,
  Lightbulb,
  Crown,
  Package,
  ShoppingBag,
} from 'lucide-react';

// ─── Animation helpers ────────────────────────────────────────────────
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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Data ─────────────────────────────────────────────────────────────
const occasions = [
  {
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    description: 'Make their day unforgettable',
  },
  {
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    description: 'Celebrate love & togetherness',
  },
  {
    name: 'Wedding',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    description: 'Gifts as special as the occasion',
  },
  {
    name: 'Festival',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800',
    description: 'Spread joy & festive cheer',
  },
  {
    name: 'Congratulations',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    description: 'Mark milestones in style',
  },
  {
    name: 'Just Because',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    description: 'Surprise them for no reason',
  },
];

const priceTiers = [
  {
    label: 'Under ₹2,000',
    description: 'Affordable luxury that speaks volumes. Perfect for heartfelt gestures without stretching your budget.',
    tag: 'Affordable Luxury',
    gradient: 'from-beige/30 to-transparent',
    borderColor: 'border-gold/20',
    textColor: 'text-gold',
  },
  {
    label: '₹2,000 – ₹5,000',
    description: 'Premium selection of finely crafted pieces. For those who appreciate the art of refined gifting.',
    tag: 'Premium Selection',
    gradient: 'from-beige/50 to-transparent',
    borderColor: 'border-gold/30',
    textColor: 'text-gold',
  },
  {
    label: '₹5,000 – ₹10,000',
    description: 'Luxury picks from our exclusive collections. Curated for the discerning gift-giver.',
    tag: 'Luxury Picks',
    gradient: 'from-gold/10 to-transparent',
    borderColor: 'border-gold/40',
    textColor: 'text-gold',
  },
  {
    label: 'Above ₹10,000',
    description: 'Ultra premium statement pieces. Extraordinary gifts for extraordinary people.',
    tag: 'Ultra Premium',
    gradient: 'from-gold/20 to-transparent',
    borderColor: 'border-gold',
    textColor: 'text-gold',
  },
];

const recipients = [
  {
    title: 'For Her',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
    categories: ['Silk Sarees', 'Designer Dresses', 'Handbags', 'Fine Jewellery', 'Perfumes'],
    reversed: false,
  },
  {
    title: 'For Mom',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800',
    categories: ['Silk Scarves', 'Cashmere Wraps', 'Pearl Sets', 'Scented Candles', 'Tea Gift Sets'],
    reversed: true,
  },
  {
    title: 'For Best Friend',
    image: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800',
    categories: ['Matching Sets', 'Co-ord Sets', 'Fragrance Duos', 'Spa Kits', 'Photo Frames'],
    reversed: false,
  },
  {
    title: 'For Yourself',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    categories: ['Cashmere Wraps', 'Silk Pyjamas', 'Spa Kits', 'Statement Pieces', 'Scented Candles'],
    reversed: true,
  },
];

const giftCards = [
  { amount: '₹2,000', tag: 'Starter', icon: Gift },
  { amount: '₹5,000', tag: 'Popular', icon: Sparkles },
  { amount: '₹10,000', tag: 'Premium', icon: Crown },
];

const wrappingOptions = [
  {
    name: 'Premium Gold Box',
    description: 'Lustrous gold-finished box with satin ribbon and tissue paper. Our signature presentation.',
    icon: Package,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238f026?w=600',
  },
  {
    name: 'Silver Gift Bag',
    description: 'Elegant silver holographic bag with embossed MIRADEEN logo and organza wrapping.',
    icon: ShoppingBag,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
  },
  {
    name: 'Black Luxury Box',
    description: 'Matte black magnetic-close box with gold foil branding and velvet lining.',
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600',
  },
];

const giftTips = [
  {
    icon: Lightbulb,
    title: 'Consider Their Style',
    description: 'Think about their wardrobe, colors they love, and pieces they reach for most often.',
  },
  {
    icon: Heart,
    title: 'Make It Personal',
    description: 'Add a handwritten note or choose something that reflects a shared memory or inside joke.',
  },
  {
    icon: Clock,
    title: 'Include Gift Receipt',
    description: 'Size matters — always include a gift receipt so they can exchange for the perfect fit.',
  },
  {
    icon: Star,
    title: 'Quality Over Quantity',
    description: 'One luxurious piece they\'ll treasure is far more meaningful than several mediocre items.',
  },
];

// ─── Section wrapper with scroll-triggered animation ──────────────────
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

// Simple intersection observer hook
function useScrollOnView(ref: React.RefObject<HTMLDivElement | null>) {
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isInView;
}

// ─── Need to import React for the hook ────────────────────────────────
import React from 'react';

export default function GiftGuidePage() {
  const navigate = useStore((s) => s.navigate);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — Hero
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[80vh] min-h-[520px] overflow-hidden">
        {/* Parallax background image */}
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1920)',
            }}
          />
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
          style={{ opacity: heroOpacity }}
        >
          {/* Gold diamond decorations */}
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="w-12 h-px bg-gold/60" />
            <span className="w-2 h-2 bg-gold rotate-45" />
            <Gift className="w-5 h-5 text-gold" />
            <span className="w-2 h-2 bg-gold rotate-45" />
            <span className="w-12 h-px bg-gold/60" />
          </motion.div>

          <motion.h1
            className="heading-serif text-shimmer text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            THE ART OF GIFTING
          </motion.h1>

          <motion.p
            className="text-white/80 text-base sm:text-lg md:text-xl max-w-xl tracking-wide"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Curated collections for every occasion
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 flex flex-col items-center gap-2 scroll-indicator cursor-pointer"
            onClick={() =>
              document
                .getElementById('occasions')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="text-white/50 text-xs tracking-[0.2em] uppercase">
              Explore
            </span>
            <ChevronDown className="w-5 h-5 text-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — Occasion Categories
      ═══════════════════════════════════════════════════════════════ */}
      <section id="occasions" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Shop by Occasion
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Find the <span className="text-gold-gradient">Perfect Gift</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Every occasion deserves a thoughtful present. Explore our curated collections.
            </p>
          </AnimatedSection>

          {/* Occasion cards grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {occasions.map((occasion, i) => (
              <motion.div
                key={occasion.name}
                variants={scaleIn}
                custom={i}
                className="group relative h-72 md:h-80 rounded-xl overflow-hidden cursor-pointer card-shine"
                onClick={() => navigate('shop')}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${occasion.image})` }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/60" />

                {/* Gold border glow on hover */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold/30 transition-colors duration-500" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <p className="text-white/70 text-sm mb-1">{occasion.description}</p>
                    <h3 className="heading-serif text-white text-2xl md:text-3xl font-bold mb-4">
                      {occasion.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — Gift by Price Range
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-beige/40 dark:bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                By Budget
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Gift by <span className="text-gold-gradient">Price Range</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Thoughtful gifts for every budget. Luxury starts here.
            </p>
          </AnimatedSection>

          {/* Price tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {priceTiers.map((tier, i) => (
              <AnimatedSection key={tier.label} delay={i * 0.12}>
                <div
                  className={`card-luxury relative rounded-xl border ${tier.borderColor} bg-gradient-to-b ${tier.gradient} p-6 md:p-8 h-full flex flex-col justify-between hover:border-gold/50 transition-colors duration-500`}
                >
                  {/* Tag */}
                  <div>
                    <span
                      className={`inline-block text-xs font-medium tracking-[0.15em] uppercase ${tier.textColor} mb-4`}
                    >
                      {tier.tag}
                    </span>

                    <h3 className="heading-serif text-xl md:text-2xl font-bold mb-3">
                      {tier.label}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate('shop')}
                    className="btn-luxury mt-6 inline-flex items-center gap-2 text-gold text-sm font-medium hover:gap-3 transition-all duration-300 group/btn"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>

                  {/* Visual grandeur indicator — ascending gold line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px">
                    <div
                      className="h-full bg-gradient-to-r from-transparent via-gold to-transparent"
                      style={{ opacity: 0.2 + i * 0.2 }}
                    />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — Gift by Recipient
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                For Everyone
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Gift by <span className="text-gold-gradient">Recipient</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Tailored suggestions for everyone on your list.
            </p>
          </AnimatedSection>

          {/* Recipient sections */}
          <div className="space-y-16 md:space-y-24">
            {recipients.map((recipient, i) => (
              <AnimatedSection key={recipient.title} delay={i * 0.08}>
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center ${
                    recipient.reversed ? 'md:direction-rtl' : ''
                  }`}
                >
                  {/* Image side */}
                  <div
                    className={`relative rounded-xl overflow-hidden img-hover-scale ${
                      recipient.reversed ? 'md:order-2' : ''
                    }`}
                  >
                    <div
                      className="aspect-[4/5] bg-cover bg-center"
                      style={{ backgroundImage: `url(${recipient.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Floating title on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="heading-serif text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
                        {recipient.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content side */}
                  <div
                    className={`${
                      recipient.reversed ? 'md:order-1 md:text-right' : ''
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-3 ${
                        recipient.reversed ? 'md:items-end' : ''
                      }`}
                    >
                      {/* Category chips */}
                      <h4 className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-medium mb-2">
                        Popular Categories
                      </h4>
                      <div
                        className={`flex flex-wrap gap-2 ${
                          recipient.reversed ? 'md:justify-end' : ''
                        }`}
                      >
                        {recipient.categories.map((cat) => (
                          <span
                            key={cat}
                            className="card-shine px-4 py-2 rounded-full border border-gold/20 text-sm font-medium hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 cursor-pointer"
                            onClick={() => navigate('shop')}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* CTA button */}
                      <button
                        onClick={() => navigate('shop')}
                        className="btn-luxury mt-6 inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full text-sm font-medium hover:bg-gold hover:text-black transition-colors duration-500"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Shop All</span>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — Gift Cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-luxury-gradient text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Flexible Gifting
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-shimmer text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              MIRADEEN Gift Cards
            </h2>
            <p className="text-white/60 mt-4 max-w-lg mx-auto">
              Give the gift of choice. Perfect for when you can&apos;t decide.
            </p>
          </AnimatedSection>

          {/* Gift card denominations */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {giftCards.map((card, i) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.amount}
                  variants={scaleIn}
                  custom={i}
                  className="card-luxury glass-card rounded-xl p-8 text-center hover:border-gold/30 transition-all duration-500 group relative"
                >
                  {/* Tag */}
                  {card.tag === 'Popular' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-semibold px-3 py-1 rounded-full tracking-wider uppercase">
                      Most Popular
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 transition-colors duration-500">
                    <IconComp className="w-6 h-6 text-gold" />
                  </div>

                  {/* Amount */}
                  <p className="heading-serif text-3xl md:text-4xl font-bold text-gold-gradient mb-2">
                    {card.amount}
                  </p>
                  <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
                    {card.tag}
                  </p>

                  {/* CTA */}
                  <button className="btn-luxury w-full py-3 rounded-full border border-gold/30 text-gold text-sm font-medium hover:bg-gold hover:text-black transition-all duration-500">
                    Buy Gift Card
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Note */}
          <AnimatedSection className="text-center mt-10" delay={0.5}>
            <p className="text-white/40 text-sm flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Perfect for when you can&apos;t decide
              <Sparkles className="w-3.5 h-3.5 text-gold" />
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — Gift Wrapping Showcase
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Presentation
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              Premium <span className="text-gold-gradient">Gift Wrapping</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Make every gift unforgettable with our signature wrapping options.
            </p>
          </AnimatedSection>

          {/* Wrapping options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {wrappingOptions.map((option, i) => {
              const IconComp = option.icon;
              return (
                <AnimatedSection key={option.name} delay={i * 0.12}>
                  <div className="card-luxury rounded-xl border border-gold/15 overflow-hidden hover:border-gold/40 transition-colors duration-500 group">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden img-hover-scale">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${option.image})` }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                          <IconComp className="w-5 h-5 text-gold" />
                        </div>
                        <h3 className="heading-serif text-lg font-bold">
                          {option.name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Add-on note */}
          <AnimatedSection className="text-center mt-10" delay={0.4}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gold/20 bg-gold/5">
              <Package className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">
                Add to any order for{' '}
                <span className="text-gold font-semibold">₹199</span>
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — Gift Tips
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-beige/40 dark:bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="text-center mb-14">
            <span className="separator-diamond mb-4 inline-flex items-center gap-2">
              <span className="diamond" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
                Pro Tips
              </span>
              <span className="diamond" />
            </span>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-4">
              The Art of <span className="text-gold-gradient">Giving</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Expert advice to help you choose the perfect gift every time.
            </p>
          </AnimatedSection>

          {/* Tips grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftTips.map((tip, i) => {
              const IconComp = tip.icon;
              return (
                <AnimatedSection key={tip.title} delay={i * 0.1}>
                  <div className="card-luxury rounded-xl border border-gold/10 bg-card p-6 md:p-8 text-center h-full hover:border-gold/30 transition-colors duration-500">
                    {/* Icon circle */}
                    <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                      <IconComp className="w-6 h-6 text-gold" />
                    </div>

                    <h3 className="heading-serif text-lg font-bold mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {tip.description}
                    </p>

                    {/* Tip number */}
                    <span className="mt-4 inline-block text-gold/40 heading-serif text-5xl font-bold -mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 — CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-luxury-gradient relative overflow-hidden">
        {/* Decorative particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-gold/20 particle" />
          <div className="absolute top-1/2 left-[30%] w-1.5 h-1.5 rounded-full bg-gold/15 particle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-[20%] w-2.5 h-2.5 rounded-full bg-gold/10 particle" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-[15%] w-1 h-1 rounded-full bg-gold/25 particle" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Question mark icon */}
            <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 animate-pulse-gold">
              <Gift className="w-7 h-7 text-gold" />
            </div>

            <h2 className="heading-serif text-shimmer text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Can&apos;t Decide?
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-md mx-auto mb-10">
              Let us help you find the perfect gift for that special someone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('style-quiz')}
                className="btn-luxury bg-gold text-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-gold-light transition-colors duration-500 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Take Style Quiz
              </button>
              <button
                onClick={() => navigate('contact')}
                className="btn-luxury border border-gold/30 text-gold px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gold/10 transition-colors duration-500 flex items-center gap-2"
              >
                Contact Our Stylists
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
