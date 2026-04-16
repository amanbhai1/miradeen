'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
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
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1600&fit=crop"
              alt="Luxury Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <h1 className="heading-serif text-4xl font-bold tracking-[0.15em] mb-2">MIRADEEN</h1>
              <div className="h-px w-16 bg-gold mb-6" />
            </div>

            <div className="max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login-brand' : 'register-brand'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {isLogin ? (
                    <>
                      <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-4">Welcome Home</p>
                      <h2 className="heading-serif text-3xl font-bold mb-4 leading-tight">
                        Sign in to access your exclusive MIRADEEN experience
                      </h2>
                      <p className="text-sm text-white/70 leading-relaxed">
                        Track your orders, manage your wishlist, and enjoy personalized recommendations from our luxury collection.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-4">Join the Club</p>
                      <h2 className="heading-serif text-3xl font-bold mb-4 leading-tight">
                        Create your account and enter the world of luxury
                      </h2>
                      <p className="text-sm text-white/70 leading-relaxed">
                        Get exclusive early access to new collections, personalized style recommendations, and special member-only offers.
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Sparkles, text: 'Exclusive member benefits' },
                  { icon: Truck, text: 'Free shipping on first order' },
                  { icon: Shield, text: 'Secure & private shopping' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <span className="text-sm text-white/80">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/40">© {new Date().getFullYear()} MIRADEEN. All rights reserved.</p>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="heading-serif text-3xl font-bold tracking-[0.15em] mb-2">MIRADEEN</h1>
              <div className="h-px w-12 bg-gold mx-auto" />
            </div>

            <div className="mb-8">
              <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLogin ? 'Sign in to your MIRADEEN account' : 'Join the world of luxury fashion'}
              </p>
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
                      <Label className="text-xs tracking-wider uppercase">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="pl-10 h-11 border-border focus:border-gold transition-colors" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs tracking-wider uppercase">Password</Label>
                        <button type="button" className="text-[10px] text-gold hover:underline transition-colors">Forgot Password?</button>
                      </div>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="pl-10 pr-10 h-11 border-border focus:border-gold transition-colors" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300 mt-2">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input required value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className="pl-10 h-11 border-border focus:border-gold transition-colors" placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="pl-10 h-11 border-border focus:border-gold transition-colors" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Phone <span className="text-muted-foreground normal-case">(optional)</span></Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="pl-10 h-11 border-border focus:border-gold transition-colors" placeholder="+91 9876543210" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword ? 'text' : 'password'} required minLength={6} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="pl-10 pr-10 h-11 border-border focus:border-gold transition-colors" placeholder="Min 6 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300 mt-2">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={() => setIsLogin(!isLogin)} className="text-gold font-medium ml-1 hover:underline transition-colors">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-8 p-4 bg-cream dark:bg-card rounded-lg border border-border">
              <p className="text-xs font-semibold mb-2 tracking-wider uppercase">Demo Accounts</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setLoginForm({ email: 'admin@miradeen.com', password: 'admin123' });
                    if (!isLogin) setIsLogin(true);
                  }}
                  className="block w-full text-left text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
                >
                  <span className="font-medium text-foreground">Admin:</span> admin@miradeen.com / admin123
                </button>
                <button
                  onClick={() => {
                    setLoginForm({ email: 'demo@miradeen.com', password: 'user123' });
                    if (!isLogin) setIsLogin(true);
                  }}
                  className="block w-full text-left text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
                >
                  <span className="font-medium text-foreground">User:</span> demo@miradeen.com / user123
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="text-[10px] text-muted-foreground text-center mt-6">
              By continuing, you agree to MIRADEEN&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
