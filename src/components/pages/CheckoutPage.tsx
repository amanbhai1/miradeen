'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, Check, ShoppingBag, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from '@/types';

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const { cart, getCartSubtotal, getCartTotal, couponDiscount, couponCode, clearCart, navigate, isAuthenticated, user } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

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
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal - discount + shippingCost + tax;

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!shipping.name.trim()) newErrors.name = 'Name is required';
    if (!shipping.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) newErrors.email = 'Invalid email';
    if (!shipping.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!shipping.address.trim()) newErrors.address = 'Address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State is required';
    if (!shipping.zip.trim()) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to place an order', description: 'You need an account to checkout', variant: 'destructive' });
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
          tax,
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
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Check className="h-12 w-12 text-green-600" />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 border-2 border-green-500/20 rounded-full"
            />
          </div>
          <h2 className="heading-serif text-3xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mb-2">Thank you for shopping with MIRADEEN</p>
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-lg mb-6">
            <p className="text-sm">Order Number:</p>
            <p className="font-bold text-gold">{orderNumber}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-8">A confirmation has been sent to your email. Your order will be processed shortly.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('orders')} variant="outline" className="tracking-wider uppercase text-xs hover:border-gold hover:text-gold transition-colors">View Orders</Button>
            <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs">Continue Shopping</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `mt-1 h-11 border-border focus:border-gold transition-colors ${errors[field] ? 'border-destructive focus:border-destructive' : ''}`;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative h-40 md:h-48 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920" alt="Checkout" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Secure Checkout</p>
          <h1 className="heading-serif text-3xl md:text-4xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Shipping', desc: 'Delivery details' },
            { num: 2, label: 'Payment', desc: 'Payment method' },
            { num: 3, label: 'Confirmation', desc: 'Place order' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step > s.num ? 'bg-gold text-background' :
                  step === s.num ? 'bg-foreground text-background shadow-lg' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <div className="hidden sm:block mt-1.5">
                  <p className={`text-xs font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              {i < 2 && (
                <div className={`w-8 md:w-16 h-px mt-[-16px] sm:mt-0 transition-colors duration-300 ${step > s.num ? 'bg-gold' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="border border-border rounded-xl p-6 md:p-8 bg-card">
                    <h2 className="text-lg font-semibold mb-1">Shipping Information</h2>
                    <p className="text-sm text-muted-foreground mb-6">Where should we deliver your order?</p>

                    {/* Error summary */}
                    {Object.keys(errors).length > 0 && (
                      <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-6 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Please fix the errors below to continue
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label className="text-xs tracking-wider uppercase">Full Name *</Label>
                        <Input value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} className={inputClass('name')} placeholder="John Doe" />
                        {errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Email *</Label>
                        <Input type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} className={inputClass('email')} placeholder="you@email.com" />
                        {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Phone *</Label>
                        <Input value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className={inputClass('phone')} placeholder="+91 9876543210" />
                        {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs tracking-wider uppercase">Address *</Label>
                        <Input value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className={inputClass('address')} placeholder="Street address, apartment, suite" />
                        {errors.address && <p className="text-[10px] text-destructive mt-1">{errors.address}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">City *</Label>
                        <Input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className={inputClass('city')} placeholder="Mumbai" />
                        {errors.city && <p className="text-[10px] text-destructive mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">State *</Label>
                        <Input value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className={inputClass('state')} placeholder="Maharashtra" />
                        {errors.state && <p className="text-[10px] text-destructive mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">ZIP Code *</Label>
                        <Input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} className={inputClass('zip')} placeholder="400001" />
                        {errors.zip && <p className="text-[10px] text-destructive mt-1">{errors.zip}</p>}
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Country</Label>
                        <Input value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="mt-1 h-11 border-border focus:border-gold transition-colors" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleNextStep} className="mt-6 w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="border border-border rounded-xl p-6 md:p-8 bg-card">
                    <h2 className="text-lg font-semibold mb-1">Payment Method</h2>
                    <p className="text-sm text-muted-foreground mb-6">Choose your preferred payment method</p>

                    {/* Payment Method Selection */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 border-2 border-gold rounded-lg p-4 bg-gold/5 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-gold flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-gold rounded-full" />
                        </div>
                        <CreditCard className="h-6 w-6 text-gold" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">PayPal</p>
                          <p className="text-xs text-muted-foreground">Secure payment via PayPal — you&apos;ll be redirected</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border border-border rounded-lg p-4 cursor-not-allowed opacity-50">
                        <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center" />
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Credit/Debit Card</p>
                          <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>
                        <Badge variant="outline" className="text-[9px]">Soon</Badge>
                      </div>
                    </div>

                    {/* Shipping Summary */}
                    <div className="bg-cream dark:bg-card/50 rounded-lg p-4 mb-6">
                      <p className="text-xs tracking-wider uppercase text-muted-foreground mb-2">Delivering to:</p>
                      <p className="text-sm font-medium">{shipping.name}</p>
                      <p className="text-sm text-muted-foreground">{shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                      <button onClick={() => setStep(1)} className="text-xs text-gold hover:underline mt-1 transition-colors">Change address</button>
                    </div>

                    <div className="bg-cream dark:bg-card/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3.5 w-3.5 text-green-600" />
                        <span>Your payment information is encrypted and secure. We never store your card details.</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 hover:border-gold hover:text-gold transition-colors">Back</Button>
                      <Button onClick={() => { setStep(3); handleSubmitOrder(); }} disabled={loading} className="flex-1 h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury">
                        {loading ? (
                          <div className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                          `Pay ₹${total.toLocaleString()}`
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                  <p className="mt-6 text-sm font-medium">Processing your order...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please do not close this page</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-border rounded-xl p-6 bg-card">
              <h3 className="heading-serif text-lg font-bold mb-4">Order Summary</h3>
              <p className="text-xs text-muted-foreground mb-4">{getCartCount()} item(s) in your cart</p>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar mb-4 pr-1">
                {cart.map((item) => {
                  const images = parseJsonField<string>(item.product.images);
                  return (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600 text-xs font-medium' : ''}>
                    {shippingCost === 0 ? '✓ Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="divider-gold" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {shippingCost > 0 && (
                <div className="mt-3 bg-gold/5 border border-gold/20 rounded-lg p-3">
                  <p className="text-[10px] text-center text-muted-foreground">
                    Add ₹{(2000 - subtotal).toLocaleString()} more for <span className="text-gold font-medium">free shipping</span>
                  </p>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: Lock, label: 'SSL Secure' },
                { icon: CreditCard, label: 'PayPal' },
                { icon: Check, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 text-center">
                  <Icon className="h-4 w-4 text-gold" />
                  <span className="text-[9px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
