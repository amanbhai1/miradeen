'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, Phone, MessageCircle, MapPin, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const { navigate } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-foreground text-primary-foreground mt-auto">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="heading-serif text-2xl md:text-3xl font-bold mb-2">Join The MIRADEEN World</h3>
              <p className="text-primary-foreground/60 text-sm">Subscribe for exclusive access to new collections and special offers</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-12 w-full md:w-72"
                required
              />
              <Button
                type="submit"
                className="bg-gold text-background hover:bg-gold-dark h-12 px-6 tracking-wider uppercase text-xs font-semibold whitespace-nowrap"
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <button onClick={() => navigate('home')} className="heading-serif text-2xl font-bold tracking-[0.15em] mb-4 block">
              MIRADEEN
            </button>
            <p className="text-primary-foreground/50 text-sm leading-relaxed mb-6">
              Redefining Luxury Fashion — Where fluid fabric meets artistic craftsmanship. Every piece tells a story of uncompromising quality.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-5 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop', page: 'shop' },
                { label: 'New Arrivals', page: 'shop' },
                { label: 'Bestsellers', page: 'shop' },
                { label: 'About', page: 'about' },
                { label: 'Contact', page: 'contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page as any)}
                    className="text-sm text-primary-foreground/50 hover:text-gold transition-colors"
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
              {['Shipping & Delivery', 'Returns & Exchanges', 'FAQ', 'Size Guide', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-primary-foreground/50 hover:text-gold transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-5 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <a href="mailto:merajkhan6188@gmail.com" className="text-sm text-primary-foreground/50 hover:text-gold transition-colors">
                  merajkhan6188@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <a href="tel:9319084050" className="text-sm text-primary-foreground/50 hover:text-gold transition-colors">
                  +91 9319084050
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <a href="https://wa.me/7683041486" className="text-sm text-primary-foreground/50 hover:text-gold transition-colors">
                  +91 7683041486
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} MIRADEEN. All rights reserved. Crafted with passion.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-primary-foreground/40">Secure Payments</span>
            <div className="flex gap-2">
              {['PayPal', 'Visa', 'MC'].map((method) => (
                <span key={method} className="px-2 py-1 border border-primary-foreground/20 rounded text-[10px] text-primary-foreground/40">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 bg-gold text-background rounded-full flex items-center justify-center shadow-lg hover:bg-gold-dark transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="h-4 w-4" />
      </motion.button>
    </footer>
  );
}
