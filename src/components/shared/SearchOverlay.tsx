'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Clock,
  Shirt,
  Crown,
  Watch,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────
const TRENDING_SEARCHES = [
  'Silk Sarees',
  'Designer Dresses',
  'Summer Collection',
  'Bridal Wear',
  'Gold Jewellery',
  'Ethnic Kurtis',
];

const POPULAR_BRANDS = ['Gucci', 'Prada', 'Versace', 'Valentino', 'Burberry'];

const BROWSE_CATEGORIES = [
  { name: "Women's Fashion", icon: Crown, count: '3,120+', slug: "women's-fashion" },
  { name: 'Dresses', icon: Sparkles, count: '1,850+', slug: 'dresses' },
  { name: 'Ethnic Wear', icon: Shirt, count: '2,450+', slug: 'ethnic-wear' },
  { name: 'Accessories', icon: Watch, count: '890+', slug: 'accessories' },
  { name: 'New Arrivals', icon: Sparkles, count: '340+', slug: 'new-arrivals' },
  { name: 'Sale', icon: Tag, count: '180+', slug: 'sale' },
];

const RECENT_SEARCHES_KEY = 'miradeen-recent-searches';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(term: string) {
  try {
    const existing = getRecentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase());
    existing.unshift(term);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(existing.slice(0, 5)));
  } catch {
    /* ignore storage errors */
  }
}

function removeRecentSearch(term: string) {
  try {
    const existing = getRecentSearches().filter((s) => s !== term);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    /* ignore */
  }
}

