'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from '@/types';

export default function CartDrawer() {
  const {
    cart, removeFromCart, updateCartQuantity, getCartSubtotal, getCartTotal,
    getCartCount, couponCode, couponDiscount, applyCoupon, removeCoupon, navigate
  } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const cartCount = getCartCount();
  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 149;
  const finalTotal = total + shipping;

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      toast({ title: 'Coupon applied!', description: `${couponInput.toUpperCase()} has been applied to your order.` });
      setCouponInput('');
    } else {
      toast({ title: 'Invalid coupon', description: 'Please check the code and try again.', variant: 'destructive' });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative hover:text-gold transition-colors"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-4 w-4 bg-gold text-background text-[10px] rounded-full flex items-center justify-center font-semibold"
            >
              {cartCount}
            </motion.span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 bg-background flex flex-col">
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h2 className="heading-serif text-lg font-bold">Shopping Cart</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cartCount}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="hover:text-gold transition-colors">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="heading-serif text-lg font-semibold mb-1">Your Cart is Empty</p>
              <p className="text-sm text-muted-foreground mb-6">Add luxury items to your cart</p>
              <Button
                onClick={() => { setOpen(false); navigate('shop'); }}
                className="bg-gold text-background hover:bg-gold-dark text-xs tracking-wider uppercase"
              >
                Explore Collection
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <AnimatePresence initial={false}>
                {cart.map((item) => {
                  const images = parseJsonField<string>(item.product.images);
                  return (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 p-3 rounded-lg border border-border bg-card group/item"
                    >
                      <div
                        className="w-20 h-24 rounded-md overflow-hidden shrink-0 bg-muted cursor-pointer"
                        onClick={() => { setOpen(false); navigate('product', item.product.id); }}
                      >
                        <img src={images[0] || '/placeholder.jpg'} alt={item.product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground tracking-wider uppercase">{item.product.category?.name}</p>
                            <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0 opacity-0 group-hover/item:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.size && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Size: {item.size}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border p-5 space-y-4 bg-card/50">
            {/* Coupon */}
            {couponCode ? (
              <div className="flex items-center justify-between bg-gold/5 border border-gold/20 rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-gold" />
                  <span className="text-xs font-medium text-gold">{couponCode}</span>
                  <span className="text-xs text-green-600">(-₹{couponDiscount.toLocaleString()})</span>
                </div>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-9 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  className="h-9 text-xs hover:border-gold hover:text-gold transition-colors shrink-0"
                >
                  Apply
                </Button>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>Discount</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 text-xs' : ''}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              <div className="divider-gold" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-[10px] text-muted-foreground text-center">
                Add ₹{(2000 - subtotal).toLocaleString()} more for free shipping
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => { setOpen(false); navigate('checkout'); }}
                className="w-full h-11 bg-gold text-background hover:bg-gold-dark tracking-[0.1em] uppercase text-xs font-semibold btn-luxury"
              >
                Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setOpen(false); navigate('cart'); }}
                className="w-full text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                View Full Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
