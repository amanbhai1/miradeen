import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding MIRADEEN database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await db.user.upsert({
    where: { email: 'admin@miradeen.com' },
    update: {},
    create: {
      name: 'MIRADEEN Admin',
      email: 'admin@miradeen.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9319084050',
    },
  });
  console.log('✅ Admin user created');

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 10);
  const demoUser = await db.user.upsert({
    where: { email: 'demo@miradeen.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@miradeen.com',
      password: userPassword,
      role: 'user',
      phone: '9876543210',
    },
  });
  console.log('✅ Demo user created');

  // Create categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: 'men' },
      update: {},
      create: {
        name: 'Men',
        slug: 'men',
        description: 'Premium menswear collection',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: 'women' },
      update: {},
      create: {
        name: 'Women',
        slug: 'women',
        description: 'Exquisite womenswear collection',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Luxury accessories and more',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        sortOrder: 3,
      },
    }),
    db.category.upsert({
      where: { slug: 'new-arrivals' },
      update: {},
      create: {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        description: 'Latest additions to our collection',
        sortOrder: 4,
      },
    }),
  ]);
  console.log('✅ Categories created');

  // Create products
  const productsData = [
    // Men's Collection
    {
      name: 'The Sovereign Blazer',
      slug: 'sovereign-blazer',
      description: 'A masterfully crafted blazer that embodies the essence of modern luxury. Made from premium Italian wool with a silk-blend lining, this piece features hand-stitched lapels and a tailored fit that commands attention. The deep midnight hue adds versatility to any wardrobe.',
      shortDesc: 'Premium Italian wool blazer with silk lining',
      price: 18999,
      comparePrice: 24999,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        'https://images.unsplash.com/photo-1593030103066-0093718e7177?w=800',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      ]),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Black', 'Navy', 'Charcoal']),
      stock: 25,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      tags: 'blazer,formal,luxury,wool',
    },
    {
      name: 'Velvet Evening Shirt',
      slug: 'velvet-evening-shirt',
      description: 'Indulge in the luxurious softness of our velvet evening shirt. Crafted with meticulous attention to detail, this shirt features a subtle sheen that catches the light beautifully. Perfect for formal occasions and upscale events.',
      shortDesc: 'Luxurious velvet evening shirt',
      price: 7999,
      comparePrice: 10999,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800',
      ]),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Burgundy', 'Black', 'Emerald']),
      stock: 30,
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      tags: 'shirt,velvet,evening,formal',
    },
    {
      name: 'Cashmere Overcoat',
      slug: 'cashmere-overcoat',
      description: 'Wrap yourself in pure luxury with our cashmere overcoat. This timeless piece is crafted from 100% Mongolian cashmere, offering unparalleled warmth and softness. The clean lines and minimalist design make it a wardrobe essential for the discerning gentleman.',
      shortDesc: '100% Mongolian cashmere overcoat',
      price: 34999,
      comparePrice: 44999,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544923246-77307dd270cd?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      ]),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Camel', 'Black', 'Grey']),
      stock: 15,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      tags: 'coat,cashmere,winter,luxury',
    },
    {
      name: 'Silk Blend Trousers',
      slug: 'silk-blend-trousers',
      description: 'Elevate your formal wear with our silk blend trousers. Featuring a contemporary slim fit and a luxurious fabric blend, these trousers offer both comfort and sophistication. The subtle sheen adds an understated elegance.',
      shortDesc: 'Premium silk blend formal trousers',
      price: 5999,
      comparePrice: 7999,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      ]),
      sizes: JSON.stringify(['28', '30', '32', '34', '36']),
      colors: JSON.stringify(['Black', 'Navy', 'Beige']),
      stock: 40,
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      tags: 'trousers,silk,formal,slim-fit',
    },
    // Women's Collection
    {
      name: 'The Empress Gown',
      slug: 'empress-gown',
      description: 'A breathtaking gown that channels the grace and power of royalty. This flowing silk chiffon creation features delicate hand-embroidered details and a flattering silhouette. Every stitch tells a story of uncompromising craftsmanship.',
      shortDesc: 'Flowing silk chiffon gown with hand embroidery',
      price: 42999,
      comparePrice: 55999,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
      ]),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Gold', 'Ivory', 'Rose']),
      stock: 10,
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      tags: 'gown,silk,evening,luxury',
    },
    {
      name: 'Artisan Silk Blouse',
      slug: 'artisan-silk-blouse',
      description: 'Our signature silk blouse combines fluid fabric with artistic design. The draped silhouette moves like water, creating an ethereal effect. Handcrafted from the finest mulberry silk with mother-of-pearl buttons.',
      shortDesc: 'Handcrafted mulberry silk blouse',
      price: 8999,
      comparePrice: 12999,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800',
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
      ]),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Cream', 'Blush', 'Champagne']),
      stock: 35,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      tags: 'blouse,silk,artisan,luxury',
    },
    {
      name: 'Heritage Lehenga Set',
      slug: 'heritage-lehenga-set',
      description: 'A celebration of traditional artistry meets contemporary design. This lehenga set features intricate zardozi work on rich velvet, paired with a matching dupatta. Each piece takes over 200 hours of handwork to complete.',
      shortDesc: 'Handcrafted velvet lehenga with zardozi work',
      price: 54999,
      comparePrice: 69999,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
      ]),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Royal Blue', 'Deep Red', 'Emerald']),
      stock: 8,
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      tags: 'lehenga,ethnic,bridal,luxury',
    },
    {
      name: 'Satin Wrap Dress',
      slug: 'satin-wrap-dress',
      description: 'The epitome of effortless luxury. Our satin wrap dress features a fluid drape that flatters every figure. The rich satin fabric catches light beautifully, making it perfect for both daytime elegance and evening glamour.',
      shortDesc: 'Fluid satin wrap dress',
      price: 6999,
      comparePrice: 8999,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      ]),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['Black', 'Wine', 'Forest Green']),
      stock: 20,
      isFeatured: false,
      isNewArrival: true,
      isBestseller: true,
      tags: 'dress,satin,wrap,elegant',
    },
    // Accessories
    {
      name: 'Heritage Leather Bag',
      slug: 'heritage-leather-bag',
      description: 'A statement piece crafted from the finest full-grain leather. This bag features hand-stitched detailing, gold-tone hardware, and a spacious interior. Each bag is individually numbered, making it a true collector\'s item.',
      shortDesc: 'Hand-stitched full-grain leather bag',
      price: 15999,
      comparePrice: 19999,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      ]),
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Tan', 'Black', 'Cognac']),
      stock: 12,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      tags: 'bag,leather,luxury,handcrafted',
    },
    {
      name: 'Crystal Silk Scarf',
      slug: 'crystal-silk-scarf',
      description: 'A wearable work of art. This pure silk scarf features an original print inspired by fluid fabric movements and silk flow. The hand-rolled edges and vibrant colors make it a versatile accessory for any season.',
      shortDesc: 'Pure silk scarf with original print',
      price: 3999,
      comparePrice: 5499,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      ]),
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Multicolor', 'Monochrome', 'Jewel Tones']),
      stock: 50,
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      tags: 'scarf,silk,art,print',
    },
    {
      name: 'Obsidian Watch',
      slug: 'obsidian-watch',
      description: 'Timeless elegance meets modern design in our signature timepiece. The obsidian-black ceramic case houses a Swiss movement, while the sapphire crystal ensures durability. The hand-stitched alligator strap adds the final touch of luxury.',
      shortDesc: 'Swiss movement ceramic timepiece',
      price: 79999,
      comparePrice: 99999,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
      ]),
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Black', 'Rose Gold']),
      stock: 5,
      isFeatured: true,
      isNewArrival: false,
      isBestseller: false,
      tags: 'watch,luxury,ceramic,swiss',
    },
    {
      name: 'Heritage Sunglasses',
      slug: 'heritage-sunglasses',
      description: 'Crafted from premium acetate with polarized lenses, our heritage sunglasses offer both style and substance. The oversized frame design evokes classic Hollywood glamour while modern details keep them firmly in the present.',
      shortDesc: 'Premium acetate polarized sunglasses',
      price: 4999,
      comparePrice: 6999,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
      ]),
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Black', 'Tortoise', 'Gold']),
      stock: 30,
      isFeatured: false,
      isNewArrival: true,
      isBestseller: true,
      tags: 'sunglasses,acetate,polarized,fashion',
    },
  ];

  for (const product of productsData) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log('✅ Products created');

  // Create coupons
  const coupons = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', minOrder: 2000, maxUses: 1000 },
    { code: 'MIRADEEN20', discount: 20, type: 'percentage', minOrder: 5000, maxUses: 500 },
    { code: 'FLAT500', discount: 500, type: 'fixed', minOrder: 3000, maxUses: 2000 },
    { code: 'LUXURY30', discount: 30, type: 'percentage', minOrder: 10000, maxUses: 100 },
  ];

  for (const coupon of coupons) {
    await db.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log('✅ Coupons created');

  // Create banners
  const banners = [
    {
      title: 'Redefining Luxury Fashion',
      subtitle: 'Discover the new collection — Where craftsmanship meets artistry',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920',
      position: 'hero',
      sortOrder: 1,
    },
    {
      title: 'New Season Arrivals',
      subtitle: 'Fluid strokes, silk movement, artistic craftsmanship',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920',
      position: 'mid',
      sortOrder: 1,
    },
    {
      title: 'The Art of Dressing',
      subtitle: 'Every piece tells a story of uncompromising quality',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920',
      position: 'bottom',
      sortOrder: 1,
    },
  ];

  for (const banner of banners) {
    await db.banner.upsert({
      where: { id: banner.title.toLowerCase().replace(/\s+/g, '-') + '-banner' },
      update: {},
      create: { ...banner, id: banner.title.toLowerCase().replace(/\s+/g, '-') + '-banner' },
    });
  }
  console.log('✅ Banners created');

  // Create site settings
  const settings = [
    { key: 'about_title', value: 'Our Story' },
    { key: 'about_content', value: 'Born from a passion for fluid fabric and artistic craftsmanship, MIRADEEN represents the pinnacle of luxury fashion. Our journey began with a simple vision — to create clothing that moves like silk, feels like a second skin, and tells a story of uncompromising quality. Every stitch, every fabric choice, every design element is a testament to our commitment to excellence. We believe that true luxury lies in the details — the hand-finished seams, the carefully sourced materials, the hours of artisan craftsmanship that go into each piece.' },
    { key: 'brand_tagline', value: 'Redefining Luxury Fashion' },
    { key: 'brand_mission', value: 'To craft garments that transcend trends, blending timeless elegance with contemporary design to create pieces that are as unique as the individuals who wear them.' },
    { key: 'contact_email', value: 'merajkhan6188@gmail.com' },
    { key: 'contact_phone', value: '9319084050' },
    { key: 'contact_whatsapp', value: '7683041486' },
    { key: 'free_shipping_min', value: '2000' },
  ];

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Site settings created');

  // Create sample reviews
  const sampleReviews = [
    { rating: 5, title: 'Absolutely Stunning', comment: 'The quality is beyond anything I\'ve experienced. The fabric feels incredibly luxurious and the fit is perfect. MIRADEEN has set a new standard for luxury fashion.', productId: productsData[0].slug },
    { rating: 5, title: 'Worth Every Penny', comment: 'The craftsmanship is exceptional. You can feel the quality the moment you touch the fabric. This is what true luxury feels like.', productId: productsData[4].slug },
    { rating: 4, title: 'Beautiful Design', comment: 'Elegant and sophisticated. The attention to detail is remarkable. Shipping was fast and the packaging was beautiful.', productId: productsData[5].slug },
    { rating: 5, title: 'My Go-To Brand', comment: 'MIRADEEN never disappoints. The quality is consistent across all their pieces. I\'m a customer for life.', productId: productsData[2].slug },
    { rating: 5, title: 'Exceeded Expectations', comment: 'The silk blouse is even more beautiful in person. The drape is perfect and the color is exactly as shown. Exceptional quality.', productId: productsData[8].slug },
  ];

  for (let i = 0; i < sampleReviews.length; i++) {
    const review = sampleReviews[i];
    const product = await db.product.findUnique({ where: { slug: review.productId } });
    if (product) {
      await db.review.create({
        data: {
          userId: demoUser.id,
          productId: product.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
        },
      });
    }
  }
  console.log('✅ Reviews created');

  // Create size charts
  const sizeChartData = [
    // Men's Clothing
    { category: 'men', type: 'clothing', size: 'XS', measurements: JSON.stringify({ chest: '34"', waist: '28"', shoulder: '16.5"', length: '26"' }) },
    { category: 'men', type: 'clothing', size: 'S', measurements: JSON.stringify({ chest: '36"', waist: '30"', shoulder: '17"', length: '27"' }) },
    { category: 'men', type: 'clothing', size: 'M', measurements: JSON.stringify({ chest: '38"', waist: '32"', shoulder: '18"', length: '28"' }) },
    { category: 'men', type: 'clothing', size: 'L', measurements: JSON.stringify({ chest: '40"', waist: '34"', shoulder: '19"', length: '29"' }) },
    { category: 'men', type: 'clothing', size: 'XL', measurements: JSON.stringify({ chest: '42"', waist: '36"', shoulder: '20"', length: '30"' }) },
    { category: 'men', type: 'clothing', size: 'XXL', measurements: JSON.stringify({ chest: '44"', waist: '38"', shoulder: '21"', length: '31"' }) },
    // Men's Shoes
    { category: 'men', type: 'shoes', size: 'UK 6 / EU 39', measurements: JSON.stringify({ footLength: '24.5 cm', usSize: '7' }) },
    { category: 'men', type: 'shoes', size: 'UK 7 / EU 40', measurements: JSON.stringify({ footLength: '25.5 cm', usSize: '8' }) },
    { category: 'men', type: 'shoes', size: 'UK 8 / EU 41', measurements: JSON.stringify({ footLength: '26 cm', usSize: '9' }) },
    { category: 'men', type: 'shoes', size: 'UK 9 / EU 42', measurements: JSON.stringify({ footLength: '27 cm', usSize: '10' }) },
    { category: 'men', type: 'shoes', size: 'UK 10 / EU 43', measurements: JSON.stringify({ footLength: '28 cm', usSize: '11' }) },
    { category: 'men', type: 'shoes', size: 'UK 11 / EU 44', measurements: JSON.stringify({ footLength: '29 cm', usSize: '12' }) },
    // Women's Clothing
    { category: 'women', type: 'clothing', size: 'XS', measurements: JSON.stringify({ bust: '31-32"', waist: '24-25"', hips: '33-34"', length: '24"' }) },
    { category: 'women', type: 'clothing', size: 'S', measurements: JSON.stringify({ bust: '33-34"', waist: '26-27"', hips: '35-36"', length: '25"' }) },
    { category: 'women', type: 'clothing', size: 'M', measurements: JSON.stringify({ bust: '35-36"', waist: '28-29"', hips: '37-38"', length: '26"' }) },
    { category: 'women', type: 'clothing', size: 'L', measurements: JSON.stringify({ bust: '37-38"', waist: '30-31"', hips: '39-40"', length: '27"' }) },
    { category: 'women', type: 'clothing', size: 'XL', measurements: JSON.stringify({ bust: '39-40"', waist: '32-33"', hips: '41-42"', length: '28"' }) },
    { category: 'women', type: 'clothing', size: 'XXL', measurements: JSON.stringify({ bust: '41-42"', waist: '34-35"', hips: '43-44"', length: '29"' }) },
    // Women's Shoes
    { category: 'women', type: 'shoes', size: 'UK 3 / EU 36', measurements: JSON.stringify({ footLength: '22.5 cm', usSize: '5' }) },
    { category: 'women', type: 'shoes', size: 'UK 4 / EU 37', measurements: JSON.stringify({ footLength: '23.5 cm', usSize: '6' }) },
    { category: 'women', type: 'shoes', size: 'UK 5 / EU 38', measurements: JSON.stringify({ footLength: '24 cm', usSize: '7' }) },
    { category: 'women', type: 'shoes', size: 'UK 6 / EU 39', measurements: JSON.stringify({ footLength: '25 cm', usSize: '8' }) },
    { category: 'women', type: 'shoes', size: 'UK 7 / EU 40', measurements: JSON.stringify({ footLength: '25.5 cm', usSize: '9' }) },
    // Accessories (general)
    { category: 'accessories', type: 'accessories', size: 'One Size', measurements: JSON.stringify({ note: 'Adjustable / Universal fit' }) },
  ];

  for (const item of sizeChartData) {
    await db.sizeChart.create({ data: item });
  }
  console.log('✅ Size charts created');

  console.log('\n🎉 MIRADEEN database seeded successfully!');
  console.log('\n👤 Admin Login: admin@miradeen.com / admin123');
  console.log('👤 Demo User: demo@miradeen.com / user123');
  console.log('\n🎟️ Coupon Codes: WELCOME10, MIRADEEN20, FLAT500, LUXURY30');
}

seed()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
