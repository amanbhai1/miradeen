'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  Clock,
  Paperclip,
  Star,
  ShieldCheck,
  Globe,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

// ─── Animation Variants ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Types ─────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

// ─── Data ──────────────────────────────────────────────────────────────
const contactCards = [
  {
    icon: Mail,
    label: 'Email',
    value: 'merajkhan6188@gmail.com',
    href: 'mailto:merajkhan6188@gmail.com',
    subtext: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 9319084050',
    href: 'tel:9319084050',
    subtext: 'Call us directly',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat Now',
    href: 'https://wa.me/7683041486',
    subtext: '+91 7683041486',
    isButton: true,
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'India',
    href: '#',
    subtext: 'Visit our headquarters',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon–Sat 10AM–8PM',
    href: '#',
    subtext: 'Closed on Sundays',
  },
];

const subjectOptions = [
  'General Inquiry',
  'Order Issue',
  'Product Question',
  'Return/Exchange',
  'Partnership',
  'Other',
];

const faqItems = [
  {
    q: 'What is your return policy?',
    a: 'We offer free returns within 30 days of delivery. Items must be unused, unwashed, and in their original packaging with all tags attached. Simply initiate a return from your Orders page or contact our support team for assistance. Refunds are processed within 5–7 business days after we receive the item.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard delivery takes 5–7 business days across India. Express delivery is available in 2–3 business days for select pin codes. International shipping to 30+ countries takes 7–14 business days. You will receive tracking details via email and SMS once your order ships.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, we ship to 30+ countries worldwide including the US, UK, UAE, Singapore, Australia, and many more. International shipping rates and delivery times vary by destination. All duties and taxes are calculated at checkout for a seamless experience.',
  },
  {
    q: 'How can I track my order?',
    a: 'Use our Order Tracking page accessible from the footer or your account dashboard. Enter your order number or log in to see real-time status updates. You will also receive email and SMS notifications at every stage — from dispatch to delivery.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept a wide range of payment methods including PayPal, Visa, Mastercard, American Express, UPI (GPay, PhonePe, Paytm), RuPay, and net banking. All transactions are secured with 256-bit SSL encryption for your safety.',
  },
  {
    q: 'How do I care for my MIRADEEN garments?',
    a: 'Please refer to the care label attached to each garment for specific instructions. As a general rule, we recommend gentle hand wash or dry cleaning for premium fabrics. Store garments in a cool, dry place and avoid direct sunlight for extended periods. For silk and delicate items, always dry clean.',
  },
];

const socialProof = [
  {
    icon: Star,
    stat: '4.9/5',
    label: 'from 10,000+ reviews',
    stars: true,
  },
  {
    icon: ShieldCheck,
    stat: '98%',
    label: 'of customers recommend MIRADEEN',
    stars: false,
  },
  {
    icon: Globe,
    stat: '50,000+',
    label: 'happy customers worldwide',
    stars: false,
  },
];

