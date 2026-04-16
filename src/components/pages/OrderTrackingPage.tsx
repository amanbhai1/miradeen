'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, CheckCircle, Clock, Truck, MapPin,
  XCircle, ArrowRight, Phone, Mail, MessageCircle,
  ChevronRight, Copy, ExternalLink, ShieldCheck,
  Calendar, CreditCard, PackageCheck, Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';
import { parseJsonField } from '@/types';

/* ── Demo order data for when no real order exists ── */
const DEMO_ORDER: Order = {
  id: 'demo-1',
  orderNumber: 'ORD-001',
  userId: 'demo',
  status: 'shipped',
  paymentStatus: 'paid',
  total: 4999,
  shipping: 0,
  tax: 250,
  discount: 0,
  couponCode: '',
  trackingNumber: 'MIR2025IN7845612',
  shippingName: 'Rahul Sharma',
  shippingEmail: 'rahul@example.com',
  shippingPhone: '+91 98765 43210',
  shippingAddress: '42, Juhu Scheme',
  shippingCity: 'Mumbai',
  shippingState: 'Maharashtra',
  shippingZip: '400049',
  shippingCountry: 'India',
  createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      id: 'oi-1',
      orderId: 'demo-1',
      productId: 'p1',
      productName: 'Classic Oxford Blazer',
      productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=260&fit=crop',
      quantity: 1,
      size: 'M',
      color: 'Navy',
      price: 3999,
      createdAt: new Date().toISOString(),
      product: undefined as never,
    },
    {
      id: 'oi-2',
      orderId: 'demo-1',
      productId: 'p2',
      productName: 'Silk Pocket Square',
      productImage: 'https://images.unsplash.com/photo-1601924921557-45e8e1af0014?w=200&h=260&fit=crop',
      quantity: 2,
      size: null,
      color: 'Gold',
      price: 500,
      createdAt: new Date().toISOString(),
      product: undefined as never,
    },
  ],
};

/* ── Timeline step definitions ── */
type StepStatus = 'completed' | 'current' | 'pending';

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  date: string;
  getStatus: (orderStatus: string) => StepStatus;
}

function getTimelineSteps(order: Order): TimelineStep[] {
  const createdDate = new Date(order.createdAt);
  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d: Date, h: number) => {
    const copy = new Date(d);
    copy.setHours(copy.getHours() + h);
    return copy.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return [
    {
      key: 'placed',
      label: 'Order Placed',
      description: 'Your order has been received and confirmed',
      icon: CheckCircle,
      date: formatDate(createdDate),
      getStatus: (s) => ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(s) ? 'completed' : 'pending',
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Payment verified and order confirmed by MIRADEEN',
      icon: CreditCard,
      date: formatTime(createdDate, 2),
      getStatus: (s) => ['confirmed', 'processing', 'shipped', 'delivered'].includes(s) ? 'completed' : 'pending',
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Your items are being carefully packed and inspected',
      icon: Warehouse,
      date: formatTime(createdDate, 24),
      getStatus: (s) => ['processing', 'shipped', 'delivered'].includes(s) ? 'completed' : 'pending',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Package handed to courier — in transit to your city',
      icon: Truck,
      date: formatTime(createdDate, 48),
      getStatus: (s) => s === 'shipped' ? 'current' : ['delivered'].includes(s) ? 'completed' : 'pending',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Estimated delivery by ' + formatDate(new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000)),
      icon: PackageCheck,
      date: '',
      getStatus: (s) => s === 'delivered' ? 'completed' : 'pending',
    },
  ];
}

