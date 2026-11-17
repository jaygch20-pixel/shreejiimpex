const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Design = require('../models/Design');
const ManufacturingStage = require('../models/ManufacturingStage');
const WebsiteContent = require('../models/WebsiteContent');
const GalleryImage = require('../models/GalleryImage');

const SAMPLE_IMAGES = {
  heroFabric: '/demo-assets/kitango-01.svg',
  fabric1: '/demo-assets/kitango-01.svg',
  fabric2: '/demo-assets/kitango-02.svg',
  fabric3: '/demo-assets/kitango-03.svg',
  fabric4: '/demo-assets/kitango-04.svg',
  factory1: '/demo-assets/process-loom.svg',
  factory2: '/demo-assets/process-finishing.svg',
  textile1: '/demo-assets/kitango-05.svg',
  textile2: '/demo-assets/kitango-06.svg',
  cotton: '/demo-assets/process-cotton.svg',
  printing: '/demo-assets/process-printing.svg',
  packaging: '/demo-assets/process-packaging.svg',
  quality: '/demo-assets/process-quality.svg',
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be set in backend/.env.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const seedAdmin = async () => {
  if (process.env.SKIP_ADMIN_SEED === 'true') {
    console.log('⚠️  Admin creation skipped. Set ADMIN_EMAIL_SEED and ADMIN_PASSWORD_SEED in backend/.env to enable demo admin login.');
    return;
  }

  const email = process.env.ADMIN_EMAIL_SEED?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD_SEED;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL_SEED and ADMIN_PASSWORD_SEED in backend/.env before seeding an admin.');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD_SEED must contain at least 8 characters.');
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log('⚠️  Admin already exists, skipping...');
    return;
  }
  await Admin.create({
    name: process.env.ADMIN_NAME_SEED?.trim() || 'Administrator',
    email,
    password,
    role: 'super_admin',
  });
  console.log(`✅ Admin ${email} created.`);
};

const seedCategories = async () => {
  const categories = [
    { name: 'Java', slug: 'java', legacySlugs: ['floral'], description: 'Fictional Java-style textile print concepts for preview.', image: { url: SAMPLE_IMAGES.fabric1, alt: 'Demo Java-inspired textile illustration' }, sortOrder: 1, isActive: true, isSampleData: true },
    { name: 'Ankara', slug: 'ankara', legacySlugs: ['traditional-african'], description: 'Fictional Ankara-style textile print concepts for preview.', image: { url: SAMPLE_IMAGES.fabric2, alt: 'Demo Ankara-inspired textile illustration' }, sortOrder: 2, isActive: true, isSampleData: true },
    { name: 'Kente', slug: 'kente', legacySlugs: ['geometric'], description: 'Fictional Kente-inspired textile print concepts for preview.', image: { url: SAMPLE_IMAGES.fabric3, alt: 'Demo Kente-inspired textile illustration' }, sortOrder: 3, isActive: true, isSampleData: true },
    { name: 'Other Prints', slug: 'other-prints', legacySlugs: ['modern'], description: 'Fictional contemporary Kitenge-style print concepts for preview.', image: { url: SAMPLE_IMAGES.fabric4, alt: 'Demo contemporary textile illustration' }, sortOrder: 4, isActive: true, isSampleData: true },
  ];

  for (const cat of categories) {
    const { legacySlugs, ...categoryData } = cat;
    const existing = await Category.findOne({ slug: { $in: [cat.slug, ...legacySlugs] } });
    if (!existing) await Category.create(categoryData);
    else if (existing.isSampleData) await Category.updateOne({ _id: existing._id }, categoryData);
  }
  console.log('✅ Categories seeded');
  return await Category.find({ slug: { $in: categories.map((category) => category.slug) } });
};

