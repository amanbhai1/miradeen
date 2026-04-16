'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Star,
  Share2,
  GitCompareArrows,
  Minus,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Package,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  navy: '#1e3a5f',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  brown: '#78350f',
  beige: '#d4c5a9',
  cream: '#fffdd0',
  grey: '#9ca3af',
  gray: '#9ca3af',
  pink: '#ec4899',
  purple: '#7c3aed',
  orange: '#ea580c',
  yellow: '#eab308',
  gold: '#c9a96e',
  silver: '#c0c0c0',
  maroon: '#7f1d1d',
  olive: '#4d5e15',
  teal: '#0d9488',
  burgundy: '#800020',
  tan: '#d2b48c',
  ivory: '#fffff0',
  charcoal: '#36454f',
  khaki: '#c3b091',
  rust: '#b7410e',
  coral: '#ff7f50',
  lavender: '#b57edc',
  mint: '#98fb98',
  peach: '#ffcba4',
  sage: '#bcb88a',
};

function getColorHex(name: string): string {
  return COLOR_HEX_MAP[name.toLowerCase().trim()] || '#cccccc';
}

function getColorBorder(name: string): string {
  const lower = name.toLowerCase().trim();
  return (lower === 'white' || lower === 'cream' || lower === 'ivory') ? 'border border-border' : '';
}

function getStockStatus(stock: number) {
  if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', dot: 'bg-red-500' };
  if (stock <= 5) return { label: `Only ${stock} Left`, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400', dot: 'bg-orange-500' };
  if (stock <= 20) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', dot: 'bg-amber-500' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', dot: 'bg-green-500' };
}

