import { useEffect, useState } from 'react';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

export function AboutPage() {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getAllContent()
      .then(({ data }) => {
        const content = data.data || {};
        setSections(['about_intro', 'about_story', 'about_mission', 'about_values']
          .map((key) => content[key])
          .filter(Boolean));
      })
      .catch(() => setError('Company information could not be loaded. Please try again later.'));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-3xl" data-reveal>
        <p className="text-sm font-medium uppercase tracking-[0.26em] text-[#641E2D]">About</p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-900 sm:text-5xl">About Shreeji Impex</h1>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && sections.length === 0 && <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600">Company information will be published here soon.</p>}
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.section} className="grid gap-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_0.8fr] md:p-8" data-reveal>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#641E2D]">{section.tagline}</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-900">{section.heading || section.title}</h2>
              {(section.subheading || section.subtitle) && <h3 className="mt-2 text-lg text-stone-700">{section.subheading || section.subtitle}</h3>}
              {section.body && <p className="mt-4 whitespace-pre-line text-base leading-7 text-stone-600">{section.body}</p>}
              {section.blocks?.map((block, index) => (
                <div key={`${section.section}-${index}`} className="mt-5">
                  {block.heading && <h3 className="font-semibold text-stone-900">{block.heading}</h3>}
                  {block.body && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-600">{block.body}</p>}
                </div>
              ))}
            </div>
            {section.images?.[0]?.url && <img src={getOptimizedImageUrl(section.images[0].url, 1000)} alt={section.images[0].alt || section.heading || 'Company'} loading="lazy" decoding="async" className="h-full min-h-56 w-full rounded-2xl object-cover" />}
          </section>
        ))}
      </div>
    </div>
  );
}
