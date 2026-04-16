'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import type { StyleQuizResult } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface QuizOption {
  id: string;
  label: string;
  subtitle?: string;
  image?: string;
  colors?: { name: string; hex: string }[];
  styleKey: 'classicist' | 'minimalist' | 'bohemian' | 'trendsetter';
}

interface QuizStep {
  question: string;
  options: QuizOption[];
}

const STEPS: QuizStep[] = [
  {
    question: "What's Your Vibe?",
    options: [
      {
        id: 's1-o1',
        label: 'Classic Elegance',
        subtitle: 'Timeless sophistication',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
        styleKey: 'classicist',
      },
      {
        id: 's1-o2',
        label: 'Modern Minimalist',
        subtitle: 'Clean lines, bold impact',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
        styleKey: 'minimalist',
      },
      {
        id: 's1-o3',
        label: 'Bohemian Luxe',
        subtitle: 'Free-spirited opulence',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
        styleKey: 'bohemian',
      },
      {
        id: 's1-o4',
        label: 'Street Style',
        subtitle: 'Urban edge meets luxury',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop',
        styleKey: 'trendsetter',
      },
    ],
  },
  {
    question: 'Your Color Palette?',
    options: [
      {
        id: 's2-o1',
        label: 'Neutral Earth',
        subtitle: 'Warm beige, ivory, camel, chocolate',
        colors: [
          { name: 'Beige', hex: '#D4B896' },
          { name: 'Ivory', hex: '#FFFFF0' },
          { name: 'Camel', hex: '#C19A6B' },
          { name: 'Chocolate', hex: '#5C4033' },
        ],
        styleKey: 'classicist',
      },
      {
        id: 's2-o2',
        label: 'Cool Blues & Whites',
        subtitle: 'Navy, slate, ivory, silver',
        colors: [
          { name: 'Navy', hex: '#1B2A4A' },
          { name: 'Slate', hex: '#708090' },
          { name: 'Ivory', hex: '#FFFFF0' },
          { name: 'Silver', hex: '#C0C0C0' },
        ],
        styleKey: 'minimalist',
      },
      {
        id: 's2-o3',
        label: 'Rich Jewel Tones',
        subtitle: 'Emerald, sapphire, burgundy, gold',
        colors: [
          { name: 'Emerald', hex: '#046307' },
          { name: 'Sapphire', hex: '#0F52BA' },
          { name: 'Burgundy', hex: '#800020' },
          { name: 'Gold', hex: '#C9A96E' },
        ],
        styleKey: 'bohemian',
      },
      {
        id: 's2-o4',
        label: 'Monochrome',
        subtitle: 'Black, white, charcoal, gray',
        colors: [
          { name: 'Black', hex: '#1A1A1A' },
          { name: 'White', hex: '#FAFAFA' },
          { name: 'Charcoal', hex: '#36454F' },
          { name: 'Gray', hex: '#808080' },
        ],
        styleKey: 'trendsetter',
      },
    ],
  },
  {
    question: 'Perfect Weekend Outfit?',
    options: [
      {
        id: 's3-o1',
        label: 'Tailored blazer with silk trousers',
        styleKey: 'classicist',
      },
      {
        id: 's3-o2',
        label: 'Cashmere sweater with wide-leg pants',
        styleKey: 'minimalist',
      },
      {
        id: 's3-o3',
        label: 'Flowing maxi dress with layered jewelry',
        styleKey: 'bohemian',
      },
      {
        id: 's3-o4',
        label: 'Leather jacket with designer jeans',
        styleKey: 'trendsetter',
      },
    ],
  },
  {
    question: 'Your Accessories Style?',
    options: [
      {
        id: 's4-o1',
        label: 'Delicate gold jewelry, silk scarf',
        styleKey: 'classicist',
      },
      {
        id: 's4-o2',
        label: 'Statement watch, leather belt',
        styleKey: 'minimalist',
      },
      {
        id: 's4-o3',
        label: 'Layered necklaces, ethnic jewelry',
        styleKey: 'bohemian',
      },
      {
        id: 's4-o4',
        label: 'Bold sunglasses, designer bag',
        styleKey: 'trendsetter',
      },
    ],
  },
  {
    question: 'Favorite Fashion Era?',
    options: [
      {
        id: 's5-o1',
        label: 'Old Hollywood Glamour',
        subtitle: '1940s-50s',
        styleKey: 'classicist',
      },
      {
        id: 's5-o2',
        label: 'Power Dressing',
        subtitle: '1980s',
        styleKey: 'minimalist',
      },
      {
        id: 's5-o3',
        label: 'Free Spirit',
        subtitle: '1970s',
        styleKey: 'bohemian',
      },
      {
        id: 's5-o4',
        label: 'Contemporary Now',
        subtitle: '2020s',
        styleKey: 'trendsetter',
      },
    ],
  },
];

