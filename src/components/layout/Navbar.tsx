'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Search, Heart, User, Menu, X, Sun, Moon,
  LogOut, Shield, Package, Settings, MapPin,
  ChevronDown, ChevronRight, LogIn, ShoppingBag,
  Shirt, Crown, Watch, Sparkles, Star, Gem,
  Palette, Gift, Ruler, PenTool, BookOpen, Tag, Layers,
  FileText, Home, Grid3X3,
  Briefcase, Building2, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
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
  { label: 'Women', slug: 'women' },
  { label: 'Accessories', slug: 'accessories' },
];

const megaMenuCategories = [
  { label: 'Women', icon: Crown, slug: 'women' },
  { label: 'Accessories', icon: Watch, slug: 'accessories' },
  { label: 'New Arrivals', icon: Sparkles, slug: 'new-arrivals' },
  { label: 'Best Sellers', icon: Star, slug: 'best-sellers' },
];

const megaMenuCollections = [
  { label: 'Summer 2024', icon: Sun },
  { label: 'Wedding Collection', icon: Heart },
  { label: 'Premium Basics', icon: Gem },
  { label: 'Bridal Collection', icon: Palette },
];

const megaMenuQuickLinks = [
  { label: 'Collections', icon: Layers, page: 'collections' as const },
  { label: 'Sale', icon: Tag, page: 'sale' as const },
  { label: 'Gift Guide', icon: Gift, page: 'gift-guide' as const },
  { label: 'Size Guide', icon: Ruler, page: 'size-guide' as const },
  { label: 'Style Quiz', icon: PenTool, page: 'style-quiz' as const },
  { label: 'Lookbook', icon: BookOpen, page: 'lookbook' as const },
  { label: 'Journal', icon: FileText, page: 'blog' as const },
];

const moreMenuItems = [
  { label: 'Journal', icon: FileText, page: 'blog' as const },
  { label: 'Gift Guide', icon: Gift, page: 'gift-guide' as const },
  { label: 'Lookbook', icon: BookOpen, page: 'lookbook' as const },
  { label: 'Style Quiz', icon: PenTool, page: 'style-quiz' as const },
];

const companyMenuItems = [
  { label: 'About', icon: Building2, page: 'about' as const },
  { label: 'Contact', icon: Compass, page: 'contact' as const },
];

const featuredProducts = [
  {
    name: 'Silk Evening Gown',
    price: '₹12,999',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=240&fit=crop',
  },
  {
    name: 'Gold Chain Necklace',
    price: '₹24,999',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=240&fit=crop',
  },
];

const megaMenuVariants = {
  hidden: { opacity: 0, y: -10, scaleY: 0.95 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, scaleY: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

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
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' },
  }),
};

const searchPulseKeyframes = {
  scale: [1, 1.25, 1],
  opacity: [1, 0.6, 1],
};

/* ------------------------------------------------------------------ */
/*  Mobile menu section definition                                     */
/* ------------------------------------------------------------------ */

interface MobileMenuSection {
  heading: string;
  icon: typeof Home;
  links: { label: string; page: string; icon?: typeof Home }[];
}

