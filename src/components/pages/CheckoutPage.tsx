'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cart, getCartSubtotal, getCartTotal, couponDiscount, couponCode, clearCart, navigate, isAuthenticated, user } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zipCode || '',
    country: user?.country || 'India',
  });

  const subtotal = getCartSubtotal();
  const discount = couponDiscount;
  const shippingCost = subtotal >= 2000 ? 0 : 149;
  const total = subtotal - discount + shippingCost;

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to place an order', variant: 'destructive' });
      navigate('auth');
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('miradeen-token')}`,
        },
        body: JSON.stringify({
          items,
          shipping: shippingCost,
          shippingName: shipping.name,
          shippingEmail: shipping.email,
          shippingPhone: shipping.phone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingState: shipping.state,
          shippingZip: shipping.zip,
          shippingCountry: shipping.country,
          discount,
          couponCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Order failed');
      }

      const data = await res.json();
      setOrderNumber(data.order.orderNumber);
      setOrderSuccess(true);
      clearCart();
    } catch (err: unknown) {
      toast({ title: 'Order failed', description: err instanceof Error ? err.message : 'Something went wrong', variant: 'destructive' });
    }
    setLoading(false);
  };

  if (cart.length === 0 && !orderSuccess) {
    navigate('cart');
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="heading-serif text-3xl font-bold mb-2">Order Placed!</h2>
          <p className="text-muted-foreground mb-2">Thank you for shopping with MIRADEEN</p>
          <p className="text-sm font-medium mb-6">Order Number: <span className="text-gold">{orderNumber}</span></p>
          <p className="text-xs text-muted-foreground mb-8">A confirmation has been sent to your email. Your order will be processed shortly.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('orders')} variant="outline" className="tracking-wider uppercase text-xs">View Orders</Button>
            <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs">Continue Shopping</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Shipping', 'Payment', 'Confirmation'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${step > i + 1 ? 'bg-gold text-background' : step === i + 1 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < 2 && <div className="w-8 md:w-16 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-lg font-semibold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Label>Full Name *</Label><Input value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} className="mt-1" /></div>
                  <div><Label>Email *</Label><Input type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} className="mt-1" /></div>
                  <div><Label>Phone *</Label><Input value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="mt-1" /></div>
                  <div className="sm:col-span-2"><Label>Address *</Label><Input value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="mt-1" /></div>
                  <div><Label>City *</Label><Input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="mt-1" /></div>
                  <div><Label>State *</Label><Input value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="mt-1" /></div>
                  <div><Label>ZIP Code *</Label><Input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} className="mt-1" /></div>
                  <div><Label>Country</Label><Input value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="mt-1" /></div>
                </div>
                <Button onClick={() => setStep(2)} className="mt-6 w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-wider uppercase text-xs font-semibold">
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-lg font-semibold mb-6">Payment Method</h2>
                <div className="border border-border rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-gold" />
                    <div>
                      <p className="font-medium text-sm">PayPal</p>
                      <p className="text-xs text-muted-foreground">Secure payment via PayPal</p>
                    </div>
                  </div>
                </div>
                <div className="bg-cream dark:bg-card rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
                  <Button onClick={() => { setStep(3); handleSubmitOrder(); }} disabled={loading} className="flex-1 h-12 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold btn-luxury">
                    {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" />
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="heading-serif text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map((item) => {
                  const images = parseJsonField<string>(item.product.images);
                  return (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <div className="w-14 h-18 rounded bg-muted overflow-hidden shrink-0">
                        <img src={images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}{item.size ? ` | ${item.size}` : ''}</p>
                        <p className="text-xs font-medium mt-0.5">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="divider-gold mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                <div className="divider-gold" />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