// ─── Component ─────────────────────────────────────────────────────────
export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    priority: 'medium',
    message: '',
  });

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const formSectionRef = useRef(null);
  const faqRef = useRef(null);
  const proofRef = useRef(null);
  const mapRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true, margin: '-50px' });
  const formInView = useInView(formSectionRef, { once: true, margin: '-50px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-50px' });
  const proofInView = useInView(proofRef, { once: true, margin: '-50px' });
  const mapInView = useInView(mapRef, { once: true, margin: '-50px' });

  // ─── Validation ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── File Attachment (visual only) ────────────────────────────────
  const handleFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setFileName(file.name);
    };
    input.click();
  };

  // ─── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({
        title: 'Message sent!',
        description: 'We will get back to you shortly.',
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        priority: 'medium',
        message: '',
      });
      setFileName(null);
      setErrors({});
    } catch {
      toast({
        title: 'Failed to send',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* ═══════════ 1. ENHANCED HERO ═══════════ */}
      <section
        ref={heroRef}
        className="relative h-72 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Contact MIRADEEN"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70" />
        {/* Gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <motion.div
          className="relative z-10 text-center text-white px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-gold-light mb-3">
            Get in Touch
          </p>
          <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="max-w-xl mx-auto text-white/70 text-sm sm:text-base leading-relaxed">
            We&apos;re here to help with any questions about our collections, orders,
            or anything else. Reach out to us anytime.
          </p>
        </motion.div>
      </section>

      {/* ═══════════ 2. CONTACT INFO CARDS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          ref={cardsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={cardsInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="divider-gold w-24 mx-auto mb-6" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Reach Out Anytime
            </p>
            <h2 className="heading-serif text-3xl sm:text-4xl font-bold mb-4">
              How Can We Help?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you have a question about our collections, sizing, or anything
              else, our team is ready to assist you.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={cardsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {contactCards.map((card, i) => (
            <motion.a
              key={card.label}
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              variants={fadeUp}
              custom={i}
              className="card-luxury group relative flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                <card.icon className="h-5 w-5 text-gold" />
              </div>

              {/* Label */}
              <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                {card.label}
              </p>

              {/* Value */}
              <p className="text-sm font-semibold group-hover:text-gold transition-colors mb-1">
                {card.value}
              </p>

              {/* Subtext */}
              <p className="text-xs text-muted-foreground">{card.subtext}</p>

              {/* WhatsApp button overlay */}
              {card.isButton && (
                <span className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-green-700 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat Now
                </span>
              )}
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ 3. ENHANCED CONTACT FORM ═══════════ */}
      <section className="bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Left Column: Info */}
            <motion.div
              ref={formSectionRef}
              initial={{ opacity: 0, x: -30 }}
              animate={formInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-2 flex flex-col justify-center"
            >
              <div className="divider-gold w-24 mb-6" />
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
                Send Us a Message
              </p>
              <h2 className="heading-serif text-3xl sm:text-4xl font-bold mb-4">
                Let&apos;s Start a Conversation
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Fill out the form and our team will get back to you as soon as
                possible. We typically respond within 24 hours.
              </p>

              {/* Quick contact shortcuts */}
              <div className="space-y-4">
                <a
                  href="mailto:merajkhan6188@gmail.com"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Mail className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email us directly</p>
                    <p className="text-sm font-medium group-hover:text-gold transition-colors">
                      merajkhan6188@gmail.com
                    </p>
                  </div>
                </a>
                <a href="tel:9319084050" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Phone className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Call us</p>
                    <p className="text-sm font-medium group-hover:text-gold transition-colors">
                      +91 9319084050
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={formInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="lg:col-span-3"
            >
              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 md:p-10 rounded-xl border border-border bg-card shadow-sm"
              >
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <Label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <Label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer ${
                          errors.subject ? 'border-destructive' : ''
                        }`}
                      >
                        <option value="" disabled>
                          Select a subject...
                        </option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* Priority Selector */}
                <div className="mb-5">
                  <Label className="mb-2.5 block text-sm font-medium">Priority</Label>
                  <div className="flex flex-wrap gap-3">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <label
                        key={level}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition-all duration-200 ${
                          form.priority === level
                            ? level === 'high'
                              ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
                              : level === 'medium'
                                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                                : 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400'
                            : 'border-border bg-background text-muted-foreground hover:border-gold/30 hover:text-gold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={form.priority === level}
                          onChange={() => updateField('priority', level)}
                          className="sr-only"
                        />
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            form.priority === level ? 'border-current' : 'border-muted-foreground/40'
                          } flex items-center justify-center`}
                        >
                          {form.priority === level && (
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <span className="capitalize font-medium">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-5">
                  <Label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className={`min-h-[130px] resize-y ${
                      errors.message ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* File Attachment (visual only) */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleFileClick}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors group"
                  >
                    <Paperclip className="h-4 w-4 group-hover:rotate-45 transition-transform" />
                    <span>Attach a file</span>
                    <span className="text-xs text-muted-foreground/60">
                      (PDF, JPG, PNG)
                    </span>
                  </button>
                  {fileName && (
                    <p className="mt-1.5 text-xs text-gold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {fileName}
                    </p>
                  )}
                </div>

                {/* Response time note */}
                <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-gold/5 border border-gold/10">
                  <Clock className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-gold font-medium">Estimated response time:</span>{' '}
                    We typically respond within 24 hours. For urgent matters, please
                    call us directly.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 4. FAQ ACCORDION ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          ref={faqRef}
          initial={{ opacity: 0, y: 30 }}
          animate={faqInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <div className="divider-gold w-24 mx-auto mb-6" />
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Common Questions
          </p>
          <h2 className="heading-serif text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find quick answers to the most common questions about our products,
            shipping, and services.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={faqInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 data-[state=open]:border-gold/30 data-[state=open]:bg-gold/5 transition-colors"
              >
                <AccordionTrigger className="text-sm sm:text-base font-semibold hover:no-underline hover:text-gold transition-colors py-5 [&[data-state=open]>svg]:text-gold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* ═══════════ 5. SOCIAL PROOF ═══════════ */}
      <section className="bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div
            ref={proofRef}
            variants={staggerContainer}
            initial="hidden"
            animate={proofInView ? 'visible' : 'hidden'}
            className="text-center mb-10"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="divider-gold w-24 mx-auto mb-6" />
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
                Trusted by Thousands
              </p>
              <h2 className="heading-serif text-3xl sm:text-4xl font-bold">
                Customer Satisfaction
              </h2>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={proofInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {socialProof.map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i}
                className="card-luxury text-center p-8 rounded-xl border border-border bg-card"
              >
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>

                {item.stars && (
                  <div className="flex items-center justify-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-gold text-gold"
                      />
                    ))}
                  </div>
                )}

                <p className="heading-serif text-3xl font-bold text-gold mb-2">
                  {item.stat}
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 6. GOOGLE MAPS PLACEHOLDER ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, y: 30 }}
          animate={mapInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <div className="divider-gold w-24 mx-auto mb-6" />
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Our Location
          </p>
          <h2 className="heading-serif text-3xl sm:text-4xl font-bold mb-4">
            Visit Us
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={mapInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="relative rounded-xl overflow-hidden border border-border bg-card"
        >
          {/* Map-like background */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-beige via-cream to-muted flex items-center justify-center">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Decorative circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-gold/20 animate-pulse" />
              <div className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full border border-gold/15" />
            </div>

            {/* Map pin */}
            <div className="relative z-10 text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 rounded-full bg-gold/10 animate-ping" />
                <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-gold" />
                </div>
              </div>
              <h3 className="heading-serif text-2xl sm:text-3xl font-bold mb-1">
                India
              </h3>
              <p className="text-sm text-muted-foreground">
                MIRADEEN Headquarters
              </p>
              <Badge
                variant="outline"
                className="mt-3 border-gold/30 text-gold text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Based in India
              </Badge>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 bg-card border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium">MIRADEEN</p>
                <p className="text-xs text-muted-foreground">India</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Mon–Sat 10AM–8PM IST</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
