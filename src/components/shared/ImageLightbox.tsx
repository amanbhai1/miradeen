'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { parseJsonField } from '@/types';

export default function ImageLightbox({
  images,
  alt = 'Product',
  isOpen,
  onClose,
  initialIndex = 0,
}: {
  images: string[];
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const safeImages = Array.isArray(images) ? images : [];

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setIsZoomed(false);
    setTranslate({ x: 0, y: 0 });
  };

  const goPrev = () => goTo((currentIndex - 1 + safeImages.length) % safeImages.length);
  const goNext = () => goTo((currentIndex + 1) % safeImages.length);

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 1));

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    const dx = (e.clientX - dragStart.x) * 0.5;
    const dy = (e.clientY - dragStart.y) * 0.5;
    setTranslate({ x: dx, y: dy });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  const handleDoubleClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoom(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoom(1.8);
    }
  };

  if (!isOpen || safeImages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Controls overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-4 right-4 z-10 flex items-center gap-2"
        >
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-white/80 text-xs font-medium">{currentIndex + 1} / {safeImages.length}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            className="w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            className="w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Main image area */}
        <div
          className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4 cursor-zoom-in"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={() => setIsZoomed(false)}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={safeImages[currentIndex] || '/placeholder.jpg'}
              alt={`${alt} - Image ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: translate.x,
                y: translate.y,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-h-[80vh] max-w-full object-contain"
              style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Navigation arrows */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {safeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    i === currentIndex
                      ? 'border-gold scale-105 shadow-lg shadow-gold/20'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 pointer-events-none"
        >
          <div className="text-center">
            <p className="text-white/90 text-sm font-medium">{alt}</p>
            <p className="text-white/50 text-xs mt-1">
              {isZoomed ? 'Double-click to reset zoom • Scroll to zoom' : 'Click image to zoom • Scroll to zoom'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
