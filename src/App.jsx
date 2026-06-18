import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import {
  defaultAnnouncements,
  defaultContent,
  defaultGallery,
  defaultPackages,
  defaultServices,
  defaultPosts,
  defaultTrainers
} from '../shared/defaults.js';
import {
  BadgeInfo,
  Bell,
  ChevronRight,
  Dumbbell,
  Home,
  LayoutDashboard,
  Megaphone,
  Image,
  Menu,
  MessageCircle,
  Medal,
  Moon,
  Package,
  Pause,
  Play,
  Save,
  Settings2,
  Sparkles,
  SunMedium,
  Users,
  Video,
  X
} from 'lucide-react';
import './mobile.css';

const fallbackSettings = {
  content: defaultContent,
  services: defaultServices,
  packages: defaultPackages,
  posts: defaultPosts,
  trainers: defaultTrainers,
  announcements: defaultAnnouncements
};

const desktopNav = [
  { id: 'home', label: 'Ana Sayfa', route: '/' },
  { id: 'services', label: 'Hizmetler', route: '/services' },
  { id: 'packages', label: 'Paketler', route: '/packages' },
  { id: 'gallery', label: 'Galeri', route: '/gallery' },
  { id: 'contact', label: 'İletişim' }
];

const mobileNav = [
  { id: 'home', label: 'Ana Sayfa', icon: Home, route: '/' },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell, route: '/services' },
  { id: 'packages', label: 'Paketler', icon: Package, route: '/packages' },
  { id: 'gallery', label: 'Galeri', icon: Image, route: '/gallery' },
  { id: 'contact', label: 'İletişim', icon: LayoutDashboard }
];

const statIcons = [Users, Users, Video, Medal];

function normalizeSettings(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  return {
    content: source.content && typeof source.content === 'object' ? source.content : defaultContent,
    services: Array.isArray(source.services) && source.services.length ? source.services : defaultServices,
    packages: Array.isArray(source.packages) && source.packages.length ? source.packages : defaultPackages,
    posts: Array.isArray(source.posts) && source.posts.length ? source.posts : defaultPosts,
    trainers: Array.isArray(source.trainers) && source.trainers.length ? source.trainers : defaultTrainers,
    announcements:
      Array.isArray(source.announcements) && source.announcements.length
        ? source.announcements
        : defaultAnnouncements
  };
}

function createDrafts(settings) {
  const content = settings.content || defaultContent;
  return {
    content: {
      brandName: content.brand?.name || defaultContent.brand.name,
      brandSlogan: content.brand?.slogan || defaultContent.brand.slogan,
      heroTitle: content.hero?.title || defaultContent.hero.title,
      heroSubtitle: content.hero?.subtitle || defaultContent.hero.subtitle,
      heroImage: content.hero?.image || defaultContent.hero.image
    },
    services: JSON.stringify(settings.services || defaultServices, null, 2),
    packages: JSON.stringify(settings.packages || defaultPackages, null, 2),
    announcements: JSON.stringify(settings.announcements || defaultAnnouncements, null, 2)
  };
}

