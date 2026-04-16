'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, Star, Share2, Truck, Shield, RefreshCw, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import type { Product, Review } from '@/types';
import { parseJsonField } from '@/types';

export default function ProductPage() {
  const { navigate, addToCart, toggleWishlist, wishlistIds, selectedProductId, isAuthenticated, previousPage } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!selectedProductId) return;
    fetch(`/api/products?limit=100`).then(r => r.json()).then(data => {
      const p = (data.products || []).find((pr: Product) => pr.id === selectedProductId);
      if (p) {
        setProduct(p);
        const images = parseJsonField<string>(p.sizes);
        if (images.length) setSelectedSize(images[0]);
      }
    });
    fetch(`/api/reviews?productId=${selectedProductId}`).then(r => r.json()).then(data => setReviews(data.reviews || []));
  }, [selectedProductId]);

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
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(previousPage || 'shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-muted">
              <img src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-xs">-{discount}% OFF</Badge>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
              >
                <Heart className={`h-5 w-5 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-gold' : 'border-transparent hover:border-border'}`}>
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

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">{discount}% OFF</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.shortDesc || product.description?.substring(0, 200)}</p>

            <div className="divider-gold mb-6" />

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Color: <span className="text-muted-foreground font-normal">{selectedColor || 'Select'}</span></p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 border text-sm rounded-md transition-colors ${selectedColor === color ? 'border-gold bg-gold/5 text-gold' : 'border-border hover:border-gold/50'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Size: <span className="text-muted-foreground font-normal">{selectedSize || 'Select'}</span></p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 border text-sm rounded-md flex items-center justify-center transition-colors ${selectedSize === size ? 'border-gold bg-gold/5 text-gold font-medium' : 'border-border hover:border-gold/50'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center border rounded-md w-fit">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Add to Cart & Buy Now */}
            <div className="flex gap-3 mb-8">
              <Button
                onClick={handleAddToCart}
                className={`flex-1 h-12 tracking-[0.1em] uppercase text-xs font-semibold btn-luxury ${addedToCart ? 'bg-green-600 hover:bg-green-600' : 'bg-gold text-background hover:bg-gold-dark'}`}
              >
                {addedToCart ? <><Check className="mr-2 h-4 w-4" /> Added to Cart</> : <><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart</>}
              </Button>
              <Button
                onClick={() => { handleAddToCart(); navigate('checkout'); }}
                variant="outline"
                className="flex-1 h-12 tracking-[0.1em] uppercase text-xs font-semibold border-foreground hover:bg-foreground hover:text-background"
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: 'Secure Payment' },
                { icon: RefreshCw, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon className="h-4 w-4 text-gold" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs: Description / Reviews */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0">
              {['Description', `Reviews (${reviews.length})`, 'Shipping'].map((tab) => (
                <TabsTrigger key={tab} value={tab.toLowerCase().split(' ')[0]} className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'No description available.' }} />
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
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
      </div>
    </div>
  );
}
