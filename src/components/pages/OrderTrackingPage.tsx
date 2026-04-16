'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, ChevronRight, CheckCircle, Clock, Truck, MapPin, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Order } from '@/types';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-yellow-500' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'processing', label: 'Processing', icon: Package, color: 'text-purple-500' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-orange-500' },
  { key: 'delivered', label: 'Delivered', icon: MapPin, color: 'text-green-500' },
];

export default function OrderTrackingPage() {
  const { navigate, token, isAuthenticated } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const url = isAuthenticated && token
        ? `/api/orders?search=${orderNumber}`
        : `/api/orders?search=${orderNumber}`;
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
        setError('Order not found. Please check your order number.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const idx = ORDER_STEPS.findIndex(s => s.key === order.status);
    return idx >= 0 ? idx : 0;
  };

  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90" />
        <div className="relative z-10 text-center text-white px-4">
          <Package className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Track Your Order</p>
          <h1 className="heading-serif text-3xl md:text-4xl font-bold">Order Status</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-2 mb-10">
          <Input
            placeholder="Enter your order number (e.g., MRD-001)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="h-12 flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold"
          >
            {loading ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Track</>}
          </Button>
        </form>

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="link" className="mt-2 text-gold text-xs" onClick={() => navigate('shop')}>
              Continue Shopping <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}

        {order && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Order Summary */}
            <div className="border border-border rounded-lg p-6 bg-card mb-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Order Number</p>
                  <p className="heading-serif text-xl font-bold text-gold">{order.orderNumber}</p>
                </div>
                <Badge className={isCancelled ? 'bg-red-500 text-white' : 'bg-gold text-background'}>
                  {order.status}
                </Badge>
              </div>
              <div className="divider-gold my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="font-medium">{order.items.length} item(s)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{order.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <div className="border border-border rounded-lg p-8 bg-card text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="heading-serif text-xl font-bold mb-2">Order Cancelled</h3>
                <p className="text-sm text-muted-foreground">This order has been cancelled. If you have questions, please contact support.</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="font-semibold mb-6">Order Timeline</h3>
                <div className="relative">
                  {/* Progress bar */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-border">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex() / (ORDER_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between relative">
                    {ORDER_STEPS.map((step, i) => {
                      const isCompleted = i <= getCurrentStepIndex();
                      const isCurrent = i === getCurrentStepIndex();
                      const StepIcon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gold text-background'
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-gold/20 animate-pulse-gold' : ''}`}>
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <p className={`text-[10px] mt-2 text-center ${
                            isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking number */}
                {order.trackingNumber && (
                  <div className="mt-6 p-3 bg-gold/5 border border-gold/20 rounded-md">
                    <p className="text-xs text-muted-foreground">Tracking Number</p>
                    <p className="font-mono text-sm font-medium text-gold">{order.trackingNumber}</p>
                  </div>
                )}

                {/* Shipping address */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground mb-1">Shipping to</p>
                  <p className="text-sm">{order.shippingName}</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Items in this Order</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card">
                    <div className="w-14 h-18 rounded bg-muted overflow-hidden shrink-0">
                      {item.productImage && (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}{item.size ? ` | Size: ${item.size}` : ''}{item.color ? ` | Color: ${item.color}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
