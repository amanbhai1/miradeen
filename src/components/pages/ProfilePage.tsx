'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, LogOut, Settings, MapPin, ChevronRight, Edit3, Save,
  Camera, Trash2, Plus, Check, Shield, Heart, Activity, Clock, Mail,
  Phone, Calendar, Lock, Bell, AlertTriangle, Truck, Eye, ShoppingBag,
  CreditCard, ChevronDown, Copy, CheckCircle2, X, Star, ArrowRight,
  MapPinIcon, Home, Building2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AddressEntry {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Helper: format currency                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* ------------------------------------------------------------------ */
/*  Status colour map                                                  */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const paymentColors: Record<string, string> = {
  paid: 'border-green-500/30 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  pending: 'border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  refunded: 'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { user, isAuthenticated, isAdmin, token, navigate, setUser, logout, wishlistIds } = useStore();
  const { toast } = useToast();

  /* ---- state ---- */
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('profile');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, whatsapp: true, newsletter: false });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [newAddress, setNewAddress] = useState<Omit<AddressEntry, 'id' | 'isDefault'>>({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  /* ---- effects ---- */

  useEffect(() => {
    if (!isAuthenticated) { navigate('auth'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setOrders(data.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || 'India',
      });
      if (user.address) {
        setAddresses([{
          id: 'default',
          label: 'Home',
          name: user.name,
          phone: user.phone || '',
          address: user.address,
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          country: user.country || 'India',
          isDefault: true,
        }]);
      }
    }
  }, [user]);

  /* ---- derived ---- */

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '—';
    return new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }, [user?.createdAt]);

  const memberSinceFull = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [user?.createdAt]);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  /* Profile completion calculation */
  const profileCompletion = useMemo(() => {
    const fields = [
      profileForm.name,
      user?.email,
      profileForm.phone,
      profileForm.address,
      profileForm.city,
      profileForm.state,
      profileForm.zipCode,
      profileForm.country,
    ];
    const filled = fields.filter(f => f && f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [profileForm, user?.email]);

  const completionSuggestions = useMemo(() => {
    const suggestions: { label: string; field: string; done: boolean }[] = [
      { label: 'Add your full name', field: 'name', done: !!profileForm.name?.trim() },
      { label: 'Add your phone number', field: 'phone', done: !!profileForm.phone?.trim() },
      { label: 'Add your shipping address', field: 'address', done: !!profileForm.address?.trim() },
      { label: 'Add your city', field: 'city', done: !!profileForm.city?.trim() },
      { label: 'Add your state', field: 'state', done: !!profileForm.state?.trim() },
      { label: 'Add your ZIP code', field: 'zipCode', done: !!profileForm.zipCode?.trim() },
    ];
    return suggestions.filter(s => !s.done);
  }, [profileForm]);

  /* Filtered orders */
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter(o => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  /* Activity timeline (derived from orders + profile) */
  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    orders.slice(0, 5).forEach(order => {
      items.push({
        id: `order-${order.id}`,
        icon: <Package className="h-4 w-4" />,
        title: `Placed order ${order.orderNumber}`,
        description: `${order.items.length} item(s) · ${fmt(order.total)}`,
        date: new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        color: 'text-gold',
      });
    });
    if (wishlistIds.length > 0) {
      items.push({
        id: 'wishlist',
        icon: <Heart className="h-4 w-4" />,
        title: `Added ${wishlistIds.length} item${wishlistIds.length > 1 ? 's' : ''} to wishlist`,
        description: 'Your wishlist is growing!',
        date: 'Recently',
        color: 'text-rose-500',
      });
    }
    if (items.length === 0) {
      items.push({
        id: 'welcome',
        icon: <Star className="h-4 w-4" />,
        title: 'Welcome to MIRADEEN',
        description: 'Your account has been created successfully.',
        date: memberSinceFull || 'Just now',
        color: 'text-gold',
      });
    }
    return items;
  }, [orders, wishlistIds, memberSinceFull]);

  /* Order status tabs */
  const orderStatusTabs = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  /* Sidebar nav items */
  const sidebarNavItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistIds.length, onClick: () => navigate('wishlist') },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'track', label: 'Track Order', icon: Truck, onClick: () => navigate('order-tracking') },
  ];

  /* ---- handlers ---- */

  if (!isAuthenticated || !user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
        toast({ title: 'Profile updated!', description: 'Your information has been saved.' });
        setEditing(false);
      }
    } catch {
      toast({ title: 'Failed to update', description: 'Please try again.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || 'India',
      });
    }
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.address.trim() || !newAddress.city.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in address and city.', variant: 'destructive' });
      return;
    }
    const entry: AddressEntry = {
      ...newAddress,
      id: `addr-${Date.now()}`,
      isDefault: addresses.length === 0,
    };
    setAddresses(prev => [...prev, entry]);
    setNewAddress({ label: 'Home', name: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'India' });
    setShowAddAddress(false);
    toast({ title: 'Address added!', description: 'Your new address has been saved.' });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Address removed', description: 'The address has been deleted.' });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast({ title: 'Default updated', description: 'Your default address has been changed.' });
  };

  const handleSidebarClick = (item: typeof sidebarNavItems[number]) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    setActiveSidebarTab(item.id);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      if (item.productId) {
        fetch('/api/products').then(r => r.json()).then(data => {
          const product = (data.products || []).find((p: { id: string }) => p.id === item.productId);
          if (product) {
            useStore.getState().addToCart(product, item.quantity, item.size, item.color);
          }
        });
      }
    });
    toast({ title: 'Items added to cart', description: `${order.items.length} item(s) from ${order.orderNumber}` });
  };

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */

  return (
    <div className="min-h-screen">
      {/* ========== 1. ENHANCED PAGE HEADER ========== */}
      <div className="relative h-48 md:h-56 lg:h-64 flex items-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          alt="Profile Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 text-white/70 text-xs">
          <button onClick={() => navigate('home')} className="hover:text-gold transition-colors">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold">My Account</span>
        </div>
        {/* Profile info overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-end gap-4">
            <div className="hidden sm:flex w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark items-center justify-center ring-4 ring-white/20 shadow-xl">
              <span className="heading-serif text-2xl font-bold text-background">{initials}</span>
            </div>
            <div className="text-white">
              <h1 className="heading-serif text-2xl md:text-3xl font-bold drop-shadow-lg">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-[10px] bg-gold/20 text-gold-light border-gold/30 backdrop-blur-sm">
                  {user.role === 'admin' ? '⚡ Admin Member' : '✦ Premium Member'}
                </Badge>
                <span className="text-xs text-white/60">Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ========== 2. ENHANCED SIDEBAR ========== */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:-mt-14 relative z-10"
            >
              <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
                {/* Avatar section */}
                <div className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-6 text-center border-b border-border">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-4 ring-4 ring-gold/20 shadow-lg relative group cursor-pointer">
                    <span className="heading-serif text-3xl font-bold text-background">{initials}</span>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  <Badge variant="outline" className="text-[10px] border-gold/30 text-gold mt-2">
                    {user.role === 'admin' ? '⚡ Admin' : '👤 Member'}
                  </Badge>
                </div>

                {/* Account stats */}
                <div className="grid grid-cols-3 border-b border-border divide-x divide-border">
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-gold">{orders.length}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Orders</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-gold">{wishlistIds.length}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Wishlist</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-gold leading-tight">{memberSince}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Since</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-3 space-y-1">
                  {sidebarNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                        activeSidebarTab === item.id
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {activeSidebarTab === item.id && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gold"
                        />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}

                  {isAdmin && (
                    <button
                      onClick={() => navigate('admin-dashboard')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gold hover:bg-gold/10 transition-all mt-2"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                </div>

                {/* Logout */}
                <div className="p-3 pt-0">
                  <Separator className="mb-3" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========== MAIN PANEL ========== */}
          <div className="lg:col-span-3">
            <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab}>
              <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0 mb-6 overflow-x-auto">
                <TabsTrigger value="profile" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors whitespace-nowrap">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors whitespace-nowrap">
                  Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="addresses" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors whitespace-nowrap">
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="settings" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors whitespace-nowrap">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="activity" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors whitespace-nowrap">
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* ========== 3. ENHANCED PROFILE TAB ========== */}
              <TabsContent value="profile">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                  {/* Profile Completion Progress */}
                  <div className="border border-border rounded-2xl bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">Profile Completion</h3>
                        <p className="text-xs text-muted-foreground">
                          {profileCompletion === 100
                            ? 'Your profile is complete! 🎉'
                            : `${completionSuggestions.length} more step${completionSuggestions.length !== 1 ? 's' : ''} to complete`}
                        </p>
                      </div>
                      <span className="heading-serif text-2xl font-bold text-gold">{profileCompletion}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full"
                      />
                    </div>
                    {completionSuggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {completionSuggestions.slice(0, 3).map(s => (
                          <span key={s.field} className="text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
                            <ArrowRight className="h-3 w-3 inline mr-1 text-gold" />
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="border border-border rounded-2xl bg-card overflow-hidden">
                    <div className="flex items-center justify-between p-5 pb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        <p className="text-sm text-muted-foreground">Manage your account details</p>
                      </div>
                      {!editing ? (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="hover:border-gold hover:text-gold transition-colors">
                          <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                          <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="bg-gold text-background hover:bg-gold-dark">
                            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <><Save className="mr-1.5 h-3.5 w-3.5" /> Save</>}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs tracking-wider uppercase flex items-center gap-1.5">
                            <User className="h-3 w-3 text-gold" /> Full Name
                          </Label>
                          <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gold" /> Email
                          </Label>
                          <Input value={user.email} className="mt-1.5 h-11 border-border bg-muted" disabled />
                          <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gold" /> Phone
                          </Label>
                          <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="+91 9876543210" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-gold" /> Date of Birth
                          </Label>
                          <Input type="date" className="mt-1.5 h-11 border-border bg-muted" disabled placeholder="DD/MM/YYYY" />
                          <p className="text-[10px] text-muted-foreground mt-1">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Section within Profile */}
                  <div className="border border-border rounded-2xl bg-card overflow-hidden">
                    <div className="flex items-center justify-between p-5 pb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Shipping Address</h2>
                        <p className="text-sm text-muted-foreground">Your default delivery address</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setActiveSidebarTab('addresses'); }} className="text-gold text-xs hover:text-gold hover:bg-gold/5">
                        Manage <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">Address</Label>
                          <Input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="Street address, apartment, suite" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">City</Label>
                          <Input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="City" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">State</Label>
                          <Input value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="State" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">ZIP Code</Label>
                          <Input value={profileForm.zipCode} onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="PIN Code" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">Country</Label>
                          <Input value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} />
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </TabsContent>

              {/* ========== 4. ENHANCED ORDERS TAB ========== */}
              <TabsContent value="orders">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {orderStatusTabs.map(status => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap ${
                          orderStatusFilter === status
                            ? 'bg-gold text-background shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status === 'all' ? `All (${orders.length})` : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-3 p-5 border border-border rounded-2xl">
                          <div className="flex justify-between">
                            <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                          </div>
                          <div className="h-3 w-full bg-muted animate-pulse rounded" />
                          <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {orderStatusFilter === 'all' ? 'No Orders Yet' : `No ${orderStatusFilter} Orders`}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        {orderStatusFilter === 'all'
                          ? 'Start shopping and your orders will appear here'
                          : `You don't have any ${orderStatusFilter} orders at the moment`}
                      </p>
                      <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark text-xs tracking-wider uppercase">
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order, idx) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border border-border rounded-2xl bg-card overflow-hidden hover:shadow-md transition-shadow group"
                        >
                          {/* Order header */}
                          <div className="p-5 pb-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 text-gold" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{order.orderNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] ${statusColors[order.status] || ''}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                                <Badge variant="outline" className={`text-[10px] ${paymentColors[order.paymentStatus] || ''}`}>
                                  <CreditCard className="h-2.5 w-2.5 mr-1" />
                                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Items list */}
                          <div className="p-5 pt-3">
                            <div className="space-y-2.5">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                    {item.productImage ? (
                                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.productName}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>Qty: {item.quantity}</span>
                                      {item.size && <span>· {item.size}</span>}
                                      {item.color && <span>· {item.color}</span>}
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium shrink-0">{fmt(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="px-5">
                            <Separator />
                          </div>

                          {/* Order footer */}
                          <div className="p-5">
                            {/* Total breakdown */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Package className="h-3 w-3" />
                                {order.items.length} item(s)
                              </div>
                              <div className="text-right space-y-0.5">
                                {order.tax > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Tax: <span className="text-foreground">{fmt(order.tax)}</span>
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Shipping: <span className="text-foreground">{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span>
                                </p>
                                {order.discount > 0 && (
                                  <p className="text-xs text-green-600">
                                    Discount: -{fmt(order.discount)}
                                  </p>
                                )}
                                <p className="text-lg font-bold">
                                  Total: <span className="text-gold">{fmt(order.total)}</span>
                                </p>
                              </div>
                            </div>

                            {/* Estimated delivery for shipped orders */}
                            {order.status === 'shipped' && (
                              <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 rounded-xl px-4 py-2.5 mb-4 text-sm">
                                <Truck className="h-4 w-4 shrink-0" />
                                <span>Estimated delivery: {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                              {order.status === 'shipped' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs hover:border-gold hover:text-gold"
                                  onClick={() => navigate('order-tracking')}
                                >
                                  <Truck className="mr-1.5 h-3.5 w-3.5" /> Track Order
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs hover:border-gold hover:text-gold"
                                onClick={() => navigate('order-tracking')}
                              >
                                <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
                              </Button>
                              {order.status === 'delivered' && (
                                <Button
                                  size="sm"
                                  className="text-xs bg-gold text-background hover:bg-gold-dark"
                                  onClick={() => handleReorder(order)}
                                >
                                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* ========== 5. ENHANCED ADDRESSES TAB ========== */}
              <TabsContent value="addresses">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Saved Addresses</h2>
                      <p className="text-sm text-muted-foreground">Manage your shipping addresses</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="bg-gold text-background hover:bg-gold-dark text-xs"
                    >
                      {showAddAddress ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
                      {showAddAddress ? 'Cancel' : 'Add Address'}
                    </Button>
                  </div>

                  {/* Add new address form */}
                  <AnimatePresence>
                    {showAddAddress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-2 border-dashed border-gold/30 rounded-2xl bg-gold/5 p-5">
                          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-gold" /> New Address
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <Label className="text-xs tracking-wider uppercase">Label</Label>
                              <div className="flex gap-2 mt-1.5">
                                {['Home', 'Office', 'Other'].map(label => (
                                  <button
                                    key={label}
                                    onClick={() => setNewAddress({ ...newAddress, label })}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                                      newAddress.label === label
                                        ? 'border-gold bg-gold/10 text-gold'
                                        : 'border-border text-muted-foreground hover:border-gold/50'
                                    }`}
                                  >
                                    {label === 'Home' ? <Home className="h-3 w-3" /> : label === 'Office' ? <Building2 className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                              <Input value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="Recipient name" />
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">Phone</Label>
                              <Input value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="+91 9876543210" />
                            </div>
                            <div className="sm:col-span-2">
                              <Label className="text-xs tracking-wider uppercase">Address</Label>
                              <Input value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="Street address, apartment, suite" />
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">City</Label>
                              <Input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="City" />
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">State</Label>
                              <Input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="State" />
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">ZIP Code</Label>
                              <Input value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" placeholder="PIN Code" />
                            </div>
                            <div>
                              <Label className="text-xs tracking-wider uppercase">Country</Label>
                              <Input value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" onClick={handleSaveNewAddress} className="bg-gold text-background hover:bg-gold-dark text-xs">
                              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Address
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddAddress(false)} className="text-xs">Cancel</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Address cards */}
                  {addresses.length === 0 && !showAddAddress ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                      <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">No Saved Addresses</h3>
                      <p className="text-sm text-muted-foreground mb-4">Add your first address for faster checkout</p>
                      <Button size="sm" onClick={() => setShowAddAddress(true)} className="bg-gold text-background hover:bg-gold-dark text-xs">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <motion.div
                          key={addr.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-2xl bg-card p-5 transition-all hover:shadow-sm ${
                            addr.isDefault ? 'border-gold/40 ring-1 ring-gold/10' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                {addr.label === 'Home' ? <Home className="h-4 w-4 text-gold" /> : addr.label === 'Office' ? <Building2 className="h-4 w-4 text-gold" /> : <MapPin className="h-4 w-4 text-gold" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{addr.label}</p>
                                <p className="text-xs text-muted-foreground">{addr.name}</p>
                              </div>
                            </div>
                            {addr.isDefault && (
                              <Badge className="text-[9px] bg-gold/10 text-gold border-gold/20">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {addr.address}<br />
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode}<br />
                            {addr.country}
                          </p>
                          {addr.phone && (
                            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Phone className="h-3 w-3" /> {addr.phone}
                            </p>
                          )}
                          <Separator className="mb-3" />
                          <div className="flex items-center gap-2">
                            {!addr.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gold hover:text-gold hover:bg-gold/5 h-8"
                                onClick={() => handleSetDefault(addr.id)}
                              >
                                <Check className="mr-1 h-3 w-3" /> Set as Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-foreground h-8"
                              onClick={() => toast({ title: 'Coming soon', description: 'Address editing will be available shortly.' })}
                            >
                              <Edit3 className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            {addresses.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 ml-auto"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* ========== SETTINGS TAB ========== */}
              <TabsContent value="settings">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                  {/* Change Password */}
                  <div className="border border-border rounded-2xl bg-card overflow-hidden">
                    <div className="p-5 pb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gold" /> Change Password
                      </h2>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <div className="px-5 pb-5 space-y-4">
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Current Password</Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" className="pl-10 h-11 border-border bg-muted" disabled placeholder="••••••••" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">New Password</Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" className="pl-10 h-11 border-border bg-muted" disabled placeholder="••••••••" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Confirm New Password</Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" className="pl-10 h-11 border-border bg-muted" disabled placeholder="••••••••" />
                        </div>
                      </div>
                      <Button disabled className="bg-gold/50 text-background cursor-not-allowed">
                        <Lock className="mr-1.5 h-3.5 w-3.5" /> Update Password
                      </Button>
                      <p className="text-[11px] text-muted-foreground">Password change requires email verification. Coming soon.</p>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border border-border rounded-2xl bg-card overflow-hidden">
                    <div className="p-5 pb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-gold" /> Notification Preferences
                      </h2>
                      <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
                    </div>
                    <div className="px-5 pb-5 space-y-0">
                      {[
                        { key: 'email' as const, label: 'Email Updates', desc: 'Order confirmations, shipping updates, and recommendations', icon: Mail },
                        { key: 'sms' as const, label: 'SMS Alerts', desc: 'One-time passwords, delivery updates, and flash sale alerts', icon: Phone },
                        { key: 'whatsapp' as const, label: 'WhatsApp Notifications', desc: 'Order status, deals, and personalized recommendations', icon: Phone },
                        { key: 'newsletter' as const, label: 'Newsletter', desc: 'Weekly curated picks, style guides, and exclusive offers', icon: Mail },
                      ].map(item => (
                        <div
                          key={item.key}
                          className="flex items-center gap-4 py-4 border-b border-border last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Checkbox
                            checked={notifPrefs[item.key]}
                            onCheckedChange={(checked) =>
                              setNotifPrefs(prev => ({ ...prev, [item.key]: !!checked }))
                            }
                            className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-background"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Deletion Warning */}
                  <div className="border border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-950/10 overflow-hidden">
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Danger Zone
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <Button
                          disabled
                          variant="outline"
                          className="text-xs text-red-500 border-red-200 dark:border-red-900/30 bg-transparent cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Request Account Deletion
                        </Button>
                        <span className="text-[11px] text-muted-foreground">Contact support for account deletion</span>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </TabsContent>

              {/* ========== 6. ACTIVITY TIMELINE ========== */}
              <TabsContent value="activity">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Recent Activity</h2>
                      <p className="text-sm text-muted-foreground">Your latest account activity and updates</p>
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl bg-card p-5">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

                      <div className="space-y-6">
                        {activityItems.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="relative flex gap-4 pl-1"
                          >
                            {/* Timeline dot */}
                            <div className={`w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 z-10 border-2 border-card ${item.color}`}>
                              {item.icon}
                            </div>
                            {/* Content */}
                            <div className="flex-1 pt-1">
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {item.date}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {activityItems.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border text-center">
                        <button className="text-xs text-gold hover:text-gold-dark transition-colors font-medium inline-flex items-center gap-1">
                          View All Activity <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
