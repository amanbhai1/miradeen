'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shirt, ShoppingBag, Users, MessageSquare, Settings, 
  BarChart3, DollarSign, TrendingUp, Eye, EyeOff, Ban, CheckCircle,
  ChevronLeft, Search, Edit, Trash2, Plus, X, Save
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

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'messages' | 'settings';

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, navigate, token } = useStore();
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
            <button onClick={() => navigate('home')} className="heading-serif text-xl font-bold tracking-wider">MIRADEEN</button>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Admin Panel</p>
          </div>
          <nav className="p-4 space-y-1">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${activeTab === item.id ? 'bg-gold/10 text-gold font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => navigate('home')} className="w-full text-xs">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back to Store
            </Button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
          <div className="flex overflow-x-auto">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] whitespace-nowrap ${activeTab === item.id ? 'text-gold' : 'text-muted-foreground'}`}>
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
              {activeTab === 'settings' && <SettingsTab token={token} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function DashboardTab({ token }: { token: string | null }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}</div>;
  if (!stats) return <p className="text-muted-foreground">Failed to load stats</p>;

  const cards = [
    { title: 'Total Users', value: stats.stats.users, icon: Users, color: 'text-blue-600' },
    { title: 'Total Orders', value: stats.stats.orders, icon: ShoppingBag, color: 'text-green-600' },
    { title: 'Revenue', value: `₹${(stats.stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-gold' },
    { title: 'Unread Messages', value: stats.stats.unreadMessages, icon: MessageSquare, color: 'text-orange-600' },
  ];

  return (
    <div>
      <h2 className="heading-serif text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Card key={card.title}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color} opacity-30`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="font-semibold mb-4">Recent Orders</h3>
      <div className="space-y-3">
        {(stats.recentOrders || []).map((order: Order) => (
          <Card key={order.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                <Badge variant="outline" className="text-[10px]">{order.paymentStatus}</Badge>
                <span className="font-semibold text-sm">₹{order.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductsTab({ token }: { token: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      const cats = new Map<string, any>();
      (data.products || []).forEach((p: Product) => { if (p.category) cats.set(p.category.id, p.category); });
      setCategories(Array.from(cats.values()));
    });
  }, [token]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="heading-serif text-2xl font-bold">Products ({products.length})</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gold text-background hover:bg-gold-dark">
          <Plus className="mr-1 h-4 w-4" /> Add Product
        </Button>
      </div>

      <AnimatePresence>{showForm && <ProductForm token={token} categories={categories} onClose={() => setShowForm(false)} onUpdate={() => {}} />}</AnimatePresence>

      <div className="space-y-3">
        {products.map((product) => {
          const images = parseJsonField<string>(product.images);
          return (
            <Card key={product.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-20 rounded bg-muted overflow-hidden shrink-0">
                  <img src={images[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category?.name} • Stock: {product.stock}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">₹{product.price.toLocaleString()}</Badge>
                  <div className="flex gap-1">
                    {product.isFeatured && <Badge className="text-[9px] bg-gold text-background">Featured</Badge>}
                    {product.isNewArrival && <Badge variant="secondary" className="text-[9px]">New</Badge>}
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">New Product</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" required /></div>
            <div><Label>Category</Label><Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" required /></div>
            <div><Label>Compare Price (₹)</Label><Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="mt-1" /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1" required /></div>
            <div><Label>Sizes (comma-separated)</Label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="mt-1" placeholder="S,M,L,XL" /></div>
            <div className="md:col-span-2"><Label>Image URLs (comma-separated)</Label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="mt-1" placeholder="https://..." /></div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" className="bg-gold text-background hover:bg-gold-dark"><Save className="mr-1 h-4 w-4" /> Save</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OrdersTab({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setOrders(data.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const updateOrder = async (id: string, data: any) => {
    const res = await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, ...data }) });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>;

  return (
    <div>
      <h2 className="heading-serif text-2xl font-bold mb-6">Orders ({orders.length})</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {order.shippingName}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={order.status} onValueChange={(v) => updateOrder(order.id, { status: v })}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={order.paymentStatus} onValueChange={(v) => updateOrder(order.id, { paymentStatus: v })}>
                    <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'paid', 'failed', 'refunded'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="font-semibold text-sm">₹{order.total.toLocaleString()}</span>
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

function UsersTab({ token }: { token: string | null }) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setUsers(data.users || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, isBlocked: !isBlocked }) });
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !isBlocked } : u));
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>;

  return (
    <div>
      <h2 className="heading-serif text-2xl font-bold mb-6">Users ({users.length})</h2>
      <div className="space-y-3">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{user.name.charAt(0)}</div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
    </div>
  );
}

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

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>;

  return (
    <div>
      <h2 className="heading-serif text-2xl font-bold mb-6">Messages ({messages.length})</h2>
      <div className="space-y-3">
        {messages.map(msg => (
          <Card key={msg.id} className={msg.isRead ? 'opacity-70' : ''}>
            <CardContent className="p-4" onClick={() => !msg.isRead && markRead(msg.id)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{msg.name}</p>
                    {!msg.isRead && <Badge className="bg-gold text-background text-[9px]">New</Badge>}
                    {msg.replied && <Badge variant="outline" className="text-[9px]">Replied</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{msg.email} • {new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {msg.subject && <p className="text-sm font-medium mb-1">{msg.subject}</p>}
              <p className="text-sm text-muted-foreground">{msg.message}</p>
              {msg.reply && <div className="mt-2 p-2 bg-muted rounded text-xs"><span className="font-medium">Reply:</span> {msg.reply}</div>}
              <div className="mt-2 flex gap-2">
                {replying === msg.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." className="h-8 text-sm" />
                    <Button size="sm" onClick={() => sendReply(msg.id)} className="h-8 bg-gold text-background">Send</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplying(null)} className="h-8">Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setReplying(msg.id)} className="text-xs"><MessageSquare className="mr-1 h-3 w-3" /> Reply</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ token }: { token: string | null }) {
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

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>;

  const labels: Record<string, string> = {
    about_title: 'About Page Title', about_content: 'About Page Content', brand_tagline: 'Brand Tagline',
    brand_mission: 'Brand Mission', contact_email: 'Contact Email', contact_phone: 'Contact Phone',
    contact_whatsapp: 'WhatsApp Number', free_shipping_min: 'Free Shipping Min Order (₹)',
  };

  return (
    <div>
      <h2 className="heading-serif text-2xl font-bold mb-6">Site Settings</h2>
      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <Label className="text-sm">{labels[key] || key}</Label>
              {key.includes('content') || key.includes('mission') ? (
                <Textarea value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1" rows={3} />
              ) : (
                <Input value={value} onChange={(e) => updateSetting(key, e.target.value)} className="mt-1" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
