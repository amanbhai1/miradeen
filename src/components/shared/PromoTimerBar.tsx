/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, Gift } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function PromoTimerBar() {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { navigate } = useStore();

  // Check if dismissed in localStorage on mount
  const [checkedDismissed, setCheckedDismissed] = useState(false);
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('miradeen-promo-dismissed');
      if (dismissed === 'true') setCheckedDismissed(true);
    } catch {}
  }, []);
  useEffect(() => {
    if (checkedDismissed) setVisible(false);
  }, [checkedDismissed]);

  // Countdown: 4 hours from now
  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 4);

    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setVisible(false); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try { localStorage.setItem('miradeen-promo-dismissed', 'true'); } catch {}
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 40, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-foreground text-primary-foreground overflow-hidden relative"
      >
        <div className="h-10 flex items-center justify-center gap-3 relative z-10">
          <Zap className="h-3.5 w-3.5 text-gold" />
          <p className="text-[11px] tracking-[0.15em] uppercase">
            <span className="text-gold font-semibold">Flash Sale:</span> 30% Off All Items — Ends in
          </p>
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="bg-gold/20 px-1.5 py-0.5 rounded text-gold text-[11px]">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-gold">:</span>
            <span className="bg-gold/20 px-1.5 py-0.5 rounded text-gold text-[11px]">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-gold">:</span>
            <span className="bg-gold/20 px-1.5 py-0.5 rounded text-gold text-[11px]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="text-[10px] font-semibold text-gold hover:text-gold-light underline underline-offset-2 ml-2 tracking-wider uppercase"
          >
            Shop Now
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/40 hover:text-primary-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
