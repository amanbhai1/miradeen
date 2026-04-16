'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, LogOut, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

export default function ProfilePage() {
  const { user, isAuthenticated, isAdmin, token, navigate } = useStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('auth'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setOrders(data.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, token]);

  if (!isAuthenticated || !user) return null;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 bg-card text-center">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <span className="heading-serif text-2xl font-bold text-gold">{user.name.charAt(0)}</span>
              </div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-2 text-[10px]">{user.role}</Badge>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => navigate('orders')}>
                  <Package className="mr-2 h-4 w-4" /> My Orders
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm text-gold" onClick={() => navigate('admin-dashboard')}>
                    <Settings className="mr-2 h-4 w-4" /> Admin Panel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0 mb-6">
                <TabsTrigger value="profile" className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent">Profile</TabsTrigger>
                <TabsTrigger value="orders" className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent">Orders ({orders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="border border-border rounded-lg p-6 bg-card max-w-lg">
                  <h3 className="font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div><Label>Full Name</Label><Input defaultValue={user.name} className="mt-1" disabled /></div>
                    <div><Label>Email</Label><Input defaultValue={user.email} className="mt-1" disabled /></div>
                    <div><Label>Phone</Label><Input defaultValue={user.phone || 'Not set'} className="mt-1" disabled /></div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => navigate('shop')} className="bg-gold text-background hover:bg-gold-dark text-xs">Start Shopping</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-lg p-4 md:p-6 bg-card">
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
                        </div>
                        <div className="divider-gold mb-3" />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                          <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
