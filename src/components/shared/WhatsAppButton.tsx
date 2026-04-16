'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const phoneNumber = '7683041486';
  const message = 'Hello MIRADEEN! I would like to know more about your collection.';

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      {/* Tooltip on hover */}
      <div className="fixed bottom-6 left-6 z-40 flex items-end gap-3">
        {/* Chat popup */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-xl shadow-2xl w-72 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#25D366] p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">MIRADEEN Support</p>
                    <p className="text-[10px] opacity-90">Usually replies within minutes</p>
                  </div>
                </div>
              </div>
              {/* Body */}
              <div className="p-4">
                <div className="bg-muted rounded-lg p-3 mb-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    👋 Welcome to MIRADEEN! How can we help you today? We&apos;re here to assist with orders, sizing, or any questions about our luxury collection.
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 text-right">Just now</p>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 h-10 bg-[#25D366] text-white rounded-lg hover:bg-[#20BD5A] transition-colors text-sm font-medium"
                >
                  <Send className="h-4 w-4" />
                  Chat on WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 group"
          aria-label="WhatsApp Chat"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse animation */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        )}
      </div>
    </>
  );
}
