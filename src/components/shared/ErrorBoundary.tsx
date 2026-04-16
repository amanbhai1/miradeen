'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MIRADEEN ErrorBoundary] Caught error:', error);
    console.error('[MIRADEEN ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  resetErrorBoundary = () => {
    const { currentPage }: Record<string, string> = (window as unknown as Record<string, unknown>).__NEXT_DATA__ || {};
    if (currentPage !== '/') {
      const storeState = localStorage.getItem('miradeen-store');
      if (storeState) {
        try {
          const parsed = JSON.parse(storeState);
          if (parsed?.state?.currentPage) {
            (window as unknown as Record<string, () => void>).__FORCE_NAVIGATE_HOME = () => {
              localStorage.setItem('miradeen-store', JSON.stringify({
                ...parsed,
                state: { ...parsed.state, currentPage: 'home' }
              }));
              window.location.href = '/';
            };
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden noise-overlay">
          {/* Subtle decorative background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/[0.03] blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold/[0.02] blur-3xl" />
          </div>

          <motion.div
            className="relative z-10 max-w-lg mx-auto px-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* MIRADEEN Logo */}
            <motion.h1
              className="heading-serif text-gold-gradient text-4xl sm:text-5xl font-bold tracking-wide mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MIRADEEN
            </motion.h1>

            {/* Decorative gold diamond separator */}
            <motion.div
              className="flex items-center justify-center gap-3 my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
              <div className="w-2.5 h-2.5 bg-gold/60 rotate-45 flex-shrink-0" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
            </motion.div>

            {/* Error Icon */}
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-full border border-gold/20 flex items-center justify-center bg-gold/[0.04]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <svg
                className="w-7 h-7 text-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="heading-serif text-2xl sm:text-3xl text-foreground font-semibold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Something Went Wrong
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              We apologize for the inconvenience. Please try refreshing
              the page or go back to our homepage.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {/* Go to Homepage Button */}
              <button
                onClick={this.resetErrorBoundary}
                className="btn-luxury px-8 py-3 bg-foreground text-primary-foreground rounded-lg text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90 min-w-[180px]"
              >
                Go to Homepage
              </button>

              {/* Refresh Page Button */}
              <button
                onClick={() => window.location.reload()}
                className="btn-luxury px-8 py-3 border border-gold/30 text-foreground rounded-lg text-sm font-medium tracking-wide hover:border-gold/60 hover:bg-gold/[0.04] transition-all duration-300 min-w-[180px]"
              >
                Refresh Page
              </button>
            </motion.div>

            {/* Error details (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                className="mt-8 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-card border border-border rounded-lg text-xs text-muted-foreground overflow-auto max-h-48 custom-scrollbar">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </motion.details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
