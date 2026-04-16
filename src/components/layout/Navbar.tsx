'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Search, Heart, User, Menu, X, Sun, Moon,
  LogOut, Shield, Package, Settings, MapPin,
  ChevronDown, ChevronRight, LogIn, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipTrigger, TooltipContent
} from '@/components/ui/tooltip';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useStore } from '@/store/useStore';
import CartDrawer from '@/components/shared/CartDrawer';
import SearchOverlay from '@/components/shared/SearchOverlay';

const announcements = [
  'Complimentary Shipping on Orders Over ₹2,000',
  'New Collection 2024 — Now Live',
  'Use Code MIRADEEN20 for 20% Off',
  'Free Returns Within 30 Days',
];

const ANNOUNCEMENT_DISMISSED_KEY = 'miradeen-announcement-dismissed';

const shopCategories = [
  { label: 'Men', slug: 'men' },
  { label: 'Women', slug: 'women' },
  { label: 'Accessories', slug: 'accessories' },
];

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

const mobileMenuVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
};

const searchPulseKeyframes = {
  scale: [1, 1.25, 1],
  opacity: [1, 0.6, 1],
};

export default function Navbar() {
  const {
    currentPage, navigate, isAuthenticated, isAdmin, user,
    wishlistIds, isMobileMenuOpen, setMobileMenuOpen, logout,
    getCartTotal, setCategoryFilter
  } = useStore();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [searchPulse, setSearchPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartTotal = getCartTotal();

  // Hydration safety
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Announcement dismissed state from localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY);
      if (dismissed === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnnouncementDismissed(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Announcement carousel
  useEffect(() => {
    if (announcementDismissed) return;
    const interval = setInterval(() => {
      setAnnouncementVisible(false);
      setTimeout(() => {
        setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        setAnnouncementVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcementDismissed]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pulse search icon once after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchPulse(true);
      setTimeout(() => setSearchPulse(false), 600);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    try {
      localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, 'true');
    } catch {
      // localStorage not available
    }
  };

  const handleNavigateShopCategory = (categorySlug: string) => {
    setCategoryFilter(categorySlug);
    navigate('shop');
    setMobileMenuOpen(false);
  };

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const userInitials = useMemo(() => {
    if (user?.name) return getUserInitials(user.name);
    return null;
  }, [user?.name]);

  const showAnnouncementBar = mounted && !announcementDismissed;

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'shop' as const },
    { label: 'Lookbook', page: 'lookbook' as const },
    { label: 'Style Quiz', page: 'style-quiz' as const },
    { label: 'About', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

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
        {/* Animated announcement bar */}
        <AnimatePresence>
          {showAnnouncementBar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 32, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-foreground text-primary-foreground overflow-hidden"
            >
              <div className="h-8 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {announcementVisible && (
                    <motion.p
                      key={announcementIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="text-[11px] tracking-[0.2em] uppercase absolute"
                    >
                      {announcements[announcementIndex]}
                    </motion.p>
                  )}
                </AnimatePresence>
                {/* Dismiss button */}
                <button
                  onClick={handleDismissAnnouncement}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-gold transition-colors">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-background p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Header with logo */}
                    <div className="p-6 border-b border-border">
                      <button
                        onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
                        className="heading-serif text-2xl font-bold tracking-wider hover:text-gold transition-colors"
                      >
                        MIRADEEN
                      </button>
                    </div>

                    {/* User greeting if authenticated */}
                    {isAuthenticated && user && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="px-6 py-4 bg-gold/5 border-b border-gold/10"
                      >
                        <p className="text-xs text-muted-foreground tracking-wider uppercase">Welcome back</p>
                        <p className="text-sm font-semibold mt-0.5 text-gold">Hello, {user.name.split(' ')[0]}</p>
                      </motion.div>
                    )}

                    {/* Nav links */}
                    <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
                      {navLinks.map((link, i) => (
                        <motion.button
                          key={link.page}
                          custom={i}
                          variants={mobileMenuVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => { navigate(link.page); setMobileMenuOpen(false); }}
                          className={`w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold hover:bg-gold/5 flex items-center justify-between ${
                            currentPage === link.page ? 'text-gold font-medium bg-gold/5' : ''
                          }`}
                        >
                          {link.label}
                          {link.page === 'shop' && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </motion.button>
                      ))}

                      {/* Shop submenu with collapsible categories */}
                      <motion.div
                        custom={navLinks.length}
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-6"
                      >
                        <Collapsible open={shopExpanded} onOpenChange={setShopExpanded}>
                          <CollapsibleTrigger className="w-full flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-gold transition-colors group">
                            <span className="tracking-[0.1em] uppercase">Categories</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 group-hover:text-gold ${shopExpanded ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <AnimatePresence>
                            {shopExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 py-2 space-y-1">
                                  {shopCategories.map((cat) => (
                                    <button
                                      key={cat.slug}
                                      onClick={() => handleNavigateShopCategory(cat.slug)}
                                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:text-gold hover:bg-gold/5 rounded-md"
                                    >
                                      {cat.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Collapsible>
                      </motion.div>

                      <div className="divider-gold mx-6 my-3" />

                      {/* Utility links */}
                      <motion.button
                        custom={navLinks.length + 1}
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => { navigate('orders'); setMobileMenuOpen(false); }}
                        className="w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold hover:bg-gold/5 flex items-center gap-3"
                      >
                        <Package className="h-4 w-4" /> My Orders
                      </motion.button>
                      <motion.button
                        custom={navLinks.length + 2}
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => { navigate('order-tracking'); setMobileMenuOpen(false); }}
                        className="w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold hover:bg-gold/5 flex items-center gap-3"
                      >
                        <MapPin className="h-4 w-4" /> Track Order
                      </motion.button>

                      {isAdmin && (
                        <>
                          <div className="divider-gold mx-6 my-3" />
                          <motion.button
                            custom={navLinks.length + 3}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => { navigate('admin-dashboard'); setMobileMenuOpen(false); }}
                            className="w-full text-left px-6 py-3 text-lg transition-colors hover:text-gold hover:bg-gold/5 flex items-center gap-3"
                          >
                            <Shield className="h-4 w-4" /> Admin Panel
                          </motion.button>
                        </>
                      )}

                      {/* Divider before auth section */}
                      <div className="divider-gold mx-6 my-3" />

                      {/* Auth section at bottom */}
                      {isAuthenticated ? (
                        <motion.button
                          custom={navLinks.length + 4}
                          variants={mobileMenuVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => { logout(); setMobileMenuOpen(false); }}
                          className="w-full text-left px-6 py-3 text-lg transition-colors hover:text-destructive hover:bg-destructive/5 flex items-center gap-3 text-muted-foreground"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </motion.button>
                      ) : (
                        <div className="px-6 space-y-2">
                          <motion.div custom={navLinks.length + 4} variants={mobileMenuVariants} initial="hidden" animate="visible">
                            <Button
                              onClick={() => { navigate('auth'); setMobileMenuOpen(false); }}
                              className="w-full bg-gold text-background hover:bg-gold-dark tracking-[0.1em] uppercase text-xs font-semibold h-11"
                            >
                              <LogIn className="mr-2 h-4 w-4" />
                              Login / Register
                            </Button>
                          </motion.div>
                          <motion.p
                            custom={navLinks.length + 5}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-[11px] text-muted-foreground text-center pt-1"
                          >
                            Sign in to access your account
                          </motion.p>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="heading-serif text-xl md:text-2xl font-bold tracking-[0.15em] hover:text-gold transition-colors"
            >
              MIRADEEN
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className="relative text-sm tracking-[0.1em] uppercase font-medium transition-colors hover:text-gold group py-1"
                >
                  {link.label}
                  {/* Hover underline */}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    currentPage === link.page ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                  {/* Gold dot indicator for active link */}
                  {currentPage === link.page && (
                    <motion.span
                      layoutId="active-nav-dot"
                      className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search Button - Opens Search Overlay */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hover:text-gold transition-colors"
              >
                <motion.div
                  animate={searchPulse ? searchPulseKeyframes : undefined}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>
              </Button>
              {/* Search shortcut badge on desktop */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md hover:border-gold/50 hover:bg-gold/5 transition-all duration-200"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Search...</span>
                <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-3 border border-border">⌘K</kbd>
              </button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:text-gold transition-colors hidden sm:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('wishlist')}
                className="hover:text-gold transition-colors relative"
              >
                <Heart className="h-5 w-5" />
                {wishlistIds.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-gold text-background text-[10px]">
                    {wishlistIds.length}
                  </Badge>
                )}
              </Button>

              {/* Cart Drawer with total tooltip */}
              {cartTotal > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hover:text-gold transition-colors">
                      <CartDrawer />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gold text-background border-0 font-semibold text-xs">
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <CartDrawer />
              )}

              {/* User */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:text-gold transition-colors relative p-0">
                      {userInitials ? (
                        <span className="relative flex items-center justify-center">
                          <span className="h-8 w-8 rounded-full bg-gold/10 border-2 border-gold text-gold text-xs font-bold flex items-center justify-center transition-all duration-200 hover:bg-gold/20">
                            {userInitials}
                          </span>
                        </span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
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
                    <DropdownMenuItem onClick={() => navigate('order-tracking')}>
                      <MapPin className="mr-2 h-4 w-4" /> Track Order
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('admin-dashboard')}>
                          <Shield className="mr-2 h-4 w-4" /> Admin Panel
                        </DropdownMenuItem>
                      </>
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
                  className="hover:text-gold transition-colors"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Gold gradient bottom border on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-px w-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #C9A96E 30%, #D4B87A 50%, #C9A96E 70%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.header>
      {/* Spacer for fixed navbar - adjusts when announcement is dismissed */}
      <div className={`transition-all duration-300 ${showAnnouncementBar ? 'h-[calc(2rem+4rem)] md:h-[calc(2rem+5rem)]' : 'h-16 md:h-20'}`} />

      {/* Search Overlay */}
      <SearchOverlay />
    </>
  );
}
