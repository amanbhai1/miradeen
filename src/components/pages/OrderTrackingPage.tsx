'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, CheckCircle, Clock, Truck, MapPin,
  XCircle, Phone, Mail, MessageCircle, Copy, ExternalLink,
  ShieldCheck, Calendar, CreditCard, PackageCheck, Warehouse,
  ArrowLeft, Filter, ShoppingBag, User, ChevronRight,
  Hash, ArrowDownRight, Navigation, Weight, HelpCircle,
  ChevronDown, Loader2, LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';
import { parseJsonField } from '@/types';

/* ── Constants ── */
const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
type StatusFilter = typeof ORDER_STATUSES[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-200 dark:border-amber-800' },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-200 dark:border-blue-800' },
  processing: { label: 'Processing', color: 'text-gold', bgColor: 'bg-gold/10', borderColor: 'border-gold/30' },
  shipped: { label: 'In Transit', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-200 dark:border-purple-800' },
  delivered: { label: 'Delivered', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-200 dark:border-green-800' },
  cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-200 dark:border-red-800' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

/* ── Timeline Step Definitions ── */
type StepStatus = 'completed' | 'current' | 'pending';

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  date: string;
}

function getTimelineSteps(order: Order): TimelineStep[] {
  const createdDate = new Date(order.createdAt);
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatFull = (d: Date) =>
    d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const formatTime = (d: Date, h: number) => {
    const copy = new Date(d);
    copy.setHours(copy.getHours() + h);
    return formatFull(copy);
  };

  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return [
    {
      key: 'placed',
      label: 'Order Placed',
      description: 'Your order has been confirmed',
      icon: CheckCircle,
      date: formatFull(createdDate),
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Payment verified, preparing your order',
      icon: CreditCard,
      date: currentIdx >= 1 ? formatTime(createdDate, 2) : '',
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Your items are being carefully packaged',
      icon: Warehouse,
      date: currentIdx >= 2 ? formatTime(createdDate, 24) : '',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Package in transit via BlueDart',
      icon: Truck,
      date: currentIdx >= 3 ? formatTime(createdDate, 48) : '',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description:
        currentIdx >= 4
          ? 'Package delivered successfully'
          : 'Estimated delivery: ' +
            formatDate(new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000)) + ' – ' +
            formatDate(new Date(createdDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
      icon: PackageCheck,
      date: currentIdx >= 4 ? formatTime(createdDate, 120) : '',
    },
  ];
}

function getStepStatus(stepIndex: number, orderStatus: string): StepStatus {
  const currentIdx = STATUS_ORDER.indexOf(orderStatus);
  if (currentIdx < 0) return 'pending';
  if (stepIndex < currentIdx) return 'completed';
  if (stepIndex === currentIdx) return 'current';
  return 'pending';
}

/* ── Sub-Components ── */

/** Animated Status Timeline with staggered reveal */
function OrderTimeline({ order }: { order: Order }) {
  const steps = getTimelineSteps(order);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border border-border rounded-xl p-5 sm:p-6 bg-card overflow-hidden relative card-luxury"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <h3 className="heading-serif font-semibold mb-6 flex items-center gap-2 text-base">
        <Clock className="h-4 w-4 text-gold" />
        Order Timeline
      </h3>

      <div className="relative pl-1 sm:pl-3">
        {steps.map((step, i) => {
          const status = getStepStatus(i, order.status);
          const isLast = i === steps.length - 1;
          const StepIcon = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.45, ease: 'easeOut' }}
              className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0"
            >
              {/* Connecting line */}
              {!isLast && (
                <div className="absolute left-[17px] sm:left-[21px] top-[40px] bottom-0 w-0.5">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.4, ease: 'easeOut' }}
                    style={{ originY: 0 }}
                    className={`w-full h-full ${
                      status === 'completed'
                        ? 'bg-gold'
                        : status === 'current'
                        ? 'bg-gradient-to-b from-gold to-border'
                        : 'border-l-2 border-dashed border-muted-foreground/25'
                    }`}
                  />
                </div>
              )}

              {/* Dot / Icon */}
              <div className="relative z-10 shrink-0">
                {status === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/25"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : status === 'current' ? (
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-[-8px] rounded-full bg-gold/20"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-[-4px] rounded-full bg-gold/15"
                    />
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30 relative z-10">
                      <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/40" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5 sm:pt-2.5 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <p
                      className={`text-sm font-semibold flex items-center gap-2 ${
                        status === 'completed'
                          ? 'text-gold'
                          : status === 'current'
                          ? 'text-gold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                      {status === 'completed' && (
                        <CheckCircle className="h-3.5 w-3.5 text-gold" />
                      )}
                      {status === 'current' && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-gold/10 text-gold border-gold/30 h-4">
                          Current
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">
                          Upcoming
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                  {step.date && (
                    <p
                      className={`text-[11px] shrink-0 ${
                        status === 'pending' ? 'text-muted-foreground/40' : 'text-muted-foreground'
                      }`}
                    >
                      {step.date}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Delivery Map Placeholder */
function DeliveryMapPlaceholder({ order }: { order: Order }) {
  const isShipped = ['shipped', 'delivered'].includes(order.status);
  const createdDate = new Date(order.createdAt);
  const estStart = new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  const estEnd = new Date(createdDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmtEst = (d: Date) =>
    d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="border border-border rounded-xl overflow-hidden relative card-luxury"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent z-10" />

      {/* Map visual */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-emerald-50 via-blue-50/50 to-amber-50 dark:from-emerald-950/40 dark:via-blue-950/30 dark:to-amber-950/40 overflow-hidden">
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Decorative route path */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <motion.path
            d="M 80 40 C 200 20, 300 100, 400 50 S 550 120, 620 80"
            stroke="currentColor"
            className="text-gold/30"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 80 40 C 200 20, 300 100, 400 50 S 550 120, 620 80"
            stroke="currentColor"
            className="text-gold"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isShipped ? 1 : 0.5 }}
            transition={{ duration: 2.5, delay: 0.8, ease: 'easeInOut' }}
          />
        </svg>

        {/* Origin pin */}
        <div className="absolute left-[10%] top-[35%] flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
            <Warehouse className="h-3.5 w-3.5 text-gold" />
          </div>
          <span className="text-[9px] text-muted-foreground mt-1 font-medium bg-background/80 dark:bg-card/80 px-1.5 py-0.5 rounded">Origin</span>
        </div>

        {/* Destination pin with pulse */}
        <div className="absolute right-[12%] top-[30%] flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 w-10 h-10 rounded-full bg-gold/20"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -top-0.5 w-8 h-8 rounded-full bg-gold/15"
          />
          <div className="relative w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-[9px] text-muted-foreground mt-1.5 font-medium bg-background/80 dark:bg-card/80 px-1.5 py-0.5 rounded">Your Address</span>
        </div>

        {/* Moving truck indicator */}
        {isShipped && order.status !== 'delivered' && (
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[45%] top-[38%]"
          >
            <div className="w-10 h-10 rounded-full bg-background shadow-lg border border-gold/30 flex items-center justify-center">
              <Truck className="h-5 w-5 text-gold" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Info overlay */}
      <div className="bg-card p-4 sm:p-5 space-y-4">
        {/* Estimated delivery */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {order.status === 'delivered' ? 'Delivered on' : 'Estimated delivery'}
            </p>
            <p className="text-sm font-semibold">
              {order.status === 'delivered'
                ? fmtEst(new Date(createdDate.getTime() + 5 * 24 * 60 * 60 * 1000))
                : `${fmtEst(estStart)} – ${fmtEst(estEnd)}`}
            </p>
          </div>
        </div>

        {/* Carrier info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Carrier</p>
            <p className="text-sm font-semibold">BlueDart Express</p>
          </div>
        </div>

        {/* Route labels */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5 text-gold" /> MIRADEEN Warehouse</span>
          <ArrowDownRight className="h-3.5 w-3.5 text-gold" />
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gold" /> {order.shippingCity || 'Your Address'}</span>
        </div>
      </div>
    </motion.div>
  );
}

/** Order items list with images, prices, and details */
function OrderItemsList({ order }: { order: Order }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="border border-border rounded-xl p-5 sm:p-6 bg-card overflow-hidden relative card-luxury"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <h3 className="heading-serif font-semibold mb-4 flex items-center gap-2 text-base">
        <ShoppingBag className="h-4 w-4 text-gold" />
        Items in this Order
        <Badge variant="outline" className="text-[9px] ml-1">{order.items.length} item(s)</Badge>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {order.items.map((item, i) => {
          const images = parseJsonField<string>(item.productImage ? [item.productImage] : []);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-200"
            >
              <div className="w-14 h-[72px] rounded-lg bg-muted overflow-hidden shrink-0">
                {images[0] ? (
                  <img src={images[0]} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                  {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                </div>
              </div>
              <p className="text-sm font-semibold text-gold shrink-0">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>Subtotal</span>
            <span>
              ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600 text-xs">
              <span>Discount</span>
              <span>-₹{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>Tax</span>
            <span>₹{order.tax.toLocaleString()}</span>
          </div>
          <div className="divider-gold my-1" />
          <div className="flex justify-between font-bold text-sm">
            <span>Total</span>
            <span className="text-gold-gradient font-bold text-base">₹{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Shipping Details Card */
function ShippingDetailsCard({ order }: { order: Order }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-border card-luxury relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="heading-serif font-semibold text-base flex items-center gap-2">
            <Truck className="h-4 w-4 text-gold" />
            Shipping Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Shipping Address */}
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Shipping Address</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{order.shippingName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                <p className="text-xs text-muted-foreground">{order.shippingCountry}</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Contact Number</p>
              <p className="text-sm font-medium">{order.shippingPhone}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Shipping Method</p>
              <p className="text-sm font-medium">Express Delivery</p>
              <p className="text-[10px] text-muted-foreground">2–4 business days</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Package Weight</p>
              <div className="flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5 text-gold" />
                <p className="text-sm font-medium">~{Math.max(0.3, order.items.length * 0.2).toFixed(1)} kg</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Carrier</p>
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-gold" />
                <p className="text-sm font-medium">BlueDart Express</p>
              </div>
            </div>
          </div>

          {/* Tracking number */}
          {order.trackingNumber && (
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Tracking Number</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-semibold text-gold flex-1">{order.trackingNumber}</p>
                <button
                  onClick={() => handleCopy(order.trackingNumber!, 'Tracking number')}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
                >
                  {copied === 'Tracking number' ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === 'Tracking number' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Enhanced Need Help Section */
function NeedHelpSection() {
  const { navigate } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="overflow-hidden border-border card-luxury relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <CardHeader className="pb-2">
          <CardTitle className="heading-serif font-semibold text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gold" />
            Need help with your order?
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Our support team is here to assist you. Reach out through any of the channels below.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Email */}
            <a
              href="mailto:merajkhan6188@gmail.com"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/[0.02] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                <Mail className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Email</p>
                <p className="text-[10px] text-muted-foreground truncate">merajkhan6188@gmail.com</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
            </a>

            {/* Phone */}
            <a
              href="tel:+919319084050"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/[0.02] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                <Phone className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Phone</p>
                <p className="text-[10px] text-muted-foreground">+91 9319084050</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919319084050"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-950/10 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-[10px] text-muted-foreground">Chat with us instantly</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
            </a>
          </div>

          {/* FAQ Links */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Frequently Asked</p>
            <div className="flex flex-wrap gap-2">
              {['Return Policy', 'Shipping Info', 'Track Package', 'Size Guide'].map((faq) => (
                <button
                  key={faq}
                  onClick={() => navigate('contact')}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-gold/30 hover:text-gold hover:bg-gold/5 text-muted-foreground transition-all duration-200"
                >
                  {faq}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Full single-order view with timeline + details + items */
function OrderDetailView({ order, onBack }: { order: Order; onBack: () => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isCancelled = order.status === 'cancelled';
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to orders
      </button>

      {/* Order Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-border card-luxury relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Order Number</p>
                <div className="flex items-center gap-2">
                  <p className="heading-serif text-xl font-bold text-gold-gradient">{order.orderNumber}</p>
                  <button
                    onClick={() => handleCopy(order.orderNumber, 'Order number')}
                    className="text-muted-foreground hover:text-gold transition-colors p-0.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border`}>
                {statusCfg.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divider-gold mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
                  Order Date
                </p>
                <p className="font-medium flex items-center gap-1.5 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">Items</p>
                <p className="font-medium flex items-center gap-1.5 text-xs">
                  <Package className="h-3.5 w-3.5 text-gold" />
                  {order.items.length} item(s)
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">Total</p>
                <p className="font-semibold text-gold flex items-center gap-1.5 text-xs">
                  <CreditCard className="h-3.5 w-3.5" />
                  ₹{order.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">Payment</p>
                <p className="font-medium capitalize flex items-center gap-1.5 text-xs">
                  <ShieldCheck
                    className={`h-3.5 w-3.5 ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'
                    }`}
                  />
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancelled State */}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-red-200 dark:border-red-800 rounded-xl p-8 bg-red-50/50 dark:bg-red-950/10 text-center"
        >
          <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h3 className="heading-serif text-xl font-bold mb-2">Order Cancelled</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This order has been cancelled. If you believe this is an error or need assistance, please contact our
            support team.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" className="text-xs hover:border-gold hover:text-gold">
              Continue Shopping
            </Button>
            <Button className="text-xs bg-gold text-background hover:bg-gold-dark btn-luxury">
              <Phone className="h-3.5 w-3.5 mr-1.5" /> Contact Support
            </Button>
          </div>
        </motion.div>
      )}

      {/* Timeline + Map (side by side on lg) */}
      {!isCancelled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderTimeline order={order} />
          <DeliveryMapPlaceholder order={order} />
        </div>
      )}

      {/* Shipping Details */}
      {!isCancelled && <ShippingDetailsCard order={order} />}

      {/* Items */}
      <OrderItemsList order={order} />

      {/* Need Help */}
      <NeedHelpSection />
    </motion.div>
  );
}