export default function QuickViewModal({
  open,
  onOpenChange,
  productId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
}) {
  const { navigate, addToCart, toggleWishlist, wishlistIds, toggleCompare, compareIds } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(data => {
        const p = (data.products || []).find((pr: Product) => pr.id === productId);
        if (p) {
          setProduct(p);
          const sizes = parseJsonField<string>(p.sizes);
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          const colors = parseJsonField<string>(p.colors);
          if (colors.length > 0) setSelectedColor(colors[0]);
          setActiveImage(0);
          setQuantity(1);
          setAddedToCart(false);
        }
      });
  }, [productId]);

  if (!product) return null;

  const images = parseJsonField<string>(product.images);
  const sizes = parseJsonField<string>(product.sizes);
  const colors = parseJsonField<string>(product.colors);
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const stockStatus = getStockStatus(product.stock);
  const isWishlisted = wishlistIds.includes(product.id);
  const isComparing = compareIds.includes(product.id);

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 0) return;
    addToCart(product, quantity, selectedSize || sizes[0], selectedColor || undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?product=${product.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevImage = () => {
    setActiveImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="sr-only">Quick View - {product.name}</SheetTitle>
        </SheetHeader>

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image Gallery */}
          <div className="relative mb-5">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Discount badge */}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold">
                  -{discount}%
                </Badge>
              )}

              {/* Stock status badge */}
              <Badge className={`absolute top-3 right-3 ${stockStatus.color} text-xs font-medium gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
                {stockStatus.label}
              </Badge>

              {/* New / Bestseller badges */}
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {product.isNewArrival && (
                  <Badge className="bg-gold text-background text-[10px] font-semibold tracking-wider uppercase">New</Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-background/90 text-foreground backdrop-blur-sm text-[10px] font-semibold tracking-wider uppercase border border-border">Bestseller</Badge>
                )}
              </div>

              {/* Image nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-14 h-18 rounded-md overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-gold shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold font-medium mb-1.5">
            {product.category?.name}
          </p>
          <h2 className="heading-serif text-2xl font-bold mb-2.5">{product.name}</h2>

          {/* Rating */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-gold text-gold'
                      : i < product.rating
                        ? 'fill-gold/50 text-gold'
                        : 'text-border dark:text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gold">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2.5 mb-4">
            <span className="text-2xl font-bold tracking-tight">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                <Badge variant="secondary" className="text-[10px] font-medium text-gold bg-gold/10 border-gold/20">
                  Save ₹{(product.comparePrice - product.price).toLocaleString()}
                </Badge>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {product.shortDesc || product.description?.substring(0, 150) || 'Premium luxury product by MIRADEEN. Crafted with the finest materials and meticulous attention to detail.'}
          </p>

          <div className="divider-gold mb-5" />

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold tracking-wider uppercase text-gold">Size</p>
                {sizes.length > 0 && (
                  <button className="text-[10px] text-gold hover:underline flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 min-w-[44px] px-3 border-2 text-xs font-medium rounded-lg flex items-center justify-center transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-gold bg-gold/10 text-gold shadow-sm'
                        : 'border-border hover:border-gold/50 text-foreground'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold tracking-wider uppercase text-gold">Color</p>
                {selectedColor && (
                  <span className="text-xs text-muted-foreground capitalize">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => {
                  const hex = getColorHex(color);
                  const needsBorder = getColorBorder(color);
                  return (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-9 h-9 rounded-full ${needsBorder} transition-all duration-200 ${
                        selectedColor === color
                          ? 'ring-2 ring-gold ring-offset-2 ring-offset-background dark:ring-offset-card'
                          : 'hover:scale-110'
                      }`}
                      title={color}
                    >
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                      {selectedColor === color && (
                        <Check className={`absolute inset-0 m-auto h-4 w-4 ${
                          ['white', 'cream', 'ivory', 'beige', 'peach', 'mint', 'silver'].includes(color.toLowerCase())
                            ? 'text-foreground'
                            : 'text-white'
                        }`} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Control */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-gold">Quantity</p>
            <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                Only {product.stock} available
              </Badge>
            )}
          </div>

          {/* Primary Actions */}
          <div className="space-y-2.5">
            {/* Add to Cart Button */}
            <AnimatePresence mode="wait">
              {addedToCart ? (
                <motion.div
                  key="added"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-12 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <Check className="h-5 w-5" />
                  Added to Cart
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || (sizes.length > 0 && !selectedSize)}
                    className="w-full h-12 bg-gold text-background hover:bg-gold-dark tracking-[0.1em] uppercase text-xs font-bold btn-luxury"
                  >
                    {product.stock === 0 ? (
                      <><Package className="mr-2 h-4 w-4" /> Out of Stock</>
                    ) : sizes.length > 0 && !selectedSize ? (
                      'Select a Size'
                    ) : (
                      <><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart — ₹{(product.price * quantity).toLocaleString()}</>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Full Details & Share */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 text-xs font-medium"
                onClick={() => { navigate('product', product.id); onOpenChange(false); }}
              >
                <Eye className="mr-2 h-3.5 w-3.5" /> View Full Details
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 flex-shrink-0"
                onClick={handleShare}
                title="Share Product"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Wishlist & Compare */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-10 text-xs font-medium transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-600' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <motion.div
                  whileTap={{ scale: 1.3 }}
                  className="flex items-center gap-1.5"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </motion.div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-10 text-xs font-medium transition-colors ${isComparing ? 'text-gold' : ''}`}
                onClick={() => toggleCompare(product.id)}
                disabled={compareIds.length >= 3 && !isComparing}
              >
                <div className="flex items-center gap-1.5">
                  <GitCompareArrows className={`h-4 w-4 ${isComparing ? 'text-gold' : ''}`} />
                  {isComparing ? 'Comparing' : 'Compare'}
                </div>
              </Button>
            </div>
          </div>

          {/* Shipping info */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-foreground">Free Shipping</p>
                  <p className="text-[9px] text-muted-foreground">On orders over ₹5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-foreground">Easy Returns</p>
                  <p className="text-[9px] text-muted-foreground">7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
