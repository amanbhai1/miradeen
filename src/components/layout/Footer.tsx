'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, Phone, MessageCircle, MapPin, Send, Heart, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import BackToTopButton from '@/components/shared/BackToTopButton';

export default function Footer() {
  const { navigate } = useStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
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
          title: data.message === 'Already subscribed' ? 'You\'re already subscribed!' : 'Welcome to MIRADEEN!',
          description: data.message === 'Already subscribed'
            ? 'You\'ll continue receiving our exclusive updates.'
            : 'Thank you for subscribing! Check your inbox for a welcome surprise.',
        });
        setTimeout(() => setSubscribed(false), 5000);
      }
    } catch {
      toast({ title: 'Failed to subscribe', description: 'Please try again later.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <footer className="bg-foreground text-primary-foreground mt-auto">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="heading-serif text-2xl md:text-3xl font-bold mb-2">Join The MIRADEEN World</h3>
              <p className="text-primary-foreground/60 text-sm">Subscribe for exclusive access to new collections and special offers</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-12 w-full md:w-72 focus:border-gold"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className={`h-12 px-6 tracking-wider uppercase text-xs font-semibold whitespace-nowrap transition-all duration-300 min-w-[120px] ${
                  subscribed
                    ? 'bg-green-600 text-white hover:bg-green-600'
                    : 'bg-gold text-background hover:bg-gold-dark'
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : subscribed ? (
                  '✓ Subscribed'
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Subscribe</>
                )}
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
            <button onClick={() => navigate('home')} className="heading-serif text-2xl font-bold tracking-[0.15em] mb-4 block hover:text-gold transition-colors">
              MIRADEEN
            </button>
            <p className="text-primary-foreground/50 text-sm leading-relaxed mb-6">
              Redefining Luxury Fashion — Where fluid fabric meets artistic craftsmanship. Every piece tells a story of uncompromising quality.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/miradeen' },
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300"
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
                { label: 'Shop All', page: 'shop' },
                { label: 'New Arrivals', page: 'shop' },
                { label: 'Bestsellers', page: 'shop' },
                { label: 'About Us', page: 'about' },
                { label: 'Contact Us', page: 'contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page as 'shop' | 'about' | 'contact')}
                    className="text-sm text-primary-foreground/50 hover:text-gold hover:pl-1 transition-all duration-200"
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
              {[
                { label: 'Track Order', page: 'order-tracking' },
                { label: 'Shipping & Delivery', page: 'contact' },
                { label: 'Returns & Exchanges', page: 'contact' },
                { label: 'Size Guide', page: 'shop' },
                { label: 'FAQ', page: 'contact' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page as 'contact' | 'about' | 'order-tracking' | 'shop')}
                    className="text-sm text-primary-foreground/50 hover:text-gold hover:pl-1 transition-all duration-200"
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
              {[
                { icon: Mail, href: 'mailto:merajkhan6188@gmail.com', value: 'merajkhan6188@gmail.com' },
                { icon: Phone, href: 'tel:9319084050', value: '+91 9319084050' },
                { icon: MessageCircle, href: 'https://wa.me/7683041486', value: '+91 7683041486' },
                { icon: MapPin, href: '#', value: 'India' },
              ].map(({ icon: Icon, href, value }) => (
                <li key={value} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <a href={href} className="text-sm text-primary-foreground/50 hover:text-gold transition-colors">
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/40 flex items-center gap-1">
            © {new Date().getFullYear()} MIRADEEN. Crafted with <Heart className="h-3 w-3 text-gold inline" /> in India.
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

      <BackToTopButton />
    </footer>
  );
}
