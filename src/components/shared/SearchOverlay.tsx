'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { parseJsonField } from '@/types';

export default function SearchOverlay() {
  const { navigate, searchQuery, setSearchQuery } = useStore();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedQuery.trim()) {
      setOpen(false);
      navigate('shop');
    }
  };

  const handleProductClick = (productId: string) => {
    setOpen(false);
    navigate('product', productId);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('shop');
  };

  return (
    <>
      {/* Search trigger button in navbar is handled separately - this is the overlay */}

      {/* Overlay */}
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
              className="fixed inset-x-0 top-0 z-[61] max-h-[80vh] mx-auto max-w-2xl pt-4 px-4"
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

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
                    <div className="text-center py-12 px-6">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
                    </div>
                  )}

                  {!loading && results.length > 0 && (
                    <>
                      <div className="py-2">
                        <p className="px-5 py-2 text-[10px] tracking-wider uppercase text-muted-foreground font-medium">
                          {results.length} result{results.length !== 1 ? 's' : ''} found
                        </p>
                        {results.map((product) => {
                          const images = parseJsonField<string>(product.images);
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
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
                            </button>
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

                  {!loading && debouncedQuery.length < 2 && (
                    <div className="text-center py-12 px-6">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {['Blazers', 'Silk', 'Dresses', 'New Collection'].map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="px-3 py-1.5 bg-muted rounded-full text-xs hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* This component only provides the overlay. The trigger is integrated into the Navbar. */}
      {/* Export the open setter for external trigger */}
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
  // Consumers can dispatch a custom event
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };
  return { openSearch };
}