const STYLE_PROFILES: Record<string, { title: string; description: string; categories: string[]; palette: string[] }> = {
  classicist: {
    title: 'The Classicist',
    description:
      'Your style exudes timeless elegance. You gravitate towards tailored silhouettes, neutral palettes, and premium fabrics.',
    categories: ["Men's Formal", "Women's Classic", 'Accessories'],
    palette: ['Beige', 'Ivory', 'Navy', 'Gold'],
  },
  minimalist: {
    title: 'The Minimalist',
    description:
      'Clean lines and thoughtful simplicity define your aesthetic. Quality over quantity is your mantra.',
    categories: ['Modern Essentials', 'Basics', 'Timeless Pieces'],
    palette: ['White', 'Black', 'Gray', 'Camel'],
  },
  bohemian: {
    title: 'The Bohemian',
    description:
      'Free-spirited with a touch of luxury. You love flowing fabrics, rich textures, and cultural influences.',
    categories: ['Boho Luxe', 'Ethnic Wear', 'Artisan Pieces'],
    palette: ['Terracotta', 'Emerald', 'Gold', 'Cream'],
  },
  trendsetter: {
    title: 'The Trendsetter',
    description:
      'Bold, confident, and always ahead of the curve. You mix high fashion with street style effortlessly.',
    categories: ['Street Luxe', 'Designer Collabs', 'Statement Pieces'],
    palette: ['Black', 'White', 'Red', 'Metallic'],
  },
};

const PALETTE_HEX: Record<string, string> = {
  Beige: '#D4B896',
  Ivory: '#FFFFF0',
  Navy: '#1B2A4A',
  Gold: '#C9A96E',
  White: '#FAFAFA',
  Black: '#1A1A1A',
  Gray: '#808080',
  Camel: '#C19A6B',
  Terracotta: '#CC5B3B',
  Emerald: '#046307',
  Cream: '#FFFDD0',
  Red: '#C41E3A',
  Metallic: '#BCC6CC',
};

/* ------------------------------------------------------------------ */
/*  Gold Sparkle Particles (decorative)                                */
/* ------------------------------------------------------------------ */

function GoldSparkles() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, #C9A96E 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 md:mb-14">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={i} className="flex items-center">
            {/* Step circle */}
            <motion.div
              className={`
                relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12
                rounded-full border-2 text-sm font-semibold
                transition-colors duration-500
                ${
                  isCompleted
                    ? 'bg-gold border-gold text-background'
                    : isCurrent
                    ? 'border-gold text-gold'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                }
              `}
              animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                stepNum
              )}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-gold"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </motion.div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="w-8 md:w-16 h-[2px] relative mx-1 md:mx-2">
                <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gold rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mb-2">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #B08D4F, #C9A96E, #D4B87A, #C9A96E)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Answer Option Card                                                 */
/* ------------------------------------------------------------------ */