/* ── Component ── */
export default function OrderTrackingPage() {
  const { navigate, token, isAuthenticated } = useStore();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setNotFound(false);
    setOrder(null);

    try {
      const url = `/api/orders?search=${orderNumber}`;
      const res = await fetch(url, {
        headers: isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const found = (data.orders || []).find(
        (o: Order) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
      );
      if (found) {
        setOrder(found);
      } else {
        // Show demo order for known demo IDs, otherwise show not found
        if (orderNumber.trim().toUpperCase() === 'ORD-001' || orderNumber.trim().toUpperCase() === 'MRD-001') {
          setOrder(DEMO_ORDER);
        } else {
          setNotFound(true);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleCopyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber).then(() => {
      setCopied(true);
      toast({ title: 'Copied!', description: 'Tracking number copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const timelineSteps = order ? getTimelineSteps(order) : [];
  const isCancelled = order?.status === 'cancelled';
  const isDelivered = order?.status === 'delivered';

  const getEstDelivery = () => {
    if (!order) return '';
    const created = new Date(order.createdAt);
    const est = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    return est.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative h-52 md:h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90" />
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center text-white px-4"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Package className="h-8 w-8 text-gold" />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Real-Time Tracking</p>
          <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">Enter your order number below to get real-time updates on your delivery</p>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Search Form ── */}
        <motion.form
          onSubmit={handleTrack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative mb-10"
        >
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Enter order number (e.g., ORD-001)"
                value={orderNumber}
                onChange={(e) => { setOrderNumber(e.target.value); setError(''); setNotFound(false); }}
                className="h-12 pl-10 text-sm border-border focus:border-gold focus:ring-gold/20 focus:ring-2 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="h-12 px-6 sm:px-8 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold transition-all duration-300 shrink-0"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </>
              )}
            </Button>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs mt-2">{error}</motion.p>
          )}
        </motion.form>

        {/* ── Loading State ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Not Found State ── */}
        <AnimatePresence>
          {notFound && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="heading-serif text-xl font-bold mb-2">Order Not Found</h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
                We couldn&apos;t find an order with that number. Please double-check and try again.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Tip: Try searching for <button onClick={() => { setOrderNumber('ORD-001'); }} className="text-gold hover:underline font-medium">ORD-001</button> to see a demo order.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('shop')}
                  className="h-11 px-6 hover:border-gold hover:text-gold transition-colors text-xs"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => { setNotFound(false); setError(''); }}
                  className="h-11 px-6 bg-gold text-background hover:bg-gold-dark text-xs"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Order Found Content ── */}
        <AnimatePresence>
          {order && !loading && !notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* ── Order Details Card ── */}
              <div className="border border-border rounded-xl p-6 bg-card overflow-hidden relative">
                {/* Gold accent top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-0.5">Order Number</p>
                    <div className="flex items-center gap-2">
                      <p className="heading-serif text-xl font-bold text-gold">{order.orderNumber}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.orderNumber);
                          toast({ title: 'Copied!', description: 'Order number copied.' });
                        }}
                        className="text-muted-foreground hover:text-gold transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <Badge
                    className={
                      isCancelled
                        ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800'
                        : isDelivered
                        ? 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800'
                        : 'bg-gold/10 text-gold border-gold/30'
                    }
                  >
                    {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : order.status === 'shipped' ? 'In Transit' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <div className="divider-gold mb-4" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-0.5">Order Date</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-0.5">Items</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-gold" />
                      {order.items.length} item(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-0.5">Total</p>
                    <p className="font-semibold text-gold flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-0.5">Payment</p>
                    <p className="font-medium capitalize flex items-center gap-1.5">
                      <ShieldCheck className={`h-3.5 w-3.5 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'}`} />
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Cancelled State ── */}
              {isCancelled ? (
                <div className="border border-red-200 dark:border-red-800 rounded-xl p-8 bg-red-50/50 dark:bg-red-950/10 text-center">
                  <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
                  <h3 className="heading-serif text-xl font-bold mb-2">Order Cancelled</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This order has been cancelled. If you believe this is an error or need assistance, please contact our support team.
                  </p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button variant="outline" className="text-xs hover:border-gold hover:text-gold" onClick={() => navigate('shop')}>
                      Continue Shopping
                    </Button>
                    <Button className="text-xs bg-gold text-background hover:bg-gold-dark">
                      <Phone className="h-3.5 w-3.5 mr-1.5" /> Contact Support
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Status Timeline ── */}
                  <div className="border border-border rounded-xl p-6 bg-card overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gold" />
                      Order Timeline
                    </h3>

                    <div className="relative pl-2 sm:pl-4">
                      {timelineSteps.map((step, i) => {
                        const status = step.getStatus(order.status);
                        const isLast = i === timelineSteps.length - 1;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
                            {/* Connecting line */}
                            {!isLast && (
                              <div className="absolute left-[15px] sm:left-[19px] top-[36px] bottom-0 w-0.5">
                                <div
                                  className={`w-full h-full ${
                                    status === 'completed'
                                      ? 'bg-gold'
                                      : status === 'current'
                                      ? 'bg-gradient-to-b from-gold to-border'
                                      : 'border-l-2 border-dashed border-muted-foreground/30'
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
                                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                                  className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20"
                                >
                                  <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                                </motion.div>
                              ) : status === 'current' ? (
                                <div className="relative">
                                  <motion.div
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute inset-[-4px] rounded-full bg-gold/30"
                                  />
                                  <div className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30 relative z-10">
                                    <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-background" strokeWidth={2.5} />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                  <StepIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" strokeWidth={1.5} />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1 sm:pt-2 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <div>
                                  <p className={`text-sm font-semibold flex items-center gap-2 ${
                                    status === 'completed' ? 'text-green-700 dark:text-green-400' :
                                    status === 'current' ? 'text-gold' :
                                    'text-muted-foreground'
                                  }`}>
                                    {step.label}
                                    {status === 'completed' && <CheckCircle className="h-3.5 w-3.5" />}
                                    {status === 'current' && (
                                      <Badge className="text-[9px] px-1.5 py-0 bg-gold/10 text-gold border-gold/30 h-4">
                                        In Transit
                                      </Badge>
                                    )}
                                    {status === 'pending' && (
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">
                                        Pending
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                </div>
                                {step.date && (
                                  <p className={`text-[11px] shrink-0 ${
                                    status === 'pending' ? 'text-muted-foreground/50' : 'text-muted-foreground'
                                  }`}>
                                    {step.date}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Shipping Info Card ── */}
                  <div className="border border-border rounded-xl p-6 bg-card overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gold" />
                      Shipping Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tracking Number */}
                      {order.trackingNumber && (
                        <div className="sm:col-span-2 bg-gold/5 border border-gold/20 rounded-lg p-4">
                          <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Tracking Number</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-semibold text-gold flex-1">{order.trackingNumber}</p>
                            <button
                              onClick={handleCopyTracking}
                              className="text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
                            >
                              {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Carrier */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Carrier</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">BlueDart Express</p>
                            <p className="text-[10px] text-muted-foreground">Premium Shipping</p>
                          </div>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Estimated Delivery</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{getEstDelivery()}</p>
                            <p className="text-[10px] text-muted-foreground">7 business days from order</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Shipping to</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{order.shippingName}</p>
                          <p className="text-xs text-muted-foreground">{order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                          <p className="text-xs text-muted-foreground">{order.shippingCountry}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Items in this Order ── */}
                  <div className="border border-border rounded-xl p-6 bg-card overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gold" />
                      Items in this Order
                      <Badge variant="outline" className="text-[9px] ml-1">{order.items.length} item(s)</Badge>
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, i) => {
                        const images = parseJsonField<string>(item.productImage ? [item.productImage] : []);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-200"
                          >
                            <div className="w-14 h-[72px] rounded-lg bg-muted overflow-hidden shrink-0">
                              {images[0] && (
                                <img src={images[0]} alt="" className="w-full h-full object-cover" />
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
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Subtotal</span>
                          <span>₹{(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)).toLocaleString()}</span>
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
                        <div className="divider-gold my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-gold">₹{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Help Section ── */}
                  <div className="border border-border rounded-xl p-6 bg-card overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gold" />
                      Need Help?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Our support team is available to assist you with any questions about your order.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <a
                        href="https://wa.me/919876543210"
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

                      <a
                        href="mailto:support@miradeen.com"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/[0.02] transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                          <Mail className="h-5 w-5 text-gold" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-[10px] text-muted-foreground">support@miradeen.com</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                      </a>

                      <a
                        href="tel:+919876543210"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-[10px] text-muted-foreground">+91 98765 43210</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State (no search yet) ── */}
        {!order && !loading && !notFound && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Animated rings */}
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
              <div className="absolute inset-6 rounded-full bg-gold/5 flex items-center justify-center">
                <Truck className="h-10 w-10 text-gold/60" />
              </div>
            </div>
            <h3 className="heading-serif text-xl font-bold mb-2">Track Your Package</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Enter your order number above to see real-time status updates, estimated delivery, and shipping details.
            </p>
            <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 text-xs text-muted-foreground">
              <span>Try</span>
              <button
                onClick={() => { setOrderNumber('ORD-001'); }}
                className="text-gold hover:underline font-mono font-medium bg-gold/10 px-2 py-0.5 rounded"
              >
                ORD-001
              </button>
              <span>to see a demo</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
