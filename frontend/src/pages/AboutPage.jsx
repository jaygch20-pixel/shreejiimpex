import {
  BadgeCheck,
  Building2,
  FlaskConical,
  Gauge,
  HeartHandshake,
  Lightbulb,
  PackageCheck,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stamp,
} from 'lucide-react';
import { homeHeroImages } from '../data/siteData';

const capabilities = [
  { text: '25,000 sq. ft. modern manufacturing facility.', Icon: Building2 },
  { text: 'Latest textile printing machinery.', Icon: Printer },
  { text: 'Dedicated packing department.', Icon: PackageCheck },
  { text: 'Production capacity of up to 100,000 meters per day.', Icon: Gauge },
  { text: 'Printing expertise in Cotton, Polyester and Rayon.', Icon: Stamp },
  { text: 'Advanced in-house testing laboratory.', Icon: FlaskConical },
];

const values = [
  {
    title: 'Quality First',
    description: 'We focus on maintaining consistent fabric quality through careful production processes and in-house testing.',
    Icon: BadgeCheck,
  },
  {
    title: 'Innovation',
    description: 'We continuously improve our printing techniques, machinery, and processes to meet changing market demands.',
    Icon: Lightbulb,
  },
  {
    title: 'Customer Commitment',
    description: 'We believe in understanding customer requirements and delivering fabric solutions that match their expectations.',
    Icon: HeartHandshake,
  },
  {
    title: 'Craftsmanship',
    description: 'We value our roots in traditional hand block printing while embracing modern textile printing technology.',
    Icon: Stamp,
  },
  {
    title: 'Reliability',
    description: 'We focus on consistent production, efficient operations, and dependable service for our domestic and international customers.',
    Icon: ShieldCheck,
  },
  {
    title: 'Continuous Improvement',
    description: 'We strive to enhance our manufacturing capabilities, production efficiency, and printing standards.',
    Icon: RefreshCw,
  },
];

export function AboutPage() {
  return (
    <div className="space-y-16 pb-20 sm:space-y-20">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pt-20">
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#641E2D]">About Shreeji Impex</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
            Traditional Craft to Modern Textile Printing
          </h1>
          <div className="mt-6 space-y-4 text-base leading-8 text-stone-600 sm:text-lg">
            <p>
              Shreeji Impex, formerly known as Geneva Textile Printery, is a growing textile printing company based in Gujarat, India. Established in 1995 with traditional hand block printing, we have evolved with changing market demands while staying connected to our printing heritage.
            </p>
            <p>
              Under the leadership of Mr. Pintu Patel, CEO, we have grown into a textile manufacturing company serving both domestic and international markets. Today, we combine traditional printing expertise with advanced machinery and modern technology to deliver quality fabrics with consistency and efficiency.
            </p>
            <p>
              Our fabrics reach international customers across African countries, the UK, and the USA. We specialize in textile printing across Cotton, Polyester, and Rayon, offering printing solutions to meet diverse customer requirements.
            </p>
          </div>
        </div>

        <div className="relative mx-auto h-[440px] w-full max-w-lg sm:h-[520px]" data-reveal role="group" aria-label="Shreeji Impex fabric showroom">
          <img
            src={homeHeroImages[0]}
            alt="Colorful printed fabrics displayed on shelves at Shreeji Impex"
            width="960"
            height="1280"
            fetchPriority="high"
            decoding="async"
            className="absolute left-0 top-0 h-[78%] w-[68%] rounded-3xl object-cover shadow-xl"
          />
          <img
            src={homeHeroImages[1]}
            alt="A wide view of printed fabric collections in the showroom"
            width="1604"
            height="1280"
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 right-0 h-[54%] w-[64%] rounded-3xl border-[8px] border-white object-cover shadow-xl sm:border-[10px]"
          />
          <div className="absolute bottom-5 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#641E2D] shadow-lg sm:bottom-7 sm:left-4">
            <Sparkles aria-hidden="true" size={18} />
            <span>Printed fabric collections</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="capabilities-heading">
        <div className="mb-8 max-w-2xl" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#641E2D]">Built for textile production</p>
          <h2 id="capabilities-heading" className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">Our Capabilities</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ text, Icon }) => (
            <article key={text} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" data-reveal>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F8F3E9] text-[#641E2D]">
                <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
              </span>
              <p className="pt-1 text-base font-medium leading-7 text-stone-700">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#F8F3E9] px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="vision-heading">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#641E2D]/15 bg-white/70 px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#641E2D]">Looking ahead</p>
          <h2 id="vision-heading" className="mt-3 text-3xl font-semibold tracking-wide text-stone-900 sm:text-4xl">OUR VISION</h2>
          <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-stone-600 sm:text-lg">
            To become a trusted global name in textile printing by combining our traditional craftsmanship, modern manufacturing capabilities, and commitment to quality. We aim to serve international markets with innovative fabric designs, reliable production, and customized textile solutions that meet the evolving needs of our customers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="values-heading">
        <header className="mx-auto mb-10 max-w-2xl text-center" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#641E2D]">What guides our work</p>
          <h2 id="values-heading" className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">CORE VALUES</h2>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(({ title, description, Icon }) => (
            <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D6A747]/70 hover:shadow-lg" data-reveal>
              <Icon aria-hidden="true" className="h-8 w-8 text-[#641E2D]" strokeWidth={1.7} />
              <h3 className="mt-5 text-xl font-semibold text-stone-900">{title}</h3>
              <p className="mt-3 text-base leading-7 text-stone-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
