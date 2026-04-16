'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0;
    setScrollPercent(percent);
    setVisible(scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* SVG circle progress ring */
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (scrollPercent / 100) * circumference,
    [circumference, scrollPercent],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label={`Back to top — ${Math.round(scrollPercent)}% scrolled`}
        >
          {/* Glow effect behind button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="absolute inset-0 rounded-full bg-gold/20 blur-lg group-hover:bg-gold/30 transition-colors duration-300"
          />

          {/* Button body */}
          <div className="relative w-12 h-12 bg-gold text-background rounded-full flex items-center justify-center shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35 transition-all duration-300">
            {/* Progress ring SVG */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 48 48"
            >
              {/* Background track */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="2"
              />
              {/* Progress arc */}
              <motion.circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </svg>

            {/* Arrow icon */}
            <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform relative z-10" />
          </div>

          {/* Percentage tooltip on hover */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-sm pointer-events-none">
            {Math.round(scrollPercent)}%
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
