import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { companyContact, footerNavigation, navigation } from '../data/siteData';
import { publicAPI } from '../services/api';

export function Layout() {
  const location = useLocation();
  const [branding, setBranding] = useState({});
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [demoPreview, setDemoPreview] = useState(false);
  const [scrolled, setScrolled] = useState(window.scrollY > 24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === '/';
  const transparentHeader = isHome && !scrolled;

  useEffect(() => {
    publicAPI.getAllContent()
      .then(({ data }) => {
        const content = data.data || {};
        setBranding(content.branding?.data || {});
        setDemoPreview(Boolean(content.branding?.isSampleData));
      })
      .catch(() => setBranding({}));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      publicAPI.getCategories(),
      publicAPI.getDesigns({ limit: 3 }),
    ])
      .then(([categoryResponse, designResponse]) => {
        if (!active) return;
        setCategories(categoryResponse.data.data.slice(0, 4));
        setDesigns(designResponse.data.data.slice(0, 3));
      })
      .catch(() => {
        if (active) setCatalogError('Product links are temporarily unavailable.');
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return undefined;
    if (!('IntersectionObserver' in window)) {
      main.querySelectorAll('[data-reveal]').forEach((element) => element.setAttribute('data-revealed', 'true'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

    const observeRevealElements = (root) => {
      if (root.matches?.('[data-reveal]')) observer.observe(root);
      root.querySelectorAll?.('[data-reveal]').forEach((element) => observer.observe(element));
    };
    observeRevealElements(main);
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) observeRevealElements(node);
      }));
    });
    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);

  const brandName = 'SHREEJI IMPEX';
  const navClass = ({ isActive }) => [
    'rounded-full px-3 py-2 text-base font-medium transition-colors duration-300',
    transparentHeader ? 'text-white hover:bg-white/10 hover:text-white' : 'text-stone-700 hover:bg-white/60 hover:text-[#641E2D]',
    isActive && (transparentHeader ? 'bg-white/10 text-white' : 'bg-white/60 text-[#641E2D]'),
  ].filter(Boolean).join(' ');

  return (
    <div className="site-shell min-h-screen text-stone-800">
      {demoPreview && (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold tracking-wide text-amber-950">
          DEMO PREVIEW — fictional sample details and illustrated textile designs. Replace before sharing or publishing.
        </div>
      )}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-500 ${transparentHeader ? 'border-transparent bg-transparent' : 'border-stone-900/5 bg-[#F8F3E9]/95 shadow-sm backdrop-blur-md'}`}>
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center gap-8 px-4 sm:min-h-[84px] sm:px-6 lg:px-8">
          <Link to="/" aria-label={`${brandName} home`} className="flex shrink-0 items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold transition-colors ${transparentHeader ? 'bg-white text-[#641E2D]' : 'bg-[#641E2D] text-white'}`}>
              {branding.logoText || 'S'}
            </span>
            <span>
              <span className={`block text-base font-semibold tracking-[0.16em] sm:text-lg ${transparentHeader ? 'text-white' : 'text-[#641E2D]'}`}>{brandName}</span>
              <span className={`block text-xs uppercase tracking-[0.22em] ${transparentHeader ? 'text-white/75' : 'text-stone-500'}`}>{branding.logoSubtext || 'TEXTILE EXPORTS'}</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
          </nav>

          <button
            type="button"
            className={`ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full transition md:hidden ${transparentHeader ? 'text-white hover:bg-white/10' : 'text-[#641E2D] hover:bg-white/70'}`}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-stone-900/10 bg-[#F8F3E9] px-4 py-3 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} className="rounded-lg px-4 py-3 text-base font-medium text-stone-700 hover:bg-white/70 hover:text-[#641E2D]">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-white/10 bg-[#21191a] text-stone-200">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <section aria-labelledby="footer-company">
            <h2 id="footer-company" className="mb-4 text-lg font-semibold tracking-[0.16em] text-[#D6A747]">{brandName}</h2>
            <p className="max-w-sm text-sm leading-7 text-stone-300">
              {branding.description || 'Printed cotton fabrics and textile solutions for wholesale buyers and global markets.'}
            </p>
            <Link to="/contact" className="mt-5 inline-flex rounded-full bg-[#D6A747] px-5 py-2.5 text-sm font-semibold text-[#21191a] transition hover:bg-[#e4bf6b]">
              Discuss your requirements
            </Link>
          </section>

          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Quick Links</h2>
            <ul className="space-y-3 text-sm text-stone-300">
              {footerNavigation.map((item) => (
                <li key={item.to}><Link to={item.to} className="transition-colors hover:text-[#D6A747]">{item.label}</Link></li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-products">
            <h2 id="footer-products" className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Fabric Collections</h2>
            {catalogError ? (
              <p role="status" className="text-sm leading-6 text-stone-400">{catalogError}</p>
            ) : (
              <>
                <ul className="space-y-3 text-sm text-stone-300">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <Link to={`/products/${encodeURIComponent(category.slug)}`} className="transition-colors hover:text-[#D6A747]">
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  {designs.map((design) => (
                    <li key={design._id}>
                      <Link to={`/designs/${encodeURIComponent(design.slug)}`} className="transition-colors hover:text-[#D6A747]">
                        {design.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                {categories.length === 0 && designs.length === 0 && (
                  <p className="text-sm leading-6 text-stone-400">Published fabric collections will appear here.</p>
                )}
              </>
            )}
          </section>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact</h2>
            <address className="space-y-4 text-sm not-italic leading-6 text-stone-300">
              <a href={companyContact.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 transition-colors hover:text-[#D6A747]">
                <MapPin aria-hidden="true" size={18} className="mt-1 shrink-0" />
                <span className="whitespace-pre-line">{companyContact.address}</span>
              </a>
              {companyContact.phoneNumbers.map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 transition-colors hover:text-[#D6A747]">
                  <Phone aria-hidden="true" size={17} className="shrink-0" />
                  <span>{phone}</span>
                </a>
              ))}
              <a href={`mailto:${companyContact.email}`} className="flex items-start gap-3 break-all transition-colors hover:text-[#D6A747]">
                <Mail aria-hidden="true" size={17} className="mt-1 shrink-0" />
                <span>{companyContact.email}</span>
              </a>
            </address>
            <Link to="/contact" className="mt-5 inline-flex text-sm font-semibold text-[#D6A747] underline-offset-4 hover:underline">Send an enquiry</Link>
          </section>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
