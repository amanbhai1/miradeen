'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { parseJsonField } from '@/types';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartSubtotal, getCartTotal, getCartCount, couponCode, couponDiscount, applyCoupon, removeCoupon, navigate } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 149;
  const finalTotal = total + shipping;

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="heading-serif text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Discover our luxury collection and add something special.</p>
          <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark tracking-wider uppercase text-xs transition-colors">
            Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground text-sm mb-8">{getCartCount()} items in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => {
                const images = parseJsonField<string>(item.product.images);
                return (
                  <motion.div
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="w-24 h-32 md:w-28 md:h-36 rounded-md overflow-hidden shrink-0 bg-muted">
                      <img src={images[0] || '/placeholder.jpg'} alt={item.product.name} className="w-full h-full object-cover cursor-pointer" onClick={() => navigate('product', item.product.id)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">{item.product.category?.name}</p>
                          <h3 className="text-sm font-medium truncate cursor-pointer hover:text-gold transition-colors" onClick={() => navigate('product', item.product.id)}>{item.product.name}</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeFromCart(item.product.id, item.size)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.size && <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-md">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <Button variant="ghost" className="text-destructive text-xs hover:text-destructive hover:bg-destructive/5 transition-colors" onClick={clearCart}>
              <Trash2 className="mr-1 h-3 w-3" /> Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="heading-serif text-xl font-bold mb-4">Order Summary</h3>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-gold/5 border border-gold/20 rounded-md px-3 py-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-gold" />
                    <span className="text-sm font-medium">{couponCode}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeCoupon}><X className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="h-9 text-sm focus:border-gold" />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="h-9 text-xs hover:border-gold hover:text-gold transition-colors">Apply</Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mb-4">{couponError}</p>}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{couponDiscount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span></div>
                <div className="divider-gold" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-muted-foreground mt-3">Free shipping on orders over ₹2,000</p>
              )}

              <Button
                onClick={() => navigate('checkout')}
                className="w-full mt-6 h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.15em] uppercase text-xs font-semibold btn-luxury"
              >
                Proceed to Checkout
              </Button>
              <Button variant="link" className="w-full text-xs text-muted-foreground mt-2 hover:text-gold transition-colors" onClick={() => navigate('shop')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
