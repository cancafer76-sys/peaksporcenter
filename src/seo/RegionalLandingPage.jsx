import { useEffect } from 'react';
import { applyPageSeo } from '../../shared/seo.js';
import { REGIONAL_PAGES } from '../../shared/regional-pages.js';
import { navigateToPath } from './nav.js';
import './regional.css';

export function useRegionalPageSeo(page) {
  useEffect(() => {
    applyPageSeo({
      title: page.title,
      description: page.description,
      canonicalPath: `/${page.slug}`,
      breadcrumbs: [
        { name: 'Ana Sayfa', path: '/' },
        { name: page.h1, path: `/${page.slug}` }
      ],
      regionalPage: page
    });
  }, [page]);
}

export function RegionalLandingContent({ page }) {
  const footerLinks = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'Hizmetler', path: '/hizmetler' },
    { label: 'Paketler', path: '/paketler' },
    { label: 'Galeri', path: '/galeri' },
    { label: 'Hocalarımız', path: '/hocalarimiz' },
    { label: 'Hakkımızda', path: '/hakkimizda' },
    { label: 'İletişim', path: '/iletisim' }
  ];

  return (
    <>
      <h1 className="seo-regional-h1">{page.h1}</h1>
      <nav className="seo-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="text-button" onClick={() => navigateToPath('/')}>Ana Sayfa</button>
        <span aria-hidden="true"> / </span>
        <span>{page.h1}</span>
      </nav>

      <div className="about-copy seo-regional-copy">
        {page.paragraphs.map((paragraph, index) => (
          <p key={`${page.slug}-p-${index}`}>{paragraph}</p>
        ))}
      </div>

      <div className="seo-regional-cta">
        <button type="button" className="primary-button hero-cta-primary" onClick={() => navigateToPath('/iletisim')}>
          PEAKSPOR CENTER&apos;a Katıl
        </button>
      </div>

      <section className="seo-regional-links" aria-label="Bölgesel spor salonu sayfaları">
        <h2>Bölgesel Spor Salonu Sayfaları</h2>
        <div className="seo-regional-link-grid">
          {REGIONAL_PAGES.map(item => (
            <button
              key={item.slug}
              type="button"
              className="text-button"
              onClick={() => navigateToPath(`/${item.slug}`)}
            >
              {item.city} Spor Salonu
            </button>
          ))}
        </div>
      </section>

      <footer className="seo-regional-footer">
        <div className="seo-regional-link-grid">
          {footerLinks.map(link => (
            <button key={link.path} type="button" className="text-button" onClick={() => navigateToPath(link.path)}>
              {link.label}
            </button>
          ))}
        </div>
      </footer>
    </>
  );
}
