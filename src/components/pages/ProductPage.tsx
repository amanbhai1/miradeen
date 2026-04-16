/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, Star, Share2, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Check, Bell, Ruler, GitCompareArrows, Eye, ArrowRight, AlertTriangle, Camera, ThumbsUp, ThumbsDown, ArrowUpDown, Package, Clock, RotateCcw, Info, Sparkles, Feather, Globe, Gem, Gift, ZoomIn, Copy, MessageCircle, Twitter, Facebook, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
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

// AnimatedSection: scroll-triggered fade-in animation
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string | null; onSubmitted: () => void }) {
  const { isAuthenticated, user, token, navigate } = useStore();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recommended, setRecommended] = useState<boolean | null>(null);

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
          {/* Photo Upload Placeholder */}
          <button
            type="button"
            onClick={() => toast({ title: 'Coming Soon', description: 'Photo upload will be available shortly!' })}
            className="w-full border-2 border-dashed border-border rounded-md p-4 mb-3 flex flex-col items-center gap-2 hover:border-gold/40 hover:bg-gold/5 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-gold/10 transition-colors">
              <Camera className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
            <div className="text-center">
              <span className="text-xs font-medium text-gold underline-draw">Add Photos</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Add up to 3 photos</p>
            </div>
          </button>
          {/* Recommended toggle */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-muted-foreground">Do you recommend this product?</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setRecommended(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200 ${
                  recommended === true
                    ? 'border-green-300 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
                    : 'border-border text-muted-foreground hover:border-green-300 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-3 w-3" /> Yes
              </button>
              <button
                type="button"
                onClick={() => setRecommended(false)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200 ${
                  recommended === false
                    ? 'border-red-300 bg-red-50 text-red-500 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:border-red-300 hover:text-red-500'
                }`}
              >
                <ThumbsDown className="h-3 w-3" /> No
              </button>
            </div>
          </div>
          <Button size="sm" onClick={handleSubmit} disabled={submitting || rating === 0} className="bg-gold text-background hover:bg-gold-dark text-xs">
            {submitting ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Submitting...</> : 'Submit Review'}
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
    isNotifying, toggleNotify, setSearchQuery, token
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
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [verifiedUserIds, setVerifiedUserIds] = useState<Set<string>>(new Set());
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [outfitProducts, setOutfitProducts] = useState<Product[]>([]);
  const [outfitLoading, setOutfitLoading] = useState(true);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

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
    fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => {
      const revs = data.reviews || [];
      setReviews(revs);
      // Simulate helpfulness vote counts for demo
      const initialVotes: Record<string, { up: number; down: number }> = {};
      revs.forEach((r: Review) => {
        initialVotes[r.id] = { up: Math.floor(Math.random() * 15) + 1, down: Math.floor(Math.random() * 3) };
      });
      setHelpfulVotes(initialVotes);
      // Check verified purchase: fetch orders if authenticated
      if (token) {
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(orderData => {
            const orders = orderData.orders || [];
            const productInOrders = orders.some((o: { items: { productId: string }[] }) =>
              o.items.some((item: { productId: string }) => item.productId === selectedProductId)
            );
            if (productInOrders) {
              const currentUserId = useStore.getState().user?.id;
              if (currentUserId) {
                setVerifiedUserIds(new Set([currentUserId]));
              }
            }
            // Also simulate a few verified reviewers for demo
            const demoVerified = new Set<string>();
            revs.slice(0, Math.min(2, revs.length)).forEach((r: Review) => {
              demoVerified.add(r.userId);
            });
            setVerifiedUserIds(prev => {
              const merged = new Set(prev);
              demoVerified.forEach(id => merged.add(id));
              return merged;
            });
          })
          .catch(() => {
            // Fallback: simulate verified for first 2 reviewers
            const demoVerified = new Set<string>();
            revs.slice(0, Math.min(2, revs.length)).forEach((r: Review) => {
              demoVerified.add(r.userId);
            });
            setVerifiedUserIds(demoVerified);
          });
      } else {
        // Not authenticated: simulate verified for first 2 reviewers
        const demoVerified = new Set<string>();
        revs.slice(0, Math.min(2, revs.length)).forEach((r: Review) => {
          demoVerified.add(r.userId);
        });
        setVerifiedUserIds(demoVerified);
      }
    });
  }, [selectedProductId]);

  // Fetch outfit suggestion products (complementary, different category)
  useEffect(() => {
    if (!selectedProductId) return;
    setOutfitLoading(true);
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      const products = (data.products || []).filter((p: Product) => p.id !== selectedProductId && p.isActive);
      // Pick 4 complementary products (mix of different categories)
      const shuffled = products.sort(() => Math.random() - 0.5);
      setOutfitProducts(shuffled.slice(0, 4));
      setOutfitLoading(false);
    }).catch(() => {
      setOutfitProducts([]);
      setOutfitLoading(false);
    });
  }, [selectedProductId]);

  // IntersectionObserver for sticky bar visibility
  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedProductId]);

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (!thumbnailStripRef.current) return;
    const activeThumb = thumbnailStripRef.current.querySelector('[data-active="true"]');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedImage]);

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
    setAddToCartLoading(true);
    // Simulate brief loading for UX polish
    setTimeout(() => {
      addToCart(product, quantity, selectedSize, selectedColor);
      setAddedToCart(true);
      setAddToCartLoading(false);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 400);
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
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('checkout');
  };

  const handlePrevImage = () => {
    setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleMainImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Loyalty points calculation
  const loyaltyPointsEarned = Math.floor((product.price * quantity) / 1000) * 10;

  // Estimated delivery date (5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

  // Share to social media
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?product=${product.id}` : '';
  const shareText = `Check out ${product.name} on MIRADEEN!`;

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };
  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
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

      {/* Review Modal Dialog */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="heading-serif text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-gold fill-gold" />
              Write a Review
            </DialogTitle>
            <DialogDescription>
              Share your experience with {product.name}
            </DialogDescription>
          </DialogHeader>
          <ReviewForm productId={selectedProductId} onSubmitted={() => {
            fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => setReviews(data.reviews || []));
            setReviewModalOpen(false);
          }} />
        </DialogContent>
      </Dialog>

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
              ref={mainImageRef}
              className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-muted group"
              onMouseEnter={() => setImageZoomed(true)}
              onMouseLeave={() => setImageZoomed(false)}
              onMouseMove={handleMainImageMouseMove}
              onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true); }}
              style={{ cursor: 'zoom-in' }}
            >
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                    style={imageZoomed ? {
                      transform: 'scale(2)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transition: 'transform-origin 0.1s ease',
                    } : { transform: 'scale(1)', transition: 'transform 0.3s ease' }}
                  />
                </AnimatePresence>
              ) : (
                /* Placeholder when no images */
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <span className="heading-serif text-4xl font-bold text-gold">{product.name.charAt(0)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </div>
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-xs">-{discount}% OFF</Badge>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium text-foreground">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
              {/* Zoom indicator */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className={`w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition-opacity duration-200 ${imageZoomed ? 'opacity-0' : 'opacity-100 group-hover:opacity-70'}`}>
                  <ZoomIn className="h-4 w-4 text-foreground" />
                </div>
              </div>
              {/* Left / Right arrows for desktop */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background/90 transition-all duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
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
              <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-200 ${imageZoomed ? 'opacity-0' : 'group-hover:opacity-100 opacity-0'}`}>
                <div className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
              </div>
            </div>
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div ref={thumbnailStripRef} className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 snap-x snap-mandatory">
                {images.map((img, i) => (
                  <button
                    key={i}
                    data-active={i === selectedImage}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all duration-200 snap-start ${i === selectedImage ? 'border-gold shadow-md' : 'border-transparent hover:border-border opacity-70 hover:opacity-100'}`}
                  >
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

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">{discount}% OFF</Badge>
                </>
              )}
            </div>

            {/* Loyalty Points & Delivery Estimate */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {loyaltyPointsEarned > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold">
                  <Gift className="h-3.5 w-3.5" />
                  Earn <span className="font-bold">{loyaltyPointsEarned}</span> loyalty points
                </span>
              )}
              {!isOutOfStock && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-gold" />
                  Delivery by <span className="font-medium text-foreground">{deliveryDateStr}</span>
                </span>
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

            {/* Share Buttons Row */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-muted-foreground mr-1">Share:</span>
              {[
                { icon: MessageCircle, label: 'WhatsApp', handler: handleShareWhatsApp, color: 'hover:text-green-600' },
                { icon: Twitter, label: 'Twitter', handler: handleShareTwitter, color: 'hover:text-sky-500' },
                { icon: Facebook, label: 'Facebook', handler: handleShareFacebook, color: 'hover:text-blue-600' },
                { icon: Copy, label: 'Copy Link', handler: handleShare, color: copied ? 'text-green-500' : 'hover:text-gold' },
              ].map(({ icon: Icon, label, handler, color }) => (
                <button
                  key={label}
                  onClick={handler}
                  title={label}
                  className={`w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 ${color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

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
            <div ref={addToCartRef}>
            {isOutOfStock ? (
              <div className="mb-8">
                <Button
                  onClick={handleNotify}
                  variant="outline"
                  className={`w-full h-14 tracking-[0.1em] uppercase text-xs font-semibold border-gold/30 transition-all duration-300 ${
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
                  disabled={addToCartLoading}
                  className={`flex-1 h-14 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury transition-all duration-300 ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : addToCartLoading
                        ? 'bg-gold/70 text-background'
                        : 'bg-gold text-background hover:bg-gold-dark'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center">
                        <Check className="mr-2 h-4 w-4" /> Added to Cart
                      </motion.span>
                    ) : addToCartLoading ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 h-14 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Buy Now
                </Button>
              </div>
            )}
            </div>

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

        {/* Tabs: Description / Details / Reviews / Shipping */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0 overflow-x-auto">
              {['Description', 'Details', `Reviews (${reviews.length})`, 'Shipping'].map((tab) => (
                <TabsTrigger key={tab} value={tab.toLowerCase().split(' ')[0]} className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-gold text-sm tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors whitespace-nowrap">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'No description available.' }} />
            </TabsContent>
            <TabsContent value="details" className="pt-6">
              <div className="max-w-2xl">
                <h3 className="heading-serif text-lg font-semibold mb-4 text-foreground">Product Details</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        { label: 'Material', value: product.category?.name === 'Jewellery' || product.category?.name === 'Accessories' ? 'Sterling Silver / 18K Gold Plated' : 'Premium Cotton Silk Blend' },
                        { label: 'Care Instructions', value: product.category?.name === 'Jewellery' || product.category?.name === 'Accessories' ? 'Avoid contact with water and perfume. Store in the provided pouch.' : 'Dry clean recommended. Iron on low heat. Do not bleach.' },
                        { label: 'Weight', value: product.category?.name === 'Jewellery' || product.category?.name === 'Accessories' ? '12g approx.' : '280g approx.' },
                        { label: 'Origin', value: 'India' },
                        { label: 'Season', value: 'All Season' },
                        { label: 'SKU', value: `MRD-${product.id.slice(0, 8).toUpperCase()}` },
                      ].map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                          <td className="px-4 py-3 font-medium text-foreground w-40 border-r border-border">{row.label}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Key Features */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Feather, text: 'Crafted with premium materials' },
                      { icon: Gem, text: 'Timeless elegant design' },
                      { icon: Globe, text: 'Sustainably sourced from India' },
                      { icon: Package, text: 'Luxury gift packaging included' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-gold" />
                        </div>
                        <span className="text-xs text-muted-foreground">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                  {/* Rating breakdown with percentages */}
                  <div className="space-y-2">
                    {ratingCounts.map(({ star, count }) => {
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-3">{star}</span>
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          <span className="text-xs text-muted-foreground w-4 text-right">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="md:col-span-2">
                  {/* Sort dropdown */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-foreground">Customer Reviews</p>
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value as 'recent' | 'highest' | 'helpful')}
                        className="text-xs bg-background border border-border rounded-md px-2 py-1.5 text-muted-foreground focus:outline-none focus:border-gold focus-ring cursor-pointer"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rated</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar mb-6">
                    {reviews.length === 0 ? (
                      /* Beautiful empty state */
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-4 animate-float">
                          <Star className="h-10 w-10 text-gold fill-gold/30" />
                        </div>
                        <h4 className="heading-serif text-lg font-semibold mb-2 text-foreground">Be the First to Review</h4>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                          Share your experience with this product and help other shoppers make informed decisions.
                        </p>
                        <Button
                          onClick={() => setReviewModalOpen(true)}
                          className="bg-gold text-background hover:bg-gold-dark btn-luxury"
                        >
                          <Star className="mr-2 h-4 w-4" /> Write a Review
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews
                          .slice()
                          .sort((a, b) => {
                            if (reviewSort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            if (reviewSort === 'highest') return b.rating - a.rating;
                            if (reviewSort === 'helpful') return (helpfulVotes[b.id]?.up || 0) - (helpfulVotes[a.id]?.up || 0);
                            return 0;
                          })
                          .map((review) => {
                            const hasVoted = votedReviews.has(review.id);
                            const votes = helpfulVotes[review.id] || { up: 0, down: 0 };
                            const isVerified = verifiedUserIds.has(review.userId);
                            return (
                              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-semibold text-gold">
                                    {review.user?.name?.charAt(0) || 'U'}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
                                      {isVerified && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                          Verified Purchase
                                        </span>
                                      )}
                                    </div>
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
                                {/* Helpfulness Voting */}
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <p className="text-[10px] text-muted-foreground mb-1.5">Was this review helpful?</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (hasVoted) return;
                                        setVotedReviews(prev => new Set(prev).add(review.id));
                                        setHelpfulVotes(prev => ({
                                          ...prev,
                                          [review.id]: { up: (prev[review.id]?.up || 0) + 1, down: prev[review.id]?.down || 0 },
                                        }));
                                      }}
                                      disabled={hasVoted}
                                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-all duration-200 ${
                                        hasVoted
                                          ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground'
                                          : 'border-border text-muted-foreground hover:border-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:border-green-700 dark:hover:text-green-400 dark:hover:bg-green-950/20'
                                      }`}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>{votes.up}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (hasVoted) return;
                                        setVotedReviews(prev => new Set(prev).add(review.id));
                                        setHelpfulVotes(prev => ({
                                          ...prev,
                                          [review.id]: { up: prev[review.id]?.up || 0, down: (prev[review.id]?.down || 0) + 1 },
                                        }));
                                      }}
                                      disabled={hasVoted}
                                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-all duration-200 ${
                                        hasVoted
                                          ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground'
                                          : 'border-border text-muted-foreground hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:border-red-700 dark:hover:text-red-400 dark:hover:bg-red-950/20'
                                      }`}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                      <span>{votes.down}</span>
                                    </button>
                                    {hasVoted && (
                                      <span className="text-[10px] text-gold animate-scale-in">Thanks for your feedback!</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  {/* Write a Review Button + Inline Form */}
                  <Button
                    onClick={() => setReviewModalOpen(true)}
                    variant="outline"
                    className="w-full border-gold/30 text-gold hover:bg-gold hover:text-background hover:border-gold transition-all duration-300 mb-4"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                  <ReviewForm productId={selectedProductId} onSubmitted={() => {
                    fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => setReviews(data.reviews || []));
                  }} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="max-w-2xl space-y-6">
                <h3 className="heading-serif text-lg font-semibold text-foreground">Shipping & Returns</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Truck,
                      title: 'Free Shipping',
                      desc: 'Enjoy free standard shipping on all orders over ₹2,000. For orders below this amount, a nominal shipping fee applies.',
                      accent: true,
                    },
                    {
                      icon: Clock,
                      title: 'Standard Delivery',
                      desc: '5-7 business days across India. Track your order in real-time through your account dashboard.',
                    },
                    {
                      icon: Sparkles,
                      title: 'Express Delivery',
                      desc: '2-3 business days for select metro cities. Available at checkout for an additional fee.',
                    },
                    {
                      icon: RotateCcw,
                      title: 'Easy 30-Day Returns',
                      desc: 'Not satisfied? Return within 30 days for a full refund. Items must be unused with original tags attached.',
                    },
                  ].map(({ icon: Icon, title, desc, accent }) => (
                    <div key={title} className={`p-4 rounded-lg border ${accent ? 'border-gold/30 bg-gold/5' : 'border-border bg-muted/20'} transition-colors hover:border-gold/40`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${accent ? 'bg-gold/20' : 'bg-muted'}`}>
                          <Icon className={`h-4 w-4 ${accent ? 'text-gold' : 'text-muted-foreground'}`} />
                        </div>
                        <h4 className={`text-sm font-semibold ${accent ? 'text-gold' : 'text-foreground'}`}>{title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-12">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">International Shipping</p>
                      <p className="text-xs text-muted-foreground">We currently ship within India only. International shipping coming soon. For queries, contact our support team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Complete the Look - Outfit Suggestions */}
        <AnimatedSection className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">Curated for you</p>
              <h2 className="heading-serif text-2xl md:text-3xl font-bold">
                Complete the <span className="text-gold">Look</span>
              </h2>
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

          {outfitLoading ? (
            /* Skeleton Loading */
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[200px] sm:min-w-[220px] lg:min-w-0 flex-shrink-0 snap-start">
                  <Skeleton className="aspect-[3/4] rounded-lg w-full" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : outfitProducts.length > 0 ? (
            /* Product Cards */
            <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory scrollbar-hide">
              {outfitProducts.map((item, i) => {
                const itemImages = parseJsonField<string>(item.images);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="group cursor-pointer bg-background dark:bg-card rounded-lg overflow-hidden border border-border product-card min-w-[200px] sm:min-w-[220px] lg:min-w-0 flex-shrink-0 snap-start hover:border-gold/30 transition-colors duration-300"
                    onClick={() => navigate('product', item.id)}
                  >
                    <div className="relative aspect-[3/4] img-zoom">
                      <img src={itemImages[0] || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${wishlistIds.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProductId(item.id);
                          }}
                          size="sm"
                          className="flex-1 h-8 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                        >
                          <Eye className="h-3 w-3 mr-0.5" /> Quick View
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            const itemSizes = parseJsonField<string>(item.sizes);
                            addToCart(item, 1, itemSizes[0]);
                          }}
                          size="sm"
                          className="flex-1 h-8 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                        >
                          <ShoppingBag className="h-3 w-3 mr-0.5" /> Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{item.category?.name}</p>
                      <h3 className="text-sm font-medium truncate group-hover:text-gold transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold">₹{item.price.toLocaleString()}</span>
                        {item.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{item.comparePrice.toLocaleString()}</span>
                        )}
                      </div>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span className="text-[10px] text-muted-foreground">{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : null}

          {/* Mobile View All link */}
          <button
            onClick={() => navigate('shop')}
            className="sm:hidden flex items-center justify-center gap-1 text-sm text-gold hover:underline mt-4 w-full"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </button>
        </AnimatedSection>

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

      {/* Sticky Add-to-Cart Bar */}
      <AnimatePresence>
        {showStickyBar && !isOutOfStock && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-xl lg:rounded-2xl shadow-luxury-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                {/* Product thumbnail + name */}
                <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {images.length > 0 ? (
                      <img src={images[selectedImage]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="heading-serif text-lg font-bold text-gold">{product.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gold">₹{(product.price * quantity).toLocaleString()}</span>
                      {selectedSize && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Size: {selectedSize}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Mobile: compact info */}
                <div className="sm:hidden flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <span className="text-sm font-bold text-gold">₹{(product.price * quantity).toLocaleString()}</span>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center border rounded-md flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3 w-3" /></Button>
                  <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="h-3 w-3" /></Button>
                </div>

                {/* Add to Cart button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCartLoading}
                  className={`h-10 sm:h-11 px-4 sm:px-6 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury transition-all duration-300 flex-shrink-0 ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : addToCartLoading
                        ? 'bg-gold/70 text-background'
                        : 'bg-gold text-background hover:bg-gold-dark'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="sticky-added" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center">
                        <Check className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Added</span>
                      </motion.span>
                    ) : addToCartLoading ? (
                      <motion.span key="sticky-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center">
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span key="sticky-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center">
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
