/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, SlidersHorizontal, Grid3X3, Grid2X2, ChevronDown, ChevronLeft, ChevronRight, X, Eye, GitCompareArrows, PackageSearch, RotateCcw, List, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/store/useStore';
import type { Product, Category } from '@/types';
import { parseJsonField } from '@/types';

// ─── Color name → hex mapping ──────────────────────────────────────
const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#ffffff',
  navy: '#1e3a5f',
  red: '#dc2626',
  green: '#16a34a',
  beige: '#d4c5a9',
  brown: '#78350f',
  gold: '#c9a96e',
  blue: '#2563eb',
  gray: '#6b7280',
  grey: '#6b7280',
  maroon: '#7c2d12',
  cream: '#f5f0e1',
  olive: '#5c6b3c',
  teal: '#0d9488',
  purple: '#7c3aed',
  pink: '#ec4899',
  orange: '#ea580c',
  coral: '#f87171',
  burgundy: '#7f1d1d',
  charcoal: '#36454f',
  khaki: '#c3b091',
  rust: '#b7410e',
  peach: '#fbbf24',
  ivory: '#fffff0',
  silver: '#c0c0c0',
  tan: '#d2b48c',
  camel: '#c19a6b',
  mustard: '#e1ad01',
  lavender: '#b57edc',
  mauve: '#e0b0ff',
  mint: '#98fb98',
  turquoise: '#40e0d0',
  magenta: '#ff00ff',
  copper: '#b87333',
  bronze: '#cd7f32',
  wine: '#722f37',
  forest: '#228b22',
  olivegreen: '#556b2f',
  skyblue: '#87ceeb',
  royalblue: '#4169e1',
  midnightblue: '#191970',
  hotpink: '#ff69b4',
  salmon: '#fa8072',
  fuchsia: '#ff00ff',
  indigo: '#4f46e5',
  cyan: '#06b6d4',
  lime: '#84cc16',
  yellow: '#eab308',
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().replace(/[^a-z]/g, '');
  if (COLOR_HEX_MAP[normalized]) return COLOR_HEX_MAP[normalized];
  // Try to find a partial match
  for (const [key, val] of Object.entries(COLOR_HEX_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }
  // Generate a stable color from the string
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 50%)`;
}

// ─── All size options ──────────────────────────────────────────────
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

// ─── Active Filter Chip ────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium border border-gold/20 hover:bg-gold/20 transition-colors cursor-pointer"
      onClick={onRemove}
    >
      {label}
      <X className="h-3 w-3" />
    </motion.span>
  );
}

// ─── Main ShopPage Component ──────────────────────────────────────
export default function ShopPage() {
  const { navigate, addToCart, toggleWishlist, wishlistIds, searchQuery, categoryFilter, setCategoryFilter, setQuickViewProductId, toggleCompare, compareIds } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [gridCols, setGridCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isInitialMount = useRef(true);

  // ─── Products per page for pagination ───────────────────────────
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly, selectedColors, selectedSizes]);

  // ─── Scroll-to-top button visibility ────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Fetch all products (unfiltered) ─────────────────────────────
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
      let fetched = data.products || [];
      // Apply price range
      fetched = fetched.filter((p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]);
      // Apply in-stock filter
      if (inStockOnly) {
        fetched = fetched.filter((p: Product) => p.stock > 0);
      }
      // Apply color filter
      if (selectedColors.length > 0) {
        fetched = fetched.filter((p: Product) => {
          const colors = parseJsonField<string>(p.colors);
          return colors.some((c: string) => selectedColors.some(sc => c.toLowerCase().includes(sc.toLowerCase()) || sc.toLowerCase().includes(c.toLowerCase())));
        });
      }
      // Apply size filter
      if (selectedSizes.length > 0) {
        fetched = fetched.filter((p: Product) => {
          const sizes = parseJsonField<string>(p.sizes);
          return sizes.some((s: string) => selectedSizes.includes(s));
        });
      }
      // Apply client-side sorting for new sort options
      if (sortBy === 'newest') {
        fetched.sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'name-asc') {
        fetched.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      } else if (sortBy === 'top-rated') {
        fetched.sort((a: Product, b: Product) => b.rating - a.rating);
      } else if (sortBy === 'best-selling') {
        fetched.sort((a: Product, b: Product) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
      }
      setProducts(fetched);
      // Also keep all products for counting
      setAllProducts(data.products || []);
    } catch {
      setProducts([]);
      setAllProducts([]);
    }
    setLoading(false);
  }, [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly, selectedColors, selectedSizes]);

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

  // ─── Extract unique colors from all products ─────────────────────
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    allProducts.forEach(p => {
      const colors = parseJsonField<string>(p.colors);
      colors.forEach(c => {
        if (c && c.trim()) colorSet.add(c.trim());
      });
    });
    return Array.from(colorSet);
  }, [allProducts]);

  // ─── Extract unique sizes from all products ──────────────────────
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    allProducts.forEach(p => {
      const sizes = parseJsonField<string>(p.sizes);
      sizes.forEach(s => {
        if (s && s.trim()) sizeSet.add(s.trim());
      });
    });
    return ALL_SIZES.filter(s => sizeSet.has(s));
  }, [allProducts]);

  // ─── Category name lookup ────────────────────────────────────────
  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  // ─── Active filter count ─────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
    if (selectedColors.length > 0) count++;
    if (selectedSizes.length > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, priceRange, selectedColors, selectedSizes, inStockOnly]);

  // ─── Total count (before filters, for "Showing X of Y") ──────────
  const totalProductCount = allProducts.length;

  // ─── Clear all filters ───────────────────────────────────────────
  const clearAllFilters = () => {
    setSelectedCategory('');
    setCategoryFilter('');
    setPriceRange([0, 100000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStockOnly(false);
  };

  // ─── Remove individual filters ───────────────────────────────────
  const removeCategoryFilter = () => {
    setSelectedCategory('');
    setCategoryFilter('');
  };
  const removePriceFilter = () => {
    setPriceRange([0, 100000]);
  };
  const removeColorFilter = (color: string) => {
    setSelectedColors(prev => prev.filter(c => c !== color));
  };
  const removeSizeFilter = (size: string) => {
    setSelectedSizes(prev => prev.filter(s => s !== size));
  };
  const removeStockFilter = () => {
    setInStockOnly(false);
  };

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
          <p className="text-sm text-primary-foreground/70 mt-2">
            {loading
              ? 'Loading products...'
              : `${products.length} of ${totalProductCount} products available`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden hover:border-gold hover:text-gold transition-colors relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-gold text-background text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{products.length}</span> of{' '}
              <span className="font-medium text-foreground">{totalProductCount}</span> products
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-gold [&>option]:bg-background"
              >
                <option value="latest">Latest</option>
                <option value="newest">Newest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="top-rated">Top Rated</option>
                <option value="best-selling">Best Selling</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="hidden sm:flex border rounded-md">
              <Button variant={gridCols === 4 ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 hover:text-gold transition-colors" onClick={() => setGridCols(4)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={gridCols === 2 ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 hover:text-gold transition-colors" onClick={() => setGridCols(2)}>
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button variant={gridCols === 1 ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none hover:text-gold transition-colors" onClick={() => setGridCols(1)}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Chips */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
              {selectedCategory && (
                <FilterChip
                  label={`Category: ${getCategoryName(selectedCategory)}`}
                  onRemove={removeCategoryFilter}
                />
              )}
              {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                <FilterChip
                  label={`Price: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
                  onRemove={removePriceFilter}
                />
              )}
              {selectedColors.map(color => (
                <FilterChip key={color} label={`Color: ${color}`} onRemove={() => removeColorFilter(color)} />
              ))}
              {selectedSizes.map(size => (
                <FilterChip key={size} label={`Size: ${size}`} onRemove={() => removeSizeFilter(size)} />
              ))}
              {inStockOnly && (
                <FilterChip label="In Stock Only" onRemove={removeStockFilter} />
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-gold transition-colors underline ml-2"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 hover-scale-shadow rounded-lg p-1">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => { setSelectedCategory(cat); setCategoryFilter(cat); }}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              selectedColors={selectedColors}
              onToggleColor={(color) => {
                setSelectedColors(prev =>
                  prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                );
              }}
              availableColors={availableColors}
              selectedSizes={selectedSizes}
              onToggleSize={(size) => {
                setSelectedSizes(prev =>
                  prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                );
              }}
              availableSizes={availableSizes}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(prev => !prev)}
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
                    <h3 className="font-semibold flex items-center gap-2">
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-gold text-background text-[10px] font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="hover:text-gold"><X className="h-5 w-5" /></Button>
                  </div>
                  <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => { setSelectedCategory(cat); setCategoryFilter(cat); }}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    selectedColors={selectedColors}
                    onToggleColor={(color) => {
                      setSelectedColors(prev =>
                        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                      );
                    }}
                    availableColors={availableColors}
                    selectedSizes={selectedSizes}
                    onToggleSize={(size) => {
                      setSelectedSizes(prev =>
                        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                      );
                    }}
                    availableSizes={availableSizes}
                    inStockOnly={inStockOnly}
                    onToggleInStock={() => setInStockOnly(prev => !prev)}
                    onApply={() => { fetchProducts(); setShowFilters(false); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-4 md:gap-6 ${gridCols === 1 ? 'grid-cols-1' : gridCols === 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {Array.from({ length: gridCols === 1 ? 4 : 6 }).map((_, i) => (
                  <div key={i} className={gridCols === 1 ? 'flex gap-4 p-4 bg-card rounded-lg border border-border' : 'space-y-3'}>
                    <div className={`${gridCols === 1 ? 'w-1/3 shrink-0' : ''}`}>
                      <div className={`skeleton-luxury ${gridCols === 1 ? 'aspect-square' : 'aspect-[3/4]'} rounded-lg`} />
                    </div>
                    <div className={`flex-1 ${gridCols === 1 ? 'flex flex-col justify-center gap-2' : 'space-y-3 pt-0'}`}>
                      <div className="h-3 w-16 skeleton-luxury rounded" />
                      <div className="h-4 w-3/4 skeleton-luxury rounded" />
                      {gridCols === 1 && <div className="h-3 w-full skeleton-luxury rounded" />}
                      <div className="h-4 w-1/3 skeleton-luxury rounded" />
                      <div className="flex gap-2">
                        <div className="h-6 w-12 skeleton-luxury rounded-full" />
                        <div className="h-6 w-12 skeleton-luxury rounded-full" />
                        <div className="h-6 w-12 skeleton-luxury rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center relative overflow-hidden"
              >
                {/* Morph blob background */}
                <div className="absolute w-64 h-64 bg-gold/5 morph-blob rounded-3xl -top-10 -right-10 blur-3xl" />
                <div className="absolute w-48 h-48 bg-gold/5 morph-blob-slow rounded-3xl -bottom-10 -left-10 blur-3xl" />
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6 mx-auto">
                    <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="heading-serif text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">
                    We couldn&apos;t find any products matching your current filters. Try adjusting your criteria or browse our full collection.
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      className="hover:border-gold hover:text-gold transition-colors mb-6"
                      onClick={clearAllFilters}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Browse All Products
                    </Button>
                  )}
                  {/* Suggested categories */}
                  {categories.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-3">Or browse by category:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {categories.slice(0, 6).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.slug); setCategoryFilter(cat.slug); }}
                            className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card text-muted-foreground hover:border-gold hover:text-gold hover:bg-gold/5 transition-all duration-200"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : gridCols === 1 ? (
              /* ─── List View ─── */
              <div className="space-y-4">
                {paginatedProducts.map((product, i) => {
                  const images = parseJsonField<string>(product.images);
                  const productDiscount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
                  const productColors = parseJsonField<string>(product.colors);
                  const productSizes = parseJsonField<string>(product.sizes);
                  const isLowStock = product.stock > 0 && product.stock < 5;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="card-luxury card-shine group cursor-pointer bg-card rounded-lg overflow-hidden border border-border flex" onClick={() => navigate('product', product.id)}>
                        {/* Image - 1/3 */}
                        <div className="relative w-1/3 max-w-[280px] shrink-0 aspect-square">
                          <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {productDiscount > 0 && <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0">-{productDiscount}%</Badge>}
                            {product.isNewArrival && <Badge className="bg-gold text-background text-[9px] px-1.5 py-0">New</Badge>}
                            {product.isBestseller && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Bestseller</Badge>}
                          </div>
                          {/* Wishlist button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            className="absolute top-2 right-2 w-8 h-8 bg-background/80 dark:bg-card/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-gold hover:text-background transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>
                        {/* Info - 2/3 */}
                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-1">{product.category?.name}</p>
                                <h3 className="text-base font-medium group-hover:text-gold transition-colors">{product.name}</h3>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                                  compareIds.includes(product.id) ? 'bg-gold text-background' : 'hover:bg-gold hover:text-background text-muted-foreground'
                                }`}
                              >
                                <GitCompareArrows className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description || ''}</p>
                            {/* Rating */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, si) => (
                                  <svg key={si} className={`h-3.5 w-3.5 ${si < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} viewBox="0 0 20 20"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.6l5.34-.78L10 1z" /></svg>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Price */}
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                                {product.comparePrice && (
                                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                                )}
                              </div>
                              {/* Stock dot */}
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className={`inline-block w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-500' : isLowStock ? 'bg-orange-400' : 'bg-green-500'}`} />
                                {product.stock === 0 ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left` : 'In Stock'}
                              </span>
                              {/* Size pills */}
                              {productSizes.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {productSizes.slice(0, 3).map((s) => (
                                    <span key={s} className="px-1.5 py-0.5 text-[10px] border border-border rounded text-muted-foreground">{s}</span>
                                  ))}
                                  {productSizes.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">+{productSizes.length - 3} more</span>
                                  )}
                                </div>
                              )}
                              {/* Color dots */}
                              {productColors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {productColors.slice(0, 4).map((c) => (
                                    <span
                                      key={c}
                                      className="inline-block w-4 h-4 rounded-full border border-border"
                                      style={{ backgroundColor: getColorHex(c) }}
                                      title={c}
                                    />
                                  ))}
                                  {productColors.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground">+{productColors.length - 4}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickViewProductId(product.id);
                                }}
                                className="h-9 hover:border-gold hover:text-gold transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> Quick View
                              </Button>
                              <Button
                                size="sm"
                                disabled={product.stock === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product, 1, productSizes[0]);
                                }}
                                className="h-9 bg-gold text-background hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingBag className="h-3.5 w-3.5 mr-1" /> {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ─── Grid View ─── */
              <>
                <div className={`grid gap-4 md:gap-6 ${gridCols === 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {paginatedProducts.map((product, i) => {
                    const images = parseJsonField<string>(product.images);
                    const productDiscount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
                    const productColors = parseJsonField<string>(product.colors);
                    const productSizes = parseJsonField<string>(product.sizes);
                    const isLowStock = product.stock > 0 && product.stock < 5;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="product-card card-shine group cursor-pointer bg-card rounded-lg overflow-hidden border border-border" onClick={() => navigate('product', product.id)}>
                          <div className="relative aspect-[3/4] img-zoom">
                            <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {productDiscount > 0 && <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0">-{productDiscount}%</Badge>}
                              {product.isNewArrival && <Badge className="bg-gold text-background text-[9px] px-1.5 py-0">New</Badge>}
                              {product.isBestseller && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Bestseller</Badge>}
                              {product.stock === 0 && <Badge className="bg-muted text-muted-foreground text-[9px] px-1.5 py-0">Out of Stock</Badge>}
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
                                  addToCart(product, 1, productSizes[0]);
                                }}
                                size="sm"
                                disabled={product.stock === 0}
                                className="flex-1 h-9 bg-white text-foreground hover:bg-gold hover:text-background text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingBag className="h-3 w-3 mr-0.5" /> {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
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
                            {/* Quick-stats badges */}
                            <div className="mt-2 space-y-1.5">
                              {/* Stock indicator + Rating */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${product.stock === 0 ? 'bg-red-500' : isLowStock ? 'bg-orange-400' : 'bg-green-500'}`} />
                                  <span className="text-[10px] text-muted-foreground">
                                    {product.stock === 0 ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left` : 'In Stock'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, si) => (
                                    <svg key={si} className={`h-2.5 w-2.5 ${si < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} viewBox="0 0 20 20"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.6l5.34-.78L10 1z" /></svg>
                                  ))}
                                  <span className="text-[9px] text-muted-foreground ml-0.5">({product.reviewCount})</span>
                                </div>
                              </div>
                              {/* Size pills */}
                              {productSizes.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {productSizes.slice(0, 3).map((s) => (
                                    <span key={s} className="px-1.5 py-0 text-[9px] border border-border/60 rounded text-muted-foreground leading-4">{s}</span>
                                  ))}
                                  {productSizes.length > 3 && (
                                    <span className="text-[9px] text-muted-foreground">+{productSizes.length - 3} more</span>
                                  )}
                                </div>
                              )}
                              {/* Color dots */}
                              {productColors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {productColors.slice(0, 4).map((c) => (
                                    <span
                                      key={c}
                                      className="inline-block w-3.5 h-3.5 rounded-full border border-border/60"
                                      style={{ backgroundColor: getColorHex(c) }}
                                      title={c}
                                    />
                                  ))}
                                  {productColors.length > 4 && (
                                    <span className="text-[9px] text-muted-foreground">+{productColors.length - 4}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ─── Pagination ─── */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-foreground">{(currentPage - 1) * PRODUCTS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-medium text-foreground">{Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)}</span> of{' '}
                      <span className="font-medium text-foreground">{products.length}</span> products
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 hover:border-gold hover:text-gold transition-colors"
                        disabled={currentPage === 1}
                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollToTop(); }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, pi) => pi + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="icon"
                          className={`h-9 w-9 transition-colors ${
                            currentPage === page
                              ? 'bg-gold text-background hover:bg-gold/90'
                              : 'hover:border-gold hover:text-gold'
                          }`}
                          onClick={() => { setCurrentPage(page); scrollToTop(); }}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 hover:border-gold hover:text-gold transition-colors"
                        disabled={currentPage === totalPages}
                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollToTop(); }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Scroll-to-top button ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-gold text-background shadow-lg hover:bg-gold/90 transition-colors flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── FilterSidebar Component ──────────────────────────────────────
interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  priceRange: number[];
  onPriceChange: (range: number[]) => void;
  selectedColors: string[];
  onToggleColor: (color: string) => void;
  availableColors: string[];
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  availableSizes: string[];
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onApply: () => void;
}

function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceChange,
  selectedColors,
  onToggleColor,
  availableColors,
  selectedSizes,
  onToggleSize,
  availableSizes,
  inStockOnly,
  onToggleInStock,
  onApply,
}: FilterSidebarProps) {
  return (
    <div className="space-y-8 sticky top-32">
      {/* Categories */}
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

      {/* Price Range */}
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
      </div>

      {/* Colors */}
      {availableColors.length > 0 && (
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4">Colors</h4>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {availableColors.map((color) => {
              const hex = getColorHex(color);
              const isActive = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => onToggleColor(color)}
                  title={color}
                  className={`relative w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    isActive
                      ? 'border-gold ring-2 ring-gold/30 scale-110'
                      : 'border-border hover:border-gold/50'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg className={`w-3.5 h-3.5 ${hex === '#ffffff' || hex === '#fffff0' || hex === '#f5f0e1' ? 'text-gray-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedColors.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4">Sizes</h4>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isActive = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onToggleSize(size)}
                  className={`px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 ${
                    isActive
                      ? 'bg-gold text-background border-gold'
                      : 'bg-background text-muted-foreground border-border hover:border-gold hover:text-gold'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* In Stock Only */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock-only"
          checked={inStockOnly}
          onCheckedChange={onToggleInStock}
          className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
        />
        <label
          htmlFor="in-stock-only"
          className="text-sm cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
        >
          In Stock Only
        </label>
      </div>

      {/* Apply Button */}
      <Button size="sm" variant="outline" className="w-full hover:border-gold hover:text-gold transition-colors" onClick={onApply}>
        Apply Filters
      </Button>
    </div>
  );
}
