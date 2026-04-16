'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram, Facebook, Twitter, Mail, Phone, MessageCircle, MapPin, Send, Heart, ArrowUp,
  Shield, ShieldCheck, Truck, RotateCcw, Smartphone, Lock, Globe, ChevronDown,
  Youtube, Linkedin, PinIcon, Gem, BadgeCheck, Award, Sparkles, Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import BackToTopButton from '@/components/shared/BackToTopButton';

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons for App Stores & Payment Methods                  */
/* ------------------------------------------------------------------ */

function AppleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.18 23.38c-.36-.2-.58-.58-.58-1.02V1.64c0-.44.22-.82.58-1.02l10.76 11.38L3.18 23.38zm13.14-10.46L4.8 1.16l12.52 6.66-1 5.1zM4.8 22.84l11.52-11.76 1 5.1-12.52 6.66zm15.46-6.47l-2.56-1.36.06-.01-2.44-1.3 1.7-3.42 3.24 1.72c.86.46 1.2 1.1 1.2 1.7 0 .6-.34 1.24-1.2 1.67z" />
    </svg>
  );
}

/* Payment method SVGs – small brand logos rendered inline */
function VisaIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="white" />
      <path d="M17.6 21H14.4L16.2 11h3.2L17.6 21zm8-9.6c-.6-.2-1.6-.5-2.8-.5-3 0-5.2 1.6-5.2 3.8 0 1.7 1.5 2.6 2.7 3.1 1.2.6 1.6.9 1.6 1.4 0 .8-.9 1.1-1.8 1.1-1.2 0-1.8-.2-2.8-.6l-.4-.2-.4 2.5c.7.3 2 .6 3.4.6 3.2 0 5.3-1.5 5.3-3.9 0-1.3-.8-2.3-2.6-3.1-1.1-.5-1.7-.9-1.7-1.4 0-.5.5-1 1.7-1 1 0 1.7.2 2.2.4l.3.1.5-2.3zm8.2 0h-2.5c-.8 0-1.4.2-1.7 1L24.2 21h3.4l.7-1.9h4l.4 1.9H36l-2.2-9.6zm-3.5 5.8l1.2-3.2.3-.8.3.7.7 3.3h-2.5zm-15.6-5.8L11.4 18l-.3-1.7c-.6-2-2.4-4.1-4.4-5.2L10.4 21h3.4l5.1-9.6h-3.2z" fill="#1A1F71" />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="white" />
      <circle cx="19" cy="16" r="7" fill="#EB001B" />
      <circle cx="29" cy="16" r="7" fill="#F79E1B" />
      <path d="M24 10.5a7 7 0 010 11" fill="#FF5F00" />
      <path d="M24 10.5a7 7 0 000 11" fill="#FF5F00" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#003087" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">PayPal</text>
    </svg>
  );
}

function UpiIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#5F259F" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">UPI</text>
    </svg>
  );
}

function RuPayIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#00438C" />
      <text x="24" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">RuPay</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  App Download Badge Component                                       */
/* ------------------------------------------------------------------ */

