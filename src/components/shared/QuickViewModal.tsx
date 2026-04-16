'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Ruler, Share2, Bell, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

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
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products?limit=100`).then(r => r.json()).then(data => {
      const p = (data.products || []).find((pr: Product) => pr.id === productId);
      if (p) {
        setProduct(p);
        const sizes = parseJsonField<string>(p.sizes);
        if (sizes.length) setSelectedSize(sizes[0]);
      }
    });
  }, [productId]);

  if (!product) return null;

  const images = parseJsonField<string>(product.images);
  const sizes = parseJsonField<string>(product.colors || product.sizes);
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    const actualSizes = parseJsonField<string>(product.sizes);
    addToCart(product, quantity, actualSizes[0]);
    onOpenChange(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?product=${product.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="sr-only">Quick View - {product.name}</SheetTitle>
        </SheetHeader>

        <div className="p-6">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-muted">
            <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">-{discount}%</Badge>
            )}
          </div>

          {/* Info */}
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{product.category?.name}</p>
          <h2 className="heading-serif text-xl font-bold mb-2">{product.name}</h2>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {product.shortDesc || product.description?.substring(0, 120) || 'Premium luxury product by MIRADEEN.'}
          </p>

          <div className="divider-gold mb-4" />

          {/* Sizes */}
          {parseJsonField<string>(product.sizes).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {parseJsonField<string>(product.sizes).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 border text-xs rounded-md flex items-center justify-center transition-colors ${
                      selectedSize === size ? 'border-gold bg-gold/5 text-gold font-medium' : 'border-border hover:border-gold/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium">Qty:</span>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <span className="text-sm">−</span>
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                <span className="text-sm">+</span>
              </Button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-orange-500">Only {product.stock} left</span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-11 bg-gold text-background hover:bg-gold-dark tracking-[0.1em] uppercase text-xs font-semibold btn-luxury"
            >
              {product.stock === 0 ? 'Out of Stock' : <><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart</>}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 text-xs"
                onClick={() => { navigate('product', product.id); onOpenChange(false); }}
              >
                View Full Details
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={handleShare}
              >
                <Share2 className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
              </Button>
            </div>

            <div className="flex gap-2 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 text-xs"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`mr-1.5 h-3.5 w-3.5 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistIds.includes(product.id) ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 h-9 text-xs ${compareIds.includes(product.id) ? 'text-gold' : ''}`}
                onClick={() => toggleCompare(product.id)}
                disabled={compareIds.length >= 3 && !compareIds.includes(product.id)}
              >
                <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
                {compareIds.includes(product.id) ? 'Comparing' : 'Compare'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
