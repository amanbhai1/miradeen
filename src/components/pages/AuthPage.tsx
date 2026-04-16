'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, ShieldCheck, Sparkles, Shield, Truck } from 'lucide-react';
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
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [forgotForm, setForgotForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });

  // OTP input state
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const passwordStrength = useMemo(() => getPasswordStrength(registerForm.password), [registerForm.password]);
  const forgotPasswordStrength = useMemo(() => getPasswordStrength(forgotForm.newPassword), [forgotForm.newPassword]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // OTP input handler
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;
    const newValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setOtpValues(newValues);
    const nextEmpty = pastedData.length < 6 ? pastedData.length : 5;
    otpRefs.current[nextEmpty]?.focus();
  }, [otpValues]);

  const isLogin = authStep === 'login';

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

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotForm.email.trim() || !validateEmail(forgotForm.email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Reset code sent', description: `Reset code sent to ${forgotForm.email}` });
      setForgotStep(2);
      setResendCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length !== 6) {
      toast({ title: 'Incomplete code', description: 'Please enter all 6 digits', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotForm(prev => ({ ...prev, code }));
      toast({ title: 'Code verified', description: 'Your identity has been confirmed' });
      setForgotStep(3);
    }, 1000);
  };

  const handleForgotStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotForm.newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'Please confirm your password correctly', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Password reset successfully!', description: 'Please sign in with your new password' });
      setAuthStep('login');
      setForgotStep(1);
      setForgotForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
      setOtpValues(['', '', '', '', '', '']);
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    toast({ title: 'Code resent', description: `A new code has been sent to ${forgotForm.email}` });
    setResendCooldown(60);
    setOtpValues(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
          {/* morph-blob decoration */}
          <div className="morph-blob absolute w-96 h-96 bg-gold/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
          <div className="morph-blob absolute w-72 h-72 bg-gold/5 rounded-full blur-3xl bottom-20 right-10 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <h1 className="heading-serif text-4xl font-bold tracking-[0.15em] mb-2">MIRADEEN</h1>
              <div className="h-px w-16 bg-gold mb-6" />
            </div>

            <div className="max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={authStep === 'forgot' ? 'forgot-brand' : authStep === 'login' ? 'login-brand' : 'register-brand'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {authStep === 'forgot' ? (
                    <>
                      <p className="text-xs tracking-[0.3em] uppercase text-gold-light mb-4">Account Recovery</p>
                      <h2 className="heading-serif text-3xl font-bold mb-4 leading-tight">
                        Reset your password and regain access
                      </h2>
                      <p className="text-sm text-white/70 leading-relaxed">
                        We'll help you securely reset your password in just a few simple steps. Your account security is our top priority.
                      </p>
                    </>
                  ) : isLogin ? (
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

            <div className="border border-border hover:border-gold/20 transition-colors rounded-xl p-8 card-shine">
              {/* Header */}
              {authStep === 'forgot' ? (
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => { setAuthStep('login'); setForgotStep(1); setForgotForm({ email: '', code: '', newPassword: '', confirmPassword: '' }); }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-4 group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                  </button>
                  <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">
                    {forgotStep === 1 && 'Reset Your Password'}
                    {forgotStep === 2 && 'Enter Verification Code'}
                    {forgotStep === 3 && 'Set New Password'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {forgotStep === 1 && "Enter your email address and we'll send you a reset code"}
                    {forgotStep === 2 && `We've sent a 6-digit code to ${forgotForm.email}`}
                    {forgotStep === 3 && 'Choose a strong new password for your account'}
                  </p>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="heading-serif text-2xl md:text-3xl font-bold mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? 'Sign in to your MIRADEEN account' : 'Join the world of luxury fashion'}
                  </p>
                </div>
              )}

            <AnimatePresence mode="wait">
              <motion.div
                key={authStep === 'forgot' ? `forgot-${forgotStep}` : isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {authStep === 'forgot' ? (
                  <>
                    {/* Forgot Password Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
                            forgotStep >= step
                              ? 'bg-gold text-black'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {forgotStep > step ? <ShieldCheck className="h-3.5 w-3.5" /> : step}
                          </div>
                          {step < 3 && (
                            <div className={`w-8 h-px transition-colors duration-300 ${
                              forgotStep > step ? 'bg-gold' : 'bg-border'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-6 text-[10px] text-muted-foreground">
                      <span className={forgotStep >= 1 ? 'text-gold font-medium' : ''}>Email</span>
                      <span>→</span>
                      <span className={forgotStep >= 2 ? 'text-gold font-medium' : ''}>Verify</span>
                      <span>→</span>
                      <span className={forgotStep >= 3 ? 'text-gold font-medium' : ''}>New Password</span>
                    </div>

                    {/* Step 1: Enter Email */}
                    {forgotStep === 1 && (
                      <form onSubmit={handleForgotStep1} className="space-y-4">
                        <div>
                          <Label className="text-xs tracking-wider uppercase">Email Address</Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              required
                              value={forgotForm.email}
                              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                              className="pl-10 h-11 border-border focus:border-gold transition-colors"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-gold text-black hover:bg-gold/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300">
                          {loading ? (
                            <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <>Send Reset Code <ArrowRight className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </form>
                    )}

                    {/* Step 2: Enter OTP Code */}
                    {forgotStep === 2 && (
                      <form onSubmit={handleForgotStep2} className="space-y-6">
                        <div>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                ref={(el) => { otpRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otpValues[index]}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                className={`w-11 h-[52px] text-center text-lg font-semibold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold ${
                                  otpValues[index] ? 'border-gold/40 bg-gold/5' : 'border-border bg-background'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <Button type="submit" disabled={loading || otpValues.join('').length !== 6} className="w-full h-12 bg-gold text-black hover:bg-gold/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300">
                          {loading ? (
                            <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <><KeyRound className="mr-2 h-4 w-4" /> Verify Code</>
                          )}
                        </Button>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Didn't receive the code?{' '}
                            <button
                              type="button"
                              onClick={handleResendCode}
                              disabled={resendCooldown > 0}
                              className={`font-medium transition-colors ${
                                resendCooldown > 0
                                  ? 'text-muted-foreground cursor-not-allowed'
                                  : 'text-gold hover:text-gold/80'
                              }`}
                            >
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </p>
                        </div>
                      </form>
                    )}

                    {/* Step 3: New Password */}
                    {forgotStep === 3 && (
                      <form onSubmit={handleForgotStep3} className="space-y-4">
                        <div>
                          <Label className="text-xs tracking-wider uppercase">New Password</Label>
                          <div className="relative mt-1.5">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showForgotPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={forgotForm.newPassword}
                              onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                              className="pl-10 pr-10 h-11 border-border focus:border-gold transition-colors"
                              placeholder="Min 6 characters"
                            />
                            <button type="button" onClick={() => setShowForgotPassword(!showForgotPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                              {showForgotPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Password Strength Meter */}
                          {forgotForm.newPassword.length > 0 && (
                            <div className="mt-2">
                              <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ease-out ${forgotPasswordStrength.color}`}
                                  style={{ width: `${forgotPasswordStrength.score}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className={`text-xs font-medium ${
                                  forgotPasswordStrength.score <= 20 ? 'text-red-500' :
                                  forgotPasswordStrength.score <= 40 ? 'text-orange-500' :
                                  forgotPasswordStrength.score <= 60 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {forgotPasswordStrength.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{forgotForm.newPassword.length} characters</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">Confirm Password</Label>
                          <div className="relative mt-1.5">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showForgotConfirmPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={forgotForm.confirmPassword}
                              onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                              className={`pl-10 pr-10 h-11 border-border focus:border-gold transition-colors ${
                                forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword ? 'border-destructive focus:border-destructive' : ''
                              }`}
                              placeholder="Re-enter password"
                            />
                            <button type="button" onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                              {showForgotConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword && (
                            <p className="text-xs text-destructive mt-1.5">Passwords don't match</p>
                          )}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-gold text-black hover:bg-gold/90 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-300">
                          {loading ? (
                            <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <><ShieldCheck className="mr-2 h-4 w-4" /> Reset Password</>
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                ) : isLogin ? (
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
                        <button type="button" onClick={() => setAuthStep('forgot')} className="text-[10px] text-gold hover:underline relative group transition-colors">
                          Forgot Password?
                          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                        </button>
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
              {authStep !== 'forgot' && (
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button onClick={() => { setAuthStep(isLogin ? 'register' : 'login'); setLoginErrors({}); setRegisterErrors({}); setTouched({}); }} className="text-gold font-medium ml-1 hover:underline transition-colors">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              )}
            </div>

            {/* Demo Accounts */}
            <div className="mt-8 p-4 bg-cream dark:bg-card rounded-lg border border-gold/20 glass-card">
              <p className="text-xs font-semibold mb-2 tracking-wider uppercase text-gold">Demo Accounts</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setLoginForm({ email: 'admin@miradeen.com', password: 'admin123' });
                    if (authStep !== 'login') setAuthStep('login');
                  }}
                  className="block w-full text-left text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
                >
                  <span className="font-medium text-foreground">Admin:</span> admin@miradeen.com / admin123
                </button>
                <button
                  onClick={() => {
                    setLoginForm({ email: 'demo@miradeen.com', password: 'user123' });
                    if (authStep !== 'login') setAuthStep('login');
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
    </div>
  );
}
