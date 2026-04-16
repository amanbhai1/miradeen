'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shirt, ShoppingBag, Users, MessageSquare, Settings,
  BarChart3, DollarSign, TrendingUp, Eye, EyeOff, Ban, CheckCircle,
  ChevronLeft, Search, Edit, Trash2, Plus, X, Save,
  ArrowUpRight, ArrowDownRight, Star, Package, Calendar, Clock, Trophy,
  ShoppingCart, Filter, UserCheck, ToggleLeft, ToggleRight, Sparkles, Crown, Mail,
  Download, FileJson, FileSpreadsheet, Loader2, CheckCircle2, Ticket, Percent, Copy, RefreshCw,
  Image as ImageIcon, Megaphone, Quote, Tag, AlertTriangle, Printer, Send, MapPin, Phone, Globe, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Product, Order, User as UserType, ContactMessage, Banner, Category } from '@/types';
import { parseJsonField } from '@/types';
import { exportData, type ExportDataType, type ExportFormatType } from '@/lib/export';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'messages' | 'coupons' | 'cms' | 'marketing' | 'settings';

// ── Helpers ──────────────────────────────────────────────────────────────────

interface FormErrors {
  [key: string]: string | undefined;
}

const validateUrl = (url: string) => {
  if (!url.trim()) return true; // empty is ok
  try { new URL(url); return true; } catch { return false; }
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/[\s+\-]/g, ''));

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

