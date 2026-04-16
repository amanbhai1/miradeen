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
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import QuickViewModal from '@/components/shared/QuickViewModal';
import CompareDrawer from '@/components/shared/CompareDrawer';
import SizeGuideModal from '@/components/shared/SizeGuideModal';
import RecentlyViewedSection from '@/components/shared/RecentlyViewedSection';
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
    default: return base;
  }
}

export default function App() {
  const { currentPage, token, setUser, selectedProductId, quickViewProductId, setQuickViewProductId, compareIds } = useStore();
  const [mounted, setMounted] = useState(false);
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
  }, [restoreAuth]);

  if (!mounted) return null;

  const breadcrumbItems = getBreadcrumbItems(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
        {showBreadcrumb && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <BreadcrumbNav items={breadcrumbItems} />
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
    </div>
  );
}
