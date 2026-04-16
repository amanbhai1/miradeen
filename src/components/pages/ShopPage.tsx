/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, SlidersHorizontal, Grid3X3, Grid2X2, ChevronDown, X, Eye, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/store/useStore';
import type { Product, Category } from '@/types';
import { parseJsonField } from '@/types';

export default function ShopPage() {
  const { navigate, addToCart, toggleWishlist, wishlistIds, searchQuery, categoryFilter, setCategoryFilter, setQuickViewProductId, toggleCompare, compareIds } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [sortBy, setSortBy] = useState('latest');
  const [gridCols, setGridCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const isInitialMount = useRef(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);
      params.set('limit', '50');
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      let filtered = data.products || [];
      filtered = filtered.filter((p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]);
      setProducts(filtered);
    } catch { setProducts([]); }
    setLoading(false);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const fetchCategories = useCallback(() => {
    fetch('/api/products?limit=100').then(r => r.json()).then(d => {
      const cats = new Map<string, Category>();
      (d.products || []).forEach((p: Product) => { if (p.category) cats.set(p.category.id, p.category); });
      setCategories(Array.from(cats.values()));
    });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchProducts();
      fetchCategories();
    } else {
      fetchProducts();
    }
  }, [fetchProducts, fetchCategories]);

  const formatPrice = (p: number) => `₹${p.toLocaleString()}`;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920" alt="Shop" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Discover</p>
          <h1 className="heading-serif text-4xl md:text-5xl font-bold">Shop</h1>
          <p className="text-sm text-primary-foreground/70 mt-2">{products.length} products available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden hover:border-gold hover:text-gold transition-colors">
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
            </Button>
            <span className="text-sm text-muted-foreground">{products.length} products</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="hidden sm:flex border rounded-md">
              <Button variant={gridCols === 4 ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none hover:text-gold transition-colors" onClick={() => setGridCols(4)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={gridCols === 2 ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none hover:text-gold transition-colors" onClick={() => setGridCols(2)}>
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => { setSelectedCategory(cat); setCategoryFilter(cat); }}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              onApply={fetchProducts}
            />
          </aside>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="hover:text-gold"><X className="h-5 w-5" /></Button>
                  </div>
                  <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => { setSelectedCategory(cat); setCategoryFilter(cat); }}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    onApply={() => { fetchProducts(); setShowFilters(false); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="outline" className="mt-4 hover:border-gold hover:text-gold transition-colors" onClick={() => { setSelectedCategory(''); setCategoryFilter(''); setPriceRange([0, 100000]); }}>Clear Filters</Button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${gridCols === 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {products.map((product, i) => {
                  const images = parseJsonField<string>(product.images);
                  const productDiscount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="product-card group cursor-pointer bg-card rounded-lg overflow-hidden border border-border" onClick={() => navigate('product', product.id)}>
                        <div className="relative aspect-[3/4] img-zoom">
                          <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {productDiscount > 0 && <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0">-{productDiscount}%</Badge>}
                            {product.isNewArrival && <Badge className="bg-gold text-background text-[9px] px-1.5 py-0">New</Badge>}
                            {product.isBestseller && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Bestseller</Badge>}
                          </div>
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              className="w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                            >
                              <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                              className={`w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center transition-colors ${
                                compareIds.includes(product.id) ? 'bg-gold text-background' : 'hover:bg-gold hover:text-background'
                              }`}
                            >
                              <GitCompareArrows className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewProductId(product.id);
                              }}
                              size="sm"
                              className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                            >
                              <Eye className="h-3 w-3 mr-0.5" /> Quick View
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                const sizes = parseJsonField<string>(product.sizes);
                                addToCart(product, 1, sizes[0]);
                              }}
                              size="sm"
                              className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px]"
                            >
                              <ShoppingBag className="h-3 w-3 mr-0.5" /> Add to Cart
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 md:p-4">
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{product.category?.name}</p>
                          <h3 className="text-sm font-medium truncate group-hover:text-gold transition-colors">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                            {product.comparePrice && (
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <svg key={si} className={`h-3 w-3 ${si < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}`} viewBox="0 0 20 20"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.6l5.34-.78L10 1z" /></svg>
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ categories, selectedCategory, onSelectCategory, priceRange, onPriceChange, onApply }: {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  priceRange: number[];
  onPriceChange: (range: number[]) => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-8 sticky top-32">
      <div>
        <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4">Categories</h4>
        <div className="space-y-2">
          <button onClick={() => onSelectCategory('')} className={`block w-full text-left text-sm py-1.5 transition-all duration-200 ${!selectedCategory ? 'text-gold font-medium pl-1 border-l-2 border-gold' : 'text-muted-foreground hover:text-foreground hover:pl-1'}`}>
            All Products
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => onSelectCategory(cat.slug)} className={`block w-full text-left text-sm py-1.5 transition-all duration-200 ${selectedCategory === cat.slug ? 'text-gold font-medium pl-1 border-l-2 border-gold' : 'text-muted-foreground hover:text-foreground hover:pl-1'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={onPriceChange}
          max={100000}
          step={1000}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
        <Button size="sm" variant="outline" className="w-full mt-4 hover:border-gold hover:text-gold transition-colors" onClick={onApply}>Apply Filters</Button>
      </div>
    </div>
  );
}
