import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function DesignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getCategories()
      .then(({ data }) => setCategories(data.data))
      .catch(() => setError('Categories could not be loaded. Please try again later.'));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    publicAPI.getDesigns({
      category,
      search: query.trim() || undefined,
      limit: 48,
    })
      .then(({ data }) => {
        if (active) setDesigns(data.data);
      })
      .catch(() => {
        if (active) setError('Designs could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [category, query]);

  const selectCategory = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete('category');
    else params.set('category', value);
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#641E2D]">Our catalogue</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Fabric designs</h1>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full max-w-md rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#641E2D]"
          placeholder="Search designs"
          aria-label="Search designs"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <button onClick={() => selectCategory('all')} className={`rounded-full px-4 py-2 text-sm font-medium ${category === 'all' ? 'bg-[#641E2D] text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200'}`}>All designs</button>
        {categories.map((item) => (
          <button key={item._id} onClick={() => selectCategory(item.slug)} className={`rounded-full px-4 py-2 text-sm font-medium ${category === item.slug ? 'bg-[#641E2D] text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200'}`}>{item.name}</button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {loading && <p className="py-8 text-stone-600">Loading designs…</p>}
      {!loading && !error && designs.length === 0 && <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">No published designs match your search.</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {designs.map((design) => (
          <Link key={design._id} to={`/designs/${design.slug}`} className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            {design.images?.[0]?.url ? <img src={getOptimizedImageUrl(design.images[0].url, 800)} alt={design.images[0].alt || design.name} loading="lazy" decoding="async" className="h-64 w-full object-cover" /> : <div className="h-64 bg-stone-100" />}
            <div className="p-6">
              <span className="rounded-full bg-[#F5E7C8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a542b]">{design.designCode}</span>
              <h2 className="mt-4 text-xl font-semibold text-stone-900">{design.name}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{design.shortDescription}</p>
              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-stone-600">
                <span>{design.moq ? `MOQ: ${design.moq}` : 'Ask about minimum order quantities'}</span>
                <span className="font-medium text-[#641E2D]">Details</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
