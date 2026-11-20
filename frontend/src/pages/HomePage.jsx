import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { coreValues, homeHeroImages } from '../data/siteData';
import { localProductCategories, mergeProductCategories } from '../data/productCategories';
import { publicAPI } from '../services/api';
import { getOptimizedImageUrl } from '../services/imageUrl';

const valueIcons = {
  integrity: BadgeCheck,
  customizable: Sparkles,
  satisfaction: HeartHandshake,
};

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let active = true;
    publicAPI.getCategories()
      .then(async (categoryResponse) => {
        const selected = mergeProductCategories(categoryResponse.data.data);
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
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % homeHeroImages.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <section className="home-hero relative isolate -mt-[76px] overflow-hidden bg-[#24191b] text-white sm:-mt-[84px]" aria-label="Featured textile designs">
        {homeHeroImages.map((image, index) => (
          <img
            key={image}
            src={getOptimizedImageUrl(image, 1920)}
            alt=""
            aria-hidden="true"
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${index === slide ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25" />
        <div className="relative mx-auto flex min-h-[570px] max-w-7xl items-center px-4 pb-14 pt-32 sm:px-6 sm:pt-36 lg:min-h-[660px] lg:px-8">
          <div className="max-w-3xl" data-reveal>
            <p className="mb-5 inline-flex rounded-full border border-white/30 bg-black/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#f4d378] backdrop-blur-sm">
              Textile Printing for Global Markets
            </p>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium Printed Cotton Fabric for Global Markets
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              Explore our fabric designs and talk with our team about your sourcing requirements.
            </p>
            <Link to="/products" className="mt-8 inline-flex rounded-full bg-[#D6A747] px-7 py-3.5 text-base font-semibold text-[#1d1415] transition hover:-translate-y-0.5 hover:bg-[#e4bf6b]">
              Explore Our Products
            </Link>
          </div>
          <div className="absolute bottom-7 right-6 flex gap-2 sm:right-10" aria-label="Hero image slides">
            {homeHeroImages.map((image, index) => (
              <span key={image} className={`h-1.5 rounded-full transition-all ${index === slide ? 'w-8 bg-white' : 'w-3 bg-white/50'}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="core-values-section relative isolate overflow-hidden bg-[#1d1918] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20" data-reveal>
        <div className="mx-auto max-w-7xl">
          <header className="mb-9 text-center" data-reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f0c767]">What guides us</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-wide text-white sm:text-4xl">OUR CORE VALUES</h2>
          </header>
          <div className="grid gap-5 md:grid-cols-3">
            {coreValues.map((value) => {
              const Icon = valueIcons[value.icon];
              return (
                <article key={value.title} className="rounded-2xl border border-white/20 bg-black/35 p-7 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#e9bd5c]/70 hover:bg-black/45" data-reveal>
                  <Icon aria-hidden="true" className="h-9 w-9 text-[#e9bd5c]" strokeWidth={1.6} />
                  <h3 className="mt-5 text-xl font-semibold tracking-[0.12em] text-white">{value.title}</h3>
                  <p className="mt-3 text-base leading-7 text-white/85">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-product-collections mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <header className="mb-8" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#641E2D]">Fabric collections</p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">Explore Catalog</h2>
        </header>
        {categories.length === 0 && <p className="rounded-xl bg-white p-6 text-base text-stone-600">Fabric categories will appear here once they are available.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 right-5 text-2xl font-semibold text-white">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="home-textile-cta relative isolate flex min-h-screen items-center justify-center px-4 py-20 text-center text-white sm:px-6"
        style={{ backgroundImage: `url("${homeHeroImages[1]}")` }}
        data-reveal
      >
        <div className="absolute inset-0 -z-10 bg-slate-950/65" />
        <div className="mx-auto max-w-3xl">
          <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Bring Your Textile Ideas to Life
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
            From custom designs to finished fabrics, we provide premium textile printing and customization solutions tailored to your brand and requirements.
          </p>
          <Link
            to="/contact"
            className="mt-9 inline-flex min-h-14 items-center justify-center rounded-full bg-[#18344c] px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#244b6b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Connect with Us!
          </Link>
        </div>
      </section>
    </div>
  );
}
