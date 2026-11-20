import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { localProductCategories } from '../data/productCategories';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function CategoryGalleryPage() {
  const { category: slug } = useParams();
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const localCategory = localProductCategories.find((item) => item.slug === slug);
    if (localCategory) {
      setCategory(localCategory);
      setImages(localCategory.images.map((url, index) => ({
        url,
        key: `${localCategory.slug}-${index + 1}`,
        alt: `${localCategory.name} printed cotton fabric design ${index + 1}`,
      })));
      setLoading(false);
      return () => { active = false; };
    }

    Promise.all([
      publicAPI.getCategories(),
      publicAPI.getDesigns({ category: slug, limit: 100 }),
    ])
      .then(([categoryResponse, designResponse]) => {
        const selectedCategory = categoryResponse.data.data.find((item) => item.slug === slug);
        if (!selectedCategory) {
          if (active) setError('This fabric category could not be found.');
          return;
        }

        const designImages = designResponse.data.data.flatMap((design) => (
          (design.images || []).map((image, index) => ({
            ...image,
            key: `${design._id}-${image.publicId || image.url || index}`,
            alt: image.alt || `${selectedCategory.name} fabric design`,
          }))
        ));
        if (active) {
          setCategory(selectedCategory);
          setImages(designImages);
        }
      })
      .catch(() => {
        if (active) setError('Fabric images could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex items-center justify-between gap-4" data-reveal>
        <Link to="/products" className="text-sm font-medium text-[#641E2D] hover:underline">← All fabric categories</Link>
        {category && <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">{category.name}</h1>}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {loading && <p className="py-8 text-stone-600">Loading fabric images…</p>}
      {!loading && !error && images.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">No fabric images are available for this category yet.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <figure key={image.key} className="aspect-[4/5] overflow-hidden rounded-xl bg-[#f8f3e9]" data-reveal>
            <img src={getOptimizedImageUrl(image.url, 1000)} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </figure>
        ))}
      </div>
    </div>
  );
}
