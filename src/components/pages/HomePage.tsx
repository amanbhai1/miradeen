'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight,
  Truck, Shield, RefreshCw, Headphones, Instagram, Send, Loader2, Sparkles,
  Eye, GitCompareArrows
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

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

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { navigate, addToCart, toggleWishlist, wishlistIds, setQuickViewProductId, toggleCompare, compareIds } = useStore();
  const images = parseJsonField<string>(product.images);
  return (
    <AnimatedSection delay={index * 0.08}>
      <div className="product-card group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border" onClick={() => navigate('product', product.id)}>
        <div className="relative aspect-[3/4] img-zoom">
          <img
            src={images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNewArrival && <Badge className="bg-gold text-background text-[9px] px-1.5 py-0">New</Badge>}
            {product.isBestseller && <Badge className="bg-foreground text-primary-foreground text-[9px] px-1.5 py-0">Bestseller</Badge>}
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
              className="w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
            >
              <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
              className={`w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center transition-colors ${compareIds.includes(product.id) ? 'bg-gold text-background' : 'hover:bg-gold hover:text-background'}`}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProductId(product.id);
              }}
              size="sm"
              className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
            >
              <Eye className="h-3 w-3 mr-0.5" /> Quick View
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const sizes = parseJsonField<string>(product.sizes);
                addToCart(product, 1, sizes[0]);
              }}
              size="sm"
              className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
            >
              <ShoppingBag className="h-3 w-3 mr-0.5" /> Add to Cart
            </Button>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{product.category?.name}</p>
          <h3 className="text-sm font-medium truncate group-hover:text-gold transition-colors">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function HomePage() {
  const { navigate } = useStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop' },
    { name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The quality is beyond anything I\'ve experienced. MIRADEEN has set a new standard for luxury fashion in India. Every piece feels like it was made just for me.' },
    { name: 'Arjun Mehta', location: 'Delhi', rating: 5, text: 'From the packaging to the fabric quality, everything screams premium. The Sovereign Blazer is now my go-to for every important occasion.' },
    { name: 'Ananya Patel', location: 'Bangalore', rating: 5, text: 'I\'ve been a loyal customer for over a year. The craftsmanship is consistently exceptional. MIRADEEN truly redefines luxury fashion.' },
  ];

  const instagramImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹2,000' },
    { icon: Shield, title: 'Secure Payment', desc: 'PayPal & SSL secured' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'WhatsApp & email' },
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
      {/* Hero Section */}
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

      {/* Features Bar */}
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

      {/* Categories */}
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

      {/* Featured Products */}
      <section className="py-20 bg-cream dark:bg-card/50">
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
                <ProductCard key={product.id} product={product} index={i} />
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

      {/* Parallax Banner */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920"
            alt="Luxury"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
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

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Testimonials</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">What Our Clients Say</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="max-w-2xl mx-auto">
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

      {/* Instagram Gallery */}
      <section className="py-20 bg-cream dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Instagram className="h-6 w-6 text-gold mx-auto mb-3" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Follow Us</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-3">@MIRADEEN</h2>
            <div className="divider-gold w-20 mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            {instagramImages.map((img, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="group relative aspect-square overflow-hidden cursor-pointer">
                  <img src={img} alt={`Instagram ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-cream dark:bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Happy Customers', sublabel: 'and counting' },
              { number: '500+', label: 'Products', sublabel: 'curated collection' },
              { number: '4.9★', label: 'Average Rating', sublabel: 'from 10K+ reviews' },
              { number: '30+', label: 'Countries', sublabel: 'worldwide delivery' },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="heading-serif text-2xl md:text-3xl font-bold text-gold mb-1">{stat.number}</p>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <div className="w-12 h-px bg-gold mx-auto mb-6" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Limited Time Offer</p>
            <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Join the MIRADEEN family and enjoy exclusive savings on your first purchase. Use code{' '}
              <span className="font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">MIRADEEN20</span>{' '}
              at checkout
            </p>
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
