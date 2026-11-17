import { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function GalleryPage() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getGallery()
      .then(({ data }) => setImages(data.data))
      .catch(() => setError('The gallery could not be loaded. Please try again later.'));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl" data-reveal>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#641E2D]">Gallery</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Our gallery</h1>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && images.length === 0 && <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">Gallery images will appear here when published.</p>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {images.map((item) => (
          <figure key={item._id} className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-sm" data-reveal>
            {item.image?.url && <img src={getOptimizedImageUrl(item.image.url, 960)} alt={item.image.alt || item.title || 'Gallery image'} loading="lazy" decoding="async" className="h-72 w-full object-cover" />}
            {(item.title || item.description) && <figcaption className="p-5">
              {item.title && <h2 className="text-lg font-semibold text-stone-900">{item.title}</h2>}
              {item.description && <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>}
            </figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