function AppBadge({ platform, icon: Icon }: { platform: 'App Store' | 'Google Play'; icon: typeof AppleIcon }) {
  return (
    <button
      className="flex items-center gap-2.5 px-4 py-2.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-lg hover:bg-primary-foreground/20 hover:border-gold/40 transition-all duration-300 group w-full sm:w-auto"
      aria-label={`Download on ${platform}`}
    >
      <Icon className="h-6 w-6 text-primary-foreground/80 group-hover:text-gold transition-colors shrink-0" />
      <div className="text-left">
        <span className="block text-[10px] leading-tight text-primary-foreground/50 uppercase tracking-wide">Download on the</span>
        <span className="block text-sm font-semibold text-primary-foreground/90 group-hover:text-gold transition-colors leading-tight">
          {platform}
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Badge Component                                              */
/* ------------------------------------------------------------------ */

function TrustBadge({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-primary-foreground/5 border border-primary-foreground/10">
      <Icon className="h-4 w-4 text-gold shrink-0" />
      <span className="text-xs text-primary-foreground/60 whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Footer Component                                              */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const { navigate } = useStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  /* Scroll progress for the gold indicator line */
  const handleScroll = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setScrollProgress(Math.min((window.scrollY / docHeight) * 100, 100));
    }
  }, []);

  useEffect(() => {
    const onScroll = () => handleScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    if (!isValidEmail(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address (e.g., name@example.com).', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.subscribed) {
        setSubscribed(true);
        setEmail('');
        toast({
          title: 'Thank you for subscribing! ✨',
          description: data.message === 'Already subscribed'
            ? 'You\'re already part of the MIRADEEN family. Stay tuned for updates!'
            : 'Welcome to the MIRADEEN family! Check your inbox for exclusive offers.',
        });
        setTimeout(() => setSubscribed(false), 6000);
      } else {
        toast({ title: 'Subscription failed', description: data.message || 'Something went wrong. Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to subscribe', description: 'A network error occurred. Please try again later.', variant: 'destructive' });
    }
    setLoading(false);
  };

  /* Data arrays */
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/miradeen' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: PinIcon, label: 'Pinterest', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
  ];

  const quickLinks = [
    { label: 'Shop All', page: 'shop' },
    { label: 'New Arrivals', page: 'shop' },
    { label: 'Collections', page: 'collections' },
    { label: 'Sale', page: 'sale' },
    { label: 'Bestsellers', page: 'shop' },
    { label: 'Gift Guide', page: 'gift-guide' },
    { label: 'Lookbook', page: 'lookbook' },
    { label: 'Style Quiz', page: 'style-quiz' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact Us', page: 'contact' },
  ];

  const customerServiceLinks = [
    { label: 'Track Order', page: 'order-tracking' },
    { label: 'Shipping & Delivery', page: 'contact' },
    { label: 'Returns & Exchanges', page: 'contact' },
    { label: 'Size Guide', page: 'shop' },
    { label: 'FAQ', page: 'contact' },
  ];

  const contactInfo = [
    { icon: Mail, href: 'mailto:merajkhan6188@gmail.com', value: 'merajkhan6188@gmail.com' },
    { icon: Phone, href: 'tel:9319084050', value: '+91 9319084050' },
    { icon: MessageCircle, href: 'https://wa.me/7683041486', value: '+91 7683041486' },
    { icon: MapPin, href: '#', value: 'India' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: 'SSL Secured' },
    { icon: Shield, label: 'Authentic Products' },
    { icon: Truck, label: 'Free Shipping' },
    { icon: RotateCcw, label: 'Easy Returns' },
    { icon: Smartphone, label: '24/7 Support' },
  ];

  const paymentMethods = [
    { icon: VisaIcon, label: 'Visa' },
    { icon: MastercardIcon, label: 'Mastercard' },
    { icon: AmexIcon, label: 'Amex' },
    { icon: PayPalIcon, label: 'PayPal' },
    { icon: UpiIcon, label: 'UPI' },
    { icon: RuPayIcon, label: 'RuPay' },
  ];

  const ourPromise = [
    { icon: Gem, title: 'Quality', desc: 'Crafted with the finest materials' },
    { icon: BadgeCheck, title: 'Authenticity', desc: 'Every piece is genuine & certified' },
    { icon: Award, title: 'Trust', desc: 'Trusted by thousands worldwide' },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground mt-auto relative">
      {/* ===== Scroll Progress Indicator ===== */}
      <div className="absolute top-0 left-0 w-full h-[2px] z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {/* ===== Newsletter Subscription Section ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="border-b border-primary-foreground/10 relative overflow-hidden"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-luxury-gradient opacity-40" />
        {/* Decorative gold corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-gold/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gold/10 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <Sparkles className="h-4 w-4 text-gold/70" />
            <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          {/* Heading */}
          <h3 className="heading-serif text-gold-gradient text-3xl sm:text-4xl font-bold tracking-wide mb-3">
            JOIN THE MIRADEEN FAMILY
          </h3>
          {/* Subtitle */}
          <p className="text-primary-foreground/50 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Subscribe for exclusive offers, new arrivals, and style inspiration
          </p>

          {/* Email Form */}
          {!subscribed ? (
            <motion.form
              key="form"
              onSubmit={handleSubscribe}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
            >
              <div className="relative w-full">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/30 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-primary-foreground/5 border-gold/30 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-gold focus:ring-1 focus:ring-gold/20 input-luxury rounded-lg transition-all duration-300"
                  required
                  aria-label="Email address for newsletter"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-luxury h-12 px-8 w-full sm:w-auto bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-bold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    SUBSCRIBING…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-3.5 w-3.5" />
                    SUBSCRIBE
                  </span>
                )}
              </Button>
            </motion.form>
          ) : (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              className="flex flex-col items-center gap-3 py-2"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gold/15 border border-gold/30 animate-pulse-gold">
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-7 w-7 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </div>
              <p className="text-gold font-semibold text-base heading-serif">Thank you for subscribing! ✨</p>
              <p className="text-primary-foreground/40 text-xs">You&apos;ll hear from us soon with exclusive updates</p>
            </motion.div>
          )}

          {/* Privacy note */}
          {!subscribed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] text-primary-foreground/30 mt-5 leading-relaxed"
            >
              By subscribing, you agree to our{' '}
              <button onClick={() => navigate('about')} className="underline underline-offset-2 hover:text-gold transition-colors duration-200">
                Privacy Policy
              </button>{' '}
              and consent to receive updates.
            </motion.p>
          )}

          {/* Bottom decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block w-8 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
            <span className="block w-8 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </div>
      </motion.div>

      {/* ===== Our Promise Section ===== */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-gold text-center">Our Promise</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {ourPromise.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-primary-foreground/8 hover:border-gold/25 bg-primary-foreground/[0.02] hover:bg-gold/[0.03] transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-primary-foreground/90 mb-0.5">{title}</h5>
                  <p className="text-xs text-primary-foreground/45 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== App Download Section ===== */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-foreground/90">Download Our App</h4>
                <p className="text-[11px] text-primary-foreground/40">Shop on the go — available now</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <AppBadge platform="App Store" icon={AppleIcon} />
              <AppBadge platform="Google Play" icon={GooglePlayIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Footer ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <button onClick={() => navigate('home')} className="heading-serif text-2xl font-bold tracking-[0.15em] mb-4 block hover:text-gold transition-colors">
              MIRADEEN
            </button>
            <p className="text-primary-foreground/50 text-sm leading-relaxed mb-6">
              Redefining Luxury Fashion — Where fluid fabric meets artistic craftsmanship. Every piece tells a story of uncompromising quality.
            </p>
            {/* Enhanced Social Links with Tooltips */}
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-gold hover:border-gold hover:bg-gold/10 hover:scale-110 hover:ring-2 hover:ring-gold/30 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                  {/* Tooltip */}
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-foreground border border-primary-foreground/15 text-[10px] font-medium text-primary-foreground/80 whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none shadow-lg z-30">
                    Follow us on {label}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground border-r border-b border-primary-foreground/15" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-5 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page as 'shop' | 'about' | 'contact' | 'lookbook' | 'style-quiz')}
                    className="text-sm text-primary-foreground/50 hover:text-gold hover:pl-1 transition-all duration-200 link-underline-gold"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-5 text-gold">Customer Service</h4>
            <ul className="space-y-3">
              {customerServiceLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page as 'contact' | 'about' | 'order-tracking' | 'shop')}
                    className="text-sm text-primary-foreground/50 hover:text-gold hover:pl-1 transition-all duration-200 link-underline-gold"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-5 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map(({ icon: Icon, href, value }) => (
                <li key={value} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <a href={href} className="text-sm text-primary-foreground/50 hover:text-gold transition-colors link-underline-gold">
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Trust Badges Row ===== */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {trustBadges.map((badge) => (
              <TrustBadge key={badge.label} icon={badge.icon} label={badge.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ===== Payment Methods + Secure Badge ===== */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-xl border border-gold/15 bg-gold/[0.03] px-6 py-5">
            <div className="flex flex-col items-center gap-4">
              {/* Secure Payments Heading */}
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-semibold text-gold tracking-wide">100% Secure Payments</h4>
                <Lock className="h-4 w-4 text-gold" />
              </div>
              {/* Payment icons */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="text-xs text-primary-foreground/40 uppercase tracking-wider font-medium shrink-0">We Accept</span>
                <div className="flex gap-2 flex-wrap justify-center">
                  {paymentMethods.map(({ icon: PIcon, label }) => (
                    <div
                      key={label}
                      className="rounded-md overflow-hidden border border-primary-foreground/10 hover:border-gold/40 hover:shadow-[0_0_12px_rgba(201,169,110,0.15)] transition-all duration-300 hover:scale-105"
                      title={label}
                    >
                      <PIcon />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <p className="text-xs text-primary-foreground/40 flex items-center gap-1">
            © {new Date().getFullYear()} MIRADEEN. Crafted with <Heart className="h-3 w-3 text-gold inline" /> in India.
          </p>

          {/* Language / Currency Selectors */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/5 border border-primary-foreground/10 text-xs text-primary-foreground/50 hover:border-gold/30 hover:text-gold transition-all duration-200"
                aria-label="Select language"
              >
                <Globe className="h-3 w-3" />
                <span className="font-medium">{selectedLang}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute bottom-full mb-1 left-0 bg-foreground border border-primary-foreground/15 rounded-md shadow-xl overflow-hidden z-20 min-w-[80px]">
                  {['EN', 'HI'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                      className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        selectedLang === lang
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                      }`}
                    >
                      {lang === 'EN' ? 'English' : 'हिंदी'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/5 border border-primary-foreground/10 text-xs text-primary-foreground/50 hover:border-gold/30 hover:text-gold transition-all duration-200"
                aria-label="Select currency"
              >
                <span className="font-medium">{selectedCurrency}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>
              {currencyOpen && (
                <div className="absolute bottom-full mb-1 left-0 bg-foreground border border-primary-foreground/15 rounded-md shadow-xl overflow-hidden z-20 min-w-[80px]">
                  {['INR', 'USD'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => { setSelectedCurrency(cur); setCurrencyOpen(false); }}
                      className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        selectedCurrency === cur
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                      }`}
                    >
                      {cur === 'INR' ? '₹ INR' : '$ USD'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BackToTopButton />
    </footer>
  );
}
