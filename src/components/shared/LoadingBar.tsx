'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

type LoadingPhase = 'loading' | 'completing' | 'done';

/* Inner animation component - remounts on each route change */
function LoadingBarAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<LoadingPhase>('loading');
  const [width, setWidth] = useState(0);

  // Start the loading animation on mount using a self-cancelling rAF loop
  useState(() => {
    let start: number | null = null;
    const targetWidth = 78;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setWidth(eased * targetWidth);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // After content likely loaded, start completing
    setTimeout(() => {
      setPhase('completing');
    }, 800);
  });

  // Handle completing phase
  useState(() => {
    if (phase === 'completing') {
      setTimeout(() => {
        setWidth(100);
        setTimeout(() => {
          setPhase('done');
        }, 300);
      }, 50);
    }

    if (phase === 'done') {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-60 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer glow effect behind the bar */}
      <motion.div
        className="absolute top-0 left-0 h-[3px] bg-gold/20 blur-sm"
        style={{ width: `${width}%` }}
        transition={{ duration: 0.1 }}
      />

      {/* Main bar */}
      <motion.div
        className="h-[3px] relative"
        style={{
          width: `${width}%`,
          background: 'linear-gradient(90deg, transparent 0%, #C9A96E 15%, #D4B87A 50%, #C9A96E 85%, transparent 100%)',
          boxShadow: '0 0 8px rgba(201, 169, 110, 0.4), 0 0 20px rgba(201, 169, 110, 0.1)',
        }}
        transition={{ duration: 0.1 }}
      >
        {/* Shimmer highlight on the leading edge */}
        <div
          className="absolute right-0 top-0 h-full w-6"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(232, 213, 168, 0.8))',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function LoadingBar() {
  const currentPage = useStore((s) => s.currentPage);

  // Derive a unique animation key whenever currentPage changes
  // Using the React "get derived state from props" pattern
  const [prevPage, setPrevPage] = useState(currentPage);
  const [animationKey, setAnimationKey] = useState(0);
  const [isActive, setIsActive] = useState(false);

  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    setAnimationKey((k) => k + 1);
    setIsActive(true);
  }

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <LoadingBarAnimation key={animationKey} onComplete={handleComplete} />
      )}
    </AnimatePresence>
  );
}