const icls = 'transition-all duration-200 focus:ring-2 focus:ring-gold/30';
const goldBtn = 'bg-gold text-background hover:bg-gold-dark transition-all duration-200 hover:shadow-md';

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

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, badge, action }: { icon: React.ElementType; title: string; badge?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gold/20">
      <Icon className="h-4 w-4 text-gold" />
      <h3 className="heading-serif text-lg font-semibold text-gold">{title}</h3>
      {badge && <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs">{badge}</Badge>}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, navigate, token } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('auth');
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) return null;

  const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Shirt },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'cms', label: 'CMS', icon: Megaphone },
    { id: 'marketing', label: 'Marketing', icon: Mail },
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
          <nav className="p-3 space-y-0.5">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activeTab === item.id ? 'bg-gold/10 text-gold font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
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
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[9px] whitespace-nowrap transition-colors duration-200 ${activeTab === item.id ? 'text-gold' : 'text-muted-foreground'}`}>
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
              {activeTab === 'users' && <UsersTab token={token} />}
              {activeTab === 'messages' && <MessagesTab token={token} />}
              {activeTab === 'coupons' && <CouponsTab token={token} />}
              {activeTab === 'cms' && <CMSTab token={token} />}
              {activeTab === 'marketing' && <MarketingTab token={token} />}
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

  const trends = [{ pct: 12.5, up: true }, { pct: 8.2, up: true }, { pct: 23.1, up: true }, { pct: 3.4, up: false }];

  const cards = [
    { title: 'Total Users', value: stats.stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { title: 'Total Orders', value: stats.stats.orders, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { title: 'Revenue', value: formatCurrency(stats.stats.revenue || 0), icon: DollarSign, color: 'text-gold', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Avg. Order Value', value: formatCurrency(stats.stats.avgOrderValue || 0), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  const lowStockProducts = stats.lowStockProducts || [];
  const customerAnalytics = stats.customerAnalytics || {};
  const topSpenders = customerAnalytics.topSpenders || [];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{currentDate}</p>
          <h2 className="heading-serif text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-gold">{user?.name || 'Admin'}</span>
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" /> {stats.stats.newCustomers || 0} new customers
          </Badge>
          <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs px-3 py-1">
            <Mail className="h-3 w-3 mr-1" /> {stats.stats.newsletterSubscribers || 0} subscribers
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={card.title} className="border-glow-animated overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${card.bg}`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
                {i < trends.length && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${trends[i].up ? 'text-green-600' : 'text-red-500'}`}>
                    {trends[i].up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trends[i].pct}%
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Alerts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="heading-serif text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> Low Stock Alerts
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Products with stock &lt; 5</p>
              </div>
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">{lowStockProducts.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {lowStockProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All products well stocked</p>}
            <div className="space-y-2">
              {lowStockProducts.map((p: any) => {
                const imgs = parseJsonField<string>(p.images);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <div className="w-8 h-10 rounded bg-muted overflow-hidden shrink-0">
                      <img src={imgs[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category?.name}</p>
                    </div>
                    <Badge className={`text-[10px] ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </Badge>
                  </div>
                );
              })}
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
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {(stats.recentOrders || []).slice(0, 5).map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] border ${getOrderStatusColor(order.status)}`}>{order.status}</Badge>
                    <span className="font-semibold text-sm text-gold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
              {(!stats.recentOrders || stats.recentOrders.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spenders */}
      {topSpenders.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="heading-serif text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gold" /> Top Spending Customers
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {topSpenders.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold shrink-0">{i + 1}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.orderCount} orders</p>
                    <p className="text-xs font-bold text-gold mt-0.5">{formatCurrency(c.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchProducts = () => {
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setCategories(data.categories || []); }).catch(() => {});
  }, [token]);

  const toggleProduct = async (id: string, field: string, value: boolean) => {
    await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, [field]: !value }) });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !value } : p));
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Product deleted' });
    setDeleteId(null);
    fetchProducts();
  };

  const bulkDelete = async () => {
    for (const id of selected) {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    }
    toast({ title: `${selected.size} products deleted` });
    setSelected(new Set());
    fetchProducts();
  };

  if (loading) return <AdminSkeleton rows={4} height="h-20" />;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryCounts = new Map<string, number>();
  products.forEach(p => { if (p.category) categoryCounts.set(p.category.name, (categoryCounts.get(p.category.name) || 0) + 1); });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} total products</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="text-xs"><Trash2 className="h-3 w-3 mr-1" /> Delete {selected.size}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete {selected.size} Products?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel onClick={() => setSelected(new Set())}>Cancel</AlertDialogCancel><AlertDialogAction onClick={bulkDelete} className="bg-red-600 hover:bg-red-700">Delete All</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={() => { setEditProduct(null); setShowForm(!showForm); }} size="sm" className={goldBtn}><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 ${icls} border-border`} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from(categoryCounts.entries()).map(([name, count]) => (
            <Badge key={name} variant="outline" className="text-[10px] px-2 py-0.5 border-gold/30 text-gold/80 hover:bg-gold/5 cursor-pointer" onClick={() => setSearchQuery(name)}>
              {name} <span className="ml-1 font-semibold">({count})</span>
            </Badge>
          ))}
          {searchQuery && <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="text-xs h-6"><X className="h-3 w-3 mr-1" /> Clear</Button>}
        </div>
      </div>

      <AnimatePresence>
        {showForm && <ProductFormDialog token={token} categories={categories} product={editProduct} onClose={() => { setShowForm(false); setEditProduct(null); }} onUpdate={fetchProducts} /> || null}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredProducts.length === 0 && (
          <Card><CardContent className="p-8 text-center"><Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No products found</p></CardContent></Card>
        )}
        {filteredProducts.map(product => {
          const images = parseJsonField<string>(product.images);
          const isSelected = selected.has(product.id);
          return (
            <Card key={product.id} className={`group transition-all duration-300 hover:shadow-lg ${isSelected ? 'border-gold/60 ring-2 ring-gold/20' : 'hover:border-gold/40'}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <input type="checkbox" checked={isSelected} onChange={() => { const s = new Set(selected); if (isSelected) { s.delete(product.id); } else { s.add(product.id); } setSelected(s); }} className="h-4 w-4 rounded border-border accent-gold shrink-0" />
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
                    {product.stock < 5 && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-orange-300 text-orange-600"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Low</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-semibold border-gold/30 text-gold">{formatCurrency(product.price)}</Badge>
                  <div className="flex gap-1">
                    <button title="Toggle Featured" className={`p-1.5 rounded-md ${icls} ${product.isFeatured ? 'bg-gold/10 text-gold' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => toggleProduct(product.id, 'isFeatured', product.isFeatured)}>
                      <Star className={`h-3.5 w-3.5 ${product.isFeatured ? 'fill-gold' : ''}`} />
                    </button>
                    <button title="Toggle New" className={`p-1.5 rounded-md ${icls} ${product.isNewArrival ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => toggleProduct(product.id, 'isNewArrival', product.isNewArrival)}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>
                    <button title="Toggle Bestseller" className={`p-1.5 rounded-md ${icls} ${product.isBestseller ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => toggleProduct(product.id, 'isBestseller', product.isBestseller)}>
                      <Trophy className="h-3.5 w-3.5" />
                    </button>
                    <button title="Edit product" className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold" onClick={() => { setEditProduct(product); setShowForm(true); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <AlertDialog open={deleteId === product.id} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                      <AlertDialogTrigger asChild>
                        <button title="Delete product" className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete &ldquo;{product.name}&rdquo;?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

// ── Product Form Dialog ──────────────────────────────────────────────────────

function ProductFormDialog({ token, categories, product, onClose, onUpdate }: { token: string | null; categories: Category[]; product: Product | null; onClose: () => void; onUpdate: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '', description: product?.description || '', shortDesc: product?.shortDesc || '',
    price: String(product?.price || ''), comparePrice: product?.comparePrice ? String(product.comparePrice) : '',
    categoryId: product?.categoryId || '', stock: String(product?.stock || ''),
    images: parseJsonField<string>(product?.images).join(', '), sizes: parseJsonField<string>(product?.sizes).join(', '),
    colors: parseJsonField<string>(product?.colors).join(', '), tags: product?.tags || '',
    isFeatured: product?.isFeatured || false, isNewArrival: product?.isNewArrival || false, isBestseller: product?.isBestseller || false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateProductField = (field: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!form.name.trim()) return 'Product name is required';
        if (form.name.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'price': {
        if (!form.price) return 'Price is required';
        const p = parseFloat(form.price);
        if (isNaN(p) || p <= 0) return 'Price must be greater than 0';
        return undefined;
      }
      case 'stock': {
        if (form.stock === '') return 'Stock is required';
        const s = parseInt(form.stock, 10);
        if (isNaN(s) || s < 0) return 'Stock cannot be negative';
        return undefined;
      }
      case 'categoryId':
        if (!form.categoryId) return 'Please select a category';
        return undefined;
      case 'comparePrice': {
        if (form.comparePrice) {
          const cp = parseFloat(form.comparePrice);
          if (isNaN(cp) || cp <= 0) return 'Compare price must be greater than 0';
          const p = parseFloat(form.price);
          if (!isNaN(p) && cp <= p) return 'Compare price must be greater than selling price';
        }
        return undefined;
      }
      case 'images': {
        if (form.images.trim()) {
          const urls = form.images.split(',').map(s => s.trim()).filter(Boolean);
          const invalidUrls = urls.filter(u => !validateUrl(u));
          if (invalidUrls.length > 0) return `${invalidUrls.length} image URL(s) are invalid`;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFields = ['name', 'categoryId', 'price', 'stock', 'comparePrice', 'images'];
    const newErrors: FormErrors = {};
    allFields.forEach(field => {
      const error = validateProductField(field);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({ title: 'Please fix errors', description: `${Object.keys(newErrors).length} field(s) need attention`, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price), comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (product) {
        const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: product.id, ...body }) });
        if (!res.ok) throw new Error();
        toast({ title: 'Product updated!' });
      } else {
        const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();
        toast({ title: 'Product created!' });
      }
      onUpdate(); onClose();
    } catch { toast({ title: 'Failed to save product', variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="heading-serif text-lg">{product ? 'Edit Product' : 'New Product'}</DialogTitle>
          <DialogDescription>{product ? `Editing ${product.name}` : 'Add a new product to your catalog'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${icls} ${errors.name ? 'border-destructive' : ''}`} placeholder="Product name" /><AnimatePresence>{errors.name && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.name}</motion.p>}</AnimatePresence></div>
          <div><Label>Category <span className="text-destructive">*</span></Label><Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}><SelectTrigger className={`mt-1 ${icls} ${errors.categoryId ? 'border-destructive' : ''}`}><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><AnimatePresence>{errors.categoryId && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.categoryId}</motion.p>}</AnimatePresence></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`mt-1 ${icls}`} rows={3} /></div>
          <div><Label>Price (₹) <span className="text-destructive">*</span></Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={`mt-1 ${icls} ${errors.price ? 'border-destructive' : ''}`} min="0" step="1" placeholder="0" /><AnimatePresence>{errors.price && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.price}</motion.p>}</AnimatePresence></div>
          <div><Label>Compare Price (₹)</Label><Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className={`mt-1 ${icls} ${errors.comparePrice ? 'border-destructive' : ''}`} min="0" placeholder="Optional" /><AnimatePresence>{errors.comparePrice && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.comparePrice}</motion.p>}</AnimatePresence></div>
          <div><Label>Stock <span className="text-destructive">*</span></Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={`mt-1 ${icls} ${errors.stock ? 'border-destructive' : ''}`} min="0" placeholder="0" /><AnimatePresence>{errors.stock && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.stock}</motion.p>}</AnimatePresence></div>
          <div><Label>Sizes (comma-separated)</Label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className={`mt-1 ${icls}`} placeholder="S,M,L,XL" /></div>
          <div className="md:col-span-2"><Label>Image URLs (comma-separated)</Label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className={`mt-1 ${icls} ${errors.images ? 'border-destructive' : ''}`} placeholder="https://..." /><AnimatePresence>{errors.images && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1">{errors.images}</motion.p>}</AnimatePresence></div>
          <div className="md:col-span-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={`mt-1 ${icls}`} placeholder="luxury, silk, formal" /></div>
          <div className="flex gap-3 items-center">
            <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} /><Label className="text-sm">Featured</Label>
          </div>
          <div className="flex gap-3 items-center">
            <Switch checked={form.isNewArrival} onCheckedChange={(v) => setForm({ ...form, isNewArrival: v })} /><Label className="text-sm">New Arrival</Label>
          </div>
          <div className="flex gap-3 items-center">
            <Switch checked={form.isBestseller} onCheckedChange={(v) => setForm({ ...form, isBestseller: v })} /><Label className="text-sm">Bestseller</Label>
          </div>
          <DialogFooter className="flex gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className={goldBtn}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> {product ? 'Update' : 'Create'}</>}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setOrders(data.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const updateOrder = async (id: string, data: any) => {
    const res = await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, ...data }) });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const openOrderDetail = async (order: Order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setOrderNotes(data.order?.notes || '');
      }
    } catch {}
  };

  const saveOrderNotes = async () => {
    if (!selectedOrder) return;
    await fetch(`/api/admin/orders/${selectedOrder.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes: orderNotes }) });
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, notes: orderNotes } : o));
    toast({ title: 'Notes saved' });
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${selectedOrder.orderNumber}</title><style>body{font-family:sans-serif;padding:40px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f5f5f5;}.total{font-weight:bold;font-size:18px;}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:10px;}</style></head><body>
      <div class="header"><div><h1 style="color:#b8860b;">MIRADEEN</h1><p>Invoice</p></div><div><p><strong>${selectedOrder.orderNumber}</strong></p><p>${new Date(selectedOrder.createdAt).toLocaleDateString()}</p></div></div>
      <h3>Shipping To</h3><p>${selectedOrder.shippingName}<br/>${selectedOrder.shippingAddress}<br/>${selectedOrder.shippingCity}, ${selectedOrder.shippingState} ${selectedOrder.shippingZip}</p>
      <table><thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${selectedOrder.items.map(i => `<tr><td>${i.productName}</td><td>${i.size || '-'}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`).join('')}</tbody></table>
      <p>Subtotal: ₹${selectedOrder.subtotal}</p><p>Shipping: ₹${selectedOrder.shipping}</p><p>Discount: ₹${selectedOrder.discount}</p><p class="total">Total: ₹${selectedOrder.total}</p>
      <script>window.print();</script></body></html>`);
    w.document.close();
  };

  if (loading) return <AdminSkeleton rows={3} height="h-24" />;

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
  const statusCounts = new Map<string, number>();
  orders.forEach(o => { statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1); });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from(statusCounts.entries()).map(([status, count]) => (
            <Badge key={status} variant="outline" className={`text-[10px] px-2 py-0.5 cursor-pointer border ${statusFilter === status ? 'ring-2 ring-gold/50 ring-offset-1' : ''} ${getOrderStatusColor(status)}`} onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
              {status} ({count})
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className={`w-[180px] h-9 text-sm ${icls}`}><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <Card><CardContent className="p-8 text-center"><ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No orders found</p></CardContent></Card>
        )}
        {filteredOrders.map(order => (
          <Card key={order.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30 cursor-pointer" onClick={() => openOrderDetail(order)}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <Badge className={`text-[9px] border px-1.5 py-0 ${getOrderStatusColor(order.status)}`}>{order.status}</Badge>
                    <Badge className={`text-[9px] border px-1.5 py-0 ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()} • {order.shippingName}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  <Select value={order.status} onValueChange={(v) => updateOrder(order.id, { status: v })}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <span className="font-semibold text-sm text-gold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {order.items.map((item, i) => <span key={i}>{item.quantity}x {item.productName}{i < order.items.length - 1 ? ',' : ''}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="heading-serif text-lg">Order {selectedOrder.orderNumber}</DialogTitle>
                    <DialogDescription>{new Date(selectedOrder.createdAt).toLocaleString()}</DialogDescription>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-[10px] ${getOrderStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</Badge>
                    <Badge className={`text-[10px] ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><ShoppingCart className="h-4 w-4 text-gold" /> Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                          <img src={item.productImage || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.size && `Size: ${item.size}`}{item.size && item.color && ' • '}{item.color && `Color: ${item.color}`}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{formatCurrency(item.price)} × {item.quantity}</p>
                          <p className="text-sm font-bold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Totals */}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(selectedOrder.shipping)}</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(selectedOrder.discount)}</span></div>}
                  <div className="flex justify-between font-bold text-lg pt-1 border-t"><span>Total</span><span className="text-gold">{formatCurrency(selectedOrder.total)}</span></div>
                </div>
                {/* Shipping & Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <h4 className="text-xs font-semibold mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Shipping</h4>
                    <p className="text-sm">{selectedOrder.shippingName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.shippingAddress}, {selectedOrder.shippingCity}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.shippingState} {selectedOrder.shippingZip}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.shippingPhone}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <h4 className="text-xs font-semibold mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3" /> Payment</h4>
                    <p className="text-sm">{selectedOrder.paymentMethod}</p>
                    <p className="text-xs text-muted-foreground">Status: {selectedOrder.paymentStatus}</p>
                    {selectedOrder.paymentId && <p className="text-xs text-muted-foreground">ID: {selectedOrder.paymentId}</p>}
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Order Notes</h4>
                  <Textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className={icls} rows={2} placeholder="Add notes about this order..." />
                  <Button size="sm" onClick={saveOrderNotes} className="mt-2 text-xs">Save Notes</Button>
                </div>
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="text-xs" onClick={handlePrint}><Printer className="h-3 w-3 mr-1" /> Print Invoice</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── CreditCard icon placeholder ──────────────────────────────────────────────

function CreditCard({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
}

// ── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setUsers(data.users || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, isBlocked: !isBlocked }) });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !isBlocked } : u));
      toast({ title: `User ${!isBlocked ? 'blocked' : 'unblocked'}` });
    }
  };

  const openUserDetail = async (userId: string) => {
    setUserLoading(true);
    setSelectedUser(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSelectedUser(await res.json());
    } catch {}
    setUserLoading(false);
  };

  if (loading) return <AdminSkeleton rows={3} height="h-16" />;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} registered users</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 ${icls} border-border`} />
      </div>

      <div className="space-y-3">
        {filteredUsers.map(user => (
          <Card key={user.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30 cursor-pointer" onClick={() => openUserDetail(user.id)}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold ring-2 ring-gold/30 ring-offset-1 group-hover:ring-gold transition-all duration-300">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm group-hover:text-gold transition-colors duration-200">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
                <Badge variant={user.isBlocked ? 'destructive' : 'secondary'} className="text-[10px]">{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
                <span className="text-xs text-muted-foreground">{user._count?.orders || 0} orders</span>
                <Button variant="ghost" size="sm" onClick={() => toggleBlock(user.id, user.isBlocked)} className="text-xs">
                  {user.isBlocked ? <><CheckCircle className="mr-1 h-3 w-3" /> Unblock</> : <><Ban className="mr-1 h-3 w-3" /> Block</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={userLoading || !!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {userLoading && <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" /></div>}
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="heading-serif text-lg">{selectedUser.user.name}</DialogTitle>
                <DialogDescription>{selectedUser.user.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{selectedUser.orders.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{formatCurrency(selectedUser.totalSpent)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Total Spent</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{selectedUser.user._count?.wishlist || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Wishlist</p>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Joined:</span> {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedUser.user.phone || 'N/A'}</p>
                  <p><span className="text-muted-foreground">Location:</span> {selectedUser.user.city || 'N/A'}, {selectedUser.user.state || ''}</p>
                </div>
                {/* Recent Orders */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recent Orders</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.orders.length === 0 && <p className="text-xs text-muted-foreground">No orders yet</p>}
                    {selectedUser.orders.map((o: Order) => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs font-medium">{o.orderNumber}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[9px] border ${getOrderStatusColor(o.status)}`}>{o.status}</Badge>
                          <span className="text-xs font-bold text-gold">{formatCurrency(o.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Wishlist */}
                {selectedUser.wishlist.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500" /> Wishlist</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedUser.wishlist.map((w: any) => (
                        <div key={w.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="w-8 h-10 rounded bg-muted overflow-hidden shrink-0">
                            <img src={parseJsonField<string>(w.product?.images)[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium truncate">{w.product?.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Messages Tab ─────────────────────────────────────────────────────────────

function MessagesTab({ token }: { token: string | null }) {
  const { toast } = useToast();
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
    if (res.ok) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, reply: replyText, replied: true } : m));
      setReplying(null); setReplyText('');
      toast({ title: 'Reply sent!' });
    }
  };

  if (loading) return <AdminSkeleton rows={3} height="h-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{messages.length} total • {messages.filter(m => !m.isRead).length} unread</p>
      </div>
      <div className="space-y-3">
        {messages.map(msg => (
          <Card key={msg.id} className={`group transition-all duration-300 hover:shadow-md ${msg.isRead ? 'opacity-70' : 'hover:border-gold/30'}`}>
            <CardContent className="p-4 cursor-pointer" onClick={() => !msg.isRead && markRead(msg.id)}>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium text-sm">{msg.name}</p>
                {!msg.isRead && <Badge className="bg-gold text-background text-[9px]">New</Badge>}
                {msg.replied && <Badge variant="outline" className="text-[9px] border-gold/30 text-gold">Replied</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{msg.email} • {new Date(msg.createdAt).toLocaleDateString()}</p>
              {msg.subject && <p className="text-sm font-medium mt-1">{msg.subject}</p>}
              <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
              {msg.reply && <div className="mt-2 p-2 bg-muted rounded text-xs"><span className="font-medium text-gold">Reply:</span> {msg.reply}</div>}
              <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                {replying === msg.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." className={`h-8 text-sm ${icls}`} />
                    <Button size="sm" onClick={() => sendReply(msg.id)} className={`h-8 ${goldBtn}`}>Send</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplying(null)} className="h-8">Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setReplying(msg.id)} className="text-xs hover:text-gold hover:bg-gold/10"><MessageSquare className="mr-1 h-3 w-3" /> Reply</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Coupons Tab ───────────────────────────────────────────────────────────────

interface Coupon {
  id: string; code: string; discount: number; type: string;
  minOrder: number | null; maxUses: number | null; usedCount: number;
  isActive: boolean; startsAt: string | null; expiresAt: string | null;
}

function getCouponStatus(c: Coupon) {
  const now = new Date();
  if (c.expiresAt && new Date(c.expiresAt) < now) return 'expired';
  if (c.startsAt && new Date(c.startsAt) > now) return 'scheduled';
  if (!c.isActive) return 'disabled';
  return 'active';
}

function getCouponBadge(s: string) {
  const m: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300',
    expired: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/40 dark:text-gray-400',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300',
    disabled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300',
  };
  return m[s] || 'bg-muted text-muted-foreground border-border';
}

function genCouponCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += c[Math.floor(Math.random() * c.length)];
  return code;
}

function CouponsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', discount: '', minOrder: '', maxUses: '', isActive: true, startsAt: '', expiresAt: '' });
  const [couponErrors, setCouponErrors] = useState<FormErrors>({});

  const fetchCoupons = () => {
    fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, [token]);

  const openCreate = () => { setForm({ code: '', type: 'percentage', discount: '', minOrder: '', maxUses: '', isActive: true, startsAt: '', expiresAt: '' }); setEditing(null); setShowDialog(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({ code: c.code, type: c.type, discount: String(c.discount), minOrder: c.minOrder ? String(c.minOrder) : '', maxUses: c.maxUses ? String(c.maxUses) : '', isActive: c.isActive, startsAt: c.startsAt ? c.startsAt.split('T')[0] : '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    const errs: FormErrors = {};
    if (!form.code.trim()) errs.code = 'Coupon code is required';
    else if (form.code.trim().length < 3) errs.code = 'Code must be at least 3 characters';
    else if (!/^[A-Z0-9_-]+$/.test(form.code.trim())) errs.code = 'Code must be uppercase letters, numbers, hyphens only';
    if (!form.discount) errs.discount = 'Discount value is required';
    else if (parseFloat(form.discount) <= 0) errs.discount = 'Discount must be greater than 0';
    if (form.type === 'percentage' && parseFloat(form.discount) > 100) errs.discount = 'Percentage discount cannot exceed 100';
    if (form.startsAt && form.expiresAt && new Date(form.startsAt) >= new Date(form.expiresAt)) errs.expiresAt = 'End date must be after start date';
    setCouponErrors(errs);
    if (Object.keys(errs).length > 0) { toast({ title: 'Fix errors first', description: `${Object.keys(errs).length} field(s) need attention`, variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form }) });
        toast({ title: 'Coupon updated!' });
      } else {
        await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        toast({ title: 'Coupon created!' });
      }
      setShowDialog(false); fetchCoupons();
    } catch { toast({ title: 'Failed to save coupon', variant: 'destructive' }); }
    setSaving(false);
  };

  const handleDelete = async (c: Coupon) => {
    await fetch('/api/admin/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: c.id }) });
    toast({ title: 'Coupon deleted' }); fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await fetch('/api/admin/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: c.id, isActive: !c.isActive }) });
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !c.isActive } : x));
  };

  if (loading) return <AdminSkeleton rows={3} height="h-28" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Coupons</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{coupons.length} total • {coupons.filter(c => getCouponStatus(c) === 'active').length} active</p>
        </div>
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-4 w-4" /> Create Coupon</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const status = getCouponStatus(coupon);
          return (
            <Card key={coupon.id} className={`group transition-all duration-300 hover:shadow-lg ${status === 'active' ? 'border-gold/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${status === 'active' ? 'bg-gold/10' : 'bg-muted'}`}><Ticket className={`h-4 w-4 ${status === 'active' ? 'text-gold' : 'text-muted-foreground'}`} /></div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm font-mono tracking-wider">{coupon.code}</span>
                        <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast({ title: 'Code copied!' }); }} className="p-0.5 text-muted-foreground hover:text-gold"><Copy className="h-3 w-3" /></button>
                      </div>
                      <Badge variant="outline" className={`text-[9px] border px-1.5 py-0 mt-0.5 ${getCouponBadge(status)}`}>{status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(coupon)} className="p-1.5 rounded-md">{coupon.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-red-600" />}</button>
                    <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Coupon?</AlertDialogTitle><AlertDialogDescription>Delete {coupon.code}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(coupon)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                  <span className="text-2xl font-bold text-gold">{coupon.type === 'percentage' ? coupon.discount : formatCurrency(coupon.discount)}</span>
                  <span className="text-xs text-muted-foreground ml-1">{coupon.type === 'percentage' ? '% OFF' : 'OFF'}</span>
                </div>
                <div className="text-xs text-muted-foreground">Used: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div><Label>Code <span className="text-destructive">*</span></Label><div className="flex gap-1 mt-1"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={`${icls} font-mono ${couponErrors.code ? 'border-destructive' : ''}`} disabled={!!editing} placeholder="SUMMER30" />{!editing && <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, code: genCouponCode() })}><RefreshCw className="h-4 w-4" /></Button>}</div>{couponErrors.code && <p className="text-xs text-destructive mt-1">{couponErrors.code}</p>}</div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed (₹)</SelectItem></SelectContent></Select></div>
            <div><Label>Discount <span className="text-destructive">*</span></Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className={`mt-1 ${icls} ${couponErrors.discount ? 'border-destructive' : ''}`} min="0" max={form.type === 'percentage' ? 100 : undefined} placeholder={form.type === 'percentage' ? '20' : '500'} />{couponErrors.discount && <p className="text-xs text-destructive mt-1">{couponErrors.discount}</p>}</div>
            <div><Label>Min Order (₹)</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className={`mt-1 ${icls}`} min="0" placeholder="0 = no minimum" /></div>
            <div><Label>Max Uses</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={`mt-1 ${icls}`} min="0" placeholder="0 = unlimited" /></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-sm">Active</Label></div>
            <div><Label>Start Date</Label><Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={`mt-1 ${icls} ${couponErrors.expiresAt ? 'border-destructive' : ''}`} />{couponErrors.expiresAt && <p className="text-xs text-destructive mt-1">{couponErrors.expiresAt}</p>}</div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className={goldBtn}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> {editing ? 'Update' : 'Create'}</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── CMS Tab ─────────────────────────────────────────────────────────────────

function CMSTab({ token }: { token: string | null }) {
  const [activeSection, setActiveSection] = useState<'banners' | 'testimonials' | 'categories'>('banners');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Content Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage banners, testimonials, and categories</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['banners', 'testimonials', 'categories'] as const).map(s => (
          <Button key={s} variant={activeSection === s ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection(s)} className={activeSection === s ? goldBtn : 'text-xs'}>
            {s === 'banners' && <><ImageIcon className="h-3 w-3 mr-1" /> Banners</>}
            {s === 'testimonials' && <><Quote className="h-3 w-3 mr-1" /> Testimonials</>}
            {s === 'categories' && <><Tag className="h-3 w-3 mr-1" /> Categories</>}
          </Button>
        ))}
      </div>
      {activeSection === 'banners' && <BannersSection token={token} />}
      {activeSection === 'testimonials' && <TestimonialsSection token={token} />}
      {activeSection === 'categories' && <CategoriesSection token={token} />}
    </div>
  );
}

// ── Banners Section ─────────────────────────────────────────────────────────

function BannersSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', subtitle: '', image: '', link: '', position: 'hero', isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const fetchBanners = () => {
    fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setBanners(d.banners || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, link: b.link || '', position: b.position, isActive: b.isActive, sortOrder: b.sortOrder }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) { toast({ title: 'Title and image required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form }) });
        toast({ title: 'Banner updated!' });
      } else {
        await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        toast({ title: 'Banner created!' });
      }
      setShowDialog(false); fetchBanners();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const toggleActive = async (b: Banner) => {
    await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: b.id, isActive: !b.isActive }) });
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, isActive: !b.isActive } : x));
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Banner deleted' }); fetchBanners();
  };

  if (loading) return <AdminSkeleton rows={3} height="h-28" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Image} title="Banners" badge={`${banners.length} total`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Banner</Button>
      </div>
      <div className="space-y-3">
        {banners.map(banner => (
          <Card key={banner.id} className="group transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-32 h-20 rounded-md bg-muted overflow-hidden shrink-0">
                <img src={banner.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{banner.title}</p>
                {banner.subtitle && <p className="text-xs text-muted-foreground">{banner.subtitle}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[9px]">{banner.position}</Badge>
                  <Badge variant="outline" className="text-[9px]">Sort: {banner.sortOrder}</Badge>
                  <Badge className={`text-[9px] ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{banner.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(banner)} className="p-1.5 rounded-md">{banner.isActive ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}</button>
                <button onClick={() => openEdit(banner)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Banner?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteBanner(banner.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {banners.length === 0 && <Card><CardContent className="p-8 text-center"><ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No banners yet</p></CardContent></Card>}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`mt-1 ${icls}`} required /></div>
            <div className="sm:col-span-2"><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`mt-1 ${icls}`} placeholder="https://..." required /></div>
            <div><Label>Link</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={`mt-1 ${icls}`} placeholder="https://..." /></div>
            <div><Label>Position</Label><Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hero">Hero</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="bottom">Bottom</SelectItem><SelectItem value="sidebar">Sidebar</SelectItem></SelectContent></Select></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={`mt-1 ${icls}`} /></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-sm">Active</Label></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className={goldBtn}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Testimonials Section ────────────────────────────────────────────────────

interface Testimonial { id: string; author: string; role?: string; company?: string; avatar?: string; rating: number; text: string; isFeatured: boolean; isActive: boolean; sortOrder: number; }

function TestimonialsSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { author: '', role: '', company: '', avatar: '', rating: 5, text: '', isFeatured: false, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const fetchT = () => {
    fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setTestimonials(d.testimonials || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchT(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ author: t.author, role: t.role || '', company: t.company || '', avatar: t.avatar || '', rating: t.rating, text: t.text, isFeatured: t.isFeatured, isActive: t.isActive, sortOrder: t.sortOrder }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.author.trim() || !form.text.trim()) { toast({ title: 'Author and text required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form }) });
        toast({ title: 'Testimonial updated!' });
      } else {
        await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        toast({ title: 'Testimonial created!' });
      }
      setShowDialog(false); fetchT();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const deleteT = async (id: string) => {
    await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Testimonial deleted' }); fetchT();
  };

  const toggleFeatured = async (t: Testimonial) => {
    await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: t.id, isFeatured: !t.isFeatured }) });
    setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, isFeatured: !x.isFeatured } : x));
  };

  if (loading) return <AdminSkeleton rows={3} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Quote} title="Testimonials" badge={`${testimonials.length} total`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Testimonial</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <Card key={t.id} className="group transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold">{t.author.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium">{t.author}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}{t.role && t.company ? ' at ' : ''}{t.company}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleFeatured(t)} className="p-1.5 rounded-md" title="Toggle Featured">
                    <Star className={`h-3.5 w-3.5 ${t.isFeatured ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
                  </button>
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Testimonial?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteT(t.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">&ldquo;{t.text}&rdquo;</p>
              <div className="flex gap-2 mt-2">
                <Badge className={`text-[9px] ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                {t.isFeatured && <Badge className="text-[9px] bg-gold text-background">Featured</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && <Card className="md:col-span-2"><CardContent className="p-8 text-center"><Quote className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No testimonials yet</p></CardContent></Card>}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div><Label>Author Name</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={`mt-1 ${icls}`} required /></div>
            <div><Label>Role / Title</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`mt-1 ${icls}`} placeholder="e.g., Fashion Designer" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>Rating (1-5)</Label><Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: parseInt(v) })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{'★'.repeat(n)}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2"><Label>Testimonial Text</Label><Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className={`mt-1 ${icls}`} rows={3} required /></div>
            <div className="flex items-center gap-3"><Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} /><Label className="text-sm">Featured</Label></div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-sm">Active</Label></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className={goldBtn}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Categories Section ──────────────────────────────────────────────────────

function CategoriesSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { name: '', description: '', image: '', sortOrder: 0, isActive: true };
  const [form, setForm] = useState(emptyForm);

  const fetchC = () => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setCategories(d.categories || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchC(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '', sortOrder: c.sortOrder, isActive: c.isActive }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form }) });
        toast({ title: 'Category updated!' });
      } else {
        await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        toast({ title: 'Category created!' });
      }
      setShowDialog(false); fetchC();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const deleteC = async (id: string) => {
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Category deleted' }); fetchC();
  };

  if (loading) return <AdminSkeleton rows={3} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Tag} title="Categories" badge={`${categories.length} total`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Category</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat.id} className="group transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm group-hover:text-gold transition-colors">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground">Slug: {cat.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete &ldquo;{cat.name}&rdquo;?</AlertDialogTitle><AlertDialogDescription>Products in this category will lose their category assignment.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteC(cat.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {cat.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center gap-2">
                <Badge className={`text-[9px] ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                <span className="text-[10px] text-muted-foreground">{cat._count?.products || 0} products</span>
                <span className="text-[10px] text-muted-foreground">Sort: {cat.sortOrder}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center"><Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No categories yet</p></CardContent></Card>}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${icls}`} required /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`mt-1 ${icls}`} rows={2} /></div>
            <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-sm">Active</Label></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className={goldBtn}>{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Marketing Tab ───────────────────────────────────────────────────────────

function MarketingTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailText, setEmailText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/newsletter', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setSubscribers(d.subscribers || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const deleteSub = async (id: string) => {
    await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Subscriber removed' });
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const exportSubscribers = () => {
    const csv = 'Email,Name,Subscribed\n' + subscribers.map(s => `${s.email},${s.name || ''},${new Date(s.createdAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported subscribers' });
  };

  const handleBulkEmail = () => {
    if (!emailText.trim()) { toast({ title: 'Enter email content', variant: 'destructive' }); return; }
    toast({ title: `Bulk email queued for ${subscribers.length} subscribers`, description: 'Email sending is a placeholder — configure SMTP for production.' });
    setEmailText('');
  };

  if (loading) return <AdminSkeleton rows={3} />;

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()) || (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCount = subscribers.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Marketing</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Newsletter subscribers & email campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30"><Mail className="h-4 w-4 text-green-600" /></div>
            <div><p className="text-lg font-bold">{subscribers.length}</p><p className="text-[10px] text-muted-foreground uppercase">Total</p></div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30"><CheckCircle2 className="h-4 w-4 text-blue-600" /></div>
            <div><p className="text-lg font-bold">{activeCount}</p><p className="text-[10px] text-muted-foreground uppercase">Active</p></div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30"><Send className="h-4 w-4 text-gold" /></div>
            <div><p className="text-lg font-bold">0</p><p className="text-[10px] text-muted-foreground uppercase">Campaigns</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Email */}
      <Card className="border-gold/20">
        <CardContent className="p-4">
          <h3 className="heading-serif text-base font-semibold text-gold mb-2 flex items-center gap-2"><Send className="h-4 w-4" /> Send Bulk Email</h3>
          <Textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} className={`${icls} mb-3`} rows={3} placeholder="Write your email content here..." />
          <div className="flex gap-2">
            <Button onClick={handleBulkEmail} disabled={!emailText.trim()} className={goldBtn} size="sm"><Send className="h-3 w-3 mr-1" /> Send to All</Button>
            <Button onClick={exportSubscribers} variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Mail} title="Subscribers" badge={`${filtered.length} shown`} />
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-8 h-8 text-xs ${icls}`} />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No subscribers found</p>}
          {filtered.map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-gold/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">{(sub.name || sub.email).charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium">{sub.name || sub.email}</p>
                  <p className="text-xs text-muted-foreground">{sub.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[9px] ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{sub.isActive ? 'Active' : 'Inactive'}</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</span>
                <button onClick={() => deleteSub(sub.id)} className="p-1 rounded text-muted-foreground hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setSettings(data.settings || {}); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const updateSetting = (key: string, value: string) => {
    // Validate before saving
    const error = validateSettingField(key, value);
    setSettingsErrors(prev => {
      const updated = { ...prev };
      if (error) updated[key] = error;
      else delete updated[key];
      return updated;
    });
    if (!error) {
      // Only save to server if valid
      fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) })
        .then(res => { if (res.ok) setSettings(prev => ({ ...prev, [key]: value })); });
    }
  };

  const validateSettingField = (key: string, value: string): string | undefined => {
    if (!value.trim()) return undefined; // empty ok for optional fields
    switch (key) {
      case 'contact_email':
        if (!validateEmail(value)) return 'Please enter a valid email';
        return undefined;
      case 'contact_phone':
      case 'contact_whatsapp':
        if (!validatePhone(value)) return 'Enter a valid 10-digit Indian phone (starts with 6-9)';
        return undefined;
      case 'free_shipping_min': {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0) return 'Must be a valid non-negative number';
        return undefined;
      }
      case 'social_instagram':
      case 'social_facebook':
      case 'social_twitter':
      case 'social_youtube':
        if (!validateUrl(value)) return 'Please enter a valid URL';
        return undefined;
      default:
        return undefined;
    }
  };

  if (loading) return <AdminSkeleton rows={5} height="h-12" />;

  const labels: Record<string, string> = {
    about_title: 'About Page Title', about_content: 'About Page Content', brand_tagline: 'Brand Tagline',
    brand_mission: 'Brand Mission', contact_email: 'Contact Email', contact_phone: 'Contact Phone',
    contact_whatsapp: 'WhatsApp Number', free_shipping_min: 'Free Shipping Min Order (₹)',
    site_name: 'Site Name', tagline: 'Tagline', address: 'Address',
    social_instagram: 'Instagram URL', social_facebook: 'Facebook URL', social_twitter: 'Twitter URL', social_youtube: 'YouTube URL',
    seo_title: 'SEO Meta Title', seo_description: 'SEO Meta Description', seo_keywords: 'SEO Keywords',
    announcement_text: 'Announcement Text',
  };

  const sections = [
    { title: 'Site Info', keys: ['site_name', 'tagline', 'address'], icon: Globe },
    { title: 'Contact Information', keys: ['contact_email', 'contact_phone', 'contact_whatsapp'], icon: Phone },
    { title: 'Social Media', keys: ['social_instagram', 'social_facebook', 'social_twitter', 'social_youtube'], icon: Globe },
    { title: 'SEO Settings', keys: ['seo_title', 'seo_description', 'seo_keywords'], icon: BarChart3 },
    { title: 'Announcement', keys: ['announcement_text'], icon: Megaphone },
    { title: 'Brand Settings', keys: ['brand_tagline', 'brand_mission', 'about_title', 'about_content'], icon: Crown },
    { title: 'Shipping Settings', keys: ['free_shipping_min'], icon: Package },
  ];

  const saveAll = () => { toast({ title: 'All settings saved!' }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your store</p>
        </div>
        <Button onClick={saveAll} size="sm" className={goldBtn}><Save className="mr-1 h-4 w-4" /> Save All</Button>
      </div>
      {sections.map((section) => {
        const entries = Object.entries(settings).filter(([key]) => section.keys.includes(key));
        if (entries.length === 0) return null;
        return (
          <div key={section.title} className="space-y-3">
            <SectionHeader icon={section.icon} title={section.title} />
            <div className="space-y-3">
              {entries.map(([key, value]) => (
                <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium">{labels[key] || key}</Label>
                    {key.includes('content') || key.includes('mission') || key.includes('description') || key.includes('announcement') ? (
                      <Textarea value={value} onChange={(e) => updateSetting(key, e.target.value)} className={`mt-1 ${icls} ${settingsErrors[key] ? 'border-destructive' : ''}`} rows={2} />
                    ) : (
                      <Input value={value} onChange={(e) => updateSetting(key, e.target.value)} className={`mt-1 ${icls} ${settingsErrors[key] ? 'border-destructive' : ''}`} />
                    )}
                    {settingsErrors[key] && <p className="text-xs text-destructive mt-1">{settingsErrors[key]}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Ungrouped settings */}
      {(() => {
        const allKeys = new Set(sections.flatMap(s => s.keys));
        const ungrouped = Object.entries(settings).filter(([k]) => !allKeys.has(k));
        if (ungrouped.length === 0) return null;
        return (
          <div className="space-y-3">
            <SectionHeader icon={Settings} title="Other Settings" />
            {ungrouped.map(([key, value]) => (
              <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
                <CardContent className="p-4">
                  <Label className="text-sm font-medium">{labels[key] || key}</Label>
                  <Input value={value} onChange={(e) => updateSetting(key, e.target.value)} className={`mt-1 ${icls} ${settingsErrors[key] ? 'border-destructive' : ''}`} />
                  {settingsErrors[key] && <p className="text-xs text-destructive mt-1">{settingsErrors[key]}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })()}

      {/* Export Data Section */}
      <ExportDataSection token={token} />
    </div>
  );
}

// ── Export Data Section ─────────────────────────────────────────────────────

function ExportDataSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const categories = [
    { type: 'products' as ExportDataType, label: 'Products', icon: Shirt, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { type: 'orders' as ExportDataType, label: 'Orders', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { type: 'users' as ExportDataType, label: 'Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { type: 'messages' as ExportDataType, label: 'Messages', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  const handleExport = async (type: ExportDataType, format: ExportFormatType) => {
    setExporting(`${type}-${format}`);
    const success = await exportData(token, type, format);
    if (success) {
      setDone(prev => new Set(prev).add(`${type}-${format}`));
      toast({ title: 'Export complete!' });
    } else {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
    setExporting(null);
  };

  const isDone = (type: string, format: string) => done.has(`${type}-${format}`);

  return (
    <div className="space-y-4 mt-4">
      <SectionHeader icon={Download} title="Export Data" badge="Download Workspace" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(cat => (
          <Card key={cat.type} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${cat.bg}`}><cat.icon className={`h-5 w-5 ${cat.color}`} /></div>
                <p className="font-medium text-sm group-hover:text-gold">{cat.label}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className={`flex-1 text-xs ${isDone(cat.type, 'csv') ? 'border-green-300 text-green-600' : 'hover:border-gold/40 hover:text-gold'}`} onClick={() => handleExport(cat.type, 'csv')} disabled={!!exporting}>
                  {isDone(cat.type, 'csv') ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />}
                  CSV
                </Button>
                <Button size="sm" variant="outline" className={`flex-1 text-xs ${isDone(cat.type, 'json') ? 'border-green-300 text-green-600' : 'hover:border-gold/40 hover:text-gold'}`} onClick={() => handleExport(cat.type, 'json')} disabled={!!exporting}>
                  {isDone(cat.type, 'json') ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> : <FileJson className="h-3.5 w-3.5 mr-1.5" />}
                  JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
