'use client';

import React from 'react';
import Script from 'next/script';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductSEOProps {
  name: string;
  image: string[];
  description: string;
  sku: string;
  price: number | string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number | string;
  reviewCount?: number | string;
  url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Schema (static)
// ─────────────────────────────────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MIRADEEN',
  alternateName: 'Miradeen Luxury Fashion',
  url: 'https://miradeen.com',
  logo: 'https://miradeen.com/logo.png',
  description:
    'Redefining Luxury Fashion — Premium designer clothing for men and women',
  foundingDate: '2020',
  founder: {
    '@type': 'Person',
    name: 'Meraj Khan',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9319084050',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://instagram.com/miradeen',
    'https://facebook.com/miradeen',
    'https://twitter.com/miradeen',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// WebSite Schema (static)
// ─────────────────────────────────────────────────────────────────────────────

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MIRADEEN',
  url: 'https://miradeen.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://miradeen.com/shop?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO — main component that injects Organization & WebSite JSON-LD schemas
// ─────────────────────────────────────────────────────────────────────────────

export function SEO() {
  return (
    <>
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductSEO — injects a Product JSON-LD schema for product pages
// ─────────────────────────────────────────────────────────────────────────────

export function ProductSEO({
  name,
  image,
  description,
  sku,
  price,
  availability = 'InStock',
  ratingValue,
  reviewCount,
  url,
}: ProductSEOProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image,
    description,
    sku,
    brand: {
      '@type': 'Brand',
      name: 'MIRADEEN',
    },
    offers: {
      '@type': 'Offer',
      url: url ?? `https://miradeen.com/product/${sku}`,
      priceCurrency: 'INR',
      price: String(price),
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'MIRADEEN',
      },
    },
  };

  // Only include aggregateRating when we have actual data
  if (ratingValue !== undefined && reviewCount !== undefined) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
    };
  }

  return (
    <Script
      id="schema-product"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy exports — kept for backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Use <SEO /> instead */
export const OrganizationSchema = SEO;

/** @deprecated Use <SEO /> instead */
export const WebSiteSchema = SEO;

/** @deprecated Use <ProductSEO /> instead */
export type ProductSchemaProps = ProductSEOProps;

/** @deprecated Use <ProductSEO /> instead */
export function ProductSchema(props: ProductSEOProps) {
  return <ProductSEO {...props} />;
}

/** @deprecated Use <SEO /> instead */
export function GlobalSchemas() {
  return <SEO />;
}
