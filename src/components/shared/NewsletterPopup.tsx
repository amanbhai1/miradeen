'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const POPUP_DELAY_MS = 20_000; // 20 seconds
const SESSION_DISMISSED_KEY = 'miradeen-newsletter-dismissed';
const SUBSCRIBED_KEY = 'miradeen-newsletter';

type PopupState = 'idle' | 'submitting' | 'success' | 'error';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<PopupState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user already subscribed or already dismissed this session
  const shouldShow = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem(SUBSCRIBED_KEY)) return false;
    if (sessionStorage.getItem(SESSION_DISMISSED_KEY)) return false;
    return true;
  }, []);

  // Timer to show popup after POPUP_DELAY_MS
  useEffect(() => {
    if (!shouldShow()) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // Success
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
      setState('success');

      // Auto-close after thank you animation
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.');
      setState('error');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Popup Card */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl p-8 sm:p-10 glass-card border border-gold/20 shadow-luxury-xl"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Close Button */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Decorative Elements */}
            <div className="absolute -top-3 -left-3 w-6 h-6 rotate-45 border border-gold/30 rounded-sm" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rotate-45 border border-gold/30 rounded-sm" />
            <motion.div
              className="absolute top-6 right-6"
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-5 w-5 text-gold/40" />
            </motion.div>
            <motion.div
              className="absolute bottom-6 left-6"
              animate={{ rotate: -360, scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-4 w-4 text-gold/25" />
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {state === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                    className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-5"
                  >
                    <CheckCircle className="h-8 w-8 text-gold" />
                  </motion.div>
                  <h3 className="heading-serif text-2xl font-bold mb-2">
                    <span className="text-gold-gradient">Welcome to the Family!</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for subscribing. Expect exclusive luxury updates in your inbox.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-gold" />
                    </div>
                  </div>

                  {/* Heading */}
                  <h3 className="heading-serif text-2xl sm:text-3xl font-bold text-center mb-2">
                    <span className="text-gold-gradient">Join the MIRADEEN Family</span>
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                    Subscribe to receive exclusive offers, early access to new collections, and styling tips.
                  </p>

                  {/* Gold divider */}
                  <div className="divider-gold mb-6" />

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (state === 'error') {
                            setState('idle');
                            setErrorMessage('');
                          }
                        }}
                        disabled={state === 'submitting'}
                        className="h-12 rounded-lg border border-border bg-background/80 focus-visible:border-gold focus-visible:ring-gold/20 focus-visible:ring-[3px] text-sm placeholder:text-muted-foreground/70"
                        aria-label="Email address"
                      />
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {state === 'error' && errorMessage && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-destructive flex items-center gap-1.5"
                        >
                          <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
                          {errorMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={state === 'submitting'}
                      className="w-full h-12 bg-gold text-background hover:bg-gold-dark font-semibold tracking-wider uppercase text-sm rounded-lg btn-luxury disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {state === 'submitting' ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Subscribing...
                        </span>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </form>

                  {/* Dismiss Link */}
                  <button
                    onClick={dismiss}
                    className="block w-full text-center mt-4 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    No thanks, maybe later
                  </button>

                  {/* Privacy Note */}
                  <p className="text-center text-[10px] text-muted-foreground/60 mt-3 flex items-center justify-center gap-1">
                    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v.01M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" />
                    </svg>
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
