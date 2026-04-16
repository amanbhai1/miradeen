'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { setUser, setToken, isAuthenticated, navigate } = useStore();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  if (isAuthenticated) {
    navigate('profile');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('miradeen-token', data.token);
      setUser(data.user);
      setToken(data.token);
      toast({ title: 'Welcome back!', description: `Signed in as ${data.user.name}` });
      navigate('home');
    } catch (err: unknown) {
      toast({ title: 'Login failed', description: err instanceof Error ? err.message : 'Invalid credentials', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('miradeen-token', data.token);
      setUser(data.user);
      setToken(data.token);
      toast({ title: 'Welcome to MIRADEEN!', description: 'Your account has been created.' });
      navigate('home');
    } catch (err: unknown) {
      toast({ title: 'Registration failed', description: err instanceof Error ? err.message : 'Something went wrong', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-serif text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-sm text-muted-foreground">{isLogin ? 'Sign in to your MIRADEEN account' : 'Join the world of luxury fashion'}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="pl-10" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="pl-10 pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-wider uppercase text-xs font-semibold">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className="pl-10" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="pl-10" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="pl-10" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} required minLength={6} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="pl-10 pr-10" placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-wider uppercase text-xs font-semibold">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)} className="text-gold font-medium ml-1 hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-cream dark:bg-card rounded-lg border border-border">
          <p className="text-xs font-medium mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Admin: admin@miradeen.com / admin123</p>
            <p>User: demo@miradeen.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