/** Compact order card for the orders list view */
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const images = order.items.length > 0 ? parseJsonField<string>([order.items[0].productImage]) : [];

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="w-full text-left border border-border rounded-xl p-4 bg-card hover:border-gold/30 hover:shadow-luxury-sm transition-all duration-300 group card-luxury relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-center gap-4">
        {/* Item thumbnail */}
        <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
          {images[0] ? (
            <img src={images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="heading-serif text-sm font-bold text-gold truncate">{order.orderNumber}</p>
            <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border shrink-0 text-[10px]`}>
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {order.items.length} item(s) ·{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm font-semibold text-gold mt-0.5">₹{order.total.toLocaleString()}</p>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
      </div>
    </motion.button>
  );
}

/** Gold Loading Ring */
function GoldLoadingRing({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative w-16 h-16 mb-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-3 border-transparent border-t-gold"
          style={{ borderWidth: '3px' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-gold/50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-5 w-5 text-gold/60" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function OrderTrackingPage() {
  const { navigate, token, isAuthenticated, user } = useStore();
  const { toast } = useToast();

  // Guest search state
  const [searchInput, setSearchInput] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Authenticated state
  const [authOrders, setAuthOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  // Shared detail view state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /** Fetch all orders for authenticated users */
  const fetchUserOrders = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setAuthOrders(data.orders || []);
    } catch {
      setAuthError('Failed to load your orders. Please try again.');
    }
    setAuthLoading(false);
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    }
  }, [isAuthenticated, fetchUserOrders]);

  /** Guest tracking handler */
  const handleGuestTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setGuestLoading(true);
    setGuestError('');
    setNotFound(false);
    setSelectedOrder(null);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchInput.trim())}`);
      const data = await res.json();
      const found = (data.orders || []).find(
        (o: Order) => o.orderNumber.toLowerCase() === searchInput.trim().toLowerCase()
      );
      if (found) {
        setSelectedOrder(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setGuestError('Something went wrong. Please try again.');
    }
    setGuestLoading(false);
  };

  /** Filter orders by status */
  const filteredOrders =
    activeFilter === 'all'
      ? authOrders
      : authOrders.filter((o) => o.status === activeFilter);

  /** Count orders per status */
  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return authOrders.length;
    return authOrders.filter((o) => o.status === status).length;
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen">
      {/* ── A. Hero Section ── */}
      <section className="relative h-56 md:h-72 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Decorative gold corner elements */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-gold/20 rounded-tl-lg" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-gold/20 rounded-br-lg" />
        {/* Floating gold dots */}
        <motion.div
          animate={{ y: [-8, 8, -8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 right-20 w-2 h-2 rounded-full bg-gold/40"
        />
        <motion.div
          animate={{ y: [6, -6, 6], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-16 left-24 w-1.5 h-1.5 rounded-full bg-gold/30"
        />
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-20 left-[40%] w-1 h-1 rounded-full bg-gold/25"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center text-white px-4"
        >
          <div className="w-18 h-18 mx-auto mb-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Package className="h-9 w-9 text-gold" />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-3">Real-Time Tracking</p>
          <h1 className="heading-serif text-3xl md:text-5xl font-bold mb-3 text-gold-gradient">
            Track Your Order
          </h1>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Stay updated on your MIRADEEN delivery
          </p>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Detail View (single order) ── */}
        <AnimatePresence mode="wait">
          {selectedOrder && (
            <OrderDetailView
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
            />
          )}
        </AnimatePresence>

        {/* ── List / Search View ── */}
        {!selectedOrder && (
          <>
            {/* ── B. Order Search Section (Guest) ── */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative mb-8"
              >
                <form onSubmit={handleGuestTrack} className="mb-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Search input with Package icon */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center pointer-events-none">
                        <Package className="h-5 w-5 text-gold" />
                      </div>
                      <Input
                        placeholder="Enter your order number (e.g., MRD-1234)"
                        value={searchInput}
                        onChange={(e) => {
                          setSearchInput(e.target.value);
                          setGuestError('');
                          setNotFound(false);
                        }}
                        className="h-14 pl-14 pr-4 text-sm border-border focus:border-gold focus:ring-gold/20 focus:ring-2 transition-all input-luxury rounded-xl text-center text-base"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={guestLoading || !searchInput.trim()}
                      className="w-full mt-3 h-12 px-6 sm:px-8 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold transition-all duration-300 btn-luxury rounded-xl"
                    >
                      {guestLoading ? (
                        <GoldLoadingRing text="" />
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {guestError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs mt-2 text-center">
                    {guestError}
                  </motion.p>
                )}

                {/* "Or" divider with login link */}
                <div className="flex items-center gap-4 max-w-sm mx-auto mt-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('auth')}
                    className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors group"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="link-underline-gold">Log in to view all orders</span>
                  </button>
                </div>

                {/* Loading State */}
                <AnimatePresence>
                  {guestLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8"
                    >
                      <GoldLoadingRing text="Tracking your order..." />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── D. No Result State (Guest) ── */}
            {!isAuthenticated && notFound && !guestLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 mx-auto rounded-2xl bg-muted/80 border border-border flex items-center justify-center"
                  >
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-2xl border-2 border-gold/20"
                  />
                </div>
                <h3 className="heading-serif text-xl font-bold mb-2">No Order Found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn&apos;t find an order with that number. Please check and try again.
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <CheckCircle className="h-3.5 w-3.5 text-gold" />
                    Check your order number for typos
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <CheckCircle className="h-3.5 w-3.5 text-gold" />
                    Make sure you&apos;re using the correct format
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotFound(false);
                      setGuestError('');
                      setSearchInput('');
                    }}
                    className="h-11 px-6 hover:border-gold hover:text-gold transition-colors text-xs rounded-xl"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => navigate('shop')}
                    className="h-11 px-6 bg-gold text-background hover:bg-gold-dark text-xs btn-luxury rounded-xl"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Our Shop
                  </Button>
                  <Button
                    onClick={() => navigate('contact')}
                    variant="ghost"
                    className="h-11 px-6 text-xs text-muted-foreground hover:text-gold rounded-xl"
                  >
                    Contact Support
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Authenticated User: Orders List with Tabs */}
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {/* Mini search bar for authenticated users */}
                <div className="mb-6">
                  <form
                    onSubmit={handleGuestTrack}
                    className="relative mb-6"
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search by order number (e.g., MRD-1234)"
                          value={searchInput}
                          onChange={(e) => {
                            setSearchInput(e.target.value);
                            setGuestError('');
                            setNotFound(false);
                          }}
                          className="h-11 pl-10 text-sm border-border focus:border-gold focus:ring-gold/20 focus:ring-2 transition-all input-luxury"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={guestLoading || !searchInput.trim()}
                        className="h-11 px-5 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold transition-all duration-300 shrink-0 btn-luxury"
                      >
                        {guestLoading ? (
                          <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Status filter tabs */}
                  <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as StatusFilter)}>
                    <TabsList className="bg-muted/80 rounded-lg overflow-x-auto max-w-full custom-scrollbar flex-nowrap">
                      {ORDER_STATUSES.map((status) => {
                        const count = getStatusCount(status);
                        return (
                          <TabsTrigger
                            key={status}
                            value={status}
                            className="text-xs capitalize data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30 data-[state=active]:border rounded-md px-3 whitespace-nowrap"
                          >
                            {status === 'all' ? 'All Orders' : status}
                            <span className="ml-1 text-[10px] opacity-60">({count})</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Guest search error for authenticated users */}
                <AnimatePresence>
                  {guestError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <p className="text-destructive text-xs mb-4">{guestError}</p>
                    </motion.div>
                  )}
                  {notFound && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        No order found with that number. It may belong to a different account.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading state */}
                {authLoading && (
                  <GoldLoadingRing text="Loading your orders..." />
                )}

                {/* Error state */}
                {authError && !authLoading && (
                  <div className="text-center py-12">
                    <p className="text-sm text-destructive mb-4">{authError}</p>
                    <Button
                      onClick={fetchUserOrders}
                      variant="outline"
                      className="text-xs hover:border-gold hover:text-gold"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Empty state */}
                {!authLoading && !authError && authOrders.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                  >
                    <div className="relative w-28 h-28 mx-auto mb-6">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-4 rounded-full bg-gold/5 flex items-center justify-center"
                      >
                        <ShoppingBag className="h-8 w-8 text-gold/60" />
                      </motion.div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-gold/20"
                      />
                    </div>
                    <h3 className="heading-serif text-xl font-bold mb-2">No Orders Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      You haven&apos;t placed any orders yet. Start exploring our luxury collection and place your first
                      order.
                    </p>
                    <Button
                      onClick={() => navigate('shop')}
                      className="bg-gold text-background hover:bg-gold-dark text-xs tracking-wider uppercase btn-luxury rounded-xl"
                    >
                      Start Shopping
                    </Button>
                  </motion.div>
                )}

                {/* Orders list */}
                {!authLoading && !authError && filteredOrders.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {/* Active filter label */}
                    {activeFilter !== 'all' && (
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                          Showing {filteredOrders.length} {activeFilter} order(s)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveFilter('all')}
                          className="text-xs text-gold hover:text-gold-dark hover:bg-gold/5 h-7 px-2"
                        >
                          Show all
                        </Button>
                      </div>
                    )}
                    <AnimatePresence mode="popLayout">
                      {filteredOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Filtered empty */}
                {!authLoading && !authError && authOrders.length > 0 && filteredOrders.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <Filter className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No {activeFilter} orders found.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveFilter('all')}
                      className="text-xs text-gold hover:text-gold-dark mt-2"
                    >
                      View all orders
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* ── Guest-only: Empty state (no search yet) ── */
              <>
                {!guestLoading && !notFound && !guestError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-gold/20"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-3 rounded-full border border-gold/10"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-6 rounded-full bg-gold/5 flex items-center justify-center"
                      >
                        <Truck className="h-10 w-10 text-gold/60" />
                      </motion.div>
                    </div>
                    <h3 className="heading-serif text-xl font-bold mb-2">Track Your Package</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Enter your order number above to see real-time status updates, estimated delivery, and shipping
                      details.
                    </p>

                    {/* Authenticated CTA */}
                    <div className="bg-muted/40 border border-border rounded-xl p-6 max-w-sm mx-auto">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-gold" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold">Have an account?</p>
                          <p className="text-xs text-muted-foreground">Sign in to view all your orders</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate('auth')}
                        className="w-full bg-gold text-background hover:bg-gold-dark text-xs tracking-wider uppercase btn-luxury rounded-xl"
                      >
                        Sign In / Register
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