const mobileMenuSections: MobileMenuSection[] = [
  {
    heading: 'Shopping',
    icon: ShoppingBag,
    links: [
      { label: 'Home', page: 'home', icon: Home },
      { label: 'Shop', page: 'shop', icon: Shirt },
      { label: 'Collections', page: 'collections', icon: Grid3X3 },
      { label: 'Sale', page: 'sale', icon: Tag },
      { label: 'Gift Guide', page: 'gift-guide', icon: Gift },
    ],
  },
  {
    heading: 'Explore',
    icon: Compass,
    links: [
      { label: 'Lookbook', page: 'lookbook', icon: BookOpen },
      { label: 'Style Quiz', page: 'style-quiz', icon: PenTool },
      { label: 'Journal', page: 'blog', icon: FileText },
    ],
  },
  {
    heading: 'Company',
    icon: Building2,
    links: [
      { label: 'About', page: 'about', icon: Briefcase },
      { label: 'Contact', page: 'contact', icon: MapPin },
    ],
  },
  {
    heading: 'Account',
    icon: User,
    links: [
      { label: 'My Orders', page: 'orders', icon: Package },
      { label: 'Track Order', page: 'order-tracking', icon: MapPin },
    ],
  },
];

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
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const shopMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shopMenuCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Cleanup mega menu timeouts on unmount
  useEffect(() => {
    return () => {
      if (shopMenuTimeoutRef.current) clearTimeout(shopMenuTimeoutRef.current);
      if (shopMenuCloseTimeoutRef.current) clearTimeout(shopMenuCloseTimeoutRef.current);
    };
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

  const handleMobileNavigate = (page: string) => {
    navigate(page as 'home' | 'shop' | 'collections' | 'sale' | 'gift-guide' | 'lookbook' | 'style-quiz' | 'blog' | 'about' | 'contact' | 'orders' | 'order-tracking' | 'admin-dashboard' | 'profile' | 'auth');
    setMobileMenuOpen(false);
  };

  const handleShopMenuEnter = useCallback(() => {
    if (shopMenuCloseTimeoutRef.current) {
      clearTimeout(shopMenuCloseTimeoutRef.current);
      shopMenuCloseTimeoutRef.current = null;
    }
    shopMenuTimeoutRef.current = setTimeout(() => {
      setShopMenuOpen(true);
    }, 200);
  }, []);

  const handleShopMenuLeave = useCallback(() => {
    if (shopMenuTimeoutRef.current) {
      clearTimeout(shopMenuTimeoutRef.current);
      shopMenuTimeoutRef.current = null;
    }
    shopMenuCloseTimeoutRef.current = setTimeout(() => {
      setShopMenuOpen(false);
    }, 300);
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const userInitials = useMemo(() => {
    if (user?.name) return getUserInitials(user.name);
    return null;
  }, [user?.name]);

  const showAnnouncementBar = mounted && !announcementDismissed;

  /* ------------------------------------------------------------------ */
  /*  Desktop primary nav links (only 5 visible)                        */
  /* ------------------------------------------------------------------ */
  const desktopPrimaryLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'shop' as const },
    { label: 'Collections', page: 'collections' as const },
    { label: 'Sale', page: 'sale' as const },
  ];

  /* ------------------------------------------------------------------ */
  /*  Render helpers                                                     */
  /* ------------------------------------------------------------------ */

  /** Standard desktop link button with hover underline & gold dot */
  const renderDesktopLink = (label: string, page: string, key?: string) => (
    <button
      key={key ?? page}
      onClick={() => navigate(page as typeof currentPage)}
      className="relative text-sm tracking-[0.1em] uppercase font-medium transition-colors hover:text-gold group py-1"
    >
      {label}
      {/* Sale badge */}
      {page === 'sale' && (
        <span className="absolute -top-2 -right-3.5 text-[8px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-sm leading-none">HOT</span>
      )}
      {/* Hover underline */}
      <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
        currentPage === page ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
      {/* Gold dot indicator for active link */}
      {currentPage === page && (
        <motion.span
          layoutId="active-nav-dot"
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );

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
            {/* Mobile menu trigger */}
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
                    <div className="p-6 border-b border-border flex items-center justify-between">
                      <button
                        onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
                        className="heading-serif text-2xl font-bold tracking-wider hover:text-gold transition-colors"
                      >
                        MIRADEEN
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        className="h-8 w-8 text-muted-foreground hover:text-gold"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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

                    {/* Scrollable nav links grouped by section */}
                    <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
                      {mobileMenuSections.map((section, sIdx) => {
                        const SectionIcon = section.icon;
                        const linkStartIdx = mobileMenuSections
                          .slice(0, sIdx)
                          .reduce((acc, s) => acc + s.links.length, 0);

                        return (
                          <div key={section.heading}>
                            {/* Section header */}
                            <motion.div
                              custom={linkStartIdx}
                              variants={mobileMenuVariants}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-2 px-6 pt-4 pb-2"
                            >
                              <SectionIcon className="h-3.5 w-3.5 text-gold/60" />
                              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                                {section.heading}
                              </span>
                              <span className="flex-1 h-px bg-border" />
                            </motion.div>

                            {/* Section links */}
                            {section.links.map((link, lIdx) => {
                              const Icon = link.icon;
                              const isShop = link.page === 'shop';

                              return (
                                <motion.button
                                  key={link.page}
                                  custom={linkStartIdx + lIdx}
                                  variants={mobileMenuVariants}
                                  initial="hidden"
                                  animate="visible"
                                  onClick={() => isShop ? undefined : handleMobileNavigate(link.page)}
                                  className={`w-full text-left px-6 pl-10 py-2.5 text-[15px] transition-colors hover:text-gold hover:bg-gold/5 flex items-center justify-between ${
                                    currentPage === link.page ? 'text-gold font-medium bg-gold/5' : 'text-foreground/80'
                                  }`}
                                >
                                  <span className="flex items-center gap-3">
                                    {Icon && <Icon className="h-4 w-4 text-muted-foreground/70" />}
                                    {link.label}
                                  </span>
                                  {isShop && (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </motion.button>
                              );
                            })}

                            {/* Collapsible shop categories (after Shop link) */}
                            {section.heading === 'Shopping' && (
                              <motion.div
                                custom={linkStartIdx + section.links.length}
                                variants={mobileMenuVariants}
                                initial="hidden"
                                animate="visible"
                                className="pl-10 pr-6"
                              >
                                <Collapsible open={shopExpanded} onOpenChange={setShopExpanded}>
                                  <CollapsibleTrigger className="w-full flex items-center justify-between py-2 text-xs text-muted-foreground hover:text-gold transition-colors group">
                                    <span className="tracking-[0.1em] uppercase">Categories</span>
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:text-gold ${shopExpanded ? 'rotate-180' : ''}`} />
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
                                        <div className="pl-6 py-1 space-y-0.5">
                                          {shopCategories.map((cat) => (
                                            <button
                                              key={cat.slug}
                                              onClick={() => handleNavigateShopCategory(cat.slug)}
                                              className="w-full text-left px-3 py-1.5 text-sm transition-colors hover:text-gold hover:bg-gold/5 rounded-md"
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
                            )}
                          </div>
                        );
                      })}

                      {/* Admin Panel — shown only for admins */}
                      {isAdmin && (
                        <div>
                          <div className="flex items-center gap-2 px-6 pt-4 pb-2">
                            <Shield className="h-3.5 w-3.5 text-gold/60" />
                            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">Admin</span>
                            <span className="flex-1 h-px bg-border" />
                          </div>
                          <motion.button
                            custom={100}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => handleMobileNavigate('admin-dashboard')}
                            className="w-full text-left px-6 pl-10 py-2.5 text-[15px] transition-colors hover:text-gold hover:bg-gold/5 flex items-center gap-3 text-foreground/80"
                          >
                            <Shield className="h-4 w-4 text-muted-foreground/70" />
                            Admin Panel
                          </motion.button>
                        </div>
                      )}

                      {/* Divider before auth section */}
                      <div className="divider-gold mx-6 my-4" />

                      {/* Auth section at bottom */}
                      {isAuthenticated ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="px-6 space-y-1"
                        >
                          <motion.button
                            custom={101}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => handleMobileNavigate('profile')}
                            className="w-full text-left py-2.5 text-[15px] transition-colors hover:text-gold hover:bg-gold/5 flex items-center gap-3 text-foreground/80"
                          >
                            <Settings className="h-4 w-4 text-muted-foreground/70" />
                            Profile
                          </motion.button>
                          <motion.button
                            custom={102}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                            className="w-full text-left py-2.5 text-[15px] transition-colors hover:text-destructive hover:bg-destructive/5 flex items-center gap-3 text-muted-foreground"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="px-6 space-y-2"
                        >
                          <motion.div custom={101} variants={mobileMenuVariants} initial="hidden" animate="visible">
                            <Button
                              onClick={() => { navigate('auth'); setMobileMenuOpen(false); }}
                              className="w-full bg-gold text-background hover:bg-gold-dark tracking-[0.1em] uppercase text-xs font-semibold h-11"
                            >
                              <LogIn className="mr-2 h-4 w-4" />
                              Login / Register
                            </Button>
                          </motion.div>
                          <motion.p
                            custom={102}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-[11px] text-muted-foreground text-center pt-1"
                          >
                            Sign in to access your account
                          </motion.p>
                        </motion.div>
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

            {/* Desktop Nav Links — only 5 items max */}
            <div className="hidden md:flex items-center gap-9">
              {/* Regular links */}
              {desktopPrimaryLinks.map((link) => {
                if (link.page === 'shop') {
                  // Shop with mega menu
                  return (
                    <div
                      key={link.page}
                      className="relative"
                      onMouseEnter={handleShopMenuEnter}
                      onMouseLeave={handleShopMenuLeave}
                    >
                      <button
                        onClick={() => navigate(link.page)}
                        className={`relative text-sm tracking-[0.1em] uppercase font-medium transition-colors hover:text-gold group py-1 flex items-center gap-1 ${
                          shopMenuOpen ? 'text-gold' : ''
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`} />
                        <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                          currentPage === link.page || shopMenuOpen ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                        {currentPage === link.page && !shopMenuOpen && (
                          <motion.span
                            layoutId="active-nav-dot"
                            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>

                      {/* Mega Menu Panel */}
                      <AnimatePresence>
                        {shopMenuOpen && (
                          <motion.div
                            variants={megaMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                            style={{ transformOrigin: 'top center' }}
                          >
                            {/* Gold accent line */}
                            <div className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold to-transparent" />
                            <div className="bg-background border border-border rounded-b-xl shadow-luxury-lg w-[80vw] max-w-4xl">
                              <div className="p-6 grid grid-cols-4 gap-6">
                                {/* Column 1: Categories */}
                                <div>
                                  <h3 className="text-xs tracking-wider uppercase text-muted-foreground font-semibold mb-3">Categories</h3>
                                  <ul className="space-y-1">
                                    {megaMenuCategories.map((cat) => {
                                      const Icon = cat.icon;
                                      return (
                                        <li key={cat.label}>
                                          <button
                                            onClick={() => handleNavigateShopCategory(cat.slug)}
                                            className="w-full flex items-center gap-2.5 px-2 py-2 text-sm rounded-md transition-colors hover:bg-gold/5 hover:text-gold"
                                          >
                                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                                            {cat.label}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>

                                {/* Column 2: Collections */}
                                <div>
                                  <h3 className="text-xs tracking-wider uppercase text-muted-foreground font-semibold mb-3">Collections</h3>
                                  <ul className="space-y-1">
                                    {megaMenuCollections.map((col) => {
                                      const Icon = col.icon;
                                      return (
                                        <li key={col.label}>
                                          <button
                                            onClick={() => { navigate('shop'); setMobileMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-2 py-2 text-sm rounded-md transition-colors hover:bg-gold/5 hover:text-gold"
                                          >
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            {col.label}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>

                                {/* Column 3: Featured Products */}
                                <div>
                                  <h3 className="text-xs tracking-wider uppercase text-muted-foreground font-semibold mb-3">Featured</h3>
                                  <div className="space-y-3">
                                    {featuredProducts.map((product) => (
                                      <button
                                        key={product.name}
                                        onClick={() => { navigate('shop'); setMobileMenuOpen(false); }}
                                        className="w-full group/feat text-left rounded-lg overflow-hidden border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-md"
                                      >
                                        <div className="relative h-24 overflow-hidden">
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/feat:scale-110"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </div>
                                        <div className="p-2.5">
                                          <p className="text-xs font-medium truncate">{product.name}</p>
                                          <p className="text-xs text-gold font-semibold mt-0.5">{product.price}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Column 4: Quick Links (includes Journal/Blog now) */}
                                <div>
                                  <h3 className="text-xs tracking-wider uppercase text-muted-foreground font-semibold mb-3">Quick Links</h3>
                                  <ul className="space-y-1">
                                    {megaMenuQuickLinks.map((ql) => {
                                      const Icon = ql.icon;
                                      return (
                                        <li key={ql.label}>
                                          <button
                                            onClick={() => { navigate(ql.page); setMobileMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-2 py-2 text-sm rounded-md transition-colors hover:bg-gold/5 hover:text-gold"
                                          >
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            {ql.label}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // Regular link (Home, Collections, Sale)
                return renderDesktopLink(link.label, link.page);
              })}

              {/* "More" dropdown */}
              <DropdownMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className={`relative text-sm tracking-[0.1em] uppercase font-medium transition-colors hover:text-gold group py-1 flex items-center gap-1 ${
                    moreMenuOpen ? 'text-gold' : ''
                  }`}>
                    More
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-background border-border">
                  <DropdownMenuLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Explore</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.page}
                        onClick={() => navigate(item.page)}
                        className={`cursor-pointer gap-2.5 py-2.5 ${currentPage === item.page ? 'text-gold bg-gold/5' : ''}`}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Company</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {companyMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.page}
                        onClick={() => navigate(item.page)}
                        className={`cursor-pointer gap-2.5 py-2.5 ${currentPage === item.page ? 'text-gold bg-gold/5' : ''}`}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
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
