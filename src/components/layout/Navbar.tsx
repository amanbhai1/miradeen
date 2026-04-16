'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Search, ShoppingBag, Heart, User, Menu, X, Sun, Moon,
  ChevronDown, LogOut, Shield, Package, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';

export default function Navbar() {
  const {
    currentPage, navigate, isAuthenticated, isAdmin, user,
    cart, getCartCount, wishlistIds, searchQuery,
    setSearchQuery, isMobileMenuOpen, setMobileMenuOpen, logout
  } = useStore();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'shop' as const },
    { label: 'About', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        {/* Top announcement bar */}
        <div className="bg-foreground text-primary-foreground text-center py-1.5 text-xs tracking-[0.2em] uppercase">
          Complimentary Shipping on Orders Over ₹2,000
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-gold">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-background p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                      <button
                        onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
                        className="heading-serif text-2xl font-bold tracking-wider"
                      >
                        MIRADEEN
                      </button>
                    </div>
                    <div className="flex-1 py-6">
                      {navLinks.map((link) => (
                        <button
                          key={link.page}
                          onClick={() => { navigate(link.page); setMobileMenuOpen(false); }}
                          className={`w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold ${
                            currentPage === link.page ? 'text-gold font-medium' : ''
                          }`}
                        >
                          {link.label}
                        </button>
                      ))}
                      <div className="divider-gold mx-6 my-4" />
                      {isAdmin && (
                        <button
                          onClick={() => { navigate('admin-dashboard'); setMobileMenuOpen(false); }}
                          className="w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" /> Admin Panel
                        </button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="heading-serif text-xl md:text-2xl font-bold tracking-[0.15em] hover:opacity-80 transition-opacity"
            >
              MIRADEEN
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className="relative text-sm tracking-[0.1em] uppercase font-medium transition-colors hover:text-gold group"
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    currentPage === link.page ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSearch}>
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 text-sm border-gold/30 focus:border-gold"
                        autoFocus
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:text-gold"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:text-gold hidden sm:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('wishlist')}
                className="hover:text-gold relative"
              >
                <Heart className="h-5 w-5" />
                {wishlistIds.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-gold text-background text-[10px]">
                    {wishlistIds.length}
                  </Badge>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('cart')}
                className="hover:text-gold relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-4 w-4 p-0 flex items-center justify-center bg-gold text-background text-[10px]">
                      {cartCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>

              {/* User */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:text-gold">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('profile')}>
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('orders')}>
                      <Package className="mr-2 h-4 w-4" /> My Orders
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('admin-dashboard')}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('auth')}
                  className="hover:text-gold"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </nav>
      </motion.header>
      {/* Spacer for fixed navbar */}
      <div className="h-[calc(2.5rem+4rem)] md:h-[calc(2.5rem+5rem)]" />
    </>
  );
}
