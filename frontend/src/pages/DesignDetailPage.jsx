import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function DesignDetailPage() {
  const { slug } = useParams();
  const [design, setDesign] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    publicAPI.getDesignBySlug(slug)
      .then(({ data }) => {
        if (active) setDesign(data.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 404 ? 'This design is not available.' : 'Design details could not be loaded.');
      });
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8" data-reveal><Link to="/products" className="text-sm font-medium text-[#641E2D] hover:underline">← Back to products</Link></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && !design && <p className="py-8 text-stone-600">Loading design…</p>}
      {design && (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4" data-reveal>
            {design.images?.[0]?.url ? <img src={getOptimizedImageUrl(design.images[0].url, 1200)} alt={design.images[0].alt || design.name} fetchPriority="high" decoding="async" className="h-[420px] w-full rounded-[28px] object-cover shadow-lg" /> : <div className="h-[420px] rounded-[28px] bg-stone-100" />}
            <div className="grid gap-4 sm:grid-cols-2">
              {design.images?.slice(1).map((image, index) => <img key={image.publicId || image.url || index} src={getOptimizedImageUrl(image.url, 640)} alt={image.alt || `${design.name} image ${index + 2}`} loading="lazy" decoding="async" className="h-52 w-full rounded-[22px] object-cover" />)}
            </div>
          </div>
          <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm" data-reveal>
            <span className="rounded-full bg-[#F5E7C8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a542b]">{design.designCode}</span>
            <h1 className="mt-4 text-3xl font-semibold text-stone-900">{design.name}</h1>
            {design.category?.name && <p className="mt-2 text-sm text-stone-500">{design.category.name}</p>}
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-stone-600">{design.description || design.shortDescription}</p>
            <dl className="mt-6 space-y-4 border-y border-stone-200 py-6 text-sm text-stone-700">
              {[
                ['Fabric', design.fabricType],
                ['Fabric width', design.fabricWidth],
                ['Weight', design.weight],
                ['Minimum order quantity', design.moq],
                ['Available colors', design.availableColors?.join(', ')],
                ['Colors', design.colorDescription],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="text-right font-medium">{value}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