function useAppData() {
  const [state, setState] = useState({
    settings: fallbackSettings,
    loading: true,
    darkMode: true,
    drawerOpen: false,
    adminOpen: false,
    adminTab: 'content',
    user: null,
    selectedService: null,
    selectedPackage: null,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1400,
    adminDrafts: createDrafts(fallbackSettings)
  });

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([api.content(), api.me()]).then(([contentResult, meResult]) => {
      if (!mounted) return;
      const settings =
        contentResult.status === 'fulfilled' ? normalizeSettings(contentResult.value) : fallbackSettings;
      setState(prev => ({
        ...prev,
        settings,
        user: meResult.status === 'fulfilled' ? meResult.value?.user || null : null,
        adminDrafts: createDrafts(settings),
        loading: false
      }));
    });

    const updateViewport = () => setState(prev => ({ ...prev, viewportWidth: window.innerWidth }));
    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      mounted = false;
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return [state, setState];
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateToPath(pathname) {
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function usePathname() {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return pathname;
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function resolveAnnouncementText(items) {
  const list = Array.isArray(items) && items.length ? items : defaultAnnouncements;
  return list
    .slice(0, 4)
    .map(item => (typeof item === 'string' ? item : item.message || ''))
    .filter(Boolean)
    .join(' • ');
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark">▲</span>
      <span className="brand-text">
        <strong>
          <span>PEAK</span>
          <span className="brand-accent">SPOR</span>
        </strong>
        <small>Premium Fitness</small>
      </span>
    </div>
  );
}

function HeaderActions({ darkMode, onToggleTheme, onOpenAdmin }) {
  return (
    <div className="header-actions">
      <button className="icon-button" type="button" aria-label="Bildirimler">
        <Bell size={18} />
      </button>
      <button className="theme-switch" type="button" onClick={onToggleTheme} aria-label="Tema değiştir">
        <span className={darkMode ? 'active' : ''}>
          <Moon size={14} />
        </span>
        <span className={!darkMode ? 'active' : ''}>
          <SunMedium size={14} />
        </span>
      </button>
      {onOpenAdmin ? (
        <button className="icon-button" type="button" onClick={onOpenAdmin} aria-label="Admin panel">
          <LayoutDashboard size={18} />
        </button>
      ) : null}
    </div>
  );
}

function RouteChrome({ state, setState, title, subtitle, content, backTo = '/' }) {
  const mobile = state.viewportWidth < 980;
  const pathname = usePathname();
  const isActiveRoute = route => pathname === route;

  return (
    <div className={`app-shell ${mobile ? 'mobile-shell' : 'desktop-shell'} ${state.darkMode ? 'dark' : 'light'}`}>
      <header className={mobile ? 'mobile-header' : 'desktop-header'}>
        <div className={`${mobile ? 'mobile-header-inner' : 'desktop-header-inner'} shell-width`}>
          <div className="header-left-group">
            <button
              className="icon-button mobile-menu-button"
              type="button"
              onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              aria-label="Menü"
            >
              <Menu size={18} />
            </button>
            <Brand compact={mobile} />
          </div>
          {!mobile ? <div className="page-heading-inline"><span>{title}</span></div> : null}
          <HeaderActions
            darkMode={state.darkMode}
            onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
          />
        </div>
      </header>

      <main className={`shell-width ${mobile ? 'mobile-page' : 'desktop-page'}`}>
        <section className="section-block">
          <SectionHeader
            title={title}
            subtitle={subtitle}
            action={
              <button className="text-button" type="button" onClick={() => navigateToPath(backTo)}>
                <ChevronRight size={16} />
                Geri Dön
              </button>
            }
          />
          <div className={mobile ? 'route-content-mobile' : ''}>
            {content}
          </div>
        </section>
      </main>

      {mobile ? (
        <nav className="bottom-nav" aria-label="Alt menü">
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/') ? 'active' : ''}`} onClick={() => navigateToPath('/')}>
            <Home size={18} />
            <span>Ana Sayfa</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/services') ? 'active' : ''}`} onClick={() => navigateToPath('/services')}>
            <Dumbbell size={18} />
            <span>Hizmetler</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/gallery') ? 'active' : ''}`} onClick={() => navigateToPath('/gallery')}>
            <Image size={18} />
            <span>Galeri</span>
          </button>
          <button type="button" className={`bottom-nav-item ${isActiveRoute('/packages') ? 'active' : ''}`} onClick={() => navigateToPath('/packages')}>
            <Package size={18} />
            <span>Paketler</span>
          </button>
        </nav>
      ) : null}

      <a
        className={`whatsapp-bubble ${mobile ? 'whatsapp-bubble-mobile' : 'whatsapp-bubble-desktop'}`}
        href={`https://wa.me/${(state.settings.content?.whatsapp?.number || '+905555555555').replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} />
      </a>

      {state.drawerOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        />
      ) : null}

      {state.drawerOpen ? (
        <div className="side-drawer mobile-drawer">
          <button
            type="button"
            className="drawer-close"
            onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
          >
            <X size={18} />
          </button>
          <Brand compact />
          <div className="drawer-links">
            {mobileNav.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.route ? navigateToPath(item.route) : scrollToSection(item.id))}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {state.adminOpen ? <AdminModal state={state} setState={setState} /> : null}
    </div>
  );
}

function HeroButtons({ compact = false, onPrimary, onSecondary }) {
  return (
    <div className={`hero-actions ${compact ? 'hero-actions-compact' : ''}`}>
      <button className="primary-button" type="button" onClick={onPrimary}>
        ÜYE OL
      </button>
      <button className="secondary-button" type="button" onClick={onSecondary}>
        SALONU KEŞFET
      </button>
    </div>
  );
}

function HeroCarousel({ slides, mobile = false }) {
  const heroSlides = slides.length
    ? slides
    : [{ title: defaultContent.hero.title, subtitle: defaultContent.hero.subtitle, image: defaultContent.hero.image }];
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = heroSlides.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % heroSlides.length);
    }, mobile ? 3000 : 3600);
    return () => window.clearInterval(timer);
  }, [heroSlides.length, mobile]);

  const goToSlide = nextIndex => {
    if (!heroSlides.length) return;
    const normalizedIndex = ((nextIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
    setActiveIndex(normalizedIndex);
  };

  return (
    <div className={`hero-carousel ${mobile ? 'hero-carousel-mobile' : 'hero-carousel-desktop'}`}>
      <div className="hero-carousel-viewport">
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)`, width: `${heroSlides.length * 100}%` }}
        >
          {heroSlides.map((slide, index) => (
            <article key={`${slide.title}-${index}`} className="hero-carousel-slide">
              <img src={slide.image} alt={slide.title} />
              <div className={`hero-overlay ${mobile ? 'hero-overlay-mobile' : ''}`} />
              <div className={`hero-carousel-copy ${mobile ? 'hero-carousel-copy-mobile' : ''}`}>
                <span className="hero-banner-kicker">PEAKSPOR</span>
                <strong>{slide.title}</strong>
                <p>{slide.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
        {slideCount > 1 ? (
          <>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-left"
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label="Önceki banner"
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-carousel-arrow hero-carousel-arrow-right"
              onClick={() => goToSlide(activeIndex + 1)}
              aria-label="Sonraki banner"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      <div className="hero-carousel-dots" aria-label="Hero banner göstergeleri">
        {heroSlides.map((slide, index) => (
          <button
            key={`${slide.title}-dot-${index}`}
            type="button"
            className={`hero-carousel-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Ticker({ items }) {
  const text = resolveAnnouncementText(items);
  return (
    <div className="ticker">
      <div className="ticker-label">
        <Megaphone size={14} />
        Duyurular
      </div>
      <div className="ticker-track">
        <span className="ticker-message">{text}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ServicesPage({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const services = state.settings.services || defaultServices;
  const selectedService = state.selectedService || services[0];
  const mobile = state.viewportWidth < 980;
  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="HİZMETLER"
      subtitle="Modern alanlar, premium eğitimler ve net kategoriler."
      content={
        <>
        <div className="route-card-grid route-card-grid-mobile">
            {services.map(service => (
              <button
                key={service.title}
                type="button"
                className={`service-card route-card ${selectedService?.title === service.title ? 'selected' : ''}`}
                onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
              >
                <img src={service.image} alt={service.title} />
                <div className="card-overlay" />
                <div className="service-card-body">
                  <Dumbbell size={16} />
                  <div>
                    <strong>{service.title}</strong>
                    <span>{service.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedService ? (
            <article className="detail-card">
              <div>
                <span>Seçili Hizmet</span>
                <h3>{selectedService.title}</h3>
                <p>{selectedService.description}</p>
              </div>
            </article>
          ) : null}
        </>
      }
      backTo="/"
    />
  );
}

function PackagesPage({ state, setState }) {
  const packages = state.settings.packages || defaultPackages;
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="PAKETLER"
      subtitle="Temiz görünüm, net fiyatlar, kolay seçim."
      content={
        <>
          <div className="route-card-grid route-card-grid-mobile">
            {packages.map((item, index) => (
              <article
                key={item.title}
                className={`package-card route-card theme-${index} ${selectedPackage?.title === item.title ? 'selected' : ''}`}
                onClick={() => setState(prev => ({ ...prev, selectedPackage: item }))}
              >
                <div className="package-shape" />
                <div className="package-top">
                  <div>
                    <span>{item.subtitle}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="package-price">
                    ₺{formatPrice(item.price)}
                    <small>{item.period}</small>
                  </div>
                </div>
                <ul>
                  {item.features.slice(0, 4).map(feature => (
                    <li key={feature}>
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {selectedPackage ? (
            <article className="detail-card detail-card-compact">
              <div>
                <span>Seçili Paket</span>
                <h3>{selectedPackage.title}</h3>
                <p>{selectedPackage.subtitle}</p>
              </div>
              <div className="detail-price">
                ₺{formatPrice(selectedPackage.price)}
                <small>/ay</small>
              </div>
            </article>
          ) : null}
        </>
      }
      backTo="/"
    />
  );
}

function GalleryPage({ state, setState }) {
  const gallery = state.settings.gallery || defaultGallery;

  return (
    <RouteChrome
      state={state}
      setState={setState}
      title="GALERİ"
      subtitle="Tesis, antrenman ve premium atmosfer kareleri."
      content={
        <div className="route-card-grid route-card-grid-mobile">
          {gallery.map(item => (
            <article key={item.title} className="gallery-card route-card">
              <img src={item.image} alt={item.title} />
              <div className="card-overlay" />
              <div className="gallery-card-body">
                <span>{item.category}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
          ))}
        </div>
      }
      backTo="/"
    />
  );
}

function DesktopShell({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const gallery = state.settings.gallery || defaultGallery;
  const bannerSlides = content.bannerSlides || defaultContent.bannerSlides || [];
  const heroSlides = bannerSlides.length
    ? bannerSlides
    : [{ title: content.hero?.title || defaultContent.hero.title, subtitle: content.hero?.subtitle || defaultContent.hero.subtitle, image: content.hero?.image || defaultContent.hero.image }];
  const selectedService = state.selectedService || services[0];
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <div className={`app-shell desktop-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <header className="desktop-header">
        <div className="shell-width desktop-header-inner">
          <div className="header-left-group">
            <button
              className="icon-button"
              type="button"
              onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              aria-label="Menü"
            >
              <Menu size={18} />
            </button>
            <Brand />
          </div>
          <nav className="desktop-nav" aria-label="Ana menü">
            {desktopNav.map(item => (
              <button
                key={item.id}
                type="button"
                className="desktop-nav-link"
                onClick={() => (item.route ? navigateToPath(item.route) : scrollToSection(item.id))}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <HeaderActions
            darkMode={state.darkMode}
            onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
          />
        </div>
      </header>

      <main className="shell-width desktop-page">
        <Ticker items={state.settings.announcements} />

        <section className="desktop-hero" id="home">
          <div className="desktop-hero-copy">
            <div className="hero-badge">
              <Sparkles size={14} />
              Premium Fitness Platform
            </div>
            <h1>
              <span>HEDEFİNE ULAŞ</span>
              <span className="hero-green">ZİRVEYİ YAŞA!</span>
            </h1>
            <p>{content.hero?.subtitle || defaultContent.hero.subtitle}</p>
            <HeroButtons
              onPrimary={() => scrollToSection('packages')}
              onSecondary={() => scrollToSection('services')}
            />
          </div>

          <div className="desktop-hero-media">
            <img src={content.hero?.image || defaultContent.hero.image} alt="Peakspor hero" />
            <div className="hero-overlay" />
            <div className="hero-floating-card">
              <strong>5.000+</strong>
              <span>Aktif Üye</span>
            </div>
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLERİMİZ"
            subtitle="Modern alanlar, premium eğitimler ve net kategoriler."
            action={<button className="text-button" type="button">Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-row">
            {services.map(service => (
              <button
                key={service.title}
                type="button"
                className={`service-card ${selectedService?.title === service.title ? 'selected' : ''}`}
                onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
              >
                <img src={service.image} alt={service.title} />
                <div className="card-overlay" />
                <div className="service-card-body">
                  <Dumbbell size={16} />
                  <div>
                    <strong>{service.title}</strong>
                    <span>{service.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedService ? (
            <article className="detail-card">
              <div>
                <span>Seçili Hizmet</span>
                <h3>{selectedService.title}</h3>
                <p>{selectedService.description}</p>
              </div>
              <button className="detail-link" type="button" onClick={() => scrollToSection('packages')}>
                Paketleri Gör <ChevronRight size={16} />
              </button>
            </article>
          ) : null}
        </section>

        <section className="section-block" id="packages">
          <SectionHeader
            title="PAKETLER"
            subtitle="Temiz görünüm, net fiyatlar, kolay seçim."
            action={<button className="text-button" type="button">Tümü <ChevronRight size={16} /></button>}
          />
          <div className="package-grid">
            {packages.map((item, index) => (
              <article
                key={item.title}
                className={`package-card theme-${index} ${selectedPackage?.title === item.title ? 'selected' : ''}`}
                onClick={() => setState(prev => ({ ...prev, selectedPackage: item }))}
              >
                <div className="package-shape" />
                <div className="package-top">
                  <div>
                    <span>{item.subtitle}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="package-price">
                    ₺{formatPrice(item.price)}
                    <small>{item.period}</small>
                  </div>
                </div>
                <ul>
                  {item.features.slice(0, 4).map(feature => (
                    <li key={feature}>
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="package-cta" type="button" onClick={e => e.stopPropagation()}>
                  {item.cta}
                </button>
              </article>
            ))}
          </div>

          {selectedPackage ? (
            <article className="detail-card detail-card-compact">
              <div>
                <span>Seçili Paket</span>
                <h3>{selectedPackage.title}</h3>
                <p>{selectedPackage.subtitle}</p>
              </div>
              <div className="detail-price">
                ₺{formatPrice(selectedPackage.price)}
                <small>/ay</small>
              </div>
            </article>
          ) : null}
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader
            title="GALERİ"
            subtitle="Tesis, antrenman ve premium atmosfer kareleri."
            action={<button className="text-button" type="button">Tümü <ChevronRight size={16} /></button>}
          />
          <div className="gallery-grid">
            {gallery.map(item => (
              <article key={item.title} className="gallery-card">
                <img src={item.image} alt={item.title} />
                <div className="card-overlay" />
                <div className="gallery-card-body">
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item, index) => {
            const Icon = statIcons[index] || Users;
            return (
              <article key={item.label} className="stat-card">
                <Icon size={20} />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            );
          })}
        </section>

        <section className="feature-bar">
          {['Esnek Üyelik', '7/24 Destek', 'Güvenli Ödeme', 'Uzman Eğitmenler'].map(item => (
            <span key={item}>
              <BadgeInfo size={14} />
              {item}
            </span>
          ))}
        </section>
      </main>

      <a
        className="whatsapp-bubble whatsapp-bubble-desktop"
        href={`https://wa.me/${(content.whatsapp?.number || '+905555555555').replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} />
      </a>

      {state.drawerOpen ? (
        <div className="side-drawer">
          <button
            type="button"
            className="drawer-close"
            onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
          >
            <X size={18} />
          </button>
          <Brand compact />
          <div className="drawer-links">
            {desktopNav.map(item => (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {state.adminOpen ? <AdminModal state={state} setState={setState} /> : null}
    </div>
  );
}

function MobileShell({ state, setState }) {
  const pathname = usePathname();
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const gallery = state.settings.gallery || defaultGallery;
  const bannerSlides = content.bannerSlides || defaultContent.bannerSlides || [];
  const heroSlides = bannerSlides.length
    ? bannerSlides
    : [{ title: content.hero?.title || defaultContent.hero.title, subtitle: content.hero?.subtitle || defaultContent.hero.subtitle, image: content.hero?.image || defaultContent.hero.image }];
  const serviceLoop = services.length > 1 ? [...services, ...services] : services;
  const selectedService = state.selectedService || services[0];
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <div className={`app-shell mobile-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <header className="mobile-header">
        <div className="mobile-header-inner shell-width">
          <div className="header-left-group">
            <button
              className="icon-button mobile-menu-button"
              type="button"
              onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              aria-label="Menü"
            >
              <Menu size={18} />
            </button>
            <Brand compact />
          </div>
          <div className="header-actions">
            <button
              className="theme-switch theme-switch-mobile"
              type="button"
              onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              aria-label="Tema değiştir"
            >
              <span className={state.darkMode ? 'active' : ''}>
                <Moon size={14} />
              </span>
              <span className={!state.darkMode ? 'active' : ''}>
                <SunMedium size={14} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="shell-width mobile-page">
        <Ticker items={state.settings.announcements} />

        <section className="mobile-hero" id="home">
          <HeroCarousel slides={heroSlides} mobile />
          <div className="mobile-hero-cta-row">
            <HeroButtons
              compact
              onPrimary={() => scrollToSection('packages')}
              onSecondary={() => scrollToSection('services')}
            />
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLER"
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/services')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-carousel">
            <div className="service-carousel-viewport">
              <div className="service-carousel-track service-carousel-loop">
                {serviceLoop.map((service, index) => (
                  <button
                    key={`${service.title}-${index}`}
                    type="button"
                    className={`service-card service-card-mobile service-card-mini ${selectedService?.title === service.title ? 'selected' : ''}`}
                    onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
                  >
                    <img src={service.image} alt={service.title} />
                    <div className="card-overlay" />
                    <div className="service-card-body">
                      <Dumbbell size={15} />
                      <div>
                        <strong>{service.title}</strong>
                        <span>{service.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ServiceAutoScroller />
        </section>

        <section className="section-block" id="packages">
          <SectionHeader
            title="PAKETLER"
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/packages')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="package-rail-mobile mobile-horizontal-rail package-auto-scroll">
            {packages.map((item, index) => (
              <article
                key={item.title}
                className={`package-card theme-${index} package-card-mobile ${selectedPackage?.title === item.title ? 'selected' : ''}`}
                onClick={() => setState(prev => ({ ...prev, selectedPackage: item }))}
              >
                <div className="package-shape" />
                <div className="package-top">
                  <div>
                    <span>{item.subtitle}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="package-price">
                    ₺{formatPrice(item.price)}
                    <small>{item.period}</small>
                  </div>
                </div>
                <ul>
                  {item.features.slice(0, 4).map(feature => (
                    <li key={feature}>
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="package-cta" type="button" onClick={e => e.stopPropagation()}>
                  {item.cta}
                </button>
              </article>
            ))}
          </div>
          <PackageAutoScroller />
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader
            title="GALERİ"
            subtitle="Tesis, antrenman ve premium atmosfer kareleri."
            action={<button className="text-button" type="button" onClick={() => navigateToPath('/gallery')}>Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-carousel">
            <div className="service-carousel-viewport gallery-carousel-viewport">
              <div className="service-carousel-track gallery-carousel-track gallery-carousel-loop">
                {[...gallery, ...gallery].map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    type="button"
                    className="service-card service-card-mobile gallery-card-mini"
                  >
                    <img src={item.image} alt={item.title} />
                    <div className="card-overlay" />
                    <div className="gallery-card-body">
                      <span>{item.category}</span>
                      <strong>{item.title}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <GalleryAutoScroller />
        </section>

        <section className="stats-grid stats-grid-mobile">
          {stats.map((item, index) => {
            const Icon = statIcons[index] || Users;
            return (
              <article key={item.label} className="stat-card">
                <Icon size={18} />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            );
          })}
        </section>

        <section className="feature-bar feature-bar-mobile">
          {['Esnek Üyelik', '7/24 Destek', 'Güvenli Ödeme', 'Uzman Eğitmenler'].map(item => (
            <span key={item}>
              <BadgeInfo size={14} />
              {item}
            </span>
          ))}
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Alt menü">
        <button type="button" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`} onClick={() => navigateToPath('/')}>
          <Home size={18} />
          <span>Ana Sayfa</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/services' ? 'active' : ''}`} onClick={() => navigateToPath('/services')}>
          <Dumbbell size={18} />
          <span>Hizmetler</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/gallery' ? 'active' : ''}`} onClick={() => navigateToPath('/gallery')}>
          <Image size={18} />
          <span>Galeri</span>
        </button>
        <button type="button" className={`bottom-nav-item ${pathname === '/packages' ? 'active' : ''}`} onClick={() => navigateToPath('/packages')}>
          <Package size={18} />
          <span>Paketler</span>
        </button>
      </nav>

      <a
        className="whatsapp-bubble whatsapp-bubble-mobile"
        href={`https://wa.me/${(content.whatsapp?.number || '+905555555555').replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} />
      </a>

      {state.drawerOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        />
      ) : null}

      {state.drawerOpen ? (
        <div className="side-drawer mobile-drawer">
          <button
            type="button"
            className="drawer-close"
            onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}
          >
            <X size={18} />
          </button>
          <Brand compact />
          <div className="drawer-links">
            {mobileNav.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.route ? navigateToPath(item.route) : scrollToSection(item.id))}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {state.adminOpen ? <AdminModal state={state} setState={setState} /> : null}
    </div>
  );
}

function ServiceAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.service-carousel-viewport');
    if (!rail) return undefined;
    const firstCard = rail.querySelector('.service-card-mini');
    if (!firstCard) return undefined;
    const stepSize = firstCard.getBoundingClientRect().width + 12;
    const halfWidth = rail.scrollWidth / 2;
    const intervalId = window.setInterval(() => {
      const nextLeft = rail.scrollLeft + stepSize;
      if (nextLeft >= halfWidth - stepSize) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      rail.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

function HeroAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.hero-banner-track');
    if (!rail) return undefined;
    let frameId;
    let direction = 0.85;
    let lastTick = 0;

    const tick = timestamp => {
      if (!lastTick) lastTick = timestamp;
      const elapsed = timestamp - lastTick;
      if (elapsed >= 16) {
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        if (maxScroll > 0) {
          rail.scrollLeft += direction;
          if (rail.scrollLeft <= 0) direction = 0.85;
          if (rail.scrollLeft >= maxScroll) direction = -0.85;
        }
        lastTick = timestamp;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return null;
}

function PackageAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.package-auto-scroll');
    if (!rail) return undefined;
    let frameId;
    let direction = -0.4;

    const tick = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll > 0) {
        rail.scrollLeft += direction;
        if (rail.scrollLeft <= 0) direction = 0.4;
        if (rail.scrollLeft >= maxScroll) direction = -0.4;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return null;
}

function GalleryAutoScroller() {
  useEffect(() => {
    const rail = document.querySelector('.gallery-carousel-viewport');
    if (!rail) return undefined;
    const firstCard = rail.querySelector('.gallery-card-mini');
    if (!firstCard) return undefined;
    const stepSize = firstCard.getBoundingClientRect().width + 12;
    const halfWidth = rail.scrollWidth / 2;
    const intervalId = window.setInterval(() => {
      const nextLeft = rail.scrollLeft + stepSize;
      if (nextLeft >= halfWidth - stepSize) {
        rail.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      rail.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

function AdminModal({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const drafts = state.adminDrafts;

  const updateDraft = (section, key, value) => {
    setState(prev => ({
      ...prev,
      adminDrafts: {
        ...prev.adminDrafts,
        [section]: {
          ...prev.adminDrafts[section],
          [key]: value
        }
      }
    }));
  };

  const saveSection = async section => {
    try {
      if (section === 'content') {
        const nextContent = {
          ...content,
          brand: {
            ...(content.brand || defaultContent.brand),
            name: drafts.content.brandName,
            slogan: drafts.content.brandSlogan
          },
          hero: {
            ...(content.hero || defaultContent.hero),
            title: drafts.content.heroTitle,
            subtitle: drafts.content.heroSubtitle,
            image: drafts.content.heroImage
          }
        };
        await api.saveSetting('content', nextContent);
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, content: nextContent }
        }));
        return;
      }

      const value = JSON.parse(drafts[section]);
      await api.saveSetting(section, value);
      setState(prev => ({
        ...prev,
        settings: { ...prev.settings, [section]: value }
      }));
    } catch (error) {
      window.alert(error.message || 'Kaydetme başarısız');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <span>Admin Panel</span>
            <h3>PEAKSPOR Kontrol Merkezi</h3>
          </div>
          <button className="icon-button" type="button" onClick={() => setState(prev => ({ ...prev, adminOpen: false }))}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-summary">
          <article>
            <BadgeInfo size={18} />
            <strong>{state.user ? state.user.email : 'admin@peakspor.com'}</strong>
            <span>Yönetici erişimi</span>
          </article>
          <article>
            <Settings2 size={18} />
            <strong>{state.settings.services.length} Hizmet</strong>
            <span>Aktif içerik</span>
          </article>
          <article>
            <FileText size={18} />
            <strong>{state.settings.packages.length} Paket</strong>
            <span>Yönetilebilir</span>
          </article>
          <article>
            <Palette size={18} />
            <strong>{state.settings.announcements.length} Duyuru</strong>
            <span>Tek satır ticker</span>
          </article>
        </div>

        <div className="admin-tabs">
          {['content', 'services', 'packages', 'announcements'].map(tab => (
            <button
              key={tab}
              type="button"
              className={state.adminTab === tab ? 'active' : ''}
              onClick={() => setState(prev => ({ ...prev, adminTab: tab }))}
            >
              {tab === 'content' ? 'İçerik' : tab === 'services' ? 'Hizmetler' : tab === 'packages' ? 'Paketler' : 'Duyurular'}
            </button>
          ))}
        </div>

        {state.adminTab === 'content' ? (
          <div className="admin-form">
            <label>
              Marka Adı
              <input
                value={drafts.content.brandName}
                onChange={e => updateDraft('content', 'brandName', e.target.value)}
              />
            </label>
            <label>
              Marka Sloganı
              <input
                value={drafts.content.brandSlogan}
                onChange={e => updateDraft('content', 'brandSlogan', e.target.value)}
              />
            </label>
            <label>
              Hero Başlık
              <textarea
                rows={3}
                value={drafts.content.heroTitle}
                onChange={e => updateDraft('content', 'heroTitle', e.target.value)}
              />
            </label>
            <label>
              Hero Açıklama
              <textarea
                rows={3}
                value={drafts.content.heroSubtitle}
                onChange={e => updateDraft('content', 'heroSubtitle', e.target.value)}
              />
            </label>
            <label>
              Hero Görsel URL
              <input
                value={drafts.content.heroImage}
                onChange={e => updateDraft('content', 'heroImage', e.target.value)}
              />
            </label>
            <button className="save-button" type="button" onClick={() => saveSection('content')}>
              <Save size={16} />
              İçeriği Kaydet
            </button>
          </div>
        ) : null}

        {state.adminTab === 'services' ? (
          <div className="admin-form">
            <label>
              Hizmetler JSON
              <textarea
                rows={18}
                value={drafts.services}
                onChange={e =>
                  setState(prev => ({ ...prev, adminDrafts: { ...prev.adminDrafts, services: e.target.value } }))
                }
              />
            </label>
            <button className="save-button" type="button" onClick={() => saveSection('services')}>
              <Save size={16} />
              Hizmetleri Kaydet
            </button>
          </div>
        ) : null}

        {state.adminTab === 'packages' ? (
          <div className="admin-form">
            <label>
              Paketler JSON
              <textarea
                rows={18}
                value={drafts.packages}
                onChange={e =>
                  setState(prev => ({ ...prev, adminDrafts: { ...prev.adminDrafts, packages: e.target.value } }))
                }
              />
            </label>
            <button className="save-button" type="button" onClick={() => saveSection('packages')}>
              <Save size={16} />
              Paketleri Kaydet
            </button>
          </div>
        ) : null}

        {state.adminTab === 'announcements' ? (
          <div className="admin-form">
            <label>
              Duyurular JSON
              <textarea
                rows={18}
                value={drafts.announcements}
                onChange={e =>
                  setState(prev => ({ ...prev, adminDrafts: { ...prev.adminDrafts, announcements: e.target.value } }))
                }
              />
            </label>
            <button className="save-button" type="button" onClick={() => saveSection('announcements')}>
              <Save size={16} />
              Duyuruları Kaydet
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function useSectionPath(pathname) {
  const isServices = pathname === '/services';
  const isPackages = pathname === '/packages';
  const isGallery = pathname === '/gallery';
  return { isServices, isPackages, isGallery };
}

export default function App() {
  const [state, setState] = useAppData();
  const isMobile = useMemo(() => state.viewportWidth < 980, [state.viewportWidth]);
  const pathname = usePathname();
  const sectionPath = useSectionPath(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <Brand />
        <div className="loading-bar" />
      </div>
    );
  }

  if (sectionPath.isServices) {
    return <ServicesPage state={state} setState={setState} />;
  }

  if (sectionPath.isPackages) {
    return <PackagesPage state={state} setState={setState} />;
  }

  if (sectionPath.isGallery) {
    return <GalleryPage state={state} setState={setState} />;
  }

  return isMobile ? <MobileShell state={state} setState={setState} /> : <DesktopShell state={state} setState={setState} />;
}