// ── Animation Variants ───────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const itemHover = {
  x: 4,
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function SearchOverlay() {
  const { navigate, searchQuery, setSearchQuery, setCategoryFilter } = useStore();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentVersion, setRecentVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Read recent searches from localStorage on every render (cheap operation)
  const recentSearches = getRecentSearches();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchProducts(debouncedQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [debouncedQuery, searchProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
  };

  const handleTrendingOrRecentClick = (term: string) => {
    handleSearch(term);
    addRecentSearch(term);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedQuery.trim()) {
      addRecentSearch(debouncedQuery.trim());
      setOpen(false);
      navigate('shop');
    }
  };

  const handleProductClick = (productId: string) => {
    if (debouncedQuery.trim()) {
      addRecentSearch(debouncedQuery.trim());
    }
    setOpen(false);
    navigate('product', productId);
  };

  const handleViewAll = () => {
    if (debouncedQuery.trim()) {
      addRecentSearch(debouncedQuery.trim());
    }
    setOpen(false);
    navigate('shop');
  };

  const handleDeleteRecent = (term: string) => {
    removeRecentSearch(term);
    setRecentVersion((v) => v + 1);
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentVersion((v) => v + 1);
  };

  const handleCategoryClick = (slug: string) => {
    setCategoryFilter(slug);
    setOpen(false);
    navigate('shop');
  };

  const isIdle = !loading && debouncedQuery.length < 2;
  const hasRecentSearches = recentSearches.length > 0;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-0 z-[61] max-h-[85vh] mx-auto max-w-2xl pt-4 px-4"
            >
              <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <form onSubmit={handleSubmit} className="flex items-center px-5 py-4 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for products, collections..."
                    value={debouncedQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none ml-3 text-sm placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setDebouncedQuery(''); }}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>

                {/* Keyboard shortcut hint */}
                <div className="px-5 py-2 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">esc</kbd>
                      Close
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* ── Loading ─────────────────────────────────────────── */}
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* ── No Results ──────────────────────────────────────── */}
                  {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-14 px-6"
                    >
                      <div className="relative inline-block mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center mx-auto">
                          <Search className="h-7 w-7 text-gold/50" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        No results found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try searching for &ldquo;{debouncedQuery}&rdquo; with different keywords
                      </p>
                    </motion.div>
                  )}

                  {/* ── Search Results ──────────────────────────────────── */}
                  {!loading && results.length > 0 && (
                    <>
                      <div className="py-2">
                        <p className="px-5 py-2 text-[10px] tracking-wider uppercase text-muted-foreground font-medium">
                          {results.length} result{results.length !== 1 ? 's' : ''} found
                        </p>
                        {results.map((product) => {
                          const images = parseJsonField<string>(product.images);
                          return (
                            <motion.button
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
                              variants={itemHover}
                              whileHover="x"
                              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors text-left group"
                            >
                              <div className="w-12 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                <img src={images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">{product.category?.name}</p>
                                <p className="text-sm font-medium truncate group-hover:text-gold transition-colors">{product.name}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold">₹{product.price.toLocaleString()}</p>
                                {product.comparePrice && (
                                  <p className="text-[10px] text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</p>
                                )}
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-gold transition-all shrink-0" />
                            </motion.button>
                          );
                        })}
                      </div>
                      <div className="border-t border-border p-4">
                        <button
                          onClick={handleViewAll}
                          className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors py-1"
                        >
                          View all results <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── Idle State: Trending / Recent / Categories / Brands ── */}
                  <AnimatePresence mode="wait">
                    {isIdle && (
                      <motion.div
                        key="idle-state"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="px-5 py-4 space-y-6"
                      >
                        {/* ── Recent Searches ──────────────────────────── */}
                        {hasRecentSearches && (
                          <motion.section variants={sectionVariants} custom={0} initial="hidden" animate="visible" exit="exit">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gold" />
                                <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                                  Recent Searches
                                </h3>
                              </div>
                              <button
                                onClick={handleClearAllRecent}
                                className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="space-y-0.5">
                              {recentSearches.map((term) => (
                                <div
                                  key={term}
                                  className="flex items-center group rounded-md hover:bg-muted/50 transition-colors"
                                >
                                  <button
                                    onClick={() => handleTrendingOrRecentClick(term)}
                                    className="flex-1 flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-foreground text-left transition-colors"
                                  >
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                                    <span className="truncate">{term}</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecent(term);
                                    }}
                                    className="pr-3 text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label={`Remove ${term} from recent searches`}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.section>
                        )}

                        {/* ── Trending Now ──────────────────────────────── */}
                        <motion.section variants={sectionVariants} custom={1} initial="hidden" animate="visible" exit="exit">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-3.5 w-3.5 text-gold" />
                            <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                              Trending Now
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {TRENDING_SEARCHES.map((term) => (
                              <motion.button
                                key={term}
                                onClick={() => handleTrendingOrRecentClick(term)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-full text-xs text-foreground/80 hover:bg-gold/10 hover:text-gold border border-transparent hover:border-gold/20 transition-all"
                              >
                                <TrendingUp className="h-3 w-3 opacity-50" />
                                {term}
                              </motion.button>
                            ))}
                          </div>
                        </motion.section>

                        {/* ── Browse Categories ──────────────────────────── */}
                        <motion.section variants={sectionVariants} custom={2} initial="hidden" animate="visible" exit="exit">
                          <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground mb-3">
                            Browse Categories
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {BROWSE_CATEGORIES.map(({ name, icon: Icon, count, slug }) => (
                              <motion.button
                                key={slug}
                                onClick={() => handleCategoryClick(slug)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-gold/5 border border-transparent hover:border-gold/15 transition-all text-left group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center shrink-0 group-hover:from-gold/20 group-hover:to-gold/10 transition-colors">
                                  <Icon className="h-4 w-4 text-gold/70 group-hover:text-gold transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate group-hover:text-gold transition-colors">
                                    {name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">{count} items</p>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.section>

                        {/* ── Popular Brands ─────────────────────────────── */}
                        <motion.section variants={sectionVariants} custom={3} initial="hidden" animate="visible" exit="exit">
                          <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground mb-3">
                            Popular Brands
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {POPULAR_BRANDS.map((brand) => (
                              <motion.button
                                key={brand}
                                onClick={() => handleTrendingOrRecentClick(brand)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-3 py-1.5 bg-muted/40 rounded-full text-[11px] text-muted-foreground hover:text-gold border border-transparent hover:border-gold/15 transition-all tracking-wide"
                              >
                                {brand}
                              </motion.button>
                            ))}
                          </div>
                        </motion.section>

                        {/* ── Bottom Decorative Empty State ──────────────── */}
                        <motion.div
                          variants={sectionVariants}
                          custom={4}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="pt-2 pb-1"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                            <div className="flex items-center gap-1.5 text-muted-foreground/40">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span className="text-[10px] tracking-wider uppercase">Start exploring</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchTrigger onOpen={() => setOpen(true)} />
    </>
  );
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <>
      {/* This trigger is only used for programmatic opening.
          The actual UI trigger is in Navbar. */}
    </>
  );
}

// Export a hook to allow opening search from anywhere
export function useSearchOverlay() {
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };
  return { openSearch };
}
