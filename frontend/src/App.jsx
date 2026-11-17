import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DesignDetailPage } from './pages/DesignDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ManufacturingPage } from './pages/ManufacturingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductCatalogPage } from './pages/ProductCatalogPage';
import { CategoryGalleryPage } from './pages/CategoryGalleryPage';

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#641E2D]">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-stone-900">Page not found</h1>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-[#641E2D] px-5 py-3 text-sm font-medium text-white">Return home</Link>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:category" element={<CategoryGalleryPage />} />
        <Route path="/designs" element={<Navigate to="/products" replace />} />
        <Route path="/designs/:slug" element={<DesignDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/manufacturing" element={<ManufacturingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
