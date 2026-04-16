# Task 2: Fix All CRUD API Routes - Work Record

## Summary
All CRUD API routes have been audited, fixed, and secured. 17 route files were modified across both admin and public API routes.

---

## CRITICAL Security Fixes

### 1. `/api/admin/coupons/route.ts` — Missing Admin Auth (CRITICAL)
- **Problem**: All CRUD operations (GET, POST, PUT, DELETE) had **NO authentication or authorization**. Anyone could create, read, update, or delete coupons.
- **Fix**: Added `verifyAdmin()` to all 4 methods. Added input validation (discount range, type validation, percentage cap at 100%). Changed DELETE from body-based to query param-based (consistent with other routes). Added existence checks on UPDATE/DELETE. Added duplicate code check on UPDATE. Replaced `any` type with `Record<string, unknown>`.

### 2. `/api/products/route.ts` — Unauthorized Product Creation (CRITICAL)
- **Problem**: Had a POST method that only checked for auth token (not admin role), allowing any authenticated user to create products.
- **Fix**: Removed the POST method entirely. Product creation is handled exclusively by `/api/admin/products`.

### 3. `/api/contact/route.ts` — Unprotected GET Endpoint (CRITICAL)
- **Problem**: Had a GET method exposing all contact messages to the public without authentication.
- **Fix**: Removed the GET method. Contact messages are managed via `/api/admin/messages`. Added email format validation on POST.

### 4. `/api/newsletter/route.ts` — Using Wrong Database Table
- **Problem**: Was storing subscriptions in `SiteSetting` table (with key `newsletter_{email}`) instead of the proper `NewsletterSubscriber` table. Had an unprotected GET endpoint.
- **Fix**: Rewrote to use `NewsletterSubscriber` table. Added reactivation logic for existing subscribers. Added email format validation. Removed GET endpoint (admin manages via `/api/admin/newsletter`).

---

## Admin API Route Fixes (Standardized to `verifyAdmin`)

### 5. `/api/admin/products/route.ts`
- **Before**: Manual `verifyToken` auth, no validation, had PUT/DELETE (conflicts with [id] route)
- **After**: Uses `verifyAdmin`. Added pagination, search, and category filtering to GET. Added required field validation on POST (name, price, categoryId). Added category existence check. Added slug uniqueness check. Removed PUT and DELETE (handled by [id] route).

### 6. `/api/admin/orders/route.ts`
- **Before**: Manual auth, had PUT method conflicting with [id] route, no search support
- **After**: Uses `verifyAdmin`. GET now has search, pagination, user info. Removed PUT (handled by [id] route).

### 7. `/api/admin/orders/[id]/route.ts`
- **Before**: Manual auth, no existence checks, no validation
- **After**: Uses `verifyAdmin`. Added existence check on GET/PUT. Added status validation (validates against allowed status values). Added payment status validation.

### 8. `/api/admin/users/route.ts`
- **Before**: Manual auth, `if (role)` check prevented setting empty role, no self-protection
- **After**: Uses `verifyAdmin`. Changed role check to `if (role !== undefined)`. Added role validation (must be "user" or "admin"). Added self-demotion prevention. Added pagination and search. Added existence check.

### 9. `/api/admin/users/[id]/route.ts`
- **Before**: Manual auth, no DELETE handler, no safety guards
- **After**: Uses `verifyAdmin`. Added DELETE method with self-deletion prevention, admin deletion prevention, and cascade-safe cleanup (blocks users with orders instead of deleting). Added review/wishlist/recentlyViewed/contactMessage cleanup on delete.

### 10. `/api/admin/categories/route.ts`
- **Before**: Manual auth, PUT passed raw data to Prisma, DELETE didn't check for products
- **After**: Uses `verifyAdmin`. PUT now filters to allowed fields only. POST validates name uniqueness (both name and slug). DELETE checks for products in category and refuses deletion if products exist.

### 11. `/api/admin/banners/route.ts`
- **Before**: Manual auth, PUT passed raw data, POST missing required field validation, DELETE didn't check existence
- **After**: Uses `verifyAdmin`. POST validates required fields (title, image). PUT filters to allowed fields. Position validation. All methods check existence.

### 12. `/api/admin/testimonials/route.ts`
- **Before**: Manual auth, PUT passed raw data, POST missing required field validation
- **After**: Uses `verifyAdmin`. POST validates required fields (author, text) and rating range (1-5). PUT filters to allowed fields with type-safe rating parsing. All methods check existence.

### 13. `/api/admin/newsletter/route.ts`
- **Before**: Manual auth, broken `groupBy` query on createdAt (every row is unique), no PUT, no pagination
- **After**: Uses `verifyAdmin`. Fixed monthly trend to use manual grouping. Added PUT method for subscriber updates. Added pagination to GET. Added existence checks. Added duplicate email check on POST.

### 14. `/api/admin/messages/route.ts`
- **Before**: Manual auth, no DELETE, no existence checks
- **After**: Uses `verifyAdmin`. Added DELETE method. Added existence checks on PUT/DELETE.

### 15. `/api/admin/settings/route.ts`
- **Before**: Manual auth, only single key-value update
- **After**: Uses `verifyAdmin`. Added batch update support (`{ settings: { key: value } }`). Added key trimming.

### 16. `/api/admin/stats/route.ts`
- **Before**: Manual auth, broken `returningCustomers` query (invalid `having` clause syntax)
- **After**: Uses `verifyAdmin`. Fixed returning customers query using manual filter on groupBy results. Added order status breakdown.

---

## Public API Route Fixes

### 17. `/api/orders/route.ts`
- **Before**: Had PUT method allowing admin-level order updates on public route
- **After**: Removed PUT (admin updates via `/api/admin/orders/[id]`). Added user blocked check on POST. Added shipping info validation. Added product active status check. Added coupon start date validation. Added discount cap (can't exceed subtotal). Fixed user scoping (always filters by userId for non-search GET).

### 18. `/api/reviews/route.ts`
- **Before**: No duplicate review prevention, no DELETE, no product existence check
- **After**: Added duplicate review check (one review per user per product). Added DELETE method with ownership verification. Added product existence check. Added rating integer parsing. Added user info in response.

---

## Files Not Modified (Already Correct)
- `/api/admin/products/[id]/route.ts` — Already used `verifyAdmin` correctly
- `/api/admin/export/route.ts` — Already used `verifyAdmin` correctly  
- `/api/auth/login/route.ts` — Working correctly
- `/api/auth/register/route.ts` — Working correctly
- `/api/auth/me/route.ts` — Working correctly
- `/api/wishlist/route.ts` — Working correctly
- `/api/coupons/route.ts` — Working correctly
- `/api/recently-viewed/route.ts` — Working correctly
- `/api/size-guide/route.ts` — Static data, no issues

## Pre-existing Lint Issues (Not Introduced by This Task)
- `src/components/pages/AdminPages.tsx` has 4 errors referencing undefined components (`PagesSection`, `SEOSettingsSection`, `NavigationSection`, `MediaLibrarySection`) — these are UI placeholder tabs, not API-related.
