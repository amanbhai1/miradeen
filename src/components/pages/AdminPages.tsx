'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LayoutDashboard, Shirt, ShoppingBag, Users, MessageSquare, Settings,
  BarChart3, DollarSign, TrendingUp, Eye, EyeOff, Ban, CheckCircle,
  ChevronLeft, Search, Edit, Trash2, Plus, X, Save,
  ArrowUpRight, ArrowDownRight, Star, Package, Calendar, Clock, Trophy,
  ShoppingCart, Filter, UserCheck, ToggleLeft, ToggleRight, Sparkles, Crown, Mail,
  Download, FileJson, FileSpreadsheet, Loader2, CheckCircle2, Ticket, Percent, Copy, RefreshCw,
  Image as ImageIcon, Megaphone, Quote, Tag, AlertTriangle, Printer, Send, MapPin, Phone, Globe, Heart,
  FileText, Link2, GripVertical, MousePointerClick, CalendarDays, ExternalLink, UserCircle,
  Truck, RotateCcw, Camera, Menu, ChevronRight, PlayCircle
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

      {/* Customer Analytics */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="heading-serif text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" /> Customer Analytics
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Key customer metrics & insights</p>
            </div>
            <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs">CRM</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Customer Acquisition */}
            <div className="p-4 rounded-lg bg-muted/30 border border-gold/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-950/30"><TrendingUp className="h-4 w-4 text-green-600" /></div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">New This Month</p>
              </div>
              <p className="text-xl font-bold">{stats.stats.newCustomers || 0}</p>
              <p className="text-[10px] text-green-600 flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="h-3 w-3" /> {stats.stats.users ? (((stats.stats.newCustomers || 0) / stats.stats.users) * 100).toFixed(1) : 0}% of total
              </p>
            </div>

            {/* Customer Retention */}
            <div className="p-4 rounded-lg bg-muted/30 border border-gold/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30"><UserCheck className="h-4 w-4 text-gold" /></div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Repeat Customers</p>
              </div>
              <p className="text-xl font-bold">{stats.customerAnalytics?.repeatCustomers || 0}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.stats.users ? (((stats.customerAnalytics?.repeatCustomers || 0) / stats.stats.users) * 100).toFixed(1) : 0}% retention rate
              </p>
            </div>

            {/* Avg Order Frequency */}
            <div className="p-4 rounded-lg bg-muted/30 border border-gold/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30"><Clock className="h-4 w-4 text-purple-600" /></div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg. Frequency</p>
              </div>
              <p className="text-xl font-bold">{stats.customerAnalytics?.avgOrderFrequency || 0}</p>
              <p className="text-[10px] text-muted-foreground mt-1">orders per customer</p>
            </div>

            {/* Customer Lifetime Value */}
            <div className="p-4 rounded-lg bg-muted/30 border border-gold/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-gold/10"><Crown className="h-4 w-4 text-gold" /></div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lifetime Value</p>
              </div>
              <p className="text-xl font-bold text-gold">{formatCurrency(stats.customerAnalytics?.customerLifetimeValue || 0)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">avg. per customer</p>
            </div>
          </div>

          {/* Customer Segmentation Breakdown */}
          {stats.customerAnalytics?.segmentation && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Customer Segments</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'VIP', count: stats.customerAnalytics.segmentation.vip || 0, icon: Crown, color: 'text-gold', bg: 'bg-gold/10' },
                  { label: 'Regular', count: stats.customerAnalytics.segmentation.regular || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
                  { label: 'New', count: stats.customerAnalytics.segmentation.newCust || 0, icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                  { label: 'Inactive', count: stats.customerAnalytics.segmentation.inactive || 0, icon: UserCheck, color: 'text-muted-foreground', bg: 'bg-muted' },
                ].map(seg => (
                  <div key={seg.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                    <div className={`p-1.5 rounded-md ${seg.bg}`}><seg.icon className={`h-3.5 w-3.5 ${seg.color}`} /></div>
                    <div>
                      <p className="text-sm font-bold">{seg.count}</p>
                      <p className="text-[10px] text-muted-foreground">{seg.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>({});
  const [noteSaving, setNoteSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        // Load admin note for this user
        const settingsRes = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const note = settingsData.settings?.[`admin_note_${userId}`] || '';
          setCustomerNotes(prev => ({ ...prev, [userId]: note }));
        }
      }
    } catch {}
    setUserLoading(false);
  };

  const saveCustomerNote = async (userId: string) => {
    setNoteSaving(true);
    try {
      await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key: `admin_note_${userId}`, value: customerNotes[userId] || '' }) });
      toast({ title: 'Note saved' });
    } catch { toast({ title: 'Failed to save note', variant: 'destructive' }); }
    setNoteSaving(false);
  };

  const getCustomerSegment = (user: UserType): string => {
    const orderCount = user._count?.orders || 0;
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const daysSinceJoined = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (orderCount >= 5) return 'vip';
    if (daysSinceJoined > 90 && orderCount === 0) return 'inactive';
    if (daysSinceJoined <= 30) return 'new';
    return 'regular';
  };

  const getSegmentBadge = (segment: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      vip: { label: 'VIP', cls: 'bg-gold/10 text-gold border-gold/20' },
      regular: { label: 'Regular', cls: 'bg-green-50 dark:bg-green-950/30 text-green-700 border-green-200 dark:border-green-800' },
      new: { label: 'New', cls: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 border-blue-200 dark:border-blue-800' },
      inactive: { label: 'Inactive', cls: 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 border-gray-200 dark:border-gray-700' },
    };
    return map[segment] || map.regular;
  };

  const exportCustomers = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/users?limit=1000', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const exportUsers = data.users || [];
      if (format === 'csv') {
        const csv = 'Name,Email,Phone,Role,Orders,Joined,Segment,Status\n' +
          exportUsers.map((u: any) => {
            const seg = getCustomerSegment(u);
            return `${u.name},${u.email},${u.phone || ''},${u.role},${u._count?.orders || 0},${new Date(u.createdAt).toLocaleDateString()},${seg},${u.isBlocked ? 'Blocked' : 'Active'}`;
          }).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'customers.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const json = JSON.stringify(exportUsers, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'customers.json'; a.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: `Exported ${exportUsers.length} customers as ${format.toUpperCase()}` });
    } catch { toast({ title: 'Export failed', variant: 'destructive' }); }
    setExporting(false);
  };

  if (loading) return <AdminSkeleton rows={3} height="h-16" />;

  let filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (segmentFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => getCustomerSegment(u) === segmentFilter);
  }

  // Segment counts
  const segmentCounts = { all: users.length, vip: 0, regular: 0, new: 0, inactive: 0 };
  users.forEach(u => { segmentCounts[getCustomerSegment(u) as keyof typeof segmentCounts]++; });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportCustomers('csv')} variant="outline" size="sm" className="text-xs" disabled={exporting}>
            {exporting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileSpreadsheet className="h-3 w-3 mr-1" />} Export CSV
          </Button>
          <Button onClick={() => exportCustomers('json')} variant="outline" size="sm" className="text-xs" disabled={exporting}>
            {exporting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileJson className="h-3 w-3 mr-1" />} Export JSON
          </Button>
        </div>
      </div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'All Users', count: segmentCounts.all, icon: Users, color: 'text-foreground', bg: 'bg-muted/30' },
          { key: 'vip', label: 'VIP', count: segmentCounts.vip, icon: Crown, color: 'text-gold', bg: 'bg-gold/10' },
          { key: 'regular', label: 'Regular', count: segmentCounts.regular, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { key: 'new', label: 'New', count: segmentCounts.new, icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { key: 'inactive', label: 'Inactive', count: segmentCounts.inactive, icon: UserCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map(seg => (
          <button key={seg.key} onClick={() => setSegmentFilter(seg.key)} className={`p-3 rounded-lg border transition-all duration-200 text-left ${segmentFilter === seg.key ? 'border-gold/50 ring-2 ring-gold/20 bg-gold/5' : 'border-border hover:border-gold/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-md ${seg.bg}`}><seg.icon className={`h-3.5 w-3.5 ${seg.color}`} /></div>
              <p className="text-lg font-bold">{seg.count}</p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{seg.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 ${icls} border-border`} />
        </div>
        {segmentFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setSegmentFilter('all')} className="text-xs h-8"><X className="h-3 w-3 mr-1" /> Clear Filter</Button>
        )}
        <span className="text-xs text-muted-foreground">{filteredUsers.length} shown</span>
      </div>

      <div className="space-y-3">
        {filteredUsers.length === 0 && (
          <Card><CardContent className="p-8 text-center"><Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No users found</p></CardContent></Card>
        )}
        {filteredUsers.map(user => {
          const segment = getCustomerSegment(user);
          const segBadge = getSegmentBadge(segment);
          return (
            <Card key={user.id} className="group transition-all duration-300 hover:shadow-lg hover:border-gold/30 cursor-pointer" onClick={() => openUserDetail(user.id)}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold ring-2 ring-offset-1 group-hover:ring-gold transition-all duration-300 ${segment === 'vip' ? 'ring-gold/50 bg-gold/10' : 'ring-gold/30'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm group-hover:text-gold transition-colors duration-200">{user.name}</p>
                      <Badge variant="outline" className={`text-[8px] border px-1.5 py-0 ${segBadge.cls}`}>{segBadge.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email} • {user._count?.orders || 0} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
                  <Badge variant={user.isBlocked ? 'destructive' : 'secondary'} className="text-[10px]">{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => toggleBlock(user.id, user.isBlocked)} className="text-xs">
                    {user.isBlocked ? <><CheckCircle className="mr-1 h-3 w-3" /> Unblock</> : <><Ban className="mr-1 h-3 w-3" /> Block</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={userLoading || !!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {userLoading && <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" /></div>}
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="heading-serif text-lg flex items-center gap-2">
                      {selectedUser.user.name}
                      <Badge variant="outline" className={`text-[8px] border px-1.5 py-0 ${getSegmentBadge(getCustomerSegment(selectedUser.user)).cls}`}>
                        {getSegmentBadge(getCustomerSegment(selectedUser.user)).label}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>{selectedUser.user.email}</DialogDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {customerNotes[selectedUser.user.id] && <Badge variant="outline" className="text-[9px] border-gold/30 text-gold"><FileText className="h-2.5 w-2.5 mr-0.5" /> Has Notes</Badge>}
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{selectedUser.orders.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{formatCurrency(selectedUser.totalSpent)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Total Spent</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{selectedUser.orders.length > 0 ? formatCurrency(Math.round(selectedUser.totalSpent / selectedUser.orders.length)) : '₹0'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Avg. Order</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-gold">{selectedUser.user._count?.wishlist || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Wishlist</p>
                  </div>
                </div>

                {/* Spending Breakdown */}
                {selectedUser.orders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-gold" /> Spending Breakdown</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(() => {
                        const paid = selectedUser.orders.filter((o: Order) => o.paymentStatus === 'paid');
                        const pending = selectedUser.orders.filter((o: Order) => o.paymentStatus === 'pending');
                        const refunded = selectedUser.orders.filter((o: Order) => o.paymentStatus === 'refunded');
                        const paidTotal = paid.reduce((s: number, o: Order) => s + o.total, 0);
                        const pendingTotal = pending.reduce((s: number, o: Order) => s + o.total, 0);
                        const refundedTotal = refunded.reduce((s: number, o: Order) => s + o.total, 0);
                        return [
                          { label: 'Paid', amount: paidTotal, count: paid.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
                          { label: 'Pending', amount: pendingTotal, count: pending.length, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
                          { label: 'Refunded', amount: refundedTotal, count: refunded.length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
                        ].map(item => (
                          <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                            <p className="text-[10px] text-muted-foreground uppercase">{item.label} ({item.count})</p>
                            <p className={`text-base font-bold mt-1 ${item.color}`}>{formatCurrency(item.amount)}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 rounded-lg bg-muted/30 space-y-1 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="text-muted-foreground">Joined:</span> {new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedUser.user.phone || 'N/A'}</p>
                    <p><span className="text-muted-foreground">City:</span> {selectedUser.user.city || 'N/A'}</p>
                    <p><span className="text-muted-foreground">State:</span> {selectedUser.user.state || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedUser.user.address || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Role:</span> {selectedUser.user.role}</p>
                  </div>
                </div>

                {/* Customer Notes */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-gold" /> Admin Notes</h4>
                  <Textarea
                    value={customerNotes[selectedUser.user.id] || ''}
                    onChange={(e) => setCustomerNotes(prev => ({ ...prev, [selectedUser.user.id]: e.target.value }))}
                    className={icls}
                    rows={2}
                    placeholder="Add internal notes about this customer..."
                  />
                  <Button size="sm" onClick={() => saveCustomerNote(selectedUser.user.id)} disabled={noteSaving} className="mt-2 text-xs">
                    {noteSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Save Note
                  </Button>
                </div>

                {/* Activity Timeline */}
                {selectedUser.orders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gold" /> Order History Timeline</h4>
                    <div className="space-y-0 max-h-64 overflow-y-auto">
                      {selectedUser.orders.map((o: Order, i: number) => {
                        const isFirst = i === 0;
                        return (
                          <div key={o.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isFirst ? 'bg-gold ring-2 ring-gold/30' : 'bg-muted-foreground/30'}`} />
                              {i < selectedUser.orders.length - 1 && <div className="w-px flex-1 bg-border" />}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium">{o.orderNumber}</p>
                                  <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-[8px] border ${getOrderStatusColor(o.status)}`}>{o.status}</Badge>
                                  <span className="text-xs font-bold text-gold">{formatCurrency(o.total)}</span>
                                </div>
                              </div>
                              {isFirst && <span className="text-[9px] text-gold font-medium">Latest Order</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Wishlist */}
                {selectedUser.wishlist.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500" /> Wishlist ({selectedUser.wishlist.length} items)</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {selectedUser.wishlist.map((w: any) => {
                        const imgs = parseJsonField<string>(w.product?.images);
                        return (
                          <div key={w.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <div className="w-8 h-10 rounded bg-muted overflow-hidden shrink-0">
                              <img src={imgs[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{w.product?.name}</p>
                              <p className="text-[10px] text-muted-foreground">{w.product?.category?.name || ''} • {formatCurrency(w.product?.price || 0)}</p>
                            </div>
                          </div>
                        );
                      })}
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

type CMSSection = 'banners' | 'testimonials' | 'categories' | 'pages' | 'seo' | 'navigation' | 'media';

function CMSTab({ token }: { token: string | null }) {
  const [activeSection, setActiveSection] = useState<CMSSection>('banners');
  const sections: { id: CMSSection; label: string; icon: React.ElementType }[] = [
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'testimonials', label: 'Testimonials', icon: Quote },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'seo', label: 'SEO Settings', icon: BarChart3 },
    { id: 'navigation', label: 'Navigation', icon: Menu },
    { id: 'media', label: 'Media Library', icon: Camera },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-serif text-2xl font-bold">Content Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all website content, SEO, and media</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <Button key={s.id} variant={activeSection === s.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection(s.id)} className={activeSection === s.id ? goldBtn : 'text-xs'}>
            <s.icon className="h-3 w-3 mr-1" /> {s.label}
          </Button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeSection === 'banners' && <BannersSection token={token} />}
          {activeSection === 'testimonials' && <TestimonialsSection token={token} />}
          {activeSection === 'categories' && <CategoriesSection token={token} />}
          {activeSection === 'pages' && <PagesSection token={token} />}
          {activeSection === 'seo' && <SEOSettingsSection token={token} />}
          {activeSection === 'navigation' && <NavigationSection token={token} />}
          {activeSection === 'media' && <MediaLibrarySection token={token} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Sortable Banner Item ────────────────────────────────────────────────────

function SortableBannerItem({ banner, onEdit, onToggle, onDelete }: { banner: any; onEdit: (b: any) => void; onToggle: (b: any) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : undefined };
  const positionColors: Record<string, string> = { hero: 'bg-gold/10 text-gold border-gold/20', mid: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300', bottom: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300', sidebar: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300' };
  const scheduleInfo = banner.startDate || banner.endDate ? (
    <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
      <CalendarDays className="h-2.5 w-2.5" />
      {banner.startDate && new Date(banner.startDate).toLocaleDateString()}
      {banner.startDate && banner.endDate && ' → '}
      {banner.endDate && new Date(banner.endDate).toLocaleDateString()}
    </span>
  ) : null;

  return (
    <Card ref={setNodeRef} style={style} className="group transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold shrink-0"><GripVertical className="h-4 w-4" /></div>
        <div className="w-32 h-20 rounded-md bg-muted overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-gold/50 transition-all">
          <img src={banner.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm group-hover:text-gold transition-colors">{banner.title}</p>
          {banner.subtitle && <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="outline" className={`text-[9px] ${positionColors[banner.position] || ''}`}>{banner.position}</Badge>
            <Badge variant="outline" className="text-[9px]">#{banner.sortOrder}</Badge>
            {banner.enableClickTracking && <Badge variant="outline" className="text-[9px] border-gold/30 text-gold"><MousePointerClick className="h-2 w-2 mr-0.5" /> Tracking</Badge>}
            <Badge className={`text-[9px] ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{banner.isActive ? 'Active' : 'Inactive'}</Badge>
            {scheduleInfo}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onToggle(banner)} className="p-1.5 rounded-md">{banner.isActive ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}</button>
          <button onClick={() => onEdit(banner)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
          <AlertDialog>
            <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Banner?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(banner.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Banners Section ─────────────────────────────────────────────────────────

function BannersSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', subtitle: '', image: '', link: '', position: 'hero', isActive: true, sortOrder: 0, enableClickTracking: false, startDate: '', endDate: '' };
  const [form, setForm] = useState(emptyForm);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  const fetchBanners = () => {
    fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setBanners(d.banners || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, link: b.link || '', position: b.position, isActive: b.isActive, sortOrder: b.sortOrder, enableClickTracking: b.enableClickTracking || false, startDate: b.startDate ? b.startDate.split('T')[0] : '', endDate: b.endDate ? b.endDate.split('T')[0] : '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) { toast({ title: 'Title and image required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const body = { ...form, startDate: form.startDate || null, endDate: form.endDate || null };
      if (editing) {
        await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...body }) });
        toast({ title: 'Banner updated!' });
      } else {
        await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
        toast({ title: 'Banner created!' });
      }
      setShowDialog(false); fetchBanners();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const toggleActive = async (b: any) => {
    await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: b.id, isActive: !b.isActive }) });
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, isActive: !b.isActive } : x));
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Banner deleted' }); fetchBanners();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = banners.findIndex(b => b.id === active.id);
      const newIndex = banners.findIndex(b => b.id === over.id);
      const reordered = arrayMove(banners, oldIndex, newIndex).map((b, i) => ({ ...b, sortOrder: i }));
      setBanners(reordered);
      reordered.forEach((b, i) => {
        fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: b.id, sortOrder: i }) }).catch(() => {});
      });
    }
  };

  if (loading) return <AdminSkeleton rows={3} height="h-28" />;

  // Position preview mapping
  const positionPreview: Record<string, { label: string; desc: string; bg: string }> = {
    hero: { label: 'Hero', desc: 'Full-width top carousel', bg: 'bg-gradient-to-r from-gold/20 to-gold/5' },
    mid: { label: 'Mid-page', desc: 'Between content sections', bg: 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-950/20' },
    bottom: { label: 'Bottom', desc: 'Above footer area', bg: 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-950/20' },
    sidebar: { label: 'Sidebar', desc: 'Side column placement', bg: 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-950/20' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={ImageIcon} title="Banners" badge={`${banners.length} total`} action={<span className="text-[10px] text-muted-foreground flex items-center gap-1"><GripVertical className="h-3 w-3" /> Drag to reorder</span>} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Banner</Button>
      </div>

      {/* Position Visual Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(positionPreview).map(([key, val]) => {
          const count = banners.filter(b => b.position === key).length;
          return (
            <div key={key} className={`rounded-lg p-3 border ${val.bg} border-border/50`}>
              <p className="text-xs font-semibold">{val.label}</p>
              <p className="text-[9px] text-muted-foreground">{val.desc}</p>
              <Badge variant="outline" className="text-[9px] mt-1">{count} banner{count !== 1 ? 's' : ''}</Badge>
            </div>
          );
        })}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {banners.map(banner => (
              <SortableBannerItem key={banner.id} banner={banner} onEdit={openEdit} onToggle={toggleActive} onDelete={deleteBanner} />
            ))}
            {banners.length === 0 && <Card><CardContent className="p-8 text-center"><ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No banners yet</p></CardContent></Card>}
          </div>
        </SortableContext>
      </DndContext>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2"><Label>Title <span className="text-destructive">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Image URL <span className="text-destructive">*</span></Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`mt-1 ${icls}`} placeholder="https://..." /></div>
            {form.image && (
              <div className="sm:col-span-2"><Label>Preview</Label><div className="mt-1 w-full h-32 rounded-lg bg-muted overflow-hidden border border-border"><img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div></div>
            )}
            <div><Label>Link</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={`mt-1 ${icls}`} placeholder="https://..." /></div>
            <div><Label>Position</Label><Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hero">Hero</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="bottom">Bottom</SelectItem><SelectItem value="sidebar">Sidebar</SelectItem></SelectContent></Select></div>
            <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-sm">Active</Label></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.enableClickTracking} onCheckedChange={(v) => setForm({ ...form, enableClickTracking: v })} /><Label className="text-sm flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Click Tracking</Label></div>
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

interface Testimonial { id: string; author: string; role?: string; company?: string; avatar?: string; rating: number; text: string; isFeatured: boolean; isActive: boolean; sortOrder: number; status?: string; tags?: string; }

type TestimonialStatus = 'draft' | 'pending_review' | 'published';

const testimonialStatusLabels: Record<TestimonialStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  published: { label: 'Published', color: 'bg-green-100 text-green-700 border-green-300' },
};

function SortableTestimonialItem({ t, onEdit, onToggle, onToggleFeatured, onDelete }: { t: Testimonial; onEdit: (t: Testimonial) => void; onToggle: (t: Testimonial) => void; onToggleFeatured: (t: Testimonial) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : undefined };
  const status = (t.status || 'published') as TestimonialStatus;
  const statusInfo = testimonialStatusLabels[status];

  return (
    <Card ref={setNodeRef} style={style} className="group transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold shrink-0"><GripVertical className="h-4 w-4" /></div>
            {t.avatar ? (
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-gold/20"><img src={t.avatar} alt="" className="w-full h-full object-cover" /></div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold shrink-0">{t.author.charAt(0)}</div>
            )}
            <div>
              <p className="text-sm font-medium group-hover:text-gold transition-colors">{t.author}</p>
              <p className="text-[10px] text-muted-foreground">{t.role}{t.role && t.company ? ' at ' : ''}{t.company}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onToggleFeatured(t)} className="p-1.5 rounded-md" title="Toggle Featured"><Star className={`h-3.5 w-3.5 ${t.isFeatured ? 'fill-gold text-gold' : 'text-muted-foreground'}`} /></button>
            <button onClick={() => onEdit(t)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
            <AlertDialog>
              <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Testimonial?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(t.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="flex items-center gap-0.5 mb-2 ml-8">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />)}</div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 ml-8">&ldquo;{t.text}&rdquo;</p>
        <div className="flex items-center gap-2 mt-2 ml-8 flex-wrap">
          <Badge variant="outline" className={`text-[9px] border ${statusInfo.color}`}>{statusInfo.label}</Badge>
          {t.isFeatured && <Badge className="text-[9px] bg-gold text-background">Featured</Badge>}
          {t.isActive ? <Badge className="text-[9px] bg-green-100 text-green-700">Active</Badge> : <Badge className="text-[9px] bg-gray-100 text-gray-600">Inactive</Badge>}
          {t.tags && t.tags.split(',').map((tag, i) => <Badge key={i} variant="outline" className="text-[9px] border-gold/30 text-gold/70">{tag.trim()}</Badge>)}
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialsSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const emptyForm = { author: '', role: '', company: '', avatar: '', rating: 5, text: '', isFeatured: false, isActive: true, sortOrder: 0, status: 'draft' as TestimonialStatus, tags: '' };
  const [form, setForm] = useState(emptyForm);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  const fetchT = () => {
    fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setTestimonials(d.testimonials || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchT(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ author: t.author, role: t.role || '', company: t.company || '', avatar: t.avatar || '', rating: t.rating, text: t.text, isFeatured: t.isFeatured, isActive: t.isActive, sortOrder: t.sortOrder, status: (t.status || 'published') as TestimonialStatus, tags: t.tags || '' }); setShowDialog(true); };

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

  const toggleActive = async (t: Testimonial) => {
    await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: t.id, isActive: !t.isActive }) });
    setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, isActive: !x.isActive } : x));
  };

  const updateStatus = async (t: Testimonial, newStatus: TestimonialStatus) => {
    await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: t.id, status: newStatus }) });
    setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    toast({ title: `Status updated to ${testimonialStatusLabels[newStatus].label}` });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = testimonials.findIndex(t => t.id === active.id);
      const newIndex = testimonials.findIndex(t => t.id === over.id);
      const reordered = arrayMove(testimonials, oldIndex, newIndex).map((t, i) => ({ ...t, sortOrder: i }));
      setTestimonials(reordered);
      reordered.forEach((t, i) => {
        fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: t.id, sortOrder: i }) }).catch(() => {});
      });
    }
  };

  if (loading) return <AdminSkeleton rows={3} />;

  const featured = testimonials.filter(t => t.isFeatured);
  let filtered = testimonials;
  if (filterStatus !== 'all') filtered = filtered.filter(t => (t.status || 'published') === filterStatus);
  if (showFeaturedOnly) filtered = filtered.filter(t => t.isFeatured);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Quote} title="Testimonials" badge={`${testimonials.length} total • ${featured.length} featured`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Testimonial</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'draft', 'pending_review', 'published'] as const).map(s => (
          <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" className={`text-[10px] ${filterStatus === s ? goldBtn : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'All' : testimonialStatusLabels[s].label}
          </Button>
        ))}
        <Button variant={showFeaturedOnly ? 'default' : 'outline'} size="sm" className={`text-[10px] ${showFeaturedOnly ? goldBtn : ''}`} onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}>
          <Star className="h-3 w-3 mr-1" /> Featured Only
        </Button>
      </div>

      {/* Featured Highlights */}
      {featured.length > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20">
          <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1"><Crown className="h-3 w-3" /> Featured Testimonials ({featured.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featured.map(t => (
              <div key={t.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border shrink-0 min-w-[200px]">
                {t.avatar ? <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0"><img src={t.avatar} alt="" className="w-full h-full object-cover" /></div> : <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold shrink-0">{t.author.charAt(0)}</div>}
                <div className="min-w-0"><p className="text-xs font-medium truncate">{t.author}</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-2 w-2 ${i < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />)}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(t => (
              <SortableTestimonialItem key={t.id} t={t} onEdit={openEdit} onToggle={toggleActive} onToggleFeatured={toggleFeatured} onDelete={deleteT} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {filtered.length === 0 && <Card className="md:col-span-2"><CardContent className="p-8 text-center"><Quote className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No testimonials found</p></CardContent></Card>}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div><Label>Author Name <span className="text-destructive">*</span></Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>Role / Title</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`mt-1 ${icls}`} placeholder="e.g., Fashion Designer" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>Avatar URL</Label><Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className={`mt-1 ${icls}`} placeholder="https://..." /></div>
            {form.avatar && <div className="sm:col-span-2"><Label>Avatar Preview</Label><div className="mt-1 w-16 h-16 rounded-full bg-muted overflow-hidden border border-border"><img src={form.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div></div>}
            <div><Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="p-0.5 transition-transform hover:scale-110">
                    <Star className={`h-6 w-6 transition-colors ${n <= form.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30 hover:text-gold/50'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TestimonialStatus })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(testimonialStatusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2"><Label>Testimonial Text <span className="text-destructive">*</span></Label><Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className={`mt-1 ${icls}`} rows={3} /></div>
            <div className="sm:col-span-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={`mt-1 ${icls}`} placeholder="satisfied, repeat customer, luxury" /></div>
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
  const emptyForm = { name: '', description: '', image: '', sortOrder: 0, isActive: true, parentId: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchC = () => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setCategories(d.categories || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchC(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '', sortOrder: c.sortOrder, isActive: c.isActive, parentId: c.parentId || '' }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const body = { ...form, parentId: form.parentId || null };
      if (editing) {
        await fetch('/api/admin/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...body }) });
        toast({ title: 'Category updated!' });
      } else {
        await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
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

  const parentCategories = categories.filter(c => !c.parentId);
  const childMap = new Map<string, any[]>();
  categories.filter(c => c.parentId).forEach(c => { const existing = childMap.get(c.parentId) || []; existing.push(c); childMap.set(c.parentId, existing); });

  const renderCategory = (cat: any, depth: number = 0) => {
    const children = childMap.get(cat.id) || [];
    return (
      <div key={cat.id}>
        <Card className={`group transition-all duration-300 hover:shadow-md ${depth > 0 ? 'ml-8 border-l-2 border-l-gold/30' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {cat.image ? (
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 ring-1 ring-border group-hover:ring-gold/50 transition-all"><img src={cat.image} alt="" className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center shrink-0"><Tag className="h-5 w-5 text-gold" /></div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {depth > 0 && <ChevronRight className="h-3 w-3 text-gold/50" />}
                    <p className="font-medium text-sm group-hover:text-gold transition-colors truncate">{cat.name}</p>
                    {depth > 0 && <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-gold/30 text-gold/70">Sub</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Slug: {cat.slug}</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className={`text-[9px] ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Package className="h-2.5 w-2.5" /> {cat._count?.products || 0} products</span>
                    {children.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><ChevronRight className="h-2.5 w-2.5" /> {children.length} sub</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete &ldquo;{cat.name}&rdquo;?</AlertDialogTitle><AlertDialogDescription>Products in this category will lose their assignment.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteC(cat.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
        {children.map(child => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Tag} title="Categories" badge={`${categories.length} total`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Category</Button>
      </div>
      <div className="space-y-3">
        {parentCategories.map(cat => renderCategory(cat))}
        {categories.length === 0 && <Card><CardContent className="p-8 text-center"><Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No categories yet</p></CardContent></Card>}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div><Label>Parent Category</Label><Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue placeholder="None (Top-level)" /></SelectTrigger><SelectContent><SelectItem value="">None (Top-level)</SelectItem>{categories.filter(c => c.id !== editing?.id && !c.parentId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`mt-1 ${icls}`} rows={3} /></div>
            <div className="sm:col-span-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`mt-1 ${icls}`} /></div>
            {form.image && <div className="sm:col-span-2"><Label>Image Preview</Label><div className="mt-1 w-full h-32 rounded-lg bg-muted overflow-hidden border border-border"><img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div></div>}
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

// ── Pages Section ───────────────────────────────────────────────────────────

interface PageItem { id: string; title: string; slug: string; content: string; status: 'draft' | 'published'; metaTitle: string; metaDescription: string; createdAt: string; updatedAt: string; }

function PagesSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const emptyForm = { title: '', slug: '', content: '', status: 'draft' as const, metaTitle: '', metaDescription: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchPages = () => {
    fetch('/api/admin/pages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setPages(d.pages || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, [token]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowDialog(true); };
  const openEdit = (p: PageItem) => { setEditing(p); setForm({ title: p.title, slug: p.slug, content: p.content, status: p.status, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '' }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) { toast({ title: 'Title and slug required', variant: 'destructive' }); return; }
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/pages', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form, slug }) });
        toast({ title: 'Page updated!' });
      } else {
        await fetch('/api/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, slug }) });
        toast({ title: 'Page created!' });
      }
      setShowDialog(false); fetchPages();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const deletePage = async (id: string) => {
    await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Page deleted' }); fetchPages();
  };

  if (loading) return <AdminSkeleton rows={3} />;
  const filtered = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader icon={FileText} title="Pages" badge={`${pages.length} total`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Page</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 ${icls}`} />
      </div>
      <div className="space-y-3">
        {filtered.map(page => (
          <Card key={page.id} className="group transition-all duration-300 hover:shadow-md hover:border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gold shrink-0" />
                    <p className="font-medium text-sm group-hover:text-gold transition-colors truncate">{page.title}</p>
                    <Badge className={`text-[9px] ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{page.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-6">/{page.slug}</p>
                  {page.metaTitle && <p className="text-[10px] text-muted-foreground ml-6 mt-0.5">Meta: {page.metaTitle}</p>}
                  <p className="text-[10px] text-muted-foreground ml-6 mt-0.5">{new Date(page.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(page)} className="p-1.5 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3.5 w-3.5" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><button className="p-1.5 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete &ldquo;{page.title}&rdquo;?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePage(page.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <Card><CardContent className="p-8 text-center"><FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No pages found</p></CardContent></Card>}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Page' : 'New Page'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2"><Label>Title <span className="text-destructive">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Slug <span className="text-destructive">*</span></Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className={`mt-1 ${icls} font-mono`} placeholder="about-us" /></div>
            <div className="sm:col-span-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={`mt-1 ${icls} font-mono`} rows={8} placeholder="Page content..." /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'draft' | 'published' })}><SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
            <div><Label>Meta Title</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={`mt-1 ${icls}`} /></div>
            <div className="sm:col-span-2"><Label>Meta Description</Label><Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={`mt-1 ${icls}`} rows={2} /></div>
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

// ── Setting Field Component (shared) ───────────────────────────────────────

function SettingField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
      <CardContent className="p-4">
        <Label className="text-sm font-medium">{label}</Label>
        {type === 'textarea' ? (
          <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className={`mt-1 ${icls}`} rows={2} placeholder={placeholder} />
        ) : (
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className={`mt-1 ${icls}`} placeholder={placeholder} />
        )}
      </CardContent>
    </Card>
  );
}

// ── SEO Settings Section ────────────────────────────────────────────────────

function SEOSettingsSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [seoSettings, setSeoSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        const s = data.settings || {};
        const seo: Record<string, string> = {};
        ['seo_title', 'seo_description', 'seo_keywords', 'social_facebook', 'social_instagram', 'social_twitter', 'social_pinterest', 'social_youtube', 'google_analytics_id', 'favicon_url', 'og_image_url'].forEach(k => { if (s[k] !== undefined) seo[k] = s[k]; });
        setSeoSettings(seo);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [token]);

  const updateSetting = (key: string, value: string) => {
    setSeoSettings(prev => ({ ...prev, [key]: value }));
    fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) })
      .then(res => { if (res.ok) toast({ title: 'Setting saved' }); });
  };

  if (loading) return <AdminSkeleton rows={5} height="h-12" />;

  return (
    <div className="space-y-6">
      <SectionHeader icon={BarChart3} title="SEO Settings" />
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">General SEO</p>
        <SettingField label="Site Title" value={seoSettings['seo_title'] || ''} onChange={(v) => updateSetting('seo_title', v)} placeholder="MIRADEEN - Luxury Fashion" />
        <SettingField label="Site Description" value={seoSettings['seo_description'] || ''} onChange={(v) => updateSetting('seo_description', v)} placeholder="Discover luxury fashion at MIRADEEN..." type="textarea" />
        <SettingField label="Keywords" value={seoSettings['seo_keywords'] || ''} onChange={(v) => updateSetting('seo_keywords', v)} placeholder="luxury, fashion, silk, designer" />
      </div>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1"><Globe className="h-3 w-3" /> Social Media Links</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingField label="Facebook URL" value={seoSettings['social_facebook'] || ''} onChange={(v) => updateSetting('social_facebook', v)} placeholder="https://facebook.com/miradeen" />
          <SettingField label="Instagram URL" value={seoSettings['social_instagram'] || ''} onChange={(v) => updateSetting('social_instagram', v)} placeholder="https://instagram.com/miradeen" />
          <SettingField label="Twitter URL" value={seoSettings['social_twitter'] || ''} onChange={(v) => updateSetting('social_twitter', v)} placeholder="https://twitter.com/miradeen" />
          <SettingField label="Pinterest URL" value={seoSettings['social_pinterest'] || ''} onChange={(v) => updateSetting('social_pinterest', v)} placeholder="https://pinterest.com/miradeen" />
          <SettingField label="YouTube URL" value={seoSettings['social_youtube'] || ''} onChange={(v) => updateSetting('social_youtube', v)} placeholder="https://youtube.com/@miradeen" />
          <SettingField label="Google Analytics ID" value={seoSettings['google_analytics_id'] || ''} onChange={(v) => updateSetting('google_analytics_id', v)} placeholder="G-XXXXXXXXXX" />
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Media</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingField label="Favicon URL" value={seoSettings['favicon_url'] || ''} onChange={(v) => updateSetting('favicon_url', v)} placeholder="https://..." />
          <SettingField label="Open Graph Default Image" value={seoSettings['og_image_url'] || ''} onChange={(v) => updateSetting('og_image_url', v)} placeholder="https://..." />
        </div>
        {seoSettings['og_image_url'] && (
          <div className="w-64 h-40 rounded-lg bg-muted overflow-hidden border border-border">
            <img src={seoSettings['og_image_url']} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Navigation Section ──────────────────────────────────────────────────────

interface NavItem { id: string; label: string; link: string; icon: string; position: number; isVisible: boolean; openInNewTab: boolean; }

function NavigationSection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { label: '', link: '', icon: '', position: 0, isVisible: true, openInNewTab: false };
  const [form, setForm] = useState(emptyForm);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));

  const fetchNav = () => {
    fetch('/api/admin/navigation', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchNav(); }, [token]);

  const openCreate = () => { setForm({ ...emptyForm, position: items.length }); setEditing(null); setShowDialog(true); };
  const openEdit = (item: NavItem) => { setEditing(item); setForm({ label: item.label, link: item.link, icon: item.icon || '', position: item.position, isVisible: item.isVisible, openInNewTab: item.openInNewTab }); setShowDialog(true); };

  const handleSave = async () => {
    if (!form.label.trim()) { toast({ title: 'Label required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/navigation', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: editing.id, ...form }) });
        toast({ title: 'Nav item updated!' });
      } else {
        await fetch('/api/admin/navigation', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        toast({ title: 'Nav item created!' });
      }
      setShowDialog(false); fetchNav();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/navigation?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Nav item deleted' }); fetchNav();
  };

  const toggleVisibility = async (item: NavItem) => {
    await fetch('/api/admin/navigation', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: item.id, isVisible: !item.isVisible }) });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isVisible: !i.isVisible } : i));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((i, idx) => ({ ...i, position: idx }));
      setItems(reordered);
      reordered.forEach((i, idx) => {
        fetch('/api/admin/navigation', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: i.id, position: idx }) }).catch(() => {});
      });
    }
  };

  if (loading) return <AdminSkeleton rows={3} />;

  function SortableNavItem({ item }: { item: NavItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
      <Card ref={setNodeRef} style={style} className={`group transition-all duration-300 hover:shadow-md ${!item.isVisible ? 'opacity-50' : ''}`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold"><GripVertical className="h-4 w-4" /></div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Menu className="h-4 w-4 text-gold shrink-0" />
            <span className="text-sm font-medium truncate group-hover:text-gold transition-colors">{item.label}</span>
            <span className="text-[10px] text-muted-foreground truncate font-mono">{item.link}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {item.openInNewTab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            <Badge className={`text-[8px] ${item.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.isVisible ? 'Visible' : 'Hidden'}</Badge>
            <button onClick={() => toggleVisibility(item)} className="p-1 rounded-md">{item.isVisible ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-gray-400" />}</button>
            <button onClick={() => openEdit(item)} className="p-1 rounded-md text-muted-foreground hover:bg-gold/10 hover:text-gold"><Edit className="h-3 w-3" /></button>
            <AlertDialog>
              <AlertDialogTrigger asChild><button className="p-1 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600"><Trash2 className="h-3 w-3" /></button></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Nav Item?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem(item.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Menu} title="Navigation" badge={`${items.length} items`} />
        <Button onClick={openCreate} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
      </div>

      {/* Navigation Preview */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">Live Preview</p>
        <div className="flex items-center gap-4 overflow-x-auto">
          {items.filter(i => i.isVisible).map(item => (
            <span key={item.id} className="text-sm text-foreground hover:text-gold cursor-pointer transition-colors whitespace-nowrap">{item.label}</span>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(item => <SortableNavItem key={item.id} item={item} />)}
            {items.length === 0 && <Card><CardContent className="p-8 text-center"><Menu className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No navigation items</p></CardContent></Card>}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="heading-serif text-lg">{editing ? 'Edit Nav Item' : 'New Nav Item'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2">
            <div><Label>Label <span className="text-destructive">*</span></Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={`mt-1 ${icls}`} placeholder="Home" /></div>
            <div><Label>Link / Page</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={`mt-1 ${icls}`} placeholder="/about" /></div>
            <div><Label>Icon (Lucide name)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={`mt-1 ${icls}`} placeholder="e.g., Shirt, ShoppingBag" /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} /><Label className="text-sm">Visible</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.openInNewTab} onCheckedChange={(v) => setForm({ ...form, openInNewTab: v })} /><Label className="text-sm">New Tab</Label></div>
            </div>
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

// ── Media Library Section ───────────────────────────────────────────────────

function MediaLibrarySection({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchMedia = () => {
    fetch('/api/admin/media', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setImages(d.images || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, [token]);

  const addImage = async () => {
    if (!newUrl.trim()) return;
    try {
      await fetch('/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: newUrl.trim() }) });
      toast({ title: 'Image added!' });
      setNewUrl(''); fetchMedia();
    } catch { toast({ title: 'Failed to add image', variant: 'destructive' }); }
  };

  const removeImage = async (url: string) => {
    await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ url }) });
    toast({ title: 'Image removed' }); fetchMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copied to clipboard!' });
  };

  if (loading) return <AdminSkeleton rows={3} />;
  const filtered = searchQuery ? images.filter(img => img.toLowerCase().includes(searchQuery.toLowerCase())) : images;

  return (
    <div className="space-y-4">
      <SectionHeader icon={Camera} title="Media Library" badge={`${images.length} images`} />

      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search images by URL..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 ${icls}`} />
        </div>
        <div className="flex gap-2">
          <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Paste image URL..." className={`${icls} max-w-sm`} onKeyDown={(e) => { if (e.key === 'Enter') addImage(); }} />
          <Button onClick={addImage} size="sm" className={goldBtn}><Plus className="mr-1 h-3 w-3" /> Add</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((img, idx) => (
          <div key={idx} className="group relative rounded-lg bg-muted overflow-hidden border border-border hover:border-gold/50 transition-all hover:shadow-md aspect-square">
            <img src={img} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(img)} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button onClick={() => copyUrl(img)} className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors" title="Copy URL"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => removeImage(img)} className="p-2 bg-white/90 rounded-lg hover:bg-red-100 transition-colors" title="Remove"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full"><Card><CardContent className="p-8 text-center"><Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No images found</p></CardContent></Card></div>}
      </div>

      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <>
              <DialogHeader><DialogTitle className="heading-serif text-lg">Image Preview</DialogTitle></DialogHeader>
              <div className="rounded-lg bg-muted overflow-hidden border border-border">
                <img src={previewImage} alt="Preview" className="w-full max-h-[60vh] object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <Input value={previewImage} readOnly className={`text-xs font-mono ${icls}`} />
                <Button size="sm" variant="outline" onClick={() => copyUrl(previewImage)} className="shrink-0"><Copy className="h-3 w-3 mr-1" /> Copy</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Marketing Tab ───────────────────────────────────────────────────────────

function MarketingTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailText, setEmailText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'newsletter' | 'social_proof' | 'promo_banners'>('newsletter');

  // Social Proof settings
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [socialProofText, setSocialProofText] = useState('');
  const [socialProofDelay, setSocialProofDelay] = useState('15');
  const [socialProofLoading, setSocialProofLoading] = useState(false);

  // Add subscriber form
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [addingSub, setAddingSub] = useState(false);

  const fetchNewsletterData = useCallback(() => {
    fetch('/api/admin/newsletter', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setSubscribers(d.subscribers || []);
        setMonthlyTrend(d.monthlyTrend || []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchNewsletterData(); }, [fetchNewsletterData]);

  // Load social proof settings
  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        const s = d.settings || {};
        setSocialProofEnabled(s.social_proof_enabled === 'true');
        setSocialProofText(s.social_proof_text || 'Someone just purchased a {product}!');
        setSocialProofDelay(s.social_proof_delay || '15');
      }).catch(() => {});
  }, [token]);

  const saveSocialProof = async (key: string, value: string) => {
    setSocialProofLoading(true);
    try {
      await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) });
      toast({ title: 'Social proof setting saved' });
    } catch { toast({ title: 'Failed to save', variant: 'destructive' }); }
    setSocialProofLoading(false);
  };

  const deleteSub = async (id: string) => {
    await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast({ title: 'Subscriber removed' });
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const toggleSubActive = async (sub: any) => {
    await fetch('/api/admin/newsletter', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: sub.id, isActive: !sub.isActive }) });
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, isActive: !s.isActive } : s));
    toast({ title: `Subscriber ${!sub.isActive ? 'activated' : 'deactivated'}` });
  };

  const exportSubscribers = () => {
    const csv = 'Email,Name,Status,Subscribed\n' + subscribers.map(s => `${s.email},${s.name || ''},${s.isActive ? 'Active' : 'Inactive'},${new Date(s.createdAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported subscribers' });
  };

  const handleBulkEmail = () => {
    if (!emailText.trim()) { toast({ title: 'Enter email content', variant: 'destructive' }); return; }
    toast({ title: `Bulk email queued for ${subscribers.filter(s => s.isActive).length} active subscribers`, description: 'Email sending is a placeholder — configure SMTP for production.' });
    setEmailText('');
  };

  const handleAddSubscriber = async () => {
    if (!newSubEmail.trim() || !validateEmail(newSubEmail.trim())) {
      toast({ title: 'Valid email required', variant: 'destructive' });
      return;
    }
    setAddingSub(true);
    try {
      const res = await fetch('/api/admin/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: newSubEmail.trim(), name: newSubName.trim() || null }) });
      if (res.ok) {
        toast({ title: 'Subscriber added!' });
        setNewSubEmail(''); setNewSubName(''); setShowAddSub(false);
        fetchNewsletterData();
      } else {
        const d = await res.json();
        toast({ title: d.error || 'Failed to add subscriber', variant: 'destructive' });
      }
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setAddingSub(false);
  };

  if (loading) return <AdminSkeleton rows={3} />;

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(searchQuery.toLowerCase()) || (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCount = subscribers.filter(s => s.isActive).length;
  const thisMonthCount = monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1]?.count || 0 : 0;
  const maxTrendCount = Math.max(...monthlyTrend.map(t => t.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Marketing</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Newsletter, social proof & promotions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'newsletter' as const, label: 'Newsletter', icon: Mail },
            { id: 'social_proof' as const, label: 'Social Proof', icon: MousePointerClick },
            { id: 'promo_banners' as const, label: 'Promo Banners', icon: Megaphone },
          ]).map(s => (
            <Button key={s.id} variant={activeSection === s.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveSection(s.id)} className={activeSection === s.id ? goldBtn : 'text-xs'}>
              <s.icon className="h-3 w-3 mr-1" /> {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      {activeSection === 'newsletter' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30"><TrendingUp className="h-4 w-4 text-gold" /></div>
                <div><p className="text-lg font-bold text-gold">{thisMonthCount}</p><p className="text-[10px] text-muted-foreground uppercase">This Month</p></div>
              </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30"><Send className="h-4 w-4 text-purple-600" /></div>
                <div><p className="text-lg font-bold">0</p><p className="text-[10px] text-muted-foreground uppercase">Campaigns</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          {monthlyTrend.length > 0 && (
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="heading-serif text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" /> Subscription Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {monthlyTrend.map((t, i) => {
                    const height = Math.max((t.count / maxTrendCount) * 100, 4);
                    return (
                      <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-gold">{t.count}</span>
                        <div className="w-full bg-gold/20 rounded-t-sm relative" style={{ height: `${height}%` }}>
                          <div className={`absolute inset-0 rounded-t-sm ${i === monthlyTrend.length - 1 ? 'bg-gold' : 'bg-gold/50'}`} />
                        </div>
                        <span className="text-[8px] text-muted-foreground">{t.month.split('-')[1]}/{t.month.split('-')[0].slice(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Email */}
          <Card className="border-gold/20">
            <CardContent className="p-4">
              <h3 className="heading-serif text-base font-semibold text-gold mb-2 flex items-center gap-2"><Send className="h-4 w-4" /> Send Bulk Email</h3>
              <Textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} className={`${icls} mb-3`} rows={3} placeholder="Write your email content here..." />
              <div className="flex gap-2">
                <Button onClick={handleBulkEmail} disabled={!emailText.trim()} className={goldBtn} size="sm"><Send className="h-3 w-3 mr-1" /> Send to {activeCount} Active</Button>
                <Button onClick={exportSubscribers} variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export CSV</Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader icon={Mail} title="Subscribers" badge={`${filtered.length} shown`} action={
                <Button onClick={() => setShowAddSub(!showAddSub)} size="sm" variant="outline" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Subscriber
                </Button>
              } />
            </div>

            {/* Add Subscriber Form */}
            {showAddSub && (
              <Card className="mb-3 border-gold/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Email <span className="text-destructive">*</span></Label><Input value={newSubEmail} onChange={(e) => setNewSubEmail(e.target.value)} className={`mt-1 ${icls}`} placeholder="email@example.com" /></div>
                    <div><Label>Name</Label><Input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className={`mt-1 ${icls}`} placeholder="Optional name" /></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={handleAddSubscriber} disabled={addingSub || !newSubEmail.trim()} size="sm" className={goldBtn}>
                      {addingSub ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />} Add
                    </Button>
                    <Button onClick={() => setShowAddSub(false)} size="sm" variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search subscribers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-8 h-8 text-xs ${icls}`} />
              </div>
              <Button variant={searchQuery ? 'ghost' : 'outline'} size="sm" onClick={() => setSearchQuery('')} className="text-xs h-8"><X className="h-3 w-3" /></Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No subscribers found</p>}
              {filtered.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-gold/30 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">{(sub.name || sub.email).charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium">{sub.name || sub.email}</p>
                      <p className="text-xs text-muted-foreground">{sub.email} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] cursor-pointer ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`} onClick={() => toggleSubActive(sub)}>{sub.isActive ? 'Active' : 'Inactive'}</Badge>
                    <button onClick={() => toggleSubActive(sub)} className="p-1 rounded text-muted-foreground hover:text-gold" title="Toggle active">
                      {sub.isActive ? <ToggleRight className="h-3.5 w-3.5 text-green-600" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => deleteSub(sub.id)} className="p-1 rounded text-muted-foreground hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Section */}
      {activeSection === 'social_proof' && (
        <div className="space-y-6">
          <SectionHeader icon={MousePointerClick} title="Social Proof Notifications" badge="Engagement" />

          <Card className="border-gold/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Social Proof Popups</p>
                  <p className="text-xs text-muted-foreground">Show recent purchase notifications to visitors</p>
                </div>
                <Switch
                  checked={socialProofEnabled}
                  onCheckedChange={(v) => { setSocialProofEnabled(v); saveSocialProof('social_proof_enabled', String(v)); }}
                />
              </div>

              {socialProofEnabled && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Notification Text Template</Label>
                    <p className="text-[10px] text-muted-foreground mb-1">Use {'{product}'} and {'{time}'} as placeholders</p>
                    <Input
                      value={socialProofText}
                      onChange={(e) => setSocialProofText(e.target.value)}
                      className={icls}
                      placeholder="Someone just purchased a {product}!"
                      onBlur={() => saveSocialProof('social_proof_text', socialProofText)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Display Delay (seconds)</Label>
                    <p className="text-[10px] text-muted-foreground mb-1">Time between notifications</p>
                    <Input
                      type="number"
                      value={socialProofDelay}
                      onChange={(e) => setSocialProofDelay(e.target.value)}
                      className={`w-32 ${icls}`}
                      min="5" max="120"
                      onBlur={() => saveSocialProof('social_proof_delay', socialProofDelay)}
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Preview</p>
                    <div className="p-3 rounded-lg bg-card border border-gold/20 shadow-lg max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-gold" /></div>
                        <div>
                          <p className="text-xs font-medium">{socialProofText.replace('{product}', 'Silk Saree').replace('{time}', '2 min ago')}</p>
                          <p className="text-[10px] text-muted-foreground">Just now</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {socialProofLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</div>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4 text-gold" /> Tips for Social Proof</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Keep notifications concise — 2-3 seconds visibility works best</li>
                <li>Use real product names for authenticity</li>
                <li>Set delay between 10-30 seconds to avoid annoying visitors</li>
                <li>Combine with limited-time offers for higher conversions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promotional Banners Section */}
      {activeSection === 'promo_banners' && (
        <div className="space-y-6">
          <SectionHeader icon={Megaphone} title="Promotional Banners" badge="CMS Integration" />

          <Card className="border-gold/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gold" />
                <p className="font-medium text-sm">Schedule Promotional Banners</p>
              </div>
              <p className="text-xs text-muted-foreground">Manage time-sensitive promotional banners from the CMS Banners section. Use start/end dates to automatically activate and deactivate promotional content.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: 'Seasonal Sales', desc: 'Create banners for Diwali, Eid, Christmas sales', color: 'bg-green-50 dark:bg-green-950/30' },
                  { title: 'Flash Deals', desc: 'Time-limited offers with countdown urgency', color: 'bg-orange-50 dark:bg-orange-950/30' },
                  { title: 'New Arrivals', desc: 'Promote new collections automatically', color: 'bg-blue-50 dark:bg-blue-950/30' },
                ].map(card => (
                  <div key={card.title} className={`p-3 rounded-lg border border-border ${card.color}`}>
                    <p className="text-sm font-semibold">{card.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{card.desc}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => { setActiveSection('newsletter'); }} variant="outline" size="sm" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" /> Go to CMS Banners to manage
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><CalendarDays className="h-4 w-4 text-gold" /> Scheduling Best Practices</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Set both start and end dates for seasonal promotions</li>
                <li>Use &quot;hero&quot; position for maximum visibility</li>
                <li>Stack multiple mid-page banners for product categories</li>
                <li>Disable expired banners to keep the storefront clean</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});

  // Default settings keys to always show even when not in DB
  const defaultSettings: Record<string, string> = {
    site_name: '', tagline: '', address: '',
    contact_email: '', contact_phone: '', contact_whatsapp: '',
    social_instagram: '', social_facebook: '', social_twitter: '', social_youtube: '', social_pinterest: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    announcement_text: '',
    brand_tagline: '', brand_mission: '', about_title: '', about_content: '',
    free_shipping_min: '', shipping_flat_rate: '', shipping_express_rate: '',
    tax_rate: '', tax_enabled: 'false',
    paypal_client_id: '', paypal_mode: 'sandbox',
  };

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setSettings({ ...defaultSettings, ...(data.settings || {}) }); setLoading(false); }).catch(() => { setSettings(defaultSettings); setLoading(false); });
  }, [token]);

  const updateSetting = (key: string, value: string) => {
    const error = validateSettingField(key, value);
    setSettingsErrors(prev => {
      const updated = { ...prev };
      if (error) updated[key] = error;
      else delete updated[key];
      return updated;
    });
    if (!error) {
      fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ key, value }) })
        .then(res => { if (res.ok) setSettings(prev => ({ ...prev, [key]: value })); });
    }
  };

  const validateSettingField = (key: string, value: string): string | undefined => {
    if (!value.trim()) return undefined;
    switch (key) {
      case 'contact_email':
        if (!validateEmail(value)) return 'Please enter a valid email';
        return undefined;
      case 'contact_phone':
      case 'contact_whatsapp':
        if (!validatePhone(value)) return 'Enter a valid 10-digit Indian phone (starts with 6-9)';
        return undefined;
      case 'free_shipping_min':
      case 'shipping_flat_rate':
      case 'shipping_express_rate': {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0) return 'Must be a valid non-negative number';
        return undefined;
      }
      case 'tax_rate': {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0 || n > 100) return 'Tax rate must be between 0 and 100';
        return undefined;
      }
      case 'social_instagram':
      case 'social_facebook':
      case 'social_twitter':
      case 'social_youtube':
      case 'social_pinterest':
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
    social_instagram: 'Instagram URL', social_facebook: 'Facebook URL', social_twitter: 'Twitter URL',
    social_youtube: 'YouTube URL', social_pinterest: 'Pinterest URL',
    seo_title: 'SEO Meta Title', seo_description: 'SEO Meta Description', seo_keywords: 'SEO Keywords',
    announcement_text: 'Announcement Text',
    shipping_flat_rate: 'Standard Shipping Rate (₹)', shipping_express_rate: 'Express Shipping Rate (₹)',
    tax_rate: 'Tax Rate (%)', tax_enabled: 'Tax Enabled',
    paypal_client_id: 'PayPal Client ID', paypal_mode: 'PayPal Mode',
  };

  const sections = [
    { title: 'Site Info', keys: ['site_name', 'tagline', 'address'], icon: Globe },
    { title: 'Contact Information', keys: ['contact_email', 'contact_phone', 'contact_whatsapp'], icon: Phone },
    { title: 'Social Media', keys: ['social_instagram', 'social_facebook', 'social_twitter', 'social_youtube', 'social_pinterest'], icon: Globe },
    { title: 'SEO Settings', keys: ['seo_title', 'seo_description', 'seo_keywords'], icon: BarChart3 },
    { title: 'Announcement', keys: ['announcement_text'], icon: Megaphone },
    { title: 'Brand Settings', keys: ['brand_tagline', 'brand_mission', 'about_title', 'about_content'], icon: Crown },
    { title: 'Shipping Settings', keys: ['free_shipping_min', 'shipping_flat_rate', 'shipping_express_rate'], icon: Truck },
    { title: 'Tax Settings', keys: ['tax_enabled', 'tax_rate'], icon: Percent },
    { title: 'Payment Settings', keys: ['paypal_client_id', 'paypal_mode'], icon: CreditCard },
  ];

  const saveAll = () => { toast({ title: 'All settings saved!' }); };

  const renderField = (key: string, value: string) => {
    const isTextarea = key.includes('content') || key.includes('mission') || key.includes('description') || key.includes('announcement');
    if (key === 'tax_enabled') {
      return (
        <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{labels[key] || key}</Label>
              <Switch checked={value === 'true'} onCheckedChange={(v) => updateSetting(key, String(v))} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Enable tax calculation on orders</p>
          </CardContent>
        </Card>
      );
    }
    if (key === 'paypal_mode') {
      return (
        <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
          <CardContent className="p-4">
            <Label className="text-sm font-medium">{labels[key] || key}</Label>
            <Select value={value} onValueChange={(v) => updateSetting(key, v)}>
              <SelectTrigger className={`mt-1 ${icls}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">Use sandbox for testing, switch to live for production</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card key={key} className="transition-all duration-300 hover:shadow-md hover:border-gold/20">
        <CardContent className="p-4">
          <Label className="text-sm font-medium">{labels[key] || key}</Label>
          {isTextarea ? (
            <Textarea value={value || ''} onChange={(e) => updateSetting(key, e.target.value)} className={`mt-1 ${icls} ${settingsErrors[key] ? 'border-destructive' : ''}`} rows={2} placeholder={`Enter ${labels[key] || key}`} />
          ) : (
            <Input value={value || ''} onChange={(e) => updateSetting(key, e.target.value)} className={`mt-1 ${icls} ${settingsErrors[key] ? 'border-destructive' : ''}`} placeholder={`Enter ${labels[key] || key}`} />
          )}
          {settingsErrors[key] && <p className="text-xs text-destructive mt-1">{settingsErrors[key]}</p>}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-serif text-2xl font-bold">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your store</p>
        </div>
        <Button onClick={saveAll} size="sm" className={goldBtn}><Save className="mr-1 h-4 w-4" /> Save All</Button>
      </div>
      {sections.map((section) => (
        <div key={section.title} className="space-y-3">
          <SectionHeader icon={section.icon} title={section.title} badge={`${section.keys.length} fields`} />
          <div className="space-y-3">
            {section.keys.map(key => renderField(key, settings[key] || ''))}
          </div>
        </div>
      ))}

      {/* Ungrouped settings */}
      {(() => {
        const allKeys = new Set(sections.flatMap(s => s.keys));
        const ungrouped = Object.entries(settings).filter(([k, v]) => !allKeys.has(k) && v);
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
