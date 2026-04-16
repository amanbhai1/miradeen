---
Task ID: 3-d
Agent: Frontend Enhancement Developer
Task: Enhance ProductPage with better UX and features

Work Log:

## Changes Made to `/home/z/my-project/src/components/pages/ProductPage.tsx`

### 1. Image Lightbox Integration
- Imported `ImageLightbox` from `@/components/shared/ImageLightbox`
- Added `lightboxOpen` and `lightboxIndex` state variables
- Main product image now has `cursor-zoom-in` class and `onClick` handler to open lightbox
- Added zoom hint overlay with Eye icon on hover
- Lightbox rendered at bottom of component with proper props (`images`, `alt`, `isOpen`, `onClose`, `initialIndex`)

### 2. Enhanced Size Selection
- "Select size" placeholder shown when no size is selected (instead of just "Select")
- "One size" shown when sizes array is empty
- Added subtle gold dot indicator (1.5px circle) below selected size button
- Added warning text with AlertTriangle icon when no size selected: "Please select a size to continue"
- Added validation toast in `handleAddToCart` and `handleBuyNow` — warns user with destructive toast if they try to proceed without selecting a size

### 3. Stock Status Badge
- Added colored badge near price with 3 states:
  - Green "In Stock" (with Check icon) for stock > 5
  - Orange "Only X Left" (with AlertTriangle icon) for stock 1-5
  - Red "Out of Stock" (with AlertTriangle icon) for stock 0
- Uses pill-style with appropriate light background, text color, and border
- Includes dark mode variants

### 4. Enhanced Color Selection
- Added `COLOR_HEX_MAP` — maps 30+ common color names to hex values
- Added `getColorHex()` and `getColorBorderClass()` helper functions
- Each color button now shows a 4x4 circle preview next to the color name
- White/cream/ivory circles get an additional border for visibility
- All existing functionality preserved (selection highlighting, hover effects)

### 5. Product Tags
- Parses `product.tags` JSON field using `parseJsonField<string>`
- Tags displayed as small pill badges below the description
- Each tag is clickable — calls `setSearchQuery(tag)` then `navigate('shop')` to filter shop page
- Tags use consistent styling: uppercase, tracking-wider, border, hover gold effect

### 6. Improved Action Buttons Styling
- "Add to Cart" button: h-12, `btn-luxury` class with shimmer effect
- "Buy Now" button: h-12, `btn-luxury` class, consistent with Add to Cart
- Both buttons use `tracking-[0.1em] uppercase text-xs font-semibold` for luxury feel
- Separated `handleBuyNow` function with its own size validation

### 7. Enhanced Recommendations Section
- Mobile: horizontal scrollable row with snap-x snap-mandatory
- Desktop: 4-column grid (lg:grid-cols-4)
- Added "View All" link with ArrowRight icon (hidden on mobile, visible on desktop)
- Added mobile-specific "View All Recommendations" link at bottom
- Cards use `min-w-[200px] sm:min-w-[220px] lg:min-w-0` for proper sizing
- Added `scrollbar-hide` class, snap-x behavior, and proper padding

## Additional Improvements
- Added `ArrowRight` and `AlertTriangle` to lucide-react imports
- Added `setSearchQuery` from useStore for tag navigation
- Main image has subtle scale animation on hover (`group-hover:scale-[1.02]`)
- All click handlers on overlay buttons use `e.stopPropagation()` to prevent lightbox opening
- Fixed recommendations variable shadowing (renamed inner `sizes` to `recSizes`)

## Lint Status
- ProductPage.tsx: **0 errors, 0 warnings**
- Pre-existing errors in Navbar.tsx (3 errors) — not related to this task

## Files Modified
- `src/components/pages/ProductPage.tsx` — Enhanced with all 7 features
