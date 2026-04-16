'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, Check, ShoppingBag, AlertCircle, ChevronRight, ChevronLeft, Package, MapPin, CheckCircle2, Gift, Sparkles, Shield, Truck, RotateCcw, ShoppingCart, Banknote, Timer, Heart, Smartphone, Landmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from '@/types';

const GIFT_WRAP_OPTIONS = [
  { id: 'gold-box', label: 'Premium Gold Box', desc: 'Elegant matte gold box with satin ribbon', emoji: '🎁' },
  { id: 'silver-bag', label: 'Silver Gift Bag', desc: 'Metallic silver bag with tissue paper', emoji: '✨' },
  { id: 'black-luxury', label: 'Black Luxury Box', desc: 'Velvet-lined black box with wax seal', emoji: '🖤' },
];

const GIFT_WRAP_COST = 199;

interface FormErrors {
  [key: string]: string;
}

function getEstimatedDeliveryDate(): string {
  const now = new Date();
  let businessDays = 0;
  while (businessDays < 7) {
    now.setDate(now.getDate() + 1);
    const day = now.getDay();
    if (day !== 0 && day !== 6) businessDays++;
  }
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getMinDeliveryDate(): string {
  const now = new Date();
  let businessDays = 0;
  while (businessDays < 5) {
    now.setDate(now.getDate() + 1);
    const day = now.getDay();
    if (day !== 0 && day !== 6) businessDays++;
  }
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STEPS = [
  { num: 1, label: 'Cart', icon: ShoppingCart, desc: 'Review items' },
  { num: 2, label: 'Shipping', icon: MapPin, desc: 'Delivery details' },
  { num: 3, label: 'Payment', icon: CreditCard, desc: 'Payment method' },
  { num: 4, label: 'Confirmation', icon: CheckCircle2, desc: 'Place order' },
];

const TRUST_BADGES = [
  { icon: Shield, label: 'Secure Payment', desc: '256-bit SSL encryption' },
  { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: Truck, label: 'Fast Delivery', desc: '2-5 business days' },
];

export default function CheckoutPage() {
  const { cart, getCartSubtotal, getCartTotal, getCartCount, couponDiscount, couponCode, applyCoupon, removeCoupon, clearCart, navigate, isAuthenticated, user } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'upi' | 'net-banking' | 'cod'>('credit-card');
  const [couponLoading, setCouponLoading] = useState(false);
  const [[page, direction], setPage] = useState([2, 0]);

  // Gift wrap state
  const [giftWrapEnabled, setGiftWrapEnabled] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftWrapOption, setGiftWrapOption] = useState('gold-box');

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address1: user?.address || '',
    address2: '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zipCode || '',
    country: user?.country || 'India',
  });

  const hasSavedAddress = isAuthenticated && (user?.address || user?.city || user?.state || user?.zipCode);

  const subtotal = getCartSubtotal();
  const discount = couponDiscount;
  const shippingCost = subtotal >= 2000 ? 0 : 149;
  const tax = Math.round(subtotal * 0.05);
  const giftWrapTotal = giftWrapEnabled ? GIFT_WRAP_COST : 0;
  const total = subtotal - discount + shippingCost + tax + giftWrapTotal;

  const estimatedDelivery = useMemo(() => getEstimatedDeliveryDate(), []);
  const minDeliveryDate = useMemo(() => getMinDeliveryDate(), []);

  const validateField = (field: string): string | undefined => {
    switch (field) {
      case 'name': {
        if (!shipping.name.trim()) return 'Name is required';
        if (shipping.name.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      }
      case 'email': {
        if (!shipping.email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) return 'Please enter a valid email address';
        return undefined;
      }
      case 'phone': {
        if (!shipping.phone.trim()) return 'Phone number is required';
        const digits = shipping.phone.replace(/\D/g, '');
        if (digits.length !== 10) return 'Phone number must be exactly 10 digits';
        if (!/^[6-9]/.test(digits)) return 'Phone number must start with 6, 7, 8, or 9';
        return undefined;
      }
      case 'address1': {
        if (!shipping.address1.trim()) return 'Address is required';
        if (shipping.address1.trim().length < 5) return 'Please enter a complete address';
        return undefined;
      }
      case 'city': {
        if (!shipping.city.trim()) return 'City is required';
        return undefined;
      }
      case 'state': {
        if (!shipping.state.trim()) return 'State is required';
        return undefined;
      }
      case 'zip': {
        if (!shipping.zip.trim()) return 'ZIP code is required';
        if (!/^\d{6}$/.test(shipping.zip.trim())) return 'Enter a valid 6-digit PIN code';
        return undefined;
      }
      case 'country': {
        if (!shipping.country.trim()) return 'Country is required';
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    const allFields = ['name', 'email', 'phone', 'address1', 'city', 'state', 'zip', 'country'];
    allFields.forEach(field => {
      const error = validateField(field);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(allFields.map(k => [k, true])));
    return Object.keys(newErrors).length === 0;
  };

  const handleUseSavedAddress = () => {
    if (!user) return;
    setShipping({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address1: user.address || '',
      address2: '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zipCode || '',
      country: user.country || 'India',
    });
    setErrors({});
    setTouched({});
    toast({ title: 'Address loaded', description: 'Your saved address has been filled in.' });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (cart.length === 0) return;
      setStep(2);
    } else if (step === 2) {
      if (validateStep1()) {
        setStep(3);
        setErrors({});
      }
    } else if (step === 3) {
      setStep(4);
      handleSubmitOrder();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    // Simulate API call for realistic UX
    await new Promise(resolve => setTimeout(resolve, 800));
    const success = applyCoupon(couponInput);
    setCouponLoading(false);
    if (success) {
      setCouponApplied(true);
      toast({ title: 'Coupon applied!', description: `Discount of ₹${Math.round(discount).toLocaleString()} has been applied.` });
    } else {
      setCouponError('Invalid coupon code');
      toast({ title: 'Invalid coupon', description: 'Please check the coupon code and try again.', variant: 'destructive' });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponApplied(false);
    setCouponError('');
    toast({ title: 'Coupon removed', description: 'The discount has been removed.' });
  };

  const handleGiftWrapToggle = (checked: boolean) => {
    setGiftWrapEnabled(checked);
    if (checked) {
      toast({ title: 'Gift wrapping added', description: `₹${GIFT_WRAP_COST} has been added for premium gift wrapping.` });
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
          shippingAddress: [shipping.address1, shipping.address2].filter(Boolean).join(', '),
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
      setLoading(false);
      setStep(3);
    }
  };

  if (cart.length === 0 && !orderSuccess) {
    navigate('cart');
    return null;
  }

  /* ─── ORDER SUCCESS (Confirmation View) ─── */
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Banner */}
        <div className="relative h-40 md:h-48 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E]/10 via-background to-[#C9A96E]/5" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,169,110,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(201,169,110,0.05) 0%, transparent 50%)' }} />
          <div className="relative z-10 text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Order Confirmed</p>
            <h1 className="heading-serif text-3xl md:text-4xl font-bold">Thank You</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Animated Checkmark */}
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))', border: '2px solid rgba(201,169,110,0.3)' }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 0.6, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9A96E, #d4b87a)' }}
                >
                  <Check className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [0.8, 1.3, 1], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-gold/20"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [0.8, 1.5, 1.2], opacity: [0.5, 0.1, 0] }}
                transition={{ duration: 1.4, delay: 1, ease: 'easeOut' }}
                className="absolute inset-[-10px] rounded-full border border-gold/10"
              />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="heading-serif text-3xl md:text-4xl font-bold mb-3"
            >
              Order Placed Successfully!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground mb-8"
            >
              Thank you for choosing MIRADEEN. Your luxury pieces are on their way.
            </motion.p>

            {/* Order Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="card-luxury p-6 md:p-8 rounded-xl mb-6 text-left"
            >
              <div className="divider-luxury-enhanced mb-6" />

              {/* Order Number */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">Order Number</p>
                  <p className="heading-serif text-xl font-bold text-gold">{orderNumber}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3, type: 'spring' }}
                  className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center"
                >
                  <Package className="h-6 w-6 text-gold" />
                </motion.div>
              </div>

              <div className="divider-luxury-enhanced mb-5" />

              {/* Delivery Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                    <p className="text-sm font-medium">{minDeliveryDate} — {estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Shipping To</p>
                    <p className="text-sm font-medium">{shipping.name}</p>
                    <p className="text-xs text-muted-foreground">{[shipping.address1, shipping.address2].filter(Boolean).join(', ')}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="text-sm font-medium">
                  {paymentMethod === 'credit-card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'net-banking' ? 'Net Banking' : 'Cash on Delivery'}
                </p>
                  </div>
                </div>
              </div>

              <div className="divider-luxury-enhanced mt-5 mb-4" />

              <p className="text-xs text-muted-foreground text-center">
                A confirmation email has been sent to <span className="text-foreground font-medium">{shipping.email}</span>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={() => navigate('order-tracking')}
                variant="outline"
                className="h-12 px-8 tracking-wider uppercase text-xs hover:border-gold hover:text-gold transition-all duration-300 flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Track Order
              </Button>
              <Button
                onClick={() => navigate('shop')}
                className="h-12 px-8 bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs font-semibold btn-luxury flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `input-luxury mt-1 h-11 transition-all duration-300 ${touched[field] && errors[field] ? 'input-error' : ''}`;

  const showError = (field: string) => touched[field] && errors[field];

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
  };

  const goToStep = (newStep: number) => {
    const dir = newStep > step ? 1 : -1;
    setPage([newStep, dir]);
    setStep(newStep);
  };

  return (
    <div className="min-h-screen bg-background">
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
        {/* ─── Step Indicator ─── */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, i) => {
            const IconComp = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.label} className="flex items-center">
                <button
                  onClick={() => { if (isCompleted) goToStep(s.num); }}
                  disabled={!isCompleted && !isActive}
                  className="flex flex-col items-center group"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      boxShadow: isActive ? '0 0 0 4px rgba(201,169,110,0.2)' : '0 0 0 0 rgba(201,169,110,0)',
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gold text-white shadow-lg shadow-gold/20'
                        : isActive
                          ? 'bg-gold text-white shadow-lg shadow-gold/20'
                          : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <IconComp className="h-5 w-5" />
                    )}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium transition-colors duration-300 ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 hidden sm:block ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
                      {s.desc}
                    </p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 md:mx-6 mt-[-24px] sm:mt-0">
                    <motion.div
                      animate={{
                        backgroundColor: step > s.num ? '#C9A96E' : 'rgba(0,0,0,0.1)',
                        width: isActive ? '100%' : isCompleted ? '100%' : '100%',
                      }}
                      transition={{ duration: 0.5 }}
                      className="w-8 md:w-16 lg:w-20 h-0.5 rounded-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ─── Main Content Area ─── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait" custom={direction}>
              {/* STEP 1: Cart Review */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div className="card-luxury p-6 md:p-8 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="heading-serif text-xl font-bold">Review Your Cart</h2>
                        <p className="text-sm text-muted-foreground">{getCartCount()} item(s)</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('cart')}
                        className="text-xs text-gold hover:text-gold hover:bg-gold/10 transition-colors h-auto py-1 px-3 gap-1.5"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Edit Cart
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {cart.map((item) => {
                        const images = parseJsonField<string>(item.product.images);
                        return (
                          <motion.div
                            key={`${item.product.id}-${item.size}`}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-gold/20 transition-all duration-300"
                          >
                            <div className="w-20 h-24 md:w-24 md:h-28 rounded-lg bg-muted overflow-hidden shrink-0">
                              <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' | '}
                                {item.color && `Color: ${item.color}`}
                              </p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-gold mt-1">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="mt-6 w-full h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury flex items-center justify-center gap-2"
                  >
                    Proceed to Shipping <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: Shipping */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div className="card-luxury p-6 md:p-8 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="heading-serif text-xl font-bold">Shipping Information</h2>
                      {hasSavedAddress && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleUseSavedAddress}
                          className="text-xs text-gold hover:text-gold hover:bg-gold/10 transition-colors h-auto py-1 px-3 gap-1.5"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Use Saved Address
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">Where should we deliver your order?</p>

                    {/* Saved Address Card */}
                    {hasSavedAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg border border-gold/20 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-all duration-300"
                        onClick={handleUseSavedAddress}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="h-4 w-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">Saved Address</p>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user?.address}, {user?.city}, {user?.state} {user?.zipCode}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 text-xs bg-gold text-background hover:bg-gold-dark shrink-0"
                          >
                            Use This
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Error summary */}
                    {Object.keys(errors).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-6 text-sm"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Please complete all required fields — {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's need' : ' needs'} attention
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">Full Name *</Label>
                        <Input value={shipping.name} onChange={(e) => { setShipping({ ...shipping, name: e.target.value }); if (touched.name) handleBlur('name'); }} onBlur={() => handleBlur('name')} className={inputClass('name')} placeholder="John Doe" />
                        <AnimatePresence>
                          {showError('name') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.name}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Email */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">Email *</Label>
                        <Input type="email" value={shipping.email} onChange={(e) => { setShipping({ ...shipping, email: e.target.value }); if (touched.email) handleBlur('email'); }} onBlur={() => handleBlur('email')} className={inputClass('email')} placeholder="you@email.com" />
                        <AnimatePresence>
                          {showError('email') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.email}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Phone */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">Phone *</Label>
                        <Input value={shipping.phone} onChange={(e) => {
                          const val = e.target.value.replace(/[^\d+]/g, '');
                          setShipping({ ...shipping, phone: val });
                          if (touched.phone) handleBlur('phone');
                        }} onBlur={() => handleBlur('phone')} className={inputClass('phone')} placeholder="9876543210" />
                        <AnimatePresence>
                          {showError('phone') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.phone}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Address Line 1 */}
                      <div className="sm:col-span-2">
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">Address Line 1 *</Label>
                        <Input value={shipping.address1} onChange={(e) => { setShipping({ ...shipping, address1: e.target.value }); if (touched.address1) handleBlur('address1'); }} onBlur={() => handleBlur('address1')} className={inputClass('address1')} placeholder="Street address, apartment, suite" />
                        <AnimatePresence>
                          {showError('address1') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.address1}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Address Line 2 */}
                      <div className="sm:col-span-2">
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                          Address Line 2
                          <span className="normal-case text-muted-foreground/70 ml-1">(optional)</span>
                        </Label>
                        <Input value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} className="input-luxury mt-1 h-11 transition-all duration-300" placeholder="Apartment, suite, unit, building, floor, etc." />
                      </div>

                      {/* City */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">City *</Label>
                        <Input value={shipping.city} onChange={(e) => { setShipping({ ...shipping, city: e.target.value }); if (touched.city) handleBlur('city'); }} onBlur={() => handleBlur('city')} className={inputClass('city')} placeholder="Mumbai" />
                        <AnimatePresence>
                          {showError('city') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.city}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* State */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">State *</Label>
                        <Input value={shipping.state} onChange={(e) => { setShipping({ ...shipping, state: e.target.value }); if (touched.state) handleBlur('state'); }} onBlur={() => handleBlur('state')} className={inputClass('state')} placeholder="Maharashtra" />
                        <AnimatePresence>
                          {showError('state') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.state}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">ZIP Code *</Label>
                        <Input value={shipping.zip} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setShipping({ ...shipping, zip: val }); if (touched.zip) handleBlur('zip'); }} onBlur={() => handleBlur('zip')} className={inputClass('zip')} placeholder="400001" />
                        <AnimatePresence>
                          {showError('zip') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.zip}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Country */}
                      <div>
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground">Country *</Label>
                        <Input value={shipping.country} onChange={(e) => { setShipping({ ...shipping, country: e.target.value }); if (touched.country) handleBlur('country'); }} onBlur={() => handleBlur('country')} className={`input-luxury mt-1 h-11 transition-all duration-300 ${touched.country && errors.country ? 'input-error' : ''}`} placeholder="India" />
                        <AnimatePresence>
                          {showError('country') && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.country}</motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={handlePrevStep} variant="outline" className="flex-1 h-12 hover:border-gold hover:text-gold transition-all duration-300 flex items-center justify-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Back to Cart
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1 h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury flex items-center justify-center gap-2">
                      Continue to Payment <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div className="card-luxury p-6 md:p-8 rounded-xl">
                    <h2 className="heading-serif text-xl font-bold mb-1">Payment Method</h2>
                    <p className="text-sm text-muted-foreground mb-6">Choose your preferred payment method</p>

                    {/* Payment Method Selection */}
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'credit-card' | 'upi' | 'net-banking' | 'cod')} className="space-y-3 mb-6">

                      {/* Credit / Debit Card */}
                      <label
                        htmlFor="credit-card"
                        className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          paymentMethod === 'credit-card'
                            ? 'border-gold bg-gold/5 shadow-md shadow-gold/10'
                            : 'border-border hover:border-gold/40 hover:bg-muted/20'
                        }`}
                      >
                        <RadioGroupItem value="credit-card" id="credit-card" className="border-gold data-[state=checked]:border-gold data-[state=checked]:bg-gold" />
                        <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-charcoal to-[#1a1a1a] flex items-center justify-center shrink-0">
                          <CreditCard className="h-5 w-5 text-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Credit / Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay accepted</p>
                        </div>
                        {paymentMethod === 'credit-card' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-5 w-5 text-gold" />
                          </motion.div>
                        )}
                      </label>

                      {/* UPI */}
                      <label
                        htmlFor="upi"
                        className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          paymentMethod === 'upi'
                            ? 'border-gold bg-gold/5 shadow-md shadow-gold/10'
                            : 'border-border hover:border-gold/40 hover:bg-muted/20'
                        }`}
                      >
                        <RadioGroupItem value="upi" id="upi" className="border-gold data-[state=checked]:border-gold data-[state=checked]:bg-gold" />
                        <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-[#5B2F8F] to-[#8B5CF6] flex items-center justify-center shrink-0">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">UPI</p>
                          <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                        {paymentMethod === 'upi' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-5 w-5 text-gold" />
                          </motion.div>
                        )}
                      </label>

                      {/* Net Banking */}
                      <label
                        htmlFor="net-banking"
                        className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          paymentMethod === 'net-banking'
                            ? 'border-gold bg-gold/5 shadow-md shadow-gold/10'
                            : 'border-border hover:border-gold/40 hover:bg-muted/20'
                        }`}
                      >
                        <RadioGroupItem value="net-banking" id="net-banking" className="border-gold data-[state=checked]:border-gold data-[state=checked]:bg-gold" />
                        <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#0066CC] flex items-center justify-center shrink-0">
                          <Landmark className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Net Banking</p>
                          <p className="text-xs text-muted-foreground">All major Indian banks supported</p>
                        </div>
                        {paymentMethod === 'net-banking' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-5 w-5 text-gold" />
                          </motion.div>
                        )}
                      </label>

                      {/* Cash on Delivery */}
                      <label
                        htmlFor="cod"
                        className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          paymentMethod === 'cod'
                            ? 'border-gold bg-gold/5 shadow-md shadow-gold/10'
                            : 'border-border hover:border-gold/40 hover:bg-muted/20'
                        }`}
                      >
                        <RadioGroupItem value="cod" id="cod" className="border-gold data-[state=checked]:border-gold data-[state=checked]:bg-gold" />
                        <div className="w-12 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Banknote className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground">Pay when your order arrives at your doorstep</p>
                        </div>
                        {paymentMethod === 'cod' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="h-5 w-5 text-gold" />
                          </motion.div>
                        )}
                      </label>
                    </RadioGroup>

                    {/* Order Total Display */}
                    <div className="rounded-xl bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/20 p-5 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gold" />
                          <span className="text-sm font-medium">Order Total</span>
                        </div>
                        <span className="heading-serif text-2xl font-bold text-gold">₹{total.toLocaleString()}</span>
                      </div>
                      {shippingCost === 0 && (
                        <p className="text-[10px] text-green-600 mt-1 ml-6">✓ Free shipping included</p>
                      )}
                    </div>

                    {/* Shipping Summary */}
                    <div className="rounded-lg bg-muted/30 p-4 mb-6 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs tracking-wider uppercase text-muted-foreground">Delivering to</p>
                        <button onClick={() => goToStep(2)} className="text-xs text-gold hover:underline transition-colors">Change</button>
                      </div>
                      <p className="text-sm font-medium">{shipping.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[shipping.address1, shipping.address2].filter(Boolean).join(', ')}, {shipping.city}, {shipping.state} {shipping.zip}
                      </p>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
                      <Lock className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span>Your payment information is encrypted and secure. We never store your payment details.</span>
                    </div>

                    {/* Security Trust Badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 grid grid-cols-3 gap-3"
                    >
                      {[
                        { icon: Shield, label: 'SSL Secure', sublabel: '256-bit encryption' },
                        { icon: Lock, label: 'PCI Compliant', sublabel: 'Industry standard' },
                        { icon: CheckCircle2, label: 'Secure Payment', sublabel: '100% safe' },
                      ].map(({ icon: BadgeIcon, label, sublabel }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-gradient-to-b from-gold/5 to-transparent border border-gold/10">
                          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                            <BadgeIcon className="h-4 w-4 text-gold" />
                          </div>
                          <p className="text-[10px] font-semibold text-foreground leading-tight text-center">{label}</p>
                          <p className="text-[8px] text-muted-foreground leading-tight text-center">{sublabel}</p>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={handlePrevStep} variant="outline" className="flex-1 h-12 hover:border-gold hover:text-gold transition-all duration-300 flex items-center justify-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={loading}
                      className="flex-1 h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <>Place Order — ₹{total.toLocaleString()} <ChevronRight className="h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Processing / Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  {!orderSuccess && (
                    <>
                      <div className="relative mb-8">
                        <div className="h-20 w-20 border-[3px] border-gold/30 border-t-gold rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-7 w-7 text-gold" />
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-[-12px] rounded-full border border-gold/10"
                        />
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="heading-serif text-lg font-semibold"
                      >
                        Processing Your Order
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-muted-foreground mt-1"
                      >
                        Please do not close this page...
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 flex items-center gap-6 text-xs text-muted-foreground"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                          Verifying payment
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
                          Confirming order
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Order Summary Sidebar ─── */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="card-luxury shadow-luxury-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <h3 className="heading-serif text-lg font-bold">Order Summary</h3>
                <Badge variant="outline" className="text-[10px] text-gold border-gold/30">{getCartCount()} items</Badge>
              </div>

              {/* Cart Items */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar mb-4 pr-1 mt-3">
                {cart.map((item) => {
                  const images = parseJsonField<string>(item.product.images);
                  return (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-14 h-[4.5rem] rounded-lg bg-muted overflow-hidden shrink-0">
                        <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Qty: {item.quantity}
                          {item.size ? ` | ${item.size}` : ''}
                          {item.color ? ` | ${item.color}` : ''}
                        </p>
                        <p className="text-xs font-semibold text-gold mt-0.5">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code */}
              <div className="divider-luxury-enhanced mb-4" />
              <div className="mb-4">
                <p className="text-xs tracking-wider uppercase text-muted-foreground mb-2">Coupon Code</p>
                {couponApplied && couponCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    </motion.div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400 flex-1">{couponCode}</span>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">-₹{discount.toLocaleString()}</span>
                    <button onClick={handleRemoveCoupon} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors ml-1">Remove</button>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                      placeholder="Enter code"
                      className={`h-9 text-xs input-luxury ${couponError ? 'input-error' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="h-9 text-xs hover:border-gold hover:text-gold transition-all duration-300 shrink-0 btn-shine min-w-[64px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
                {couponError && !couponApplied && (
                  <p className="text-[10px] text-destructive mt-1">{couponError}</p>
                )}
              </div>

              {/* Gift Wrapping Section */}
              <div className="divider-luxury-enhanced mb-4" />
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gift Wrapping</p>
                      <p className="text-[10px] text-muted-foreground">Make it special for ₹{GIFT_WRAP_COST}</p>
                    </div>
                  </div>
                  <Switch
                    checked={giftWrapEnabled}
                    onCheckedChange={handleGiftWrapToggle}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>

                <AnimatePresence>
                  {giftWrapEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4">
                        <p className="text-xs tracking-wider uppercase text-muted-foreground mb-2.5">Choose Style</p>
                        <RadioGroup value={giftWrapOption} onValueChange={setGiftWrapOption} className="space-y-2">
                          {GIFT_WRAP_OPTIONS.map((opt) => (
                            <label
                              key={opt.id}
                              htmlFor={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                giftWrapOption === opt.id
                                  ? 'border-gold bg-gold/5 shadow-sm'
                                  : 'border-border hover:border-gold/40 hover:bg-muted/30'
                              }`}
                            >
                              <RadioGroupItem value={opt.id} id={opt.id} className="border-gold data-[state=checked]:border-gold" />
                              <span className="text-lg shrink-0">{opt.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                              </div>
                              {giftWrapOption === opt.id && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                                  <Check className="h-3 w-3 text-background" strokeWidth={3} />
                                </motion.div>
                              )}
                            </label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs tracking-wider uppercase">Gift Message</Label>
                          <span className={`text-[10px] ${giftMessage.length > 180 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {giftMessage.length}/200
                          </span>
                        </div>
                        <Textarea
                          value={giftMessage}
                          onChange={(e) => {
                            if (e.target.value.length <= 200) setGiftMessage(e.target.value);
                          }}
                          placeholder="Write a heartfelt message for the recipient..."
                          className="min-h-[72px] text-xs resize-none input-luxury"
                          maxLength={200}
                        />
                      </div>

                      {giftMessage.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mb-2"
                        >
                          <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Preview</p>
                          <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border border-gold/30 rounded-lg p-4 overflow-hidden">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold/40 rounded-tl-sm" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/40 rounded-tr-sm" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/40 rounded-bl-sm" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold/40 rounded-br-sm" />
                            <div className="flex items-start gap-2.5">
                              <Gift className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                              <div>
                                <p className="heading-serif text-xs text-foreground/80 italic leading-relaxed">
                                  &ldquo;{giftMessage}&rdquo;
                                </p>
                                <p className="text-[9px] text-gold/70 mt-2 flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Wrapped with {GIFT_WRAP_OPTIONS.find(o => o.id === giftWrapOption)?.label}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Breakdown */}
              <div className="divider-luxury-enhanced mb-4" />
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between text-green-600 text-xs items-center gap-1"
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Coupon ({couponCode})</span>
                    </div>
                    <span>-₹{discount.toLocaleString()}</span>
                  </motion.div>
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
                {giftWrapEnabled && (
                  <div className="flex justify-between items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-gold" />
                      <span className="text-gold text-xs">Gift Wrapping</span>
                    </div>
                    <span className="text-xs">₹{GIFT_WRAP_COST}</span>
                  </div>
                )}
                <div className="divider-luxury-enhanced" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold heading-serif">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Free shipping notice */}
              {shippingCost > 0 && (
                <div className="mt-3 bg-gold/5 border border-gold/20 rounded-lg p-3">
                  <p className="text-[10px] text-center text-muted-foreground">
                    Add ₹{(2000 - subtotal).toLocaleString()} more for <span className="text-gold font-medium">free shipping</span>
                  </p>
                </div>
              )}

              {/* Estimated Delivery */}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Package className="h-4 w-4 text-gold shrink-0" />
                <span>Est. delivery: <span className="font-medium text-foreground">{minDeliveryDate} — {estimatedDelivery}</span></span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50 text-center hover:border-gold/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium leading-tight">{label}</p>
                    <p className="text-[8px] text-muted-foreground leading-tight hidden sm:block">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
