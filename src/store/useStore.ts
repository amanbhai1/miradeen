import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageType, CartItem, Product, User } from '@/types';

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
  toggleWishlist: (productId: string) => void;
  setWishlist: (ids: string[]) => void;
  isInWishlist: (productId: string) => boolean;

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
};

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

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user && !user.isBlocked,
          isAdmin: user?.role === 'admin',
        }),

      setToken: (token: string | null) => set({ token }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false, cart: [], wishlistIds: [] });
        if (typeof window !== 'undefined') localStorage.removeItem('miradeen-token');
      },

      // Wishlist
      wishlistIds: [],
      toggleWishlist: (productId: string) => {
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(productId)
            ? state.wishlistIds.filter((id) => id !== productId)
            : [...state.wishlistIds, productId],
        }));
      },
      setWishlist: (ids: string[]) => set({ wishlistIds: ids }),
      isInWishlist: (productId: string) => get().wishlistIds.includes(productId),

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
      }),
    }
  )
);
