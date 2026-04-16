'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useStore } from '@/store/useStore';

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const { navigate } = useStore();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920" alt="About" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Our Journey</p>
          <h1 className="heading-serif text-4xl md:text-5xl font-bold">About MIRADEEN</h1>
        </div>
      </section>

      {/* Story */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">The Beginning</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Our Story</h2>
            <div className="divider-gold w-20 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800" alt="Craftsmanship" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Born from a passion for <span className="text-foreground font-medium">fluid fabric</span> and <span className="text-foreground font-medium">artistic craftsmanship</span>, MIRADEEN represents the pinnacle of luxury fashion. Our journey began with a simple vision — to create clothing that moves like silk, feels like a second skin, and tells a story of uncompromising quality.</p>
              <p>Every stitch, every fabric choice, every design element is a testament to our commitment to excellence. We believe that true luxury lies in the details — the hand-finished seams, the carefully sourced materials, the hours of artisan craftsmanship that go into each piece.</p>
              <p>Our collections draw inspiration from the flowing movements of silk, the precision of architectural design, and the timeless beauty of artistic expression. Each garment is not just clothing — it&apos;s a wearable work of art.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="py-20 bg-cream dark:bg-card/50" delay={0.2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">What We Stand For</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">Our Values</h2>
            <div className="divider-gold w-20 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Artisan Craftsmanship', desc: 'Every piece is handcrafted by skilled artisans who pour their expertise and passion into every stitch, ensuring unmatched quality.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400' },
              { title: 'Premium Materials', desc: 'We source only the finest fabrics from around the world — Italian wool, Mongolian cashmere, Indian silk — because quality starts with the material.', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400' },
              { title: 'Timeless Design', desc: 'Our designs transcend seasonal trends. We create pieces that remain relevant and beautiful, becoming enduring additions to your wardrobe.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400' },
            ].map((value, i) => (
              <Section key={value.title} delay={i * 0.15}>
                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <img src={value.image} alt={value.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="heading-serif text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </Section>
            ))}
          </div>
        </div>
      </Section>

      {/* Mission */}
      <Section className="py-20" delay={0.3}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Our Mission</p>
          <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-6">&ldquo;To craft garments that transcend trends, blending timeless elegance with contemporary design.&rdquo;</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            At MIRADEEN, we believe that luxury is not about logos or labels — it&apos;s about the feeling you get when you wear something truly extraordinary. Our mission is to make that feeling accessible to those who appreciate the finer things in life.
          </p>
          <button onClick={() => navigate('shop')} className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 tracking-[0.15em] uppercase text-xs font-semibold">
            Explore Our Collection
          </button>
        </div>
      </Section>
    </div>
  );
}
