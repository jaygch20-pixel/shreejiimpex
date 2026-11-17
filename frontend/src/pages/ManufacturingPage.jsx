import { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function ManufacturingPage() {
  const [stages, setStages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getManufacturingStages()
      .then(({ data }) => setStages(data.data))
      .catch(() => setError('Manufacturing information could not be loaded. Please try again later.'));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-3xl" data-reveal>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#641E2D]">Manufacturing</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Our manufacturing process</h1>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && stages.length === 0 && <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">Manufacturing information will be published here soon.</p>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, index) => (
          <article key={stage._id} className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm" data-reveal>
            {stage.image?.url ? <img src={getOptimizedImageUrl(stage.image.url, 800)} alt={stage.image.alt || stage.title} loading="lazy" decoding="async" className="mb-5 h-40 w-full rounded-2xl object-cover" /> : <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F5E7C8] text-lg font-semibold text-[#641E2D]">{stage.stageNumber || index + 1}</div>}
            <h2 className="text-xl font-semibold text-stone-900">{stage.title}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-600">{stage.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
