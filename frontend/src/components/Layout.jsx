import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigation } from '../data/siteData';
import { publicAPI } from '../services/api';

export function Layout() {
  const location = useLocation();
  const [branding, setBranding] = useState({});
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

  const brandName = branding.companyName || 'SHREEJI IMPEX';
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

      <footer className="mt-20 border-t border-stone-200 bg-[#1f1a1a] text-stone-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="mb-4 text-lg font-semibold tracking-[0.2em] text-[#D6A747]">{brandName}</div>
            <p className="max-w-sm text-base leading-7 text-stone-300">{branding.description || 'Textile manufacturing and export.'}</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.2em] text-stone-200">Quick Links</h2>
            <ul className="space-y-2 text-base text-stone-300">
              {navigation.map((item) => (
                <li key={item.to}><NavLink to={item.to} className="hover:text-white">{item.label}</NavLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.2em] text-stone-200">Contact</h2>
            <p className="text-base leading-7 text-stone-300">{branding.contactPrompt || 'For product and sourcing enquiries, please use our contact form.'}</p>
            <Link to="/contact" className="mt-4 inline-flex text-base font-medium text-[#D6A747] hover:underline">Contact us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
