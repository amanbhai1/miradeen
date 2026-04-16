/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, LogOut, Settings, MapPin, ChevronRight, Edit3, Save, Camera, Trash2, Plus, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

export default function ProfilePage() {
  const { user, isAuthenticated, isAdmin, token, navigate, setUser, logout } = useStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

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
    }
  }, [user]);

  if (!isAuthenticated || !user) return null;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

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

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative h-40 md:h-48 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920" alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-2">Account</p>
          <h1 className="heading-serif text-3xl md:text-4xl font-bold">My Account</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-6 bg-card text-center -mt-16 relative z-10"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/30 flex items-center justify-center mx-auto mb-4 relative group">
                <span className="heading-serif text-3xl font-bold text-gold">{user.name.charAt(0).toUpperCase()}</span>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{user.email}</p>
              <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">
                {user.role === 'admin' ? '⚡ Admin' : '👤 Member'}
              </Badge>

              <div className="mt-5 pt-5 border-t border-border space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm hover:text-gold hover:bg-gold/5 transition-colors rounded-lg">
                  <User className="mr-2 h-4 w-4" /> My Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm hover:text-gold hover:bg-gold/5 transition-colors rounded-lg" onClick={() => navigate('orders')}>
                  <Package className="mr-2 h-4 w-4" /> My Orders
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm hover:text-gold hover:bg-gold/5 transition-colors rounded-lg" onClick={() => navigate('wishlist')}>
                  <MapPin className="mr-2 h-4 w-4" /> Wishlist
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm hover:text-gold hover:bg-gold/5 transition-colors rounded-lg" onClick={() => navigate('order-tracking')}>
                  <Settings className="mr-2 h-4 w-4" /> Track Order
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm text-gold hover:bg-gold/5 transition-colors rounded-lg" onClick={() => navigate('admin-dashboard')}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Panel
                  </Button>
                )}
                <div className="pt-3 mt-2 border-t border-border">
                  <Button variant="ghost" className="w-full justify-start text-sm text-destructive hover:bg-destructive/5 transition-colors rounded-lg" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0 mb-6">
                <TabsTrigger value="profile" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors">
                  Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="addresses" className="px-4 py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm tracking-wider uppercase hover:text-gold transition-colors">
                  Addresses
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-6">
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
                          {saving ? <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <><Save className="mr-1.5 h-3.5 w-3.5" /> Save</>}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="border border-border rounded-xl p-6 bg-card">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                        <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} />
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Email</Label>
                        <Input value={user.email} className="mt-1.5 h-11 border-border bg-muted" disabled />
                        <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <Label className="text-xs tracking-wider uppercase">Phone</Label>
                        <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="mt-1.5 h-11 border-border focus:border-gold" disabled={!editing} placeholder="+91 9876543210" />
                      </div>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                      { label: 'Total Orders', value: orders.length },
                      { label: 'Wishlist Items', value: '—' },
                      { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                    ].map((stat) => (
                      <div key={stat.label} className="border border-border rounded-xl p-4 bg-card text-center">
                        <p className="text-xl font-bold text-gold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 p-4 border border-border rounded-lg">
                      <div className="flex justify-between"><div className="h-4 w-32 bg-muted animate-pulse rounded" /><div className="h-6 w-16 bg-muted animate-pulse rounded" /></div>
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    </div>
                  ))}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">No Orders Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">Start shopping and your orders will appear here</p>
                    <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark text-xs tracking-wider uppercase">
                      Shop Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl p-4 md:p-6 bg-card hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="font-semibold text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[10px] ${statusColors[order.status] || ''}`}>{order.status}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${order.paymentStatus === 'paid' ? 'border-green-500 text-green-600' : ''}`}>{order.paymentStatus}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{item.quantity}x</span>
                              <span>{item.productName}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{order.items.length - 3} more</span>
                          )}
                        </div>
                        <div className="divider-gold mb-3" />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-lg">₹{order.total.toLocaleString()}</p>
                            <Button variant="ghost" size="sm" className="text-xs text-gold hover:text-gold hover:bg-gold/5 rounded-lg" onClick={() => navigate('order-tracking')}>
                              Track <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Saved Addresses</h2>
                      <p className="text-sm text-muted-foreground">Manage your shipping addresses</p>
                    </div>
                    <Button size="sm" variant="outline" className="hover:border-gold hover:text-gold transition-colors">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Address
                    </Button>
                  </div>
                  <div className="border border-border rounded-xl p-6 bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">Default Address</p>
                          <Badge className="text-[9px] bg-gold/10 text-gold border-gold/20">
                            <Check className="h-2.5 w-2.5 mr-0.5" /> Default
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {user.address ? (
                            <>
                              {user.name}<br />
                              {user.address}<br />
                              {user.city}{user.state ? `, ${user.state}` : ''} {user.zipCode}<br />
                              {user.country}
                            </>
                          ) : (
                            'No address saved yet'
                          )}
                        </p>
                        {user.phone && <p className="text-sm text-muted-foreground mt-2">{user.phone}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="hover:text-gold transition-colors shrink-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
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