function OptionCard({
  option,
  isSelected,
  onClick,
  index,
}: {
  option: QuizOption;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const isImageStep = !!option.image;
  const isColorStep = !!option.colors;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        card-luxury group relative text-left rounded-xl overflow-hidden border-2
        transition-all duration-400 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold
        ${
          isSelected
            ? 'border-gold shadow-[0_0_24px_rgba(201,169,110,0.25)]'
            : 'border-border hover:border-gold/40'
        }
      `}
    >
      {/* Image option */}
      {isImageStep && (
        <div className="relative aspect-[4/5] md:aspect-[3/4]">
          <img
            src={option.image}
            alt={option.label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h3 className="heading-serif text-white text-lg md:text-xl font-semibold">
              {option.label}
            </h3>
            {option.subtitle && (
              <p className="text-white/70 text-sm mt-0.5">{option.subtitle}</p>
            )}
          </div>

          {/* Selected checkmark */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 right-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-background" />
            </motion.div>
          )}
        </div>
      )}

      {/* Text-only option */}
      {!isImageStep && (
        <div className="relative p-5 md:p-6 bg-card">
          {/* Selected gold corner accent */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-7 h-7 bg-gold rounded-full flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-background" />
            </motion.div>
          )}

          <h3 className="heading-serif text-base md:text-lg font-semibold pr-8 group-hover:text-gold transition-colors">
            {option.label}
          </h3>
          {option.subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{option.subtitle}</p>
          )}

          {/* Color swatches */}
          {isColorStep && option.colors && (
            <div className="flex items-center gap-2.5 mt-4">
              {option.colors.map((c, ci) => (
                <div key={ci} className="flex flex-col items-center gap-1">
                  <span
                    className="w-9 h-9 rounded-full border-2 border-border shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                  <span className="text-[10px] text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected glow border effect */}
      {isSelected && (
        <motion.div
          layoutId="selectedGlow"
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(201,169,110,0.15), inset 0 0 30px rgba(201,169,110,0.05)',
          }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Results Page                                                       */
/* ------------------------------------------------------------------ */

function ResultsPage({
  result,
  onRetake,
  onShop,
}: {
  result: StyleQuizResult;
  onRetake: () => void;
  onShop: () => void;
}) {
  const profile = STYLE_PROFILES[result.styleProfile];
  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative max-w-2xl mx-auto"
    >
      {/* Decorative sparkles */}
      <GoldSparkles />

      <div className="relative z-10 text-center">
        {/* Sparkles icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/20 mb-6"
        >
          <Sparkles className="w-9 h-9 text-gold" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs tracking-[0.3em] uppercase text-gold mb-3"
        >
          Your Style Profile
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="heading-serif text-4xl md:text-5xl font-bold text-gold-gradient mb-4"
        >
          {profile.title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-10"
        >
          {profile.description}
        </motion.p>

        {/* Divider */}
        <div className="divider-gold w-32 mx-auto mb-10" />

        {/* Recommended Categories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Recommended For You
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {profile.categories.map((cat, i) => (
              <span
                key={i}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-sm font-medium text-gold"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                {cat}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Color Palette */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-gold" />
            <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Your Color Palette
            </h3>
          </div>
          <div className="flex items-center justify-center gap-4">
            {profile.palette.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8 + i * 0.1, type: 'spring', bounce: 0.4 }}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg border-2 border-white/20 dark:border-black/20"
                  style={{ backgroundColor: PALETTE_HEX[color] || '#888' }}
                />
                <span className="text-xs text-muted-foreground font-medium">{color}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={onShop}
            className="btn-luxury px-8 py-6 text-base"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop Your Style
          </Button>
          <Button
            variant="outline"
            onClick={onRetake}
            className="px-8 py-6 text-base hover:border-gold hover:text-gold transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function StyleQuizPage() {
  const { styleQuizResult, setStyleQuizResult, navigate } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showResult, setShowResult] = useState(false);

  /* If quiz was already completed, show result directly */
  const [hydrated, setHydrated] = useState(false);

  // On mount, check if we already have a result
  useState(() => {
    setHydrated(true);
  });

  // Effect to show result if quizResult already exists
  if (!hydrated && styleQuizResult) {
    // Will be handled after hydration
  }

  const completedBefore = !!styleQuizResult;

  /* ---- Handlers ---- */

  const handleSelect = (stepIndex: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [stepIndex]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate result
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentStep(1);
    setDirection(1);
    setShowResult(false);
  };

  const calculateResult = () => {
    // Tally the style keys from selected answers
    const counts: Record<string, number> = {
      classicist: 0,
      minimalist: 0,
      bohemian: 0,
      trendsetter: 0,
    };

    Object.entries(answers).forEach(([stepIdx, optionId]) => {
      const step = STEPS[parseInt(stepIdx)];
      const option = step.options.find((o) => o.id === optionId);
      if (option) {
        counts[option.styleKey]++;
      }
    });

    // Find the style with the most votes
    const winner = (Object.entries(counts) as [string, number][]).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['classicist', 0]
    );

    const profile = STYLE_PROFILES[winner[0]];
    const result: StyleQuizResult = {
      styleProfile: winner[0] as StyleQuizResult['styleProfile'],
      description: profile.description,
      recommendedCategories: profile.categories,
      colorPalette: profile.palette,
    };

    setStyleQuizResult(result);
    setShowResult(true);
  };

  const isStepAnswered = answers[currentStep - 1] !== undefined;
  const isLastStep = currentStep === STEPS.length;
  const step = STEPS[currentStep - 1];

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      {/* ────────── Page Header ────────── */}
      <div className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          alt="Style Quiz"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2"
          >
            Discover Your Fashion Identity
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="heading-serif text-4xl md:text-5xl font-bold"
          >
            Style Quiz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm text-primary-foreground/70 mt-2"
          >
            5 questions to reveal your perfect style
          </motion.p>
        </div>
      </div>

      {/* ────────── Quiz Content ────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Show previous result if quiz already completed */}
        {completedBefore && !showResult && Object.keys(answers).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsPage
              result={styleQuizResult!}
              onRetake={handleRetake}
              onShop={() => navigate('shop')}
            />
          </motion.div>
        ) : showResult && styleQuizResult ? (
          /* Show new quiz result */
          <ResultsPage
            result={styleQuizResult}
            onRetake={handleRetake}
            onShop={() => navigate('shop')}
          />
        ) : (
          /* Quiz steps */
          <div>
            {/* Progress */}
            <div className="mb-2">
              <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
              <p className="text-xs text-muted-foreground text-right mt-1">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>

            {/* Step indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

            {/* Question */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Question heading */}
                <div className="text-center mb-8 md:mb-10">
                  <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">
                    {step.question}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose the option that resonates with you most
                  </p>
                </div>

                {/* Answer options grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
                  {step.options.map((option, i) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={answers[currentStep - 1] === option.id}
                      onClick={() => handleSelect(currentStep - 1, option.id)}
                      index={i}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="hover:text-gold transition-colors disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!isStepAnswered}
                    className="btn-luxury px-8 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLastStep ? (
                      <>
                        See My Results
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Start-over shortcut */}
            {currentStep > 1 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleRetake}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
