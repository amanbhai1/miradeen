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

export default function App() {
  const { currentPage, token, setUser } = useStore();
  const [mounted, setMounted] = useState(false);
  const isAdminPage = currentPage.startsWith('admin-');

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

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
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
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}
