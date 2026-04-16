'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  Scissors,
  Gem,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Linkedin,
  Twitter,
  Leaf,
  Recycle,
  Handshake,
  ArrowRight,
  Sparkles,
  Package,
  Ruler,
  CheckCircle2,
  Heart,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Reusable animated section wrapper
   ──────────────────────────────────────────── */
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
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Counter hook — animates 0 → target
   ──────────────────────────────────────────── */
function useCountUp(target: number, duration = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(easeOutExpo(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ────────────────────────────────────────────
   Section heading helper
   ──────────────────────────────────────────── */
function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">{eyebrow}</p>
      <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold">{title}</h2>
      <div className="divider-gold w-20 mx-auto mt-4" />
    </div>
  );
}

/* ────────────────────────────────────────────
   Diamond decorative element
   ──────────────────────────────────────────── */
function Diamond({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-3 h-3 bg-gold rotate-45 opacity-40 ${className}`}
      aria-hidden="true"
    />
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function AboutPage() {
  const { navigate } = useStore();
  const [storyExpanded, setStoryExpanded] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ── 1. HERO SECTION ─────────────────── */}
      <HeroSection />

      {/* ── 2. BRAND STORY SECTION ──────────── */}
      <BrandStorySection expanded={storyExpanded} setExpanded={setStoryExpanded} />

      {/* ── 3. BRAND STATS SECTION ──────────── */}
      <BrandStatsSection />

      {/* ── 4. VALUES SECTION ───────────────── */}
      <ValuesSection />

      {/* ── 5. MEET THE TEAM ────────────────── */}
      <TeamSection />

      {/* ── 6. OUR PROCESS ──────────────────── */}
      <ProcessSection />

      {/* ── 7. SUSTAINABILITY ───────────────── */}
      <SustainabilitySection />

      {/* ── 8. PRESS & MEDIA ────────────────── */}
      <PressSection />

      {/* ── 9. MISSION ──────────────────────── */}
      <MissionSection />

      {/* ── 10. CTA SECTION ─────────────────── */}
      <CTASection navigate={navigate} />
    </div>
  );
}

/* ════════════════════════════════════════════
   1. HERO SECTION
   ════════════════════════════════════════════ */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y: bgY }}>
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="MIRADEEN luxury boutique"
          className="w-full h-[120%] object-cover"
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Diamond decorative elements */}
      <Diamond className="absolute top-[20%] left-[15%] w-4 h-4 opacity-30" />
      <Diamond className="absolute top-[30%] right-[12%] w-5 h-5 opacity-25" />
      <Diamond className="absolute bottom-[35%] left-[25%] w-3 h-3 opacity-35" />
      <Diamond className="absolute top-[45%] left-[8%] w-2 h-2 opacity-20" />
      <Diamond className="absolute bottom-[25%] right-[20%] w-4 h-4 opacity-30" />
      <Diamond className="absolute top-[15%] right-[30%] w-3 h-3 opacity-20" />
      <Diamond className="absolute bottom-[45%] left-[40%] w-2 h-2 opacity-25" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-gold-light mb-4"
        >
          Our Journey
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="heading-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
        >
          About <span className="text-gold-gradient">MIRADEEN</span>
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="divider-gold w-24 mx-auto mb-6 origin-left"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed"
        >
          Crafting timeless luxury since 2020 — where artisan craftsmanship meets contemporary elegance.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 border border-white/40 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════
   2. BRAND STORY SECTION
   ════════════════════════════════════════════ */
function BrandStorySection({
  expanded,
  setExpanded,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: '-80px' });

  const milestones = [
    { year: '2020', title: 'Founded', desc: 'MIRADEEN was born from a vision to redefine luxury fashion with accessible artistry.' },
    { year: '2021', title: 'First Collection', desc: 'Launched our debut silk collection, earning acclaim from fashion connoisseurs worldwide.' },
    { year: '2022', title: '10K Customers', desc: 'Reached our first 10,000 happy customers across India and the Middle East.' },
    { year: '2023', title: 'Global Expansion', desc: 'Expanded to 30+ countries, partnering with premium boutiques and retailers.' },
    { year: '2024', title: '50K+ Family', desc: 'Crossed 50,000 customers with 500+ curated products in our collection.' },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading eyebrow="The Beginning" title="Our Story" />
        </AnimatedSection>

        {/* Side-by-side image + text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
          <AnimatedSection delay={0.1}>
            <div className="aspect-[4/5] rounded-lg overflow-hidden img-hover-scale">
              <img
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80"
                alt="MIRADEEN craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Born from a passion for{' '}
                <span className="text-foreground font-medium">fluid fabric</span> and{' '}
                <span className="text-foreground font-medium">artistic craftsmanship</span>, MIRADEEN
                represents the pinnacle of luxury fashion. Our journey began with a simple vision — to
                create clothing that moves like silk, feels like a second skin, and tells a story of
                uncompromising quality.
              </p>
              <p>
                Every stitch, every fabric choice, every design element is a testament to our commitment
                to excellence. We believe that true luxury lies in the details — the hand-finished seams,
                the carefully sourced materials, the hours of artisan craftsmanship that go into each
                piece.
              </p>

              {/* Expandable paragraph */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pt-2">
                      Our collections draw inspiration from the flowing movements of silk, the precision
                      of architectural design, and the timeless beauty of artistic expression. Each
                      garment is not just clothing — it&apos;s a wearable work of art that embodies the
                      spirit of modern luxury.
                    </p>
                    <p className="pt-2">
                      From our atelier in the heart of India, we work with master artisans who have
                      honed their craft over generations. Their expertise, combined with contemporary
                      design sensibilities, creates pieces that are both rooted in tradition and
                      forward-thinking in their appeal. We source the finest Italian wool, Mongolian
                      cashmere, and Indian silk to ensure every MIRADEEN piece meets the highest
                      standards of quality.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-gold hover:text-gold-dark transition-colors text-sm font-medium mt-2"
                aria-expanded={expanded}
              >
                {expanded ? 'Read Less' : 'Read More'}
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </AnimatedSection>
        </div>

        {/* Timeline / Milestones */}
        <AnimatedSection delay={0.1}>
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Our Journey</p>
            <h3 className="heading-serif text-2xl md:text-3xl font-bold">Key Milestones</h3>
          </div>
        </AnimatedSection>

        <div ref={timelineRef} className="relative">
          {/* Vertical gold line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent -translate-x-1/2" />

          <div className="space-y-8 md:space-y-0">
            {milestones.map((milestone, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`md:flex items-center mb-8 md:mb-0 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Text content */}
                  <div
                    className={`md:w-1/2 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}
                  >
                    <div className="bg-card border border-border/50 rounded-lg p-6 card-luxury">
                      <span className="text-gold font-bold text-lg heading-serif">{milestone.year}</span>
                      <h4 className="font-semibold text-lg mt-1 mb-2">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {milestone.desc}
                      </p>
                    </div>
                  </div>

                  {/* Diamond center marker (desktop) */}
                  <div className="hidden md:flex items-center justify-center w-8 shrink-0 relative z-10">
                    <div className="w-4 h-4 bg-gold rotate-45 shadow-lg shadow-gold/20" />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   3. BRAND STATS SECTION
   ════════════════════════════════════════════ */
function BrandStatsSection() {
  const stats = [
    { value: 4, suffix: '+', label: 'Years of Excellence' },
    { value: 50000, suffix: '+', label: 'Happy Customers' },
    { value: 500, suffix: '+', label: 'Curated Products' },
    { value: 30, suffix: '+', label: 'Countries Served' },
  ];

  return (
    <section className="py-20 md:py-24 bg-foreground text-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">By The Numbers</p>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold">
              Our Impact
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  delay,
}: {
  stat: { value: number; suffix: string; label: string };
  delay: number;
}) {
  const { count, ref } = useCountUp(stat.value, 2.5);

  const formatted = stat.value >= 1000
    ? `${(count / 1000).toFixed(count >= stat.value ? 0 : 1)}K`
    : `${count}`;

  return (
    <AnimatedSection delay={delay}>
      <div ref={ref} className="text-center">
        <div className="text-gold text-4xl md:text-5xl lg:text-6xl font-bold heading-serif mb-2 tabular-nums">
          {formatted}
          <span>{stat.suffix}</span>
        </div>
        <p className="text-background/60 text-xs sm:text-sm tracking-[0.1em] uppercase font-medium">
          {stat.label}
        </p>
      </div>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════
   4. VALUES SECTION
   ════════════════════════════════════════════ */
function ValuesSection() {
  const values = [
    {
      title: 'Artisan Craftsmanship',
      desc: 'Every piece is handcrafted by skilled artisans who pour their expertise and passion into every stitch, ensuring unmatched quality.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
      icon: Scissors,
    },
    {
      title: 'Premium Materials',
      desc: 'We source only the finest fabrics — Italian wool, Mongolian cashmere, Indian silk — because quality starts with the material.',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
      icon: Gem,
    },
    {
      title: 'Timeless Design',
      desc: 'Our designs transcend seasonal trends. We create pieces that remain relevant and beautiful, becoming enduring additions to your wardrobe.',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-cream dark:bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <AnimatedSection key={value.title} delay={i * 0.15}>
                <div className="bg-card rounded-lg overflow-hidden border border-border/50 card-luxury group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={value.image}
                      alt={value.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="heading-serif text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   5. MEET THE TEAM
   ════════════════════════════════════════════ */
function TeamSection() {
  const team = [
    {
      name: 'Meraj Khan',
      role: 'Founder & Creative Director',
      bio: 'With over 15 years in luxury fashion, Meraj founded MIRADEEN to bridge the gap between artisanal heritage and modern design. His vision drives every collection.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Design',
      bio: 'A graduate of Parsons School of Design, Priya brings a unique blend of Eastern aesthetics and Western silhouettes. She leads our design team with passion and precision.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
      name: 'Arjun Patel',
      role: 'Operations Director',
      bio: 'Arjun oversees our global supply chain and logistics, ensuring every MIRADEEN piece reaches our customers with the care and attention it deserves.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading eyebrow="The Visionaries" title="Meet the Team" />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <AnimatedSection key={member.name} delay={i * 0.15}>
              <div className="bg-card rounded-lg overflow-hidden border border-border/50 card-luxury group text-center">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Hover overlay with social links */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                    <div className="flex gap-3">
                      <a
                        href="#"
                        aria-label={`${member.name} on LinkedIn`}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold hover:text-white transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href="#"
                        aria-label={`${member.name} on Twitter`}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gold hover:text-white transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="heading-serif text-xl font-bold">{member.name}</h3>
                  <p className="text-gold text-xs tracking-[0.15em] uppercase font-medium mt-1 mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   6. OUR PROCESS
   ════════════════════════════════════════════ */
function ProcessSection() {
  const steps = [
    {
      icon: Sparkles,
      title: 'Design',
      desc: 'Our creative team sketches concepts inspired by global trends, heritage motifs, and modern aesthetics.',
    },
    {
      icon: Package,
      title: 'Material Sourcing',
      desc: 'We travel the world to source premium fabrics — from Italian silk mills to Japanese cotton growers.',
    },
    {
      icon: Scissors,
      title: 'Artisan Craftsmanship',
      desc: 'Master artisans bring designs to life using time-honoured techniques passed down through generations.',
    },
    {
      icon: CheckCircle2,
      title: 'Quality Control',
      desc: 'Every garment undergoes rigorous inspection to ensure it meets our uncompromising quality standards.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-cream dark:bg-card/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading eyebrow="How We Create" title="Our Process" />
        </AnimatedSection>

        <div className="relative">
          {/* Gold connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimatedSection key={step.title} delay={i * 0.15}>
                  <div className="relative text-center group">
                    {/* Step number */}
                    <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-4 font-medium">
                      Step {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Icon circle */}
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-card border-2 border-gold/20 group-hover:border-gold/60 transition-colors duration-500 mb-6 mx-auto">
                      <Icon className="w-8 h-8 text-gold" />
                      {/* Diamond at bottom */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gold rotate-45 border-2 border-cream dark:border-card" />
                    </div>

                    <h3 className="heading-serif text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   7. SUSTAINABILITY
   ════════════════════════════════════════════ */
function SustainabilitySection() {
  const pillars = [
    {
      icon: Handshake,
      title: 'Ethical Sourcing',
      desc: 'We partner exclusively with suppliers who uphold fair labour practices and environmental responsibility. Every material is traceable to its origin.',
    },
    {
      icon: Recycle,
      title: 'Eco-Friendly Packaging',
      desc: 'Our packaging is 100% recyclable and biodegradable. We use soy-based inks and minimal plastic to reduce our environmental footprint.',
    },
    {
      icon: Leaf,
      title: 'Fair Trade',
      desc: 'Every artisan in our supply chain receives fair compensation and works in safe conditions. We invest in community development programs.',
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Earth-toned background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0EDE4] via-[#E8E2D6] to-[#F0EDE4] dark:from-[#1A1F16] dark:via-[#1E2319] dark:to-[#1A1F16]" />

      {/* Subtle leaf pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 20 30 35 Q25 20 30 5Z' fill='%234A6741'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#6B8F5B] mb-3">
              Our Commitment
            </p>
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold">
              Sustainability
            </h2>
            <div className="w-20 mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-[#6B8F5B] to-transparent" />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <AnimatedSection key={pillar.title} delay={i * 0.15}>
                <div className="bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-lg p-8 border border-[#6B8F5B]/15 text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-[#6B8F5B]/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-[#6B8F5B]" />
                  </div>
                  <h3 className="heading-serif text-xl font-bold mb-3 text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   8. PRESS & MEDIA
   ════════════════════════════════════════════ */
function PressSection() {
  const publications = [
    'VOGUE',
    "Harper's BAZAAR",
    'ELLE',
    'GQ',
    'VOGUE',
    "Harper's BAZAAR",
    'ELLE',
    'GQ',
  ];

  return (
    <section className="py-16 md:py-20 bg-card border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground mb-10">
            As Featured In
          </p>
        </AnimatedSection>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10" />

          <div className="flex animate-marquee whitespace-nowrap">
            {publications.map((name, i) => (
              <span
                key={i}
                className="mx-8 md:mx-12 heading-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground/15 hover:text-gold/40 transition-colors duration-500 cursor-default select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   9. MISSION SECTION
   ════════════════════════════════════════════ */
function MissionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Our Mission</p>
          <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-6">
            &ldquo;To craft garments that transcend trends, blending timeless elegance with contemporary
            design.&rdquo;
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            At MIRADEEN, we believe that luxury is not about logos or labels — it&apos;s about the
            feeling you get when you wear something truly extraordinary. Our mission is to make that
            feeling accessible to those who appreciate the finer things in life.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="btn-luxury bg-foreground text-background hover:bg-foreground/90 px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold inline-flex items-center gap-2"
          >
            Explore Our Collection
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   10. CTA SECTION
   ════════════════════════════════════════════ */
function CTASection({ navigate }: { navigate: (page: 'shop' | 'contact') => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-charcoal to-foreground" />

      {/* Decorative elements */}
      <Diamond className="absolute top-[15%] left-[10%] w-3 h-3 opacity-20" />
      <Diamond className="absolute top-[25%] right-[15%] w-4 h-4 opacity-15" />
      <Diamond className="absolute bottom-[20%] left-[30%] w-2 h-2 opacity-25" />
      <Diamond className="absolute bottom-[30%] right-[25%] w-3 h-3 opacity-20" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-center mb-6">
            <Heart className="w-8 h-8 text-gold" />
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Join the <span className="text-gold-gradient">MIRADEEN</span> Family
          </h2>
          <p className="text-white/70 leading-relaxed mb-10 max-w-lg mx-auto">
            Discover curated luxury that speaks to your individuality. Be part of a community that
            celebrates artistry, sustainability, and timeless style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('shop')}
              className="btn-luxury bg-gold text-foreground hover:bg-gold-light px-8 py-3.5 tracking-[0.15em] uppercase text-xs font-semibold w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('contact')}
              className="border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 tracking-[0.15em] uppercase text-xs font-semibold w-full sm:w-auto transition-colors duration-300"
            >
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
