'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Truck,
  Bell,
  ShoppingBag,
  Timer,
  Award,
  User,
  type LucideIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  type:
    | 'promo'
    | 'social_proof'
    | 'countdown'
    | 'achievement'
    | 'success'
    | 'error'
    | 'info'
    | 'shipping';
  title: string;
  message: string;
  duration?: number; // ms, default 5000
  icon?: string; // optional custom lucide icon name
  action?: NotificationAction; // optional CTA button
}

/* ------------------------------------------------------------------ */
/*  Icon & color maps                                                  */
/* ------------------------------------------------------------------ */

const iconMap: Record<Notification['type'], LucideIcon> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  promo: Bell,
  shipping: Truck,
  social_proof: ShoppingBag,
  countdown: Timer,
  achievement: Award,
};

const accentColorMap: Record<Notification['type'], string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-gold/50',
  promo: 'border-l-gold',
  shipping: 'border-l-blue-400',
  social_proof: 'border-l-gold/60',
  countdown: 'border-l-amber-500',
  achievement: 'border-l-gold',
};

const progressColorMap: Record<Notification['type'], string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-gold/40',
  promo: 'bg-gold',
  shipping: 'bg-blue-400',
  social_proof: 'bg-gold/50',
  countdown: 'bg-amber-500',
  achievement: 'bg-gold',
};

/* ------------------------------------------------------------------ */
/*  Social‑proof data                                                  */
/* ------------------------------------------------------------------ */

interface SocialProofItem {
  name: string;
  location: string;
  product: string;
}

const SOCIAL_PROOF_ITEMS: SocialProofItem[] = [
  { name: 'Priya', location: 'Delhi', product: 'Silk Evening Gown' },
  { name: 'Ananya', location: 'Mumbai', product: 'Wedding Collection' },
  { name: 'Diya', location: 'Bangalore', product: 'Designer Dress' },
  { name: 'Isha', location: 'Pune', product: 'Ethnic Kurta Set' },
  { name: 'Meera', location: 'Chennai', product: 'Gold Jewellery' },
  { name: 'Nisha', location: 'Hyderabad', product: 'Summer Collection' },
];

const MAX_SP_PER_SESSION = 5;
const SP_INITIAL_DELAY_MS = 15_000;
const SP_INTERVAL_MIN_MS = 30_000;
const SP_INTERVAL_MAX_MS = 45_000;
const SP_DURATION_MS = 5_000;

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const spCountRef = useRef(0);

  /* -- Add ----------------------------------------------------------- */
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      const notif: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };
      setNotifications(prev => [...prev, notif]);

      // auto‑remove
      const timer = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        timersRef.current.delete(id);
      }, notif.duration!);
      timersRef.current.set(id, timer);

      return id;
    },
    [],
  );

  /* -- Remove -------------------------------------------------------- */
  const removeNotification = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /* -- Social proof -------------------------------------------------- */
  useEffect(() => {
    // Respect user dismissal
    if (typeof window !== 'undefined' && sessionStorage.getItem('miradeen-sp-dismissed')) {
      return;
    }

    const spTimers: ReturnType<typeof setTimeout>[] = [];

    const randomDelay = () =>
      Math.random() * (SP_INTERVAL_MAX_MS - SP_INTERVAL_MIN_MS) + SP_INTERVAL_MIN_MS;

    const scheduleNext = () => {
      if (spCountRef.current >= MAX_SP_PER_SESSION) return;
      const timer = setTimeout(() => {
        const item =
          SOCIAL_PROOF_ITEMS[Math.floor(Math.random() * SOCIAL_PROOF_ITEMS.length)];
        addNotification({
          type: 'social_proof',
          title: `${item.name} from ${item.location}`,
          message: `just purchased ${item.product}`,
          duration: SP_DURATION_MS,
        });
        spCountRef.current += 1;
        scheduleNext(); // schedule the next one with a new random delay
      }, randomDelay());
      spTimers.push(timer);
    };

    // Initial delay before first social proof
    const initial = setTimeout(scheduleNext, SP_INITIAL_DELAY_MS);
    spTimers.push(initial);

    return () => {
      spTimers.forEach(t => clearTimeout(t));
    };
  }, [addNotification]);

  return { notifications, addNotification, removeNotification };
}

/* ------------------------------------------------------------------ */
/*  Single toast card                                                  */
/* ------------------------------------------------------------------ */

interface ToastCardProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onDismissSP: () => void;
}

function ToastCard({ notification, onRemove, onDismissSP }: ToastCardProps) {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration ?? 5000;
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0); // track cumulative elapsed ms

  // progress bar animation — pauses on hover, resumes on unhover
  useEffect(() => {
    if (hovered) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const tickStart = performance.now();

    const tick = (now: number) => {
      const frameElapsed = now - tickStart;
      const totalElapsed = elapsedRef.current + frameElapsed;
      const remaining = Math.max(0, 100 - (totalElapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // save elapsed time so we can resume later
      elapsedRef.current += performance.now() - tickStart;
    };
  }, [duration, hovered]);

  const handleClose = () => {
    if (notification.type === 'social_proof') {
      onDismissSP();
    }
    onRemove(notification.id);
  };

  const Icon = iconMap[notification.type] ?? Bell;

  const isSocialProof = notification.type === 'social_proof';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        pointer-events-auto relative overflow-hidden
        glass-card rounded-xl border-l-[3px] ${accentColorMap[notification.type]}
        shadow-luxury-lg
        max-w-sm w-full
        group
      `}
    >
      {/* content */}
      <div className="p-4 pr-10">
        <div className="flex items-start gap-3">
          {/* icon */}
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
            {isSocialProof ? (
              <User className="h-4 w-4 text-gold" />
            ) : (
              <Icon className="h-4 w-4 text-gold" />
            )}
          </div>

          {/* text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug text-foreground truncate">
              {notification.title}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground leading-relaxed">
              {notification.message}
              {isSocialProof && (
                <span className="block mt-1 text-[10px] text-muted-foreground/60">
                  2 minutes ago
                </span>
              )}
            </p>

            {/* optional CTA */}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 inline-flex items-center text-xs font-medium text-gold hover:text-gold/80 transition-colors"
              >
                {notification.action.label}
                <span className="ml-1">&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* close button — visible on hover */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity duration-200 hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5 text-foreground/60" />
      </button>

      {/* progress bar */}
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <motion.div
            className={`h-full ${progressColorMap[notification.type]}`}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0 }}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Container component                                                */
/* ------------------------------------------------------------------ */

interface NotificationToastProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationToast({
  notifications,
  onRemove,
}: NotificationToastProps) {
  const handleDismissSP = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('miradeen-sp-dismissed', '1');
    }
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <ToastCard
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            onDismissSP={handleDismissSP}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
