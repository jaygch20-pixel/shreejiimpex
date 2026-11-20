export const localProductCategories = [
  {
    _id: 'local-real-wax',
    name: 'Real Wax',
    slug: 'real-wax',
    isLocal: true,
    images: [
      '/images/products/real-wax/real-wax-01.jpeg',
      '/images/products/real-wax/real-wax-02.jpeg',
      '/images/products/real-wax/real-wax-03.jpeg',
      '/images/products/real-wax/real-wax-04.jpeg',
      '/images/products/real-wax/real-wax-05.jpeg',
      '/images/products/real-wax/real-wax-06.jpeg',
      '/images/products/real-wax/real-wax-07.jpeg',
      '/images/products/real-wax/real-wax-08.jpeg',
      '/images/products/real-wax/real-wax-09.jpeg',
      '/images/products/real-wax/real-wax-10.jpeg',
      '/images/products/real-wax/real-wax-11.jpeg',
    ],
  },
  {
    _id: 'local-ankara-print',
    name: 'Ankara Print',
    slug: 'ankara-print',
    isLocal: true,
    images: [
      '/images/products/ankara-print/ankara-print-01.jpeg',
      '/images/products/ankara-print/ankara-print-02.jpeg',
      '/images/products/ankara-print/ankara-print-03.jpeg',
      '/images/products/ankara-print/ankara-print-04.jpeg',
      '/images/products/ankara-print/ankara-print-05.jpeg',
    ],
  },
  {
    _id: 'local-rainbow-color',
    name: 'Rainbow Color',
    slug: 'rainbow-color',
    isLocal: true,
    images: [
      '/images/products/rainbow-color/rainbow-color-01.jpeg',
      '/images/products/rainbow-color/rainbow-color-02.jpeg',
      '/images/products/rainbow-color/rainbow-color-03.jpeg',
      '/images/products/rainbow-color/rainbow-color-04.jpeg',
      '/images/products/rainbow-color/rainbow-color-05.jpeg',
    ],
  },
  {
    _id: 'local-angel',
    name: 'Angel',
    slug: 'angel',
    isLocal: true,
    images: [
      '/images/products/angel/angel-01.jpeg',
      '/images/products/angel/angel-02.jpeg',
      '/images/products/angel/angel-03.jpeg',
      '/images/products/angel/angel-04.jpeg',
      '/images/products/angel/angel-05.jpeg',
      '/images/products/angel/angel-06.jpeg',
    ],
  },
  {
    _id: 'local-java',
    name: 'Java',
    slug: 'java',
    isLocal: true,
    images: [
      '/images/products/java/java-01.jpeg',
      '/images/products/java/java-02.jpeg',
      '/images/products/java/java-03.jpeg',
    ],
  },
].map((category, index) => ({
  ...category,
  sortOrder: index,
  image: {
    url: `/images/products/${category.slug}/cover.webp`,
    alt: `${category.name} printed cotton fabric cover`,
  },
}));

export function mergeProductCategories(apiCategories = []) {
  const categoriesBySlug = new Map(
    apiCategories.map((category) => [category.slug, category]),
  );
  const localCategories = localProductCategories.map((category) => ({
    ...categoriesBySlug.get(category.slug),
    ...category,
    _id: categoriesBySlug.get(category.slug)?._id || category._id,
  }));
  const localSlugs = new Set(localProductCategories.map((category) => category.slug));
  const otherCategories = apiCategories.filter((category) => !localSlugs.has(category.slug));

  return [...localCategories, ...otherCategories];
}
