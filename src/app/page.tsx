/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/HomePage';
import ShopPage from '@/components/pages/ShopPage';
import ProductPage from '@/components/pages/ProductPage';
import CartPage from '@/components/pages/CartPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import AuthPage from '@/components/pages/AuthPage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import WishlistPage from '@/components/pages/WishlistPage';
import ProfilePage from '@/components/pages/ProfilePage';
import AdminDashboard from '@/components/pages/AdminPages';
import OrderTrackingPage from '@/components/pages/OrderTrackingPage';
import StyleQuizPage from '@/components/pages/StyleQuizPage';
import LookbookPage from '@/components/pages/LookbookPage';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import QuickViewModal from '@/components/shared/QuickViewModal';
import CompareDrawer from '@/components/shared/CompareDrawer';
import SizeGuideModal from '@/components/shared/SizeGuideModal';
import RecentlyViewedSection from '@/components/shared/RecentlyViewedSection';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import LoadingBar from '@/components/shared/LoadingBar';
import PromoTimerBar from '@/components/shared/PromoTimerBar';
import NotificationToast, { useNotification } from '@/components/shared/NotificationToast';
import type { PageType } from '@/types';

function PageRenderer({ page }: { page: PageType }) {
  switch (page) {
    case 'home': return <HomePage />;
    case 'shop': return <ShopPage />;
    case 'product': return <ProductPage />;
    case 'cart': return <CartPage />;
    case 'checkout': return <CheckoutPage />;
    case 'auth': return <AuthPage />;
    case 'about': return <AboutPage />;
    case 'contact': return <ContactPage />;
    case 'wishlist': return <WishlistPage />;
    case 'profile': return <ProfilePage />;
    case 'orders': return <ProfilePage />;
    case 'order-tracking': return <OrderTrackingPage />;
    case 'style-quiz': return <StyleQuizPage />;
    case 'lookbook': return <LookbookPage />;
    case 'admin-dashboard':
    case 'admin-products':
    case 'admin-orders':
    case 'admin-users':
    case 'admin-messages':
    case 'admin-cms':
    case 'admin-settings':
      return <AdminDashboard />;
    default: return <HomePage />;
  }
}

function getBreadcrumbItems(page: PageType, productName?: string): { label: string; page?: PageType }[] {
  const base = [{ label: 'Home', page: 'home' as PageType }];
  switch (page) {
    case 'shop': return [...base, { label: 'Shop', page: 'shop' }];
    case 'product': return [...base, { label: 'Shop', page: 'shop' }, { label: productName || 'Product' }];
    case 'cart': return [...base, { label: 'Shopping Cart' }];
    case 'checkout': return [...base, { label: 'Cart', page: 'cart' }, { label: 'Checkout' }];
    case 'wishlist': return [...base, { label: 'Wishlist' }];
    case 'about': return [...base, { label: 'About' }];
    case 'contact': return [...base, { label: 'Contact' }];
    case 'auth': return [...base, { label: 'Account' }];
    case 'profile': return [...base, { label: 'My Account' }];
    case 'orders': return [...base, { label: 'My Orders' }];
    case 'order-tracking': return [...base, { label: 'Order Tracking' }];
    case 'lookbook': return [...base, { label: 'Lookbook' }];
    case 'style-quiz': return [...base, { label: 'Style Quiz' }];
    default: return base;
  }
}

function LuxuryLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background noise-overlay overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Decorative diamond shape rotating slowly */}
        <motion.div
          className="relative mb-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="w-10 h-10 border border-gold/30 rotate-45"
            animate={{ rotate: [45, 405] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] border border-gold/15 rotate-45"
            animate={{ rotate: [45, -315] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* MIRADEEN brand text with shimmer */}
        <motion.h1
          className="heading-serif text-shimmer text-3xl sm:text-4xl font-bold tracking-[0.15em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          MIRADEEN
        </motion.h1>

        {/* Subtle tagline */}
        <motion.p
          className="text-muted-foreground text-xs tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Curated Luxury
        </motion.p>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          className="h-[2px]"
          initial={{ width: '0%' }}
          animate={{ width: '60%' }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #C9A96E, #D4B87A, #C9A96E, transparent)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  const { currentPage, token, setUser, selectedProductId, quickViewProductId, setQuickViewProductId, compareIds } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const { notifications, addNotification, removeNotification } = useNotification();
  const isAdminPage = currentPage.startsWith('admin-');
  const showBreadcrumb = !['home', 'auth'].includes(currentPage) && !isAdminPage;

  const restoreAuth = useCallback(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [token, setUser]);

  useEffect(() => {
    setMounted(true);
    restoreAuth();

    // Allow the loading screen to show for a minimum time for visual polish
    const loadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 1200);

    return () => clearTimeout(loadingTimer);
  }, [restoreAuth]);

  // Welcome notification
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'promo',
        title: 'Welcome to MIRADEEN! ✨',
        message: 'Use code MIRADEEN20 for 20% off your first order.',
        duration: 8000,
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      {/* Loading bar for route transitions */}
      <LoadingBar />

      {/* Initial loading screen */}
      <AnimatePresence>
        {showLoading && !mounted && (
          <motion.div
            key="loading-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <LuxuryLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app */}
      {mounted && (
        <AnimatePresence mode="wait">
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col"
          >
            {!isAdminPage && <Navbar />}
            {!isAdminPage && <PromoTimerBar />}
            <main className="flex-1">
              {showBreadcrumb && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                  <BreadcrumbNav items={getBreadcrumbItems(currentPage)} />
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PageRenderer page={currentPage} />
                </motion.div>
              </AnimatePresence>
              {!isAdminPage && currentPage !== 'home' && <RecentlyViewedSection />}
            </main>
            {!isAdminPage && <Footer />}
            <QuickViewModal
              open={!!quickViewProductId}
              onOpenChange={(open) => { if (!open) setQuickViewProductId(null); }}
              productId={quickViewProductId}
            />
            <CompareDrawer />
            {/* WhatsApp floating button - only on non-admin pages */}
            {!isAdminPage && <WhatsAppButton />}
            <NotificationToast notifications={notifications} onRemove={removeNotification} />
          </motion.div>
        </AnimatePresence>
      )}
    </ErrorBoundary>
  );
}
