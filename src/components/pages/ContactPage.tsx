'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MessageCircle, MapPin, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({ title: 'Message sent!', description: 'We will get back to you shortly.' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920" alt="Contact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Get in Touch</p>
          <h1 className="heading-serif text-4xl md:text-5xl font-bold">Contact Us</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div ref={ref} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-4">We&apos;d Love to Hear From You</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">Whether you have a question about our collections, sizing, or anything else, our team is ready to assist you.</p>

            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'merajkhan6188@gmail.com', href: 'mailto:merajkhan6188@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+91 9319084050', href: 'tel:9319084050' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+91 7683041486', href: 'https://wa.me/7683041486' },
                { icon: MapPin, label: 'Address', value: 'India', href: '#' },
                { icon: Clock, label: 'Business Hours', value: 'Mon - Sat: 10:00 AM - 8:00 PM', href: '#' },
              ].map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wider uppercase text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium group-hover:text-gold transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 md:p-8 border border-border rounded-lg bg-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" required />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 min-h-[120px]" required placeholder="How can we help you?" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury">
                {loading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