const seedDesigns = async (categories) => {
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c._id; });

  const designs = [
    {
      name: 'Royal Floral', designCode: 'SI-001',
      slug: 'royal-floral-si-001',
      description: 'An exquisite floral print featuring large, vibrant blooms inspired by the rich botanical heritage of West Africa. This design showcases intricate petal patterns in warm, traditional colors that celebrate nature\'s beauty. ⚠️ SAMPLE DATA — Replace with actual product description.',
      shortDescription: 'Vibrant floral blooms in traditional African color palette.',
      category: catMap['java'],
      images: [{ url: SAMPLE_IMAGES.fabric1, publicId: 'sample_si001_1', alt: 'Royal Floral fabric design - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      fabricWidth: '44/45 inches (Sample)',
      availableColors: ['Red', 'Yellow', 'Green', 'Blue'],
      moq: '500 meters (Sample)',
      customizationAvailable: true,
      isFeatured: true, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['floral', 'traditional', 'colorful'],
    },
    {
      name: 'African Heritage', designCode: 'SI-002',
      slug: 'african-heritage-si-002',
      description: 'A timeless design drawing inspiration from the rich cultural tapestry of East Africa. Features traditional motifs, symbolic patterns, and bold color combinations that honor centuries of textile artistry. ⚠️ SAMPLE DATA — Replace with actual product description.',
      shortDescription: 'Traditional East African motifs in bold, symbolic patterns.',
      category: catMap['ankara'],
      images: [{ url: SAMPLE_IMAGES.fabric2, publicId: 'sample_si002_1', alt: 'African Heritage fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      fabricWidth: '44/45 inches (Sample)',
      availableColors: ['Burgundy', 'Mustard', 'Brown', 'Cream'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: true, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['traditional', 'heritage', 'cultural'],
    },
    {
      name: 'Golden Geometry', designCode: 'SI-003',
      slug: 'golden-geometry-si-003',
      description: 'Mathematical precision meets African artistry in this stunning geometric collection. Bold interlocking shapes and golden tones create a fabric that is both modern and deeply rooted in African geometric traditions. ⚠️ SAMPLE DATA — Replace with actual product description.',
      shortDescription: 'Bold geometric patterns in warm golden tones.',
      category: catMap['kente'],
      images: [{ url: SAMPLE_IMAGES.fabric3, publicId: 'sample_si003_1', alt: 'Golden Geometry fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      fabricWidth: '44/45 inches (Sample)',
      availableColors: ['Gold', 'Black', 'White', 'Bronze'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: true, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['geometric', 'gold', 'modern'],
    },
    {
      name: 'Tropical Bloom', designCode: 'SI-004',
      slug: 'tropical-bloom-si-004',
      description: 'Lush tropical flowers and foliage rendered in vivid Kitenge style, capturing the essence of tropical African landscapes. A celebration of colour and natural abundance. ⚠️ SAMPLE DATA — Replace with actual product description.',
      shortDescription: 'Lush tropical florals in vivid Kitenge style.',
      category: catMap['java'],
      images: [{ url: SAMPLE_IMAGES.fabric4, publicId: 'sample_si004_1', alt: 'Tropical Bloom fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Green', 'Pink', 'Orange', 'Yellow'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['floral', 'tropical', 'vibrant'],
    },
    {
      name: 'Classic Ankara', designCode: 'SI-005',
      slug: 'classic-ankara-si-005',
      description: 'The classic Ankara print style that has defined African fashion for generations. Featuring bold patterns, rich contrasting colours and the distinctive wax-resist aesthetic beloved across the continent. ⚠️ SAMPLE DATA — Replace with actual product description.',
      shortDescription: 'The iconic Ankara pattern beloved across Africa.',
      category: catMap['ankara'],
      images: [{ url: SAMPLE_IMAGES.textile1, publicId: 'sample_si005_1', alt: 'Classic Ankara fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Blue', 'Orange', 'Green', 'Red', 'Yellow'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: true, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['ankara', 'classic', 'traditional'],
    },
    {
      name: 'Tribal Essence', designCode: 'SI-006',
      slug: 'tribal-essence-si-006',
      description: 'Distilled from the visual language of African tribal art, this design captures the geometric complexity and symbolic power of indigenous artistic traditions. Perfect for ceremonial and fashion use. ⚠️ SAMPLE DATA.',
      shortDescription: 'Geometric tribal patterns with deep cultural roots.',
      category: catMap['kente'],
      images: [{ url: SAMPLE_IMAGES.textile2, publicId: 'sample_si006_1', alt: 'Tribal Essence fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Terracotta', 'Cream', 'Brown', 'Black'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['tribal', 'geometric', 'cultural'],
    },
    {
      name: 'Modern Elegance', designCode: 'SI-007',
      slug: 'modern-elegance-si-007',
      description: 'Where contemporary design sensibility meets African print tradition. Clean lines, sophisticated colour palettes and refined patterns create a fabric suitable for high-end fashion and corporate applications. ⚠️ SAMPLE DATA.',
      shortDescription: 'Contemporary African print with sophisticated elegance.',
      category: catMap['other-prints'],
      images: [{ url: SAMPLE_IMAGES.fabric1, publicId: 'sample_si007_1', alt: 'Modern Elegance fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Navy', 'Silver', 'White', 'Gold'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['modern', 'elegant', 'contemporary'],
    },
    {
      name: 'Colorful Tradition', designCode: 'SI-008',
      slug: 'colorful-tradition-si-008',
      description: 'An explosion of joyful colour in the great tradition of African celebration fabrics. This design captures the festive spirit and communal joy that defines African textile culture at its most vibrant. ⚠️ SAMPLE DATA.',
      shortDescription: 'Joyful, vibrant celebration fabric in full colour.',
      category: catMap['ankara'],
      images: [{ url: SAMPLE_IMAGES.fabric2, publicId: 'sample_si008_1', alt: 'Colorful Tradition fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Multicolor', 'Rainbow spectrum'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['colorful', 'celebration', 'traditional'],
    },
    {
      name: 'Savanna Sunrise', designCode: 'SI-009',
      slug: 'savanna-sunrise-si-009',
      description: 'Warm amber, burnt sienna and deep ochre tones evoke the breathtaking colors of an African savanna at sunrise. A warm, earthy design perfect for home textiles and fashion. ⚠️ SAMPLE DATA.',
      shortDescription: 'Warm earthy tones inspired by the African savanna.',
      category: catMap['other-prints'],
      images: [{ url: SAMPLE_IMAGES.fabric3, publicId: 'sample_si009_1', alt: 'Savanna Sunrise fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Amber', 'Sienna', 'Ochre', 'Brown'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['abstract', 'earth tones', 'nature'],
    },
    {
      name: 'Kente Inspired', designCode: 'SI-010',
      slug: 'kente-inspired-si-010',
      description: 'Drawing inspiration from the celebrated Kente cloth tradition of West Africa, this printed cotton fabric interprets the iconic interwoven strip patterns in a modern, accessible format. ⚠️ SAMPLE DATA.',
      shortDescription: 'Kente-inspired patterns on premium printed cotton.',
      category: catMap['ankara'],
      images: [{ url: SAMPLE_IMAGES.fabric4, publicId: 'sample_si010_1', alt: 'Kente Inspired fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Gold', 'Green', 'Red', 'Black'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['kente', 'west african', 'strip pattern'],
    },
    {
      name: 'Ocean Batik', designCode: 'SI-011',
      slug: 'ocean-batik-si-011',
      description: 'Fluid, wave-like patterns in deep ocean blues and sea greens create a fabric that evokes the coastal regions of Africa. The batik-inspired print technique adds texture and depth to the design. ⚠️ SAMPLE DATA.',
      shortDescription: 'Fluid ocean-inspired patterns in coastal blues and greens.',
      category: catMap['other-prints'],
      images: [{ url: SAMPLE_IMAGES.textile1, publicId: 'sample_si011_1', alt: 'Ocean Batik fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Ocean Blue', 'Teal', 'Seafoam', 'Navy'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['abstract', 'ocean', 'batik'],
    },
    {
      name: 'Desert Rose', designCode: 'SI-012',
      slug: 'desert-rose-si-012',
      description: 'Inspired by the resilient beauty of flowers that bloom in arid landscapes, this design features delicate rose patterns in warm desert tones. A unique combination of fragility and strength. ⚠️ SAMPLE DATA.',
      shortDescription: 'Delicate rose patterns in warm desert earth tones.',
      category: catMap['java'],
      images: [{ url: SAMPLE_IMAGES.textile2, publicId: 'sample_si012_1', alt: 'Desert Rose fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Rose', 'Sand', 'Terracotta', 'Cream'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['floral', 'desert', 'rose'],
    },
    {
      name: 'Urban Kitenge', designCode: 'SI-013',
      slug: 'urban-kitenge-si-013',
      description: 'A fresh, urban interpretation of the classic Kitenge aesthetic. Bold graphic elements meet traditional African print sensibilities to create a design that speaks to contemporary African urban culture. ⚠️ SAMPLE DATA.',
      shortDescription: 'Bold urban graphics with traditional Kitenge roots.',
      category: catMap['other-prints'],
      images: [{ url: SAMPLE_IMAGES.fabric1, publicId: 'sample_si013_1', alt: 'Urban Kitenge fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Black', 'White', 'Red', 'Electric Blue'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: true, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['modern', 'urban', 'kitenge'],
    },
    {
      name: 'Harvest Festival', designCode: 'SI-014',
      slug: 'harvest-festival-si-014',
      description: 'Celebrating Africa\'s agricultural abundance, this design features joyful harvest motifs — fruits, grains and botanical elements — in warm, festive colors that evoke celebration and gratitude. ⚠️ SAMPLE DATA.',
      shortDescription: 'Joyful harvest motifs in festive, warm colors.',
      category: catMap['java'],
      images: [{ url: SAMPLE_IMAGES.fabric2, publicId: 'sample_si014_1', alt: 'Harvest Festival fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Orange', 'Green', 'Brown', 'Yellow'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['harvest', 'festival', 'botanical'],
    },
    {
      name: 'Midnight Stars', designCode: 'SI-015',
      slug: 'midnight-stars-si-015',
      description: 'An elegant, celestial-inspired pattern featuring star formations and night-sky motifs in deep indigo and silver. This design bridges the ancient African knowledge of astronomy with modern textile aesthetics. ⚠️ SAMPLE DATA.',
      shortDescription: 'Celestial star patterns in deep indigo and silver.',
      category: catMap['other-prints'],
      images: [{ url: SAMPLE_IMAGES.fabric3, publicId: 'sample_si015_1', alt: 'Midnight Stars fabric - SAMPLE', isPrimary: true }],
      fabricType: '100% Cotton (Sample Specification)',
      availableColors: ['Indigo', 'Silver', 'Midnight Blue', 'Lavender'],
      moq: '500 meters (Sample)', customizationAvailable: true,
      isFeatured: false, isNewArrival: false, status: 'published', isPublished: true, isActive: true, isSampleData: true,
      publishedAt: new Date(), tags: ['modern', 'celestial', 'night sky'],
    },
  ];

  let created = 0;
  for (const design of designs) {
    const existing = await Design.findOne({ designCode: design.designCode });
    if (!existing) {
      await Design.create(design);
      created++;
    } else if (existing.isSampleData) await Design.updateOne({ _id: existing._id }, design);
  }
  console.log(`✅ ${created} designs seeded (${designs.length - created} already existed)`);
};

const seedManufacturingStages = async () => {
  const stages = [
    {
      stageNumber: 1, title: 'White Cotton Fabric',
      description: 'We begin with premium quality white cotton fabric, carefully selected for optimal weight, weave consistency and printability. Our cotton base fabric meets international quality standards for exported textile products. ⚠️ SAMPLE DATA — Update with actual specifications.',
      icon: 'layers', isSampleData: true,
      image: { url: SAMPLE_IMAGES.cotton, publicId: 'sample_stage_1', alt: 'White cotton fabric base - SAMPLE' },
    },
    {
      stageNumber: 2, title: 'Design Preparation',
      description: 'Customer-provided designs or our in-house design library are professionally prepared for printing. Artwork is color-separated, screen-prepared and test-printed to ensure perfect reproduction on cotton fabric. ⚠️ SAMPLE DATA.',
      icon: 'edit', isSampleData: true,
      image: { url: SAMPLE_IMAGES.printing, publicId: 'sample_stage_2', alt: 'Design preparation stage - SAMPLE' },
    },
    {
      stageNumber: 3, title: 'Fabric Printing',
      description: 'Using modern printing equipment and high-quality reactive dyes, we apply the prepared designs onto the white cotton fabric. Our printing process ensures vibrant colour output with excellent wash fastness and colour consistency across each production run. ⚠️ SAMPLE DATA.',
      icon: 'printer', isSampleData: true,
      image: { url: SAMPLE_IMAGES.factory1, publicId: 'sample_stage_3', alt: 'Fabric printing process - SAMPLE' },
    },
    {
      stageNumber: 4, title: 'Finishing Process',
      description: 'Printed fabric undergoes thorough finishing: washing, drying and chemical finishing treatments to enhance colour fastness, hand feel and dimensional stability. This ensures the fabric meets the requirements of international markets. ⚠️ SAMPLE DATA.',
      icon: 'wind', isSampleData: true,
      image: { url: SAMPLE_IMAGES.factory2, publicId: 'sample_stage_4', alt: 'Finishing process - SAMPLE' },
    },
    {
      stageNumber: 5, title: 'Quality Inspection',
      description: 'Every metre of fabric is carefully inspected for print accuracy, colour consistency, fabric defects and dimensional correctness. Only fabric that meets our quality standards is approved for packaging and export. ⚠️ SAMPLE DATA.',
      icon: 'check-circle', isSampleData: true,
      image: { url: SAMPLE_IMAGES.quality, publicId: 'sample_stage_5', alt: 'Quality inspection stage - SAMPLE' },
    },
    {
      stageNumber: 6, title: 'Packaging & Dispatch',
      description: 'Approved fabric is folded or rolled to customer specifications and carefully packaged for international export. Each shipment is documented with fabric details, quality certificates and export paperwork. ⚠️ SAMPLE DATA.',
      icon: 'package', isSampleData: true,
      image: { url: SAMPLE_IMAGES.packaging, publicId: 'sample_stage_6', alt: 'Packaging and dispatch - SAMPLE' },
    },
  ];

  let created = 0;
  for (const stage of stages) {
    const existing = await ManufacturingStage.findOne({ stageNumber: stage.stageNumber });
    if (!existing) { await ManufacturingStage.create(stage); created++; }
    else if (existing.isSampleData) await ManufacturingStage.updateOne({ _id: existing._id }, stage);
  }
  console.log(`✅ ${created} manufacturing stages seeded`);
};

const seedWebsiteContent = async () => {
  const sections = [
    {
      section: 'branding',
      tagline: 'Premium Printed Cotton Fabric for Global Markets.',
      data: {
        companyName: 'Shreeji Impex',
        logoText: 'SI',
        logoSubtext: 'SHREEJI IMPEX',
        primaryColor: '#641E2D',
        accentColor: '#D6A747',
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'homepage_hero',
      heading: 'Premium Printed Cotton Fabric for Global Markets',
      subheading: 'Textile printing solutions for domestic and international business buyers.',
      body: 'Explore Shreeji Impex fabric designs and contact our team about your sourcing requirements.',
      data: {
        ctaPrimary: { text: 'Explore Our Products', link: '/products' },
        ctaSecondary: { text: 'Request a Quote', link: '/contact' },
        highlightStats: [
          { label: 'Years Experience', value: 'Est. XXXX', note: '(Sample — Update)' },
          { label: 'Design Catalogue', value: '100+', note: '(Sample)' },
          { label: 'Export Markets', value: 'International', note: '' },
        ],
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'homepage_why_choose',
      heading: 'A sample preview of a textile partner experience',
      blocks: [
        { heading: 'Print concepts', body: 'Review illustrated Kitango-inspired patterns. They are original demo graphics, not actual product photography.' },
        { heading: 'Wholesale enquiries', body: 'Use the public enquiry form to try the buyer journey without creating an account.' },
        { heading: 'Made for your requirements', body: 'These sample statements are placeholders and must be replaced with verified company capabilities.' },
      ],
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'homepage_cta',
      heading: 'Have a fabric idea in mind?',
      body: 'Send a sample enquiry to preview the customer flow. All product details on this demo site are fictional.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'homepage_intro',
      heading: 'Africa\'s Vibrant Textile Traditions, Delivered Worldwide',
      subheading: 'Your Trusted Manufacturing Partner for Kitenge & Kitango Printed Cotton Fabric',
      body: `⚠️ SAMPLE CONTENT — Replace this with the actual company introduction. 

Shreeji Impex is a dedicated textile manufacturer specialising in the production of Kitenge and Kitango printed cotton fabrics for the African market and international buyers worldwide.

We work with wholesale buyers, fabric distributors, importers and fashion businesses who require high-quality African printed cotton fabric delivered reliably and professionally.

Our manufacturing process begins with carefully selected white cotton fabric. We then apply customer-provided or our own in-house designs using modern printing technology, before completing finishing, quality inspection and professional export packaging.

[This text is SAMPLE DATA. Please replace it with accurate company information through the admin dashboard.]`,
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'about_intro',
      heading: 'About Shreeji Impex',
      subheading: 'Your Trusted Manufacturing Partner for African Printed Cotton Fabric',
      body: `⚠️ SAMPLE CONTENT — Replace with actual About Us information.

Shreeji Impex is a textile manufacturing company specialising in the production of Kitenge and Kitango printed cotton fabrics. We serve international wholesale buyers, fabric distributors and importers who require quality African printed cotton fabric.

[Establishment Year: To be confirmed]
[Factory Location: To be confirmed]
[Production Capacity: To be confirmed]

This content is SAMPLE DATA. Please update it with accurate company information through the admin dashboard.`,
      data: {
        establishedYear: 'XXXX (Sample)',
        location: 'Location to be confirmed',
        expertise: 'Kitenge & Kitango Printed Cotton Fabric',
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'about_story',
      heading: 'A sample company story',
      body: 'This fictional story is included only to preview the layout. Replace it with company-approved history, location, and capabilities before sharing the site.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'about_mission',
      heading: 'Our sample mission',
      body: 'A placeholder statement for previewing this section. It does not describe verified company policies or commitments.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'about_values',
      heading: 'Sample values',
      blocks: [
        { heading: 'Quality', body: 'Placeholder — replace with verified quality practices.' },
        { heading: 'Partnership', body: 'Placeholder — replace with approved company values.' },
        { heading: 'Reliability', body: 'Placeholder — replace with verified service commitments.' },
      ],
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'custom_printing',
      heading: 'Custom printing (sample)',
      body: 'Example copy for visual review only. Confirm all printing processes and capabilities with the company before publication.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'quality_packaging',
      heading: 'Quality and packaging (sample)',
      body: 'Example placeholder content. Do not treat this as a verified quality-control or packaging claim.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'export_global',
      heading: 'Export information (sample)',
      body: 'Example placeholder copy for the website preview. Replace with confirmed markets, shipping practices, and export documentation details.',
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'contact_info',
      data: {
        note: '⚠️ ALL CONTACT DETAILS BELOW ARE SAMPLE PLACEHOLDERS. Do not share or publish until verified.',
        address: '[Factory Address — To be provided]',
        city: '[City — To be provided]',
        country: '[Country — To be provided]',
        email: 'contact@shreejiimpex.com (SAMPLE)',
        phone: '+XX XXXX XXXXXX (SAMPLE)',
        whatsapp: '+XX XXXX XXXXXX (SAMPLE)',
        businessHours: 'Monday – Saturday: 9:00 AM – 6:00 PM (Local Time)',
        mapEmbedUrl: '',
        socialLinks: {
          linkedin: '',
          facebook: '',
          instagram: '',
          twitter: '',
        },
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'footer',
      data: {
        tagline: 'Premium Printed Cotton Fabric for Global Markets.',
        description: 'Printed cotton fabric collections and textile printing solutions for business buyers.',
        copyrightYear: new Date().getFullYear(),
        companyName: 'Shreeji Impex',
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
    {
      section: 'seo_global',
      title: 'Shreeji Impex | Premium Printed Cotton Fabric',
      data: {
        description: 'Explore Shreeji Impex printed cotton fabric collections and textile printing solutions for global markets.',
        keywords: 'Kitenge fabric manufacturer, African printed cotton fabric, Kitango fabric supplier, African fabric wholesale, custom printed fabric',
        ogImage: SAMPLE_IMAGES.heroFabric,
      },
      status: 'published', publishedAt: new Date(), isSampleData: true,
    },
  ];

  let created = 0;
  for (const content of sections) {
    const existing = await WebsiteContent.findOne({ section: content.section });
    if (!existing) { await WebsiteContent.create(content); created++; }
    else if (existing.isSampleData) await WebsiteContent.updateOne({ _id: existing._id }, content);
  }
  console.log(`✅ ${created} website content sections seeded`);
};

const seedGallery = async () => {
  const images = [
    { title: 'Factory Overview (Sample)', category: 'factory', image: { url: SAMPLE_IMAGES.factory1, publicId: 'sample_gal_1', alt: 'Factory overview - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 1 },
    { title: 'Production Floor (Sample)', category: 'printing', image: { url: SAMPLE_IMAGES.factory2, publicId: 'sample_gal_2', alt: 'Production floor - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 2 },
    { title: 'Fabric Collection Display (Sample)', category: 'collections', image: { url: SAMPLE_IMAGES.fabric1, publicId: 'sample_gal_3', alt: 'Fabric collection display - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 3 },
    { title: 'Quality Check Process (Sample)', category: 'quality', image: { url: SAMPLE_IMAGES.quality, publicId: 'sample_gal_4', alt: 'Quality inspection - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 4 },
    { title: 'Export Packaging (Sample)', category: 'packaging', image: { url: SAMPLE_IMAGES.packaging, publicId: 'sample_gal_5', alt: 'Export packaging - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 5 },
    { title: 'Fabric Rolls (Sample)', category: 'collections', image: { url: SAMPLE_IMAGES.fabric2, publicId: 'sample_gal_6', alt: 'Fabric rolls - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 6 },
    { title: 'Printing Equipment (Sample)', category: 'printing', image: { url: SAMPLE_IMAGES.printing, publicId: 'sample_gal_7', alt: 'Printing equipment - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 7 },
    { title: 'Cotton Base Fabric (Sample)', category: 'factory', image: { url: SAMPLE_IMAGES.cotton, publicId: 'sample_gal_8', alt: 'Cotton base fabric - SAMPLE PLACEHOLDER' }, isSampleData: true, sortOrder: 8 },
  ];

  let created = 0;
  for (const img of images) {
    const existing = await GalleryImage.findOne({ 'image.publicId': img.image.publicId });
    if (!existing) { await GalleryImage.create(img); created++; }
    else if (existing.isSampleData) await GalleryImage.updateOne({ _id: existing._id }, img);
  }
  console.log(`✅ ${created} gallery images seeded`);
};

const main = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seed...\n');
    await seedAdmin();
    const categories = await seedCategories();
    await seedDesigns(categories);
    if (process.env.SHOW_SAMPLE_DATA_PREVIEW === 'true') {
      await Category.updateMany(
        { isSampleData: true, slug: { $nin: ['java', 'ankara', 'kente', 'other-prints'] } },
        { $set: { isActive: false } },
      );
    }
    await seedManufacturingStages();
    await seedWebsiteContent();
    await seedGallery();

    console.log('\n✅ Database seeded successfully!');
    console.log('\n⚠️  IMPORTANT REMINDERS:');
    console.log('   1. Change the admin password immediately after first login');
    console.log('   2. All seeded designs, images and content are marked as SAMPLE DATA');
    console.log('   3. Demo Kitango-style artwork is an illustration, not product photography');
    console.log('   4. Update all sample contact information with verified details');
    console.log('   5. Never publish sample data as verified company information\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

main();
