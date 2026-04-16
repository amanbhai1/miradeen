/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, Star, Share2, Truck, Shield, RefreshCw, ChevronLeft, Check, Bell, Ruler, GitCompareArrows, Eye, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Product, Review } from '@/types';
import { parseJsonField } from '@/types';
import SizeGuideModal from '@/components/shared/SizeGuideModal';
import ImageLightbox from '@/components/shared/ImageLightbox';

// Color name to hex mapping for visual preview circles
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
  const lower = name.toLowerCase().trim();
  return COLOR_HEX_MAP[lower] || '#cccccc';
}

function getColorBorderClass(name: string): string {
  const lower = name.toLowerCase().trim();
  return (lower === 'white' || lower === 'cream' || lower === 'ivory') ? 'border border-border' : '';
}

function ReviewForm({ productId, onSubmitted }: { productId: string | null; onSubmitted: () => void }) {
  const { isAuthenticated, user, token, navigate } = useStore();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!productId) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login', description: 'Sign in to write a review', variant: 'destructive' });
      navigate('auth');
      return;
    }
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
      setRating(0); setTitle(''); setComment('');
      onSubmitted();
    } catch {
      toast({ title: 'Failed to submit', description: 'Please try again.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <h4 className="text-sm font-semibold mb-3">Write a Review</h4>
      {isAuthenticated ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">Reviewing as {user?.name}</p>
          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star className={`h-5 w-5 transition-colors ${
                  star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-border hover:text-gold/50'
                }`} />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-muted-foreground ml-2">{rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}</span>
            )}
          </div>
          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gold mb-2"
          />
          <textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gold mb-3 resize-none"
          />
          <Button size="sm" onClick={handleSubmit} disabled={submitting || rating === 0} className="bg-gold text-background hover:bg-gold-dark text-xs">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-muted-foreground mb-2">Sign in to write a review</p>
          <Button size="sm" variant="outline" onClick={() => navigate('auth')} className="hover:border-gold hover:text-gold text-xs transition-colors">
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const {
    navigate, addToCart, toggleWishlist, wishlistIds, selectedProductId,
    isAuthenticated, previousPage, toggleCompare, compareIds, setQuickViewProductId,
    isNotifying, toggleNotify, setSearchQuery
  } = useStore();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      const products = data.products || [];
      setAllProducts(products);
      const p = products.find((pr: Product) => pr.id === selectedProductId);
      if (p) {
        setProduct(p);
        const sizes = parseJsonField<string>(p.sizes);
        if (sizes.length) setSelectedSize(sizes[0]);
      }
      setLoading(false);
    });
    fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => setReviews(data.reviews || []));
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={() => navigate('shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const images = parseJsonField<string>(product.images);
  const sizes = parseJsonField<string>(product.sizes);
  const colors = parseJsonField<string>(product.colors);
  const tags = parseJsonField<string>(product.tags);
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const isOutOfStock = product.stock === 0;
  const isInCompare = compareIds.includes(product.id);

  // Recommendations: same category, different product
  const recommendations = allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
    .slice(0, 4);

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const totalReviews = reviews.length;

  // Stock status config
  const stockStatus = product.stock === 0
    ? { label: 'Out of Stock', className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800' }
    : product.stock <= 5
      ? { label: `Only ${product.stock} Left`, className: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800' }
      : { label: 'In Stock', className: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' };

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'Choose your preferred size before adding to cart.',
        variant: 'destructive',
      });
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'Choose your preferred size before purchasing.',
        variant: 'destructive',
      });
      return;
    }
    handleAddToCart();
    navigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?product=${product.id}`);
    setCopied(true);
    toast({ title: 'Link copied!', description: 'Product link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNotify = () => {
    toggleNotify(product.id);
    toast({
      title: isNotifying(product.id) ? 'Notification Removed' : 'Notification Set',
      description: isNotifying(product.id)
        ? 'You will no longer receive updates about this product.'
        : 'We will notify you when this product is back in stock.',
    });
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate('shop');
  };

  return (
    <div className="min-h-screen">
      <SizeGuideModal open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(previousPage || 'shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div
              className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-muted cursor-zoom-in group"
              onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true); }}
            >
              <img src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-xs">-{discount}% OFF</Badge>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                >
                  <Heart className={`h-5 w-5 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                >
                  <Share2 className={`h-5 w-5 ${copied ? 'text-green-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                  className={`w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center transition-colors ${isInCompare ? 'bg-gold text-background' : 'hover:bg-gold hover:text-background'}`}
                  title={isInCompare ? 'Remove from compare' : 'Add to compare'}
                >
                  <GitCompareArrows className="h-5 w-5" />
                </button>
              </div>
              {/* Zoom hint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center">
                    <Eye className="h-5 w-5 text-foreground" />
                  </div>
                </div>
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${i === selectedImage ? 'border-gold shadow-md' : 'border-transparent hover:border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">{product.category?.name}</p>
            <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">{discount}% OFF</Badge>
                </>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stockStatus.className}`}>
                {product.stock > 0 && product.stock <= 5 && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {product.stock === 0 && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {product.stock > 5 && (
                  <Check className="h-3 w-3" />
                )}
                {stockStatus.label}
              </span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.shortDesc || product.description?.substring(0, 200)}</p>

            {/* Product Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-medium border border-border text-muted-foreground hover:border-gold hover:text-gold hover:bg-gold/5 transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="divider-gold mb-6" />

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Color: <span className="text-muted-foreground font-normal">{selectedColor || 'Select'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const hex = getColorHex(color);
                    const borderClass = getColorBorderClass(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 border text-sm rounded-md transition-all duration-200 ${isSelected ? 'border-gold bg-gold/5 text-gold shadow-sm' : 'border-border hover:border-gold/50'}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full shrink-0 ${borderClass}`}
                          style={{ backgroundColor: hex }}
                        />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  Size:{' '}
                  <span className="text-muted-foreground font-normal">
                    {selectedSize || (sizes.length > 0 ? 'Select size' : 'One size')}
                  </span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-gold hover:underline flex items-center gap-1 transition-colors"
                >
                  <Ruler className="h-3 w-3" /> Size Guide
                </button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <div key={size} className="flex flex-col items-center">
                        <button
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 border text-sm rounded-md flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-gold bg-gold/5 text-gold font-medium shadow-sm' : 'border-border hover:border-gold/50 hover:bg-gold/5'}`}
                        >
                          {size}
                        </button>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {!selectedSize && sizes.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-gold" />
                  Please select a size to continue
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center border rounded-md w-fit">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-xs text-orange-500 mt-1.5">Only {product.stock} left in stock</p>
              )}
            </div>

            {/* Add to Cart & Buy Now */}
            {isOutOfStock ? (
              <div className="mb-8">
                <Button
                  onClick={handleNotify}
                  variant="outline"
                  className={`w-full h-12 tracking-[0.1em] uppercase text-xs font-semibold border-gold/30 transition-all duration-300 ${
                    isNotifying(product.id) ? 'bg-gold/10 text-gold border-gold' : 'hover:bg-gold/5 hover:text-gold hover:border-gold'
                  }`}
                >
                  <Bell className={`mr-2 h-4 w-4 ${isNotifying(product.id) ? 'fill-gold' : ''}`} />
                  {isNotifying(product.id) ? 'You Will Be Notified' : 'Notify Me When Available'}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 mb-8">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury transition-all duration-300 ${addedToCart ? 'bg-green-600 hover:bg-green-600' : 'bg-gold text-background hover:bg-gold-dark'}`}
                >
                  {addedToCart ? <><Check className="mr-2 h-4 w-4" /> Added to Cart</> : <><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart</>}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 h-12 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Buy Now
                </Button>
              </div>
            )}

            {/* Action buttons row */}
            <div className="flex gap-2 mb-8">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 text-xs hover:text-gold hover:bg-gold/5 transition-all"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`mr-1.5 h-3.5 w-3.5 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistIds.includes(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 text-xs hover:text-gold hover:bg-gold/5 transition-all"
                onClick={handleShare}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Share'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-9 text-xs transition-all ${isInCompare ? 'text-gold bg-gold/5' : 'hover:text-gold hover:bg-gold/5'}`}
                onClick={() => toggleCompare(product.id)}
              >
                <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" /> {isInCompare ? 'Comparing' : 'Compare'}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: 'Secure Payment' },
                { icon: RefreshCw, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 group">
                  <Icon className="h-4 w-4 text-gold group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs: Description / Reviews / Shipping */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0">
              {['Description', `Reviews (${reviews.length})`, 'Shipping'].map((tab) => (
                <TabsTrigger key={tab} value={tab.toLowerCase().split(' ')[0]} className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'No description available.' }} />
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rating summary */}
                <div className="md:col-span-1">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold">{product.rating.toFixed(1)}</p>
                    <div className="flex justify-center mt-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                  {/* Rating breakdown */}
                  <div className="space-y-2">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-3">{star}</span>
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <Progress value={totalReviews > 0 ? (count / totalReviews) * 100 : 0} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="md:col-span-2">
                  <div className="max-h-96 overflow-y-auto custom-scrollbar mb-6">
                    {reviews.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product.</p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-border pb-6 last:border-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-semibold text-gold">
                                {review.user?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex ml-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-gold text-gold' : 'text-border'}`} />
                                ))}
                              </div>
                            </div>
                            {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Write a Review */}
                  <ReviewForm productId={selectedProductId} onSubmitted={() => {
                    fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => setReviews(data.reviews || []));
                  }} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div><p className="font-medium text-foreground mb-1">Shipping</p><p>Free shipping on orders over ₹2,000. Standard delivery within 5-7 business days. Express delivery available at checkout.</p></div>
                <div><p className="font-medium text-foreground mb-1">Returns</p><p>We accept returns within 30 days of delivery. Items must be unused and in original packaging with all tags attached.</p></div>
                <div><p className="font-medium text-foreground mb-1">Care Instructions</p><p>Please refer to the care label on each garment for specific washing and maintenance instructions.</p></div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* You May Also Like */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Recommended</p>
                <h2 className="heading-serif text-2xl md:text-3xl font-bold">You May Also Like</h2>
                <div className="divider-gold w-16 mt-2" />
              </div>
              <button
                onClick={() => navigate('shop')}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors group"
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Mobile: horizontal scroll, Desktop: 4-column grid */}
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scrollbar-hide">
              {recommendations.map((rec, i) => {
                const recImages = parseJsonField<string>(rec.images);
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border product-card min-w-[200px] sm:min-w-[220px] lg:min-w-0 flex-shrink-0 snap-start"
                    onClick={() => navigate('product', rec.id)}
                  >
                    <div className="relative aspect-[3/4] img-zoom">
                      <img src={recImages[0] || '/placeholder.jpg'} alt={rec.name} className="w-full h-full object-cover" loading="lazy" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(rec.id); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${wishlistIds.includes(rec.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProductId(rec.id);
                          }}
                          size="sm"
                          className="flex-1 h-8 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                        >
                          <Eye className="h-3 w-3 mr-0.5" /> Quick View
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            const recSizes = parseJsonField<string>(rec.sizes);
                            addToCart(rec, 1, recSizes[0]);
                          }}
                          size="sm"
                          className="flex-1 h-8 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                        >
                          <ShoppingBag className="h-3 w-3 mr-0.5" /> Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{rec.category?.name}</p>
                      <h3 className="text-sm font-medium truncate group-hover:text-gold transition-colors">{rec.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold">₹{rec.price.toLocaleString()}</span>
                        {rec.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{rec.comparePrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile View All link */}
            <button
              onClick={() => navigate('shop')}
              className="sm:hidden flex items-center justify-center gap-1 text-sm text-gold hover:underline mt-4 w-full"
            >
              View All Recommendations
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.section>
        )}
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        alt={product.name}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
