import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageType, CartItem, Product, User, LoyaltyReward, StyleQuizResult } from '@/types';

interface StoreState {
  // Navigation
  currentPage: PageType;
  selectedProductId: string | null;
  searchQuery: string;
  categoryFilter: string;
  navigate: (page: PageType, productId?: string) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  previousPage: PageType | null;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartCount: () => number;
  applyCoupon: (code: string) => boolean;
  couponCode: string | null;
  couponDiscount: number;
  removeCoupon: () => void;

  // Auth
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Wishlist
  wishlistIds: string[];
  wishlistSynced: boolean;
  toggleWishlist: (productId: string) => void;
  setWishlist: (ids: string[]) => void;
  isInWishlist: (productId: string) => boolean;
  fetchWishlistFromServer: () => Promise<void>;
  syncWishlistToServer: () => Promise<void>;

  // Recently Viewed
  recentlyViewedIds: string[];
  addRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;

  // Compare
  compareIds: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;

  // Notify Me
  notifyProducts: string[];
  toggleNotify: (productId: string) => void;
  isNotifying: (productId: string) => boolean;

  // Quick View
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;

  // Loyalty Rewards
  loyaltyPoints: number;
  redeemableRewards: LoyaltyReward[];
  addLoyaltyPoints: (points: number) => void;
  redeemReward: (rewardId: string) => boolean;
  getLoyaltyTier: () => string;
  getLoyaltyProgress: () => { current: number; target: number; percentage: number };

  // Style Quiz
  styleQuizCompleted: boolean;
  styleQuizResult: StyleQuizResult | null;
  setStyleQuizResult: (result: StyleQuizResult) => void;

  // UI
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const COUPONS: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'WELCOME10': { discount: 10, type: 'percentage' },
  'MIRADEEN20': { discount: 20, type: 'percentage' },
  'FLAT500': { discount: 500, type: 'fixed' },
  'LUXURY30': { discount: 30, type: 'percentage' },
};

