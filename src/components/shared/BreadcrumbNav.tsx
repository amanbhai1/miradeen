'use client';

import { ChevronRight, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface BreadcrumbItem {
  label: string;
  page?: 'home' | 'shop' | 'cart' | 'about' | 'contact' | 'wishlist' | 'auth' | 'profile' | 'orders';
}

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useStore((s) => s.navigate);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground py-2 overflow-x-auto">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 shrink-0">
          {i > 0 && <ChevronRight className="h-3 w-3 text-border" />}
          {i === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : item.page ? (
            <button
              onClick={() => navigate(item.page!)}
              className="hover:text-gold transition-colors flex items-center gap-1"
            >
              {i === 0 && <Home className="h-3 w-3" />}
              {item.label}
            </button>
          ) : (
            <span className="flex items-center gap-1">
              {i === 0 && <Home className="h-3 w-3" />}
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
