import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { localProductCategories, mergeProductCategories } from '../data/productCategories';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function ProductCatalogPage() {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    publicAPI.getCategories()
      .then(async ({ data }) => {
        const selected = mergeProductCategories(data.data);
        const imageResults = await Promise.all(selected.map(async (category) => {
          if (category.image?.url) return [category.slug, category.image.url];
          const response = await publicAPI.getDesigns({ category: category.slug, limit: 1 });
          return [category.slug, response.data.data[0]?.images?.[0]?.url || ''];
        }));
        if (active) {
          setCategories(selected);
          setCategoryImages(Object.fromEntries(imageResults));
        }
      })
      .catch(() => {
        if (active) {
          setCategories(localProductCategories);
          setCategoryImages({});
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10" data-reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#641E2D]">Our products</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Explore the catalogue</h1>
      </header>
      {loading && <p className="py-8 text-stone-600">Loading fabric categories…</p>}
      {!loading && categories.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">Fabric categories will appear here when available.</p>
      )}
      <div className="product-category-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const image = category.image?.url || categoryImages[category.slug];
          return (
            <Link
              key={category._id}
              to={`/products/${encodeURIComponent(category.slug)}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f8f3e9] shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
              data-reveal
            >
              {image && <img src={getOptimizedImageUrl(image, 720)} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain transition duration-700" />}
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-5 left-5 right-5 text-2xl font-semibold text-white">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