// Helper to get auth headers
function getAuthHeaders(): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('miradeen-store');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const token = parsed?.state?.token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  } catch {
    return null;
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home' as PageType,
      selectedProductId: null,
      searchQuery: '',
      categoryFilter: '',
      previousPage: null,

      navigate: (page: PageType, productId?: string) => {
        set((state) => ({
          previousPage: state.currentPage,
          currentPage: page,
          selectedProductId: productId || null,
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (productId) {
          get().addRecentlyViewed(productId);
        }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setCategoryFilter: (category: string) => set({ categoryFilter: category }),

      // Cart
      cart: [],
      couponCode: null,
      couponDiscount: 0,

      addToCart: (product: Product, quantity = 1, size?: string, color?: string) => {
        set((state) => {
          const key = size ? `${product.id}-${size}` : product.id;
          const existing = state.cart.find(
            (item) => (item.size ? `${item.product.id}-${item.size}` : item.product.id) === key
          );

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                (item.size ? `${item.product.id}-${item.size}` : item.product.id) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            cart: [...state.cart, { product, quantity, size, color }],
          };
        });

        // Earn loyalty points: 10 points per ₹1000 spent
        const pointsEarned = Math.floor((product.price * quantity) / 1000) * 10;
        if (pointsEarned > 0) {
          get().addLoyaltyPoints(pointsEarned);
        }
      },

      removeFromCart: (productId: string, size?: string) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));
      },

      updateCartQuantity: (productId: string, quantity: number, size?: string) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ cart: [], couponCode: null, couponDiscount: 0 }),

      getCartSubtotal: () => {
        return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().couponDiscount;
        return Math.max(0, subtotal - discount);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      applyCoupon: (code: string) => {
        const coupon = COUPONS[code.toUpperCase()];
        if (!coupon) return false;

        const subtotal = get().getCartSubtotal();
        const discount =
          coupon.type === 'percentage'
            ? (subtotal * coupon.discount) / 100
            : coupon.discount;

        set({ couponCode: code.toUpperCase(), couponDiscount: discount });
        return true;
      },

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user && !user.isBlocked,
          isAdmin: user?.role === 'admin',
        });
        // Auto-fetch server wishlist when user logs in
        if (user && !user.isBlocked) {
          // Use setTimeout to avoid calling during render
          setTimeout(() => {
            get().fetchWishlistFromServer();
          }, 100);
        }
      },

      setToken: (token: string | null) => set({ token }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false, cart: [], wishlistIds: [], wishlistSynced: false, recentlyViewedIds: [], compareIds: [], notifyProducts: [] });
        if (typeof window !== 'undefined') localStorage.removeItem('miradeen-token');
      },

      // Wishlist — client-side + backend sync
      wishlistIds: [],
      wishlistSynced: false,
      toggleWishlist: (productId: string) => {
        const state = get();
        const isAdding = !state.wishlistIds.includes(productId);

        // Update client-side immediately
        set((s) => ({
          wishlistIds: s.wishlistIds.includes(productId)
            ? s.wishlistIds.filter((id) => id !== productId)
            : [...s.wishlistIds, productId],
        }));

        // Sync with backend if authenticated
        if (state.isAuthenticated && state.token) {
          const headers = { Authorization: `Bearer ${state.token}`, 'Content-Type': 'application/json' };
          if (isAdding) {
            fetch('/api/wishlist', { method: 'POST', headers, body: JSON.stringify({ productId }) }).catch(() => {});
          } else {
            fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE', headers }).catch(() => {});
          }
        }
      },
      setWishlist: (ids: string[]) => set({ wishlistIds: ids }),
      isInWishlist: (productId: string) => get().wishlistIds.includes(productId),
      fetchWishlistFromServer: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) return;
        try {
          const res = await fetch('/api/wishlist', {
            headers: { Authorization: `Bearer ${state.token}` },
          });
          if (!res.ok) return;
          const data = await res.json();
          const serverIds: string[] = (data.items || []).map(
            (item: { productId: string }) => item.productId
          );
          // Merge: union of local and server IDs
          set((s) => {
            const merged = Array.from(new Set([...s.wishlistIds, ...serverIds]));
            return { wishlistIds: merged, wishlistSynced: true };
          });
        } catch {
          // Silently fail — local state is still valid
        }
      },
      syncWishlistToServer: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) return;
        try {
          const headers = {
            Authorization: `Bearer ${state.token}`,
            'Content-Type': 'application/json',
          };
          // Add all local wishlist items to server (upsert is idempotent)
          await Promise.allSettled(
            state.wishlistIds.map((productId) =>
              fetch('/api/wishlist', {
                method: 'POST',
                headers,
                body: JSON.stringify({ productId }),
              })
            )
          );
          set({ wishlistSynced: true });
        } catch {
          // Silently fail
        }
      },

      // Recently Viewed — client-side + backend sync
      recentlyViewedIds: [],
      addRecentlyViewed: (productId: string) => {
        set((state) => {
          const filtered = state.recentlyViewedIds.filter((id) => id !== productId);
          return { recentlyViewedIds: [productId, ...filtered].slice(0, 10) };
        });

        // Sync with backend if authenticated
        const state = get();
        if (state.isAuthenticated && state.token) {
          const headers = { Authorization: `Bearer ${state.token}`, 'Content-Type': 'application/json' };
          fetch('/api/recently-viewed', { method: 'POST', headers, body: JSON.stringify({ productId }) }).catch(() => {});
        }
      },
      clearRecentlyViewed: () => {
        set({ recentlyViewedIds: [] });

        // Clear backend data if authenticated
        const state = get();
        if (state.isAuthenticated && state.token) {
          const headers = { Authorization: `Bearer ${state.token}` };
          // Backend doesn't have a clear endpoint, but client-side clear is sufficient
          // since we load from backend on auth
        }
      },

      // Compare
      compareIds: [],
      toggleCompare: (productId: string) => {
        set((state) => {
          if (state.compareIds.includes(productId)) {
            return { compareIds: state.compareIds.filter((id) => id !== productId) };
          }
          if (state.compareIds.length >= 3) return state;
          return { compareIds: [...state.compareIds, productId] };
        });
      },
      clearCompare: () => set({ compareIds: [] }),
      isInCompare: (productId: string) => get().compareIds.includes(productId),

      // Notify Me
      notifyProducts: [],
      toggleNotify: (productId: string) => {
        set((state) => ({
          notifyProducts: state.notifyProducts.includes(productId)
            ? state.notifyProducts.filter((id) => id !== productId)
            : [...state.notifyProducts, productId],
        }));
      },
      isNotifying: (productId: string) => get().notifyProducts.includes(productId),

      // Quick View
      quickViewProductId: null,
      setQuickViewProductId: (id: string | null) => set({ quickViewProductId: id }),

      // Loyalty Rewards
      loyaltyPoints: 0,
      redeemableRewards: [
        { id: '1', title: '10% Off', description: 'Get 10% off your next order', pointsRequired: 100, discountType: 'percentage', discountValue: 10, isActive: true },
        { id: '2', title: '₹500 Off', description: 'Get ₹500 off on orders above ₹2000', pointsRequired: 200, discountType: 'fixed', discountValue: 500, isActive: true },
        { id: '3', title: 'Free Shipping', description: 'Free shipping on your next order', pointsRequired: 50, discountType: 'fixed', discountValue: 200, isActive: true },
      ],

      addLoyaltyPoints: (points: number) => {
        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + points,
        }));
      },

      redeemReward: (rewardId: string) => {
        const state = get();
        const reward = state.redeemableRewards.find((r) => r.id === rewardId);
        if (!reward || !reward.isActive) return false;
        if (state.loyaltyPoints < reward.pointsRequired) return false;
        set({ loyaltyPoints: state.loyaltyPoints - reward.pointsRequired });
        return true;
      },

      getLoyaltyTier: () => {
        const points = get().loyaltyPoints;
        if (points >= 500) return 'Platinum';
        if (points >= 300) return 'Gold';
        if (points >= 100) return 'Silver';
        return 'Bronze';
      },

      getLoyaltyProgress: () => {
        const points = get().loyaltyPoints;
        let current = 0;
        let target = 100;
        if (points >= 500) { current = 500; target = 500; }
        else if (points >= 300) { current = 300; target = 500; }
        else if (points >= 100) { current = 100; target = 300; }
        else { current = 0; target = 100; }
        const range = target - current;
        const earned = points - current;
        const percentage = points >= 500 ? 100 : Math.round((earned / range) * 100);
        return { current: points, target, percentage };
      },

      // Style Quiz
      styleQuizCompleted: false,
      styleQuizResult: null,
      setStyleQuizResult: (result: StyleQuizResult) => {
        set({ styleQuizResult: result, styleQuizCompleted: true });
      },

      // UI
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),
      isLoading: false,
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'miradeen-store',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        wishlistIds: state.wishlistIds,
        recentlyViewedIds: state.recentlyViewedIds,
        compareIds: state.compareIds,
        notifyProducts: state.notifyProducts,
        loyaltyPoints: state.loyaltyPoints,
        styleQuizResult: state.styleQuizResult,
      }),
    }
  )
);
