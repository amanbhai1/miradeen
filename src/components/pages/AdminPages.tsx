'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shirt, ShoppingBag, Users, MessageSquare, Settings,
  BarChart3, DollarSign, TrendingUp, Eye, EyeOff, Ban, CheckCircle,
  ChevronLeft, Search, Edit, Trash2, Plus, X, Save,
  ArrowUpRight, ArrowDownRight, Star, Package, Calendar, Clock, Trophy,
  ShoppingCart, Filter, UserCheck, ToggleLeft, ToggleRight, Sparkles, Crown, Mail,
  Download, FileJson, FileSpreadsheet, Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Product, Order, User as UserType, ContactMessage } from '@/types';
import { parseJsonField } from '@/types';
import { exportData, type ExportDataType, type ExportFormatType } from '@/lib/export';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'messages' | 'settings';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOrderStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    processing: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700',
    shipped: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700',
    delivered: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
  };
  return map[status] || 'bg-muted text-muted-foreground border-border';
}

function getPaymentStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700',
    paid: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    failed: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
    refunded: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700',
  };
  return map[status] || 'bg-muted text-muted-foreground border-border';
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

// ── Skeleton Loader ──────────────────────────────────────────────────────────

function AdminSkeleton({ rows = 4, height = 'h-32' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} skeleton-luxury rounded-lg`} />
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, navigate, token, user } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('auth');
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) return null;

  const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Shirt },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-card border-r border-border min-h-screen sticky top-0">
          <div className="p-6 border-b border-border">
            <button onClick={() => navigate('home')} className="heading-serif text-xl font-bold tracking-wider text-gold transition-colors hover:text-gold-dark">MIRADEEN</button>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Admin Panel</p>
          </div>
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === item.id ? 'bg-gold/10 text-gold font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => navigate('home')} className="w-full text-xs transition-colors duration-200">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back to Store
            </Button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
          <div className="flex overflow-x-auto">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] whitespace-nowrap transition-colors duration-200 ${activeTab === item.id ? 'text-gold' : 'text-muted-foreground'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-20 lg:pb-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && <DashboardTab token={token} />}
              {activeTab === 'products' && <ProductsTab token={token} />}
              {activeTab === 'orders' && <OrdersTab token={token} />}
              {activeTab === 'users' && <UsersTab token={token} setActiveTab={setActiveTab} />}
              {activeTab === 'messages' && <MessagesTab token={token} />}
              {activeTab === 'settings' && <SettingsTab token={token} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ token }: { token: string | null }) {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return <AdminSkeleton rows={4} />;

  if (!stats) return <p className="text-muted-foreground">Failed to load stats</p>;

  // Mock trend data
  const trends = [
    { pct: 12.5, up: true },
    { pct: 8.2, up: true },
    { pct: 23.1, up: true },
    { pct: 3.4, up: false },
  ];

  const cards = [
    { title: 'Total Users', value: stats.stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { title: 'Total Orders', value: stats.stats.orders, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { title: 'Revenue', value: formatCurrency(stats.stats.revenue || 0), icon: DollarSign, color: 'text-gold', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Unread Messages', value: stats.stats.unreadMessages, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  // Revenue chart mock data (last 6 months)
  const revenueData = [
    { month: 'Jul', value: 65 },
    { month: 'Aug', value: 78 },
    { month: 'Sep', value: 52 },
    { month: 'Oct', value: 89 },
    { month: 'Nov', value: 95 },
    { month: 'Dec', value: 100 },
  ];

  // Recent activity mock data
  const recentActivity = [
    { icon: ShoppingCart, text: 'New order #MRD-1234 placed', time: '5 min ago', color: 'text-green-500' },
    { icon: UserCheck, text: 'User registered: John Doe', time: '12 min ago', color: 'text-blue-500' },
    { icon: Package, text: 'Product updated: Silk Blazer', time: '1 hour ago', color: 'text-purple-500' },
    { icon: Star, text: 'New review: 5 stars on Cashmere Scarf', time: '2 hours ago', color: 'text-gold' },
    { icon: Mail, text: 'Contact message from Sarah K.', time: '3 hours ago', color: 'text-orange-500' },
  ];

  // Top products mock data
  const topProducts = [
    { name: 'Royal Silk Blazer', rating: 4.9, sold: 142, image: '/placeholder.jpg' },
    { name: 'Cashmere Overcoat', rating: 4.8, sold: 128, image: '/placeholder.jpg' },
    { name: 'Handcrafted Watch', rating: 4.7, sold: 115, image: '/placeholder.jpg' },
    { name: 'Italian Leather Shoes', rating: 4.7, sold: 98, image: '/placeholder.jpg' },
    { name: 'Platinum Cufflinks', rating: 4.6, sold: 87, image: '/placeholder.jpg' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{currentDate}</p>
          <h2 className="heading-serif text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-gold">{user?.name || 'Admin'}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {stats.stats.orders > 0 && (
            <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" /> {stats.stats.orders} orders this month
            </Badge>
          )}
          {stats.stats.revenue > 0 && (
            <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs px-3 py-1">
              <TrendingUp className="h-3 w-3 mr-1" /> {formatCurrency(stats.stats.revenue)} revenue
            </Badge>
          )}
          <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs px-3 py-1">
            <Crown className="h-3 w-3 mr-1" /> Premium Dashboard
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={card.title} className="border-glow-animated overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="card-luxury p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${card.bg} transition-colors duration-200`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${trends[i].up ? 'text-green-600' : 'text-red-500'}`}>
                  {trends[i].up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {trends[i].pct}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="heading-serif text-lg font-semibold">Revenue Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months performance</p>
              </div>
              <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> +23.1%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="card-luxury pt-2">
            <div className="flex items-end gap-3 h-44 px-2">
              {revenueData.map((item, i) => {
                const isHighest = item.value === Math.max(...revenueData.map(d => d.value));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">₹{(item.value * 1.2).toFixed(0)}k</span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ease-out ${isHighest ? 'bg-gradient-to-t from-gold-dark to-gold' : 'bg-gradient-to-t from-gold/40 to-gold/70'}`}
                      style={{ height: `${(item.value / 100) * 140}px` }}
                    />
                    <span className={`text-[11px] font-medium ${isHighest ? 'text-gold' : 'text-muted-foreground'}`}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="heading-serif text-lg font-semibold">Recent Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Latest store events</p>
          </CardHeader>
          <CardContent className="card-luxury pt-2">
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className={`p-1.5 rounded-md bg-muted/50 group-hover:bg-gold/10 transition-colors duration-200 mt-0.5`}>
                    <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{activity.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="heading-serif text-lg font-semibold">Top Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Best rated items</p>
              </div>
              <Trophy className="h-4 w-4 text-gold" />
            </div>
          </CardHeader>
          <CardContent className="card-luxury pt-2">
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-gold transition-colors duration-200">{product.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-[11px] text-muted-foreground">{product.rating} • {product.sold} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="heading-serif text-lg font-semibold">Recent Orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest customer orders</p>
              </div>
              <ShoppingBag className="h-4 w-4 text-gold" />
            </div>
          </CardHeader>
          <CardContent className="card-luxury pt-2">
            <div className="space-y-3">
              {(stats.recentOrders || []).slice(0, 5).map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] border ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <span className="font-semibold text-sm text-gold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
              {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ token }: { token: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      const cats = new Map<string, any>();
      (data.products || []).forEach((p: Product) => { if (p.category) cats.set(p.category.id, p.category); });
      setCategories(Array.from(cats.values()));
    });
  }, [token]);

  if (loading) return <AdminSkeleton rows={4} height="h-20" />;

  // Filter products by search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count products per category
  const categoryCounts = new Map<string, number>();
  products.forEach(p => {
    if (p.category) {
      categoryCounts.set(p.category.name, (categoryCounts.get(p.category.name) || 0) + 1);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} total products in catalog</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gold text-background hover:bg-gold-dark transition-all duration-200 hover:shadow-md">
          <Plus className="mr-1 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search Bar & Category Badges */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-gold/30 border-border"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from(categoryCounts.entries()).map(([name, count]) => (
            <Badge key={name} variant="outline" className="text-[10px] px-2 py-0.5 border-gold/30 text-gold/80 hover:bg-gold/5 transition-colors duration-200 cursor-pointer"
              onClick={() => setSearchQuery(name)}
            >
              {name} <span className="ml-1 font-semibold">({count})</span>
            </Badge>
          ))}
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="text-xs h-6">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>{showForm && <ProductForm token={token} categories={categories} onClose={() => setShowForm(false)} onUpdate={() => {}} />}</AnimatePresence>

      {/* Product Cards */}
      <div className="space-y-3">
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No products found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
            </CardContent>
          </Card>
        )}
        {filteredProducts.map((product) => {
          const images = parseJsonField<string>(product.images);
          return (
            <Card key={product.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/40">
              <CardContent className="card-luxury p-4 flex items-center gap-4">
                <div className="w-16 h-20 rounded-md bg-muted overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-gold/50 transition-all duration-300">
                  <img src={images[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-gold transition-colors duration-200">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category?.name} • Stock: {product.stock}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {product.isFeatured && <Badge className="text-[9px] bg-gold text-background px-1.5 py-0">Featured</Badge>}
                    {product.isNewArrival && <Badge variant="secondary" className="text-[9px] px-1.5 py-0"><Sparkles className="h-2.5 w-2.5 mr-0.5" /> New</Badge>}
                    {product.isBestseller && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-gold/40 text-gold"><Trophy className="h-2.5 w-2.5 mr-0.5" /> Best</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-semibold border-gold/30 text-gold">{formatCurrency(product.price)}</Badge>
                  <div className="flex gap-1">
                    {/* Toggle Featured */}
                    <button
                      title={`Toggle Featured`}
                      className={`p-1.5 rounded-md transition-all duration-200 ${product.isFeatured ? 'bg-gold/10 text-gold' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <Star className={`h-3.5 w-3.5 ${product.isFeatured ? 'fill-gold' : ''}`} />
                    </button>
                    {/* Toggle New */}
                    <button
                      title={`Toggle New Arrival`}
                      className={`p-1.5 rounded-md transition-all duration-200 ${product.isNewArrival ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <Sparkles className={`h-3.5 w-3.5`} />
                    </button>
                    {/* Toggle Bestseller */}
                    <button
                      title={`Toggle Bestseller`}
                      className={`p-1.5 rounded-md transition-all duration-200 ${product.isBestseller ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <Trophy className={`h-3.5 w-3.5`} />
                    </button>
                    {/* Edit Button */}
                    <button
                      title="Edit product (Coming soon)"
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold transition-all duration-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Product Form ─────────────────────────────────────────────────────────────

function ProductForm({ token, categories, onClose, onUpdate }: { token: string | null; categories: any[]; onClose: () => void; onUpdate: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', description: '', shortDesc: '', price: '', comparePrice: '', categoryId: '', stock: '', images: '', sizes: '', colors: '', tags: '', isFeatured: false, isNewArrival: false, isBestseller: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, images: form.images.split(',').map(s => s.trim()).filter(Boolean), sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean), colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [] }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Product created!' });
      onUpdate(); onClose();
    } catch { toast({ title: 'Failed to create product', variant: 'destructive' }); }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
      <Card className="border-gold/30">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg heading-serif">New Product</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="transition-colors duration-200"><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" required /></div>
            <div><Label>Category</Label><Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}><SelectTrigger className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" /></div>
            <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" required /></div>
            <div><Label>Compare Price (₹)</Label><Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" required /></div>
            <div><Label>Sizes (comma-separated)</Label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" placeholder="S,M,L,XL" /></div>
            <div className="md:col-span-2"><Label>Image URLs (comma-separated)</Label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" placeholder="https://..." /></div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" className="bg-gold text-background hover:bg-gold-dark transition-all duration-200 hover:shadow-md"><Save className="mr-1 h-4 w-4" /> Save</Button>
              <Button type="button" variant="outline" onClick={onClose} className="transition-colors duration-200">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setOrders(data.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const updateOrder = async (id: string, data: any) => {
    const res = await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, ...data }) });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  if (loading) return <AdminSkeleton rows={3} height="h-24" />;

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  // Count orders per status
  const statusCounts = new Map<string, number>();
  orders.forEach(o => {
    statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="outline"
              className={`text-[10px] px-2 py-0.5 cursor-pointer border transition-all duration-200 ${statusFilter === status ? 'ring-2 ring-gold/50 ring-offset-1' : ''} ${getOrderStatusColor(status)}`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              {status} <span className="ml-1 font-semibold">({count})</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="w-[180px] h-9 text-sm transition-colors duration-200 focus:ring-2 focus:ring-gold/30">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="text-xs h-8">
            <X className="h-3 w-3 mr-1" /> Clear Filter
          </Button>
        )}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}</p>
            </CardContent>
          </Card>
        )}
        {filteredOrders.map(order => (
          <Card key={order.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30">
            <CardContent className="card-luxury p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <Badge className={`text-[9px] border px-1.5 py-0 ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <Badge className={`text-[9px] border px-1.5 py-0 ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()} • {order.shippingName}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={order.status} onValueChange={(v) => updateOrder(order.id, { status: v })}>
                    <SelectTrigger className="w-[130px] h-8 text-xs transition-colors duration-200 focus:ring-2 focus:ring-gold/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={order.paymentStatus} onValueChange={(v) => updateOrder(order.id, { paymentStatus: v })}>
                    <SelectTrigger className="w-[120px] h-8 text-xs transition-colors duration-200 focus:ring-2 focus:ring-gold/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'paid', 'failed', 'refunded'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="font-semibold text-sm text-gold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {order.items.map((item, i) => (
                  <span key={i}>{item.quantity}x {item.productName}{i < order.items.length - 1 ? ',' : ''}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ token, setActiveTab }: { token: string | null; setActiveTab: (tab: AdminTab) => void }) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setUsers(data.users || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, isBlocked: !isBlocked }) });
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !isBlocked } : u));
  };

  if (loading) return <AdminSkeleton rows={3} height="h-16" />;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-gold/30 border-border"
        />
      </div>

      {/* User Cards */}
      <div className="space-y-3">
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
            </CardContent>
          </Card>
        )}
        {filteredUsers.map(user => (
          <Card key={user.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30">
            <CardContent className="card-luxury p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold ring-2 ring-gold/30 ring-offset-1 group-hover:ring-gold transition-all duration-300">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm group-hover:text-gold transition-colors duration-200">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
                <Badge variant={user.isBlocked ? 'destructive' : 'secondary'} className="text-[10px]">{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
                <span className="text-xs text-muted-foreground">{user._count?.orders || 0} orders</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-gold hover:text-gold-dark hover:bg-gold/10 transition-colors duration-200"
                >
                  <ShoppingBag className="mr-1 h-3 w-3" /> View Orders
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleBlock(user.id, user.isBlocked)} className="text-xs transition-colors duration-200">
                  {user.isBlocked ? <><CheckCircle className="mr-1 h-3 w-3" /> Unblock</> : <><Ban className="mr-1 h-3 w-3" /> Block</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Messages Tab ─────────────────────────────────────────────────────────────

function MessagesTab({ token }: { token: string | null }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setMessages(data.messages || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const markRead = async (id: string) => {
    const res = await fetch('/api/admin/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, isRead: true }) });
    if (res.ok) setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    const res = await fetch('/api/admin/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, reply: replyText }) });
    if (res.ok) { setMessages(prev => prev.map(m => m.id === id ? { ...m, reply: replyText, replied: true } : m)); setReplying(null); setReplyText(''); }
  };

  if (loading) return <AdminSkeleton rows={3} height="h-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{messages.length} total messages • {messages.filter(m => !m.isRead).length} unread</p>
      </div>
      <div className="space-y-3">
        {messages.map(msg => (
          <Card key={msg.id} className={`group transition-all duration-300 hover:shadow-md ${msg.isRead ? 'opacity-70' : 'hover:border-gold/30'}`}>
            <CardContent className="card-luxury p-4 cursor-pointer" onClick={() => !msg.isRead && markRead(msg.id)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{msg.name}</p>
                    {!msg.isRead && <Badge className="bg-gold text-background text-[9px]">New</Badge>}
                    {msg.replied && <Badge variant="outline" className="text-[9px] border-gold/30 text-gold">Replied</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{msg.email} • {new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {msg.subject && <p className="text-sm font-medium mb-1">{msg.subject}</p>}
              <p className="text-sm text-muted-foreground">{msg.message}</p>
              {msg.reply && <div className="mt-2 p-2 bg-muted rounded text-xs"><span className="font-medium text-gold">Reply:</span> {msg.reply}</div>}
              <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {replying === msg.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." className="h-8 text-sm transition-colors duration-200 focus:ring-2 focus:ring-gold/30" />
                    <Button size="sm" onClick={() => sendReply(msg.id)} className="h-8 bg-gold text-background hover:bg-gold-dark transition-colors duration-200">Send</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplying(null)} className="h-8 transition-colors duration-200">Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setReplying(msg.id)} className="text-xs hover:text-gold hover:bg-gold/10 transition-colors duration-200"><MessageSquare className="mr-1 h-3 w-3" /> Reply</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setSettings(data.settings || {}); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const updateSetting = async (key: string, value: string) => {
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) });
    if (res.ok) setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = () => {
    // Settings are auto-saved on change, but provide visual feedback
    toast({ title: 'All settings saved!', description: 'Your changes have been applied.' });
  };

  if (loading) return <AdminSkeleton rows={5} height="h-12" />;

  const labels: Record<string, string> = {
    about_title: 'About Page Title', about_content: 'About Page Content', brand_tagline: 'Brand Tagline',
    brand_mission: 'Brand Mission', contact_email: 'Contact Email', contact_phone: 'Contact Phone',
    contact_whatsapp: 'WhatsApp Number', free_shipping_min: 'Free Shipping Min Order (₹)',
  };

  // Group settings into sections
  const contactSettings = ['contact_email', 'contact_phone', 'contact_whatsapp'];
  const brandSettings = ['brand_tagline', 'brand_mission', 'about_title', 'about_content'];
  const shippingSettings = ['free_shipping_min'];

  const sectionConfig = [
    { title: 'Contact Information', keys: contactSettings, icon: Mail },
    { title: 'Brand Settings', keys: brandSettings, icon: Crown },
    { title: 'Shipping Settings', keys: shippingSettings, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your store configuration</p>
        </div>
        <Button onClick={saveAll} size="sm" className="bg-gold text-background hover:bg-gold-dark transition-all duration-200 hover:shadow-md">
          <Save className="mr-1 h-4 w-4" /> Save All
        </Button>
      </div>

      {sectionConfig.map((section) => {
        const sectionEntries = Object.entries(settings).filter(([key]) => section.keys.includes(key));
        if (sectionEntries.length === 0) return null;
        return (
          <div key={section.title} className="space-y-3">
            {/* Section Header with Gold Divider */}
            <div className="flex items-center gap-3 divider-gold pb-3 border-b border-gold/20">
              <section.icon className="h-4 w-4 text-gold" />
              <h3 className="heading-serif text-lg font-semibold text-gold">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {sectionEntries.map(([key, value]) => (
                <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
                  <CardContent className="card-luxury p-4">
                    <Label className="text-sm font-medium">{labels[key] || key}</Label>
                    {key.includes('content') || key.includes('mission') ? (
                      <Textarea value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" rows={3} />
                    ) : (
                      <Input value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Any settings not in a section */}
      {(() => {
        const allGroupedKeys = new Set([...contactSettings, ...brandSettings, ...shippingSettings]);
        const ungrouped = Object.entries(settings).filter(([key]) => !allGroupedKeys.has(key));
        if (ungrouped.length === 0) return null;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3 divider-gold pb-3 border-b border-gold/20">
              <Settings className="h-4 w-4 text-gold" />
              <h3 className="heading-serif text-lg font-semibold text-gold">Other Settings</h3>
            </div>
            <div className="space-y-3">
              {ungrouped.map(([key, value]) => (
                <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
                  <CardContent className="card-luxury p-4">
                    <Label className="text-sm font-medium">{labels[key] || key}</Label>
                    {key.includes('content') || key.includes('mission') ? (
                      <Textarea value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" rows={3} />
                    ) : (
                      <Input value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1 transition-colors duration-200 focus:ring-2 focus:ring-gold/30" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Export Data Section */}
      <ExportDataSection token={token} />
    </div>
  );
}

// ── Export Data Section ───────────────────────────────────────────────────────

function ExportDataSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<ExportDataType | 'all' | null>(null);
  const [exportedItems, setExportedItems] = useState<Set<string>>(new Set());

  const exportCategories: {
    type: ExportDataType;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }[] = [
    {
      type: 'products',
      label: 'Products',
      description: 'Export all product data including categories, pricing, stock, and tags',
      icon: Shirt,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      type: 'orders',
      label: 'Orders',
      description: 'Export all orders with items, shipping details, and payment status',
      icon: ShoppingBag,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      type: 'users',
      label: 'Users',
      description: 'Export all registered users with their profile and account details',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      type: 'messages',
      label: 'Messages',
      description: 'Export all contact messages with read status and replies',
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ];

  const handleExport = async (type: ExportDataType | 'all', format: ExportFormatType) => {
    if (!token) return;
    setExporting(type);
    try {
      const success = await exportData(token, type, format);
      if (success) {
        setExportedItems(prev => new Set(prev).add(`${type}-${format}`));
        toast({
          title: `Export complete!`,
          description: `${type === 'all' ? 'All data' : type.charAt(0).toUpperCase() + type.slice(1)} exported as ${format.toUpperCase()}`,
        });
      } else {
        toast({ title: 'Export failed', description: 'Could not export data. Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Export failed', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    if (!token) return;
    setExporting('all');
    const formats: ExportFormatType[] = ['json', 'csv'];
    const types: ExportDataType[] = ['products', 'orders', 'users', 'messages'];

    let allSuccess = true;
    for (const format of formats) {
      try {
        const success = await exportData(token, 'all', format);
        if (success) {
          setExportedItems(prev => new Set(prev).add(`all-${format}`));
        } else {
          allSuccess = false;
        }
      } catch {
        allSuccess = false;
      }
    }

    setExporting(null);
    if (allSuccess) {
      toast({ title: 'Full workspace exported!', description: 'All data downloaded as CSV and JSON.' });
    } else {
      toast({ title: 'Partial export', description: 'Some exports may have failed. Check your downloads.', variant: 'destructive' });
    }
  };

  const isFormatDone = (type: ExportDataType | 'all', format: ExportFormatType) => exportedItems.has(`${type}-${format}`);

  return (
    <div className="space-y-4 mt-8">
      {/* Section Header with Gold Divider */}
      <div className="flex items-center gap-3 divider-gold pb-3 border-b border-gold/20">
        <Download className="h-4 w-4 text-gold" />
        <h3 className="heading-serif text-lg font-semibold text-gold">Export Data</h3>
        <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs ml-auto">
          <Download className="h-3 w-3 mr-1" /> Download Workspace
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Download your store data as CSV or JSON files for backup, analysis, or migration.
      </p>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exportCategories.map((cat) => {
          const isExporting = exporting === cat.type;
          return (
            <Card key={cat.type} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30">
              <CardContent className="card-luxury p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${cat.bg} transition-colors duration-200`}>
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-gold transition-colors duration-200">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 text-xs transition-all duration-200 ${isFormatDone(cat.type, 'csv') ? 'border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400' : 'hover:border-gold/40 hover:text-gold'}`}
                    onClick={() => handleExport(cat.type, 'csv')}
                    disabled={!!exporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : isFormatDone(cat.type, 'csv') ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 text-xs transition-all duration-200 ${isFormatDone(cat.type, 'json') ? 'border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400' : 'hover:border-gold/40 hover:text-gold'}`}
                    onClick={() => handleExport(cat.type, 'json')}
                    disabled={!!exporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : isFormatDone(cat.type, 'json') ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <FileJson className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export All Button */}
      <Card className="border-gold/20 overflow-hidden">
        <CardContent className="card-luxury p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm flex items-center gap-2">
                <Download className="h-4 w-4 text-gold" />
                Export Full Workspace
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download all data (Products, Orders, Users, Messages) in both CSV and JSON formats — 8 files total.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-gold text-background hover:bg-gold-dark transition-all duration-200 hover:shadow-md whitespace-nowrap"
              onClick={handleExportAll}
              disabled={!!exporting}
            >
              {exporting === 'all' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Export All
                </>
              )}
            </Button>
          </div>
          {/* Progress indicator when exporting all */}
          {exporting === 'all' && (
            <div className="mt-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Generating export files...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
