'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

interface FormErrors {
  [key: string]: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length < 6) return { score: 20, label: 'Weak', color: 'bg-red-500' };
  if (password.length < 8) return { score: 40, label: 'Fair', color: 'bg-orange-500' };
  if (password.length < 10) {
    const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
    return { score: hasMixed ? 60 : 40, label: hasMixed ? 'Good' : 'Fair', color: hasMixed ? 'bg-yellow-500' : 'bg-orange-500' };
  }
  const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (hasMixed && hasNumbers && hasSpecial) return { score: 100, label: 'Strong', color: 'bg-green-500' };
  if (hasMixed && hasNumbers) return { score: 80, label: 'Strong', color: 'bg-green-500' };
  if (hasMixed || hasNumbers) return { score: 60, label: 'Good', color: 'bg-yellow-500' };
  return { score: 40, label: 'Fair', color: 'bg-orange-500' };
}

export default function AuthPage() {
  const { setUser, setToken, isAuthenticated, navigate } = useStore();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  const passwordStrength = useMemo(() => getPasswordStrength(registerForm.password), [registerForm.password]);

  if (isAuthenticated) {
    navigate('profile');
    return null;
  }

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleBlur = (form: 'login' | 'register', field: string) => {
    setTouched(prev => ({ ...prev, [`${form}-${field}`]: true }));
    if (form === 'login') {
      const newErrors: FormErrors = { ...loginErrors };
      if (field === 'email' && loginForm.email && !validateEmail(loginForm.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
      if (field === 'password' && loginForm.password && loginForm.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
      setLoginErrors(newErrors);
    } else {
      const newErrors: FormErrors = { ...registerErrors };
      if (field === 'name' && registerForm.name.trim() === '') {
        newErrors.name = 'Name is required';
      } else {
        delete newErrors.name;
      }
      if (field === 'email' && registerForm.email && !validateEmail(registerForm.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
      if (field === 'password' && registerForm.password && registerForm.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
      setRegisterErrors(newErrors);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!loginForm.email.trim()) newErrors.email = 'Please enter a valid email address';
    else if (!validateEmail(loginForm.email)) newErrors.email = 'Please enter a valid email address';
    if (!loginForm.password) newErrors.password = 'Password must be at least 6 characters';
    else if (loginForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setLoginErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
    const newErrors: FormErrors = {};
    if (!registerForm.name.trim()) newErrors.name = 'Name is required';
    if (!registerForm.email.trim()) newErrors.email = 'Please enter a valid email address';
    else if (!validateEmail(registerForm.email)) newErrors.email = 'Please enter a valid email address';
    if (!registerForm.password) newErrors.password = 'Password must be at least 6 characters';
    else if (registerForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setRegisterErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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

  const showLoginError = (field: string) => touched[`login-${field}`] && loginErrors[field];
  const showRegisterError = (field: string) => touched[`register-${field}`] && registerErrors[field];

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
                        <Input
                          type="email"
                          required
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm({ ...loginForm, email: e.target.value });
                            if (showLoginError('email')) handleBlur('login', 'email');
                          }}
                          onBlur={() => handleBlur('login', 'email')}
                          className={`pl-10 h-11 border-border focus:border-gold transition-colors ${showLoginError('email') ? 'border-destructive focus:border-destructive' : ''}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      <AnimatePresence>
                        {showLoginError('email') && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1.5">
                            {loginErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs tracking-wider uppercase">Password</Label>
                        <button type="button" className="text-[10px] text-gold hover:underline transition-colors">Forgot Password?</button>
                      </div>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm({ ...loginForm, password: e.target.value });
                            if (showLoginError('password')) handleBlur('login', 'password');
                          }}
                          onBlur={() => handleBlur('login', 'password')}
                          className={`pl-10 pr-10 h-11 border-border focus:border-gold transition-colors ${showLoginError('password') ? 'border-destructive focus:border-destructive' : ''}`}
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {showLoginError('password') && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1.5">
                            {loginErrors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                      />
                      <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                        Remember me
                      </Label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300 mt-2">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Coming soon', description: 'Google login will be available shortly' })}
                        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Coming soon', description: 'Facebook login will be available shortly' })}
                        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          required
                          value={registerForm.name}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, name: e.target.value });
                            if (showRegisterError('name')) handleBlur('register', 'name');
                          }}
                          onBlur={() => handleBlur('register', 'name')}
                          className={`pl-10 h-11 border-border focus:border-gold transition-colors ${showRegisterError('name') ? 'border-destructive focus:border-destructive' : ''}`}
                          placeholder="John Doe"
                        />
                      </div>
                      <AnimatePresence>
                        {showRegisterError('name') && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1.5">
                            {registerErrors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          required
                          value={registerForm.email}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, email: e.target.value });
                            if (showRegisterError('email')) handleBlur('register', 'email');
                          }}
                          onBlur={() => handleBlur('register', 'email')}
                          className={`pl-10 h-11 border-border focus:border-gold transition-colors ${showRegisterError('email') ? 'border-destructive focus:border-destructive' : ''}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      <AnimatePresence>
                        {showRegisterError('email') && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1.5">
                            {registerErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Phone <span className="text-muted-foreground normal-case">(optional)</span></Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          className="pl-10 h-11 border-border focus:border-gold transition-colors"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs tracking-wider uppercase">Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={registerForm.password}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, password: e.target.value });
                            if (showRegisterError('password')) handleBlur('register', 'password');
                          }}
                          onBlur={() => handleBlur('register', 'password')}
                          className={`pl-10 pr-10 h-11 border-border focus:border-gold transition-colors ${showRegisterError('password') ? 'border-destructive focus:border-destructive' : ''}`}
                          placeholder="Min 6 characters"
                        />
                        <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {showRegisterError('password') && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive mt-1.5">
                            {registerErrors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Password Strength Indicator */}
                      <AnimatePresence>
                        {registerForm.password.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                                style={{ width: `${passwordStrength.score}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className={`text-xs font-medium ${
                                passwordStrength.score <= 20 ? 'text-red-500' :
                                passwordStrength.score <= 40 ? 'text-orange-500' :
                                passwordStrength.score <= 60 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {passwordStrength.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{registerForm.password.length} characters</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300 mt-2">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-3 text-muted-foreground">Or sign up with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Coming soon', description: 'Google sign up will be available shortly' })}
                        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Coming soon', description: 'Facebook sign up will be available shortly' })}
                        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button onClick={() => { setIsLogin(!isLogin); setLoginErrors({}); setRegisterErrors({}); setTouched({}); }} className="text-gold font-medium ml-1 hover:underline transition-colors">
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
