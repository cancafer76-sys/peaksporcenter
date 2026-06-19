import React, { useEffect, useMemo, useState, useRef } from 'react';
import { api } from './api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
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
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  Dumbbell,
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Medal,
  Moon,
  Package,
  Palette,
  Pause,
  Play,
  Save,
  Search,
  Settings2,
  Sparkles,
  SunMedium,
  TrendingUp,
  Users,
  Video,
  ArrowRight,
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

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return pathname;
}

function navigateToPath(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-icon">
        <path d="M4 24L12 10L16 18L20 8L28 24H4Z" fill="#7CFF4F" />
        <path d="M12 10L16 4L20 8" stroke="#7CFF4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="20" r="3" fill="#050505" />
      </svg>
      <span className="brand-text">PEAKSPOR</span>
    </div>
  );
}

function Ticker({ items }) {
  const list = Array.isArray(items) && items.length ? items : defaultAnnouncements;
  const headline = list[0] || 'YAZ KAMPANYASI %30 İNDİRİM!';
  return (
    <div className="ticker">
      <div className="ticker-info">
        <div className="ticker-badge">
          <Megaphone size={13} />
          <span>YENİ</span>
        </div>
        <div className="ticker-text">
          <div className="ticker-headline">{headline}</div>
          <div className="ticker-desc">Tüm paketlerde geçerli sınırlı süre fırsatını kaçırma.</div>
        </div>
      </div>
      <button className="ticker-cta" aria-label="Detaylar">
        <ArrowRight size={20} />
      </button>
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
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

function HeroButtons({ onPrimary, onSecondary }) {
  return (
    <div className="hero-buttons">
      <button className="btn-primary" type="button" onClick={onPrimary}>
        ÜYE OL
      </button>
      <button className="btn-secondary" type="button" onClick={onSecondary}>
        SALONU KEŞFET
      </button>
    </div>
  );
}

function AdminEntryButton({ onOpenAdmin, compact = false }) {
  return (
    <button
      className={`admin-entry-btn ${compact ? 'compact' : ''}`}
      type="button"
      onClick={onOpenAdmin}
    >
      <LayoutDashboard size={compact ? 14 : 16} />
      {compact ? 'Giriş' : 'Yetkili Giriş'}
    </button>
  );
}

function HeaderActions({ darkMode, onToggleTheme, onOpenAdmin }) {
  return (
    <div className="header-actions">
      <button
        className="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-label={darkMode ? 'Aydınlık mod' : 'Karanlık mod'}
      >
        {darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
      </button>
      <AdminEntryButton onOpenAdmin={onOpenAdmin} />
    </div>
  );
}

function StatCard({ number, label, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ServiceCard({ service, onClick }) {
  return (
    <button className="service-card" type="button" onClick={onClick}>
      <img src={service.image} alt={service.title} loading="lazy" />
      <div className="service-overlay" />
      <div className="service-content">
        <span className="service-icon">
          <Dumbbell size={20} />
        </span>
        <span className="service-title">{service.title}</span>
      </div>
    </button>
  );
}

function PackageCard({ pkg, selected, onClick }) {
  return (
    <button
      className={`package-card ${selected ? 'active' : ''}`}
      type="button"
      onClick={onClick}
    >
      <div className="package-header">
        <h3>{pkg.name}</h3>
        <div className="package-price">
          {pkg.price} <span>/ AY</span>
        </div>
      </div>
      <ul className="package-features">
        {pkg.features.map((f, i) => (
          <li key={i}>
            <span className="check-icon">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button className="package-cta" type="button">
        Hemen Başla
      </button>
    </button>
  );
}

function TrainerCard({ trainer }) {
  return (
    <div className="trainer-card">
      <img src={trainer.image} alt={trainer.name} loading="lazy" />
      <div className="trainer-info">
        <strong>{trainer.name}</strong>
        <span>{trainer.role}</span>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="post-card">
      <img src={post.image} alt={post.title} loading="lazy" />
      <div className="post-content">
        <span className="post-date">{post.date}</span>
        <h4>{post.title}</h4>
        <p>{post.excerpt}</p>
      </div>
    </div>
  );
}

function GalleryGrid({ images }) {
  return (
    <div className="gallery-grid">
      {images.map((img, i) => (
        <div className="gallery-item" key={i}>
          <img src={img} alt={`Galeri ${i + 1}`} loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function FeatureBar() {
  const features = [
    { icon: Users, text: 'Esnek Üyelik' },
    { icon: BadgeInfo, text: '%100 Memnuniyet' },
    { icon: Settings2, text: '7/24 Destek' },
    { icon: CreditCard, text: 'Güvenli Ödeme' }
  ];

  return (
    <div className="feature-bar">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div className="feature-item" key={i}>
            <Icon size={20} />
            <span>{f.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/905555555555"
      className="whatsapp-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={20} />
      <span>WHATSAPP HATTINA KATIL</span>
    </a>
  );
}

function MobileBottomNav({ pathname, onNavigate }) {
  return (
    <nav className="mobile-bottom-nav">
      {mobileNav.map(item => {
        const Icon = item.icon;
        const isActive = item.route ? pathname === item.route : false;
        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => (item.route ? onNavigate(item.route) : scrollToSection(item.id))}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileDrawer({ open, onClose, onNavigate }) {
  return (
    <div className={`mobile-drawer ${open ? 'open' : ''}`}>
      <div className="mobile-drawer-overlay" onClick={onClose} />
      <div className="mobile-drawer-content">
        <div className="mobile-drawer-header">
          <Brand />
          <button className="icon-button" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-drawer-nav">
          {mobileNav.map(item => (
            <button
              key={item.id}
              type="button"
              className="mobile-drawer-link"
              onClick={() => {
                onClose();
                if (item.route) onNavigate(item.route);
                else scrollToSection(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
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
      <div className="top-band">
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
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className="shell-width desktop-page">
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
            <AdminEntryButton onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))} />
          </div>
          <div className="desktop-hero-visual">
            <HeroCarousel slides={heroSlides} />
          </div>
        </section>

        <section className="section-block" id="stats">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <StatCard key={i} number={stat.number} label={stat.label} icon={statIcons[i % statIcons.length]} />
            ))}
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLERİMİZ"
            action={<button className="text-link" type="button">Tüm Hizmetler</button>}
          />
          <div className="services-scroll">
            {services.map((service, i) => (
              <ServiceCard
                key={i}
                service={service}
                onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
              />
            ))}
          </div>
        </section>

        <section className="section-block" id="packages">
          <SectionHeader title="PAKETLERİMİZ" />
          <div className="packages-grid">
            {packages.map((pkg, i) => (
              <PackageCard
                key={i}
                pkg={pkg}
                selected={selectedPackage === pkg}
                onClick={() => setState(prev => ({ ...prev, selectedPackage: pkg }))}
              />
            ))}
          </div>
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader title="GALERİ" />
          <GalleryGrid images={gallery} />
        </section>

        <section className="section-block" id="trainers">
          <SectionHeader title="EĞİTMENLERİMİZ" />
          <div className="trainers-grid">
            {(state.settings.trainers || defaultTrainers).map((trainer, i) => (
              <TrainerCard key={i} trainer={trainer} />
            ))}
          </div>
        </section>

        <section className="section-block" id="blog">
          <SectionHeader title="BLOG" />
          <div className="posts-grid">
            {(state.settings.posts || defaultPosts).map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        </section>

        <section className="section-block" id="contact">
          <SectionHeader title="İLETİŞİM" />
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Bize Ulaşın</h3>
              <p>Adres: Örnek Mahallesi, Spor Sokak No:1</p>
              <p>Telefon: +90 555 555 55 55</p>
              <p>E-posta: info@peakspor.com</p>
            </div>
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.658627675627!2d29.0!3d41.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzAwLjAiTiAyOcKwMDAnMDAuMCJF!5e0!3m2!1str!2str!4v1609459200000!5m2!1str!2str"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Harita"
              />
            </div>
          </div>
        </section>

        <FeatureBar />
      </main>

      <WhatsAppButton />
      {state.adminOpen ? <AdminModal state={state} setState={setState} /> : null}
    </div>
  );
}

function MobileShell({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const gallery = state.settings.gallery || defaultGallery;
  const bannerSlides = content.bannerSlides || defaultContent.bannerSlides || [];
  const heroSlides = bannerSlides.length
    ? bannerSlides
    : [{ title: content.hero?.title || defaultContent.hero.title, subtitle: content.hero?.subtitle || defaultContent.hero.subtitle, image: content.hero?.image || defaultContent.hero.image }];
  const pathname = usePathname();

  return (
    <div className={`app-shell mobile-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className="mobile-header">
          <div className="shell-width mobile-header-inner">
            <div className="header-left-group">
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
                aria-label="Menü"
              >
                <Menu size={20} />
              </button>
              <Brand compact />
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                aria-label={state.darkMode ? 'Aydınlık mod' : 'Karanlık mod'}
              >
                {state.darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(prev => ({ ...prev, adminOpen: true }))}
                aria-label="Admin"
              >
                <LayoutDashboard size={18} />
              </button>
            </div>
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className={`shell-width ${'mobile-page mobile-main'}`}>
        <section className="mobile-hero" id="home">
          <div className="hero-carousel-mobile">
            <HeroCarousel slides={heroSlides} />
          </div>
          <div className="mobile-hero-content">
            <h1>
              <span>HEDEFİNE</span>
              <span>ULAŞ</span>
              <span className="hero-green">ZİRVEYİ YAŞA!</span>
            </h1>
            <p>{content.hero?.subtitle || defaultContent.hero.subtitle}</p>
            <div className="mobile-hero-cta-row">
              <HeroButtons
                onPrimary={() => scrollToSection('packages')}
                onSecondary={() => scrollToSection('services')}
              />
            </div>
            <AdminEntryButton compact onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))} />
          </div>
        </section>

        <section className="section-block" id="stats">
          <div className="stats-grid mobile-stats">
            {(content.stats || defaultContent.stats).map((stat, i) => (
              <StatCard key={i} number={stat.number} label={stat.label} icon={statIcons[i % statIcons.length]} />
            ))}
          </div>
        </section>

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLERİMİZ"
            action={<button className="text-link" type="button">Tüm Hizmetler</button>}
          />
          <div className="services-scroll mobile-services">
            {services.map((service, i) => (
              <ServiceCard
                key={i}
                service={service}
                onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
              />
            ))}
          </div>
        </section>

        <section className="section-block" id="packages">
          <SectionHeader title="PAKETLERİMİZ" />
          <div className="packages-grid mobile-packages">
            {packages.map((pkg, i) => (
              <PackageCard
                key={i}
                pkg={pkg}
                selected={state.selectedPackage === pkg}
                onClick={() => setState(prev => ({ ...prev, selectedPackage: pkg }))}
              />
            ))}
          </div>
        </section>

        <section className="section-block" id="gallery">
          <SectionHeader title="GALERİ" />
          <GalleryGrid images={gallery} />
        </section>

        <section className="section-block" id="trainers">
          <SectionHeader title="EĞİTMENLERİMİZ" />
          <div className="trainers-grid mobile-trainers">
            {(state.settings.trainers || defaultTrainers).map((trainer, i) => (
              <TrainerCard key={i} trainer={trainer} />
            ))}
          </div>
        </section>

        <section className="section-block" id="blog">
          <SectionHeader title="BLOG" />
          <div className="posts-grid mobile-posts">
            {(state.settings.posts || defaultPosts).map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        </section>

        <section className="section-block" id="contact">
          <SectionHeader title="İLETİŞİM" />
          <div className="contact-grid mobile-contact">
            <div className="contact-info">
              <h3>Bize Ulaşın</h3>
              <p>Adres: Örnek Mahallesi, Spor Sokak No:1</p>
              <p>Telefon: +90 555 555 55 55</p>
              <p>E-posta: info@peakspor.com</p>
            </div>
          </div>
        </section>

        <FeatureBar />
      </main>

      <MobileBottomNav
        pathname={pathname}
        onNavigate={route => navigateToPath(route)}
      />
      <MobileDrawer
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        onNavigate={route => navigateToPath(route)}
      />
      <WhatsAppButton />
      {state.adminOpen ? <AdminModal state={state} setState={setState} /> : null}
    </div>
  );
}

function HeroCarousel({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="hero-carousel">
      <div className="hero-carousel-viewport">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`hero-carousel-slide ${i === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-carousel-overlay" />
          </div>
        ))}
      </div>
      <div className="hero-carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hero-carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ServicesPage({ state, setState }) {
  const services = state.settings.services || defaultServices;
  const isMobile = state.viewportWidth < 980;

  return (
    <div className={`app-shell ${isMobile ? 'mobile-shell' : 'desktop-shell'} ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className={isMobile ? 'mobile-header' : 'desktop-header'}>
          <div className={`shell-width ${isMobile ? 'mobile-header-inner' : 'desktop-header-inner'}`}>
            <div className="header-left-group">
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              >
                <Menu size={20} />
              </button>
              <Brand compact />
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              >
                {state.darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className={`shell-width ${isMobile ? 'mobile-page mobile-main' : 'desktop-page'}`}>
        <SectionHeader title="HİZMETLERİMİZ" />
        <div className={`services-grid ${isMobile ? 'mobile-services-grid' : ''}`}>
          {services.map((service, i) => (
            <ServiceCard
              key={i}
              service={service}
              onClick={() => setState(prev => ({ ...prev, selectedService: service }))}
            />
          ))}
        </div>
      </main>

      {isMobile ? (
        <MobileBottomNav pathname={usePathname()} onNavigate={route => navigateToPath(route)} />
      ) : null}
      <MobileDrawer
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        onNavigate={route => navigateToPath(route)}
      />
      <WhatsAppButton />
    </div>
  );
}

function PackagesPage({ state, setState }) {
  const packages = state.settings.packages || defaultPackages;
  const isMobile = state.viewportWidth < 980;

  return (
    <div className={`app-shell ${isMobile ? 'mobile-shell' : 'desktop-shell'} ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className={isMobile ? 'mobile-header' : 'desktop-header'}>
          <div className={`shell-width ${isMobile ? 'mobile-header-inner' : 'desktop-header-inner'}`}>
            <div className="header-left-group">
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              >
                <Menu size={20} />
              </button>
              <Brand compact />
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              >
                {state.darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className={`shell-width ${isMobile ? 'mobile-page mobile-main' : 'desktop-page'}`}>
        <SectionHeader title="PAKETLERİMİZ" />
        <div className={`packages-grid ${isMobile ? 'mobile-packages-grid' : ''}`}>
          {packages.map((pkg, i) => (
            <PackageCard
              key={i}
              pkg={pkg}
              selected={state.selectedPackage === pkg}
              onClick={() => setState(prev => ({ ...prev, selectedPackage: pkg }))}
            />
          ))}
        </div>
      </main>

      {isMobile ? (
        <MobileBottomNav pathname={usePathname()} onNavigate={route => navigateToPath(route)} />
      ) : null}
      <MobileDrawer
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        onNavigate={route => navigateToPath(route)}
      />
      <WhatsAppButton />
    </div>
  );
}

function GalleryPage({ state, setState }) {
  const gallery = state.settings.gallery || defaultGallery;
  const isMobile = state.viewportWidth < 980;

  return (
    <div className={`app-shell ${isMobile ? 'mobile-shell' : 'desktop-shell'} ${state.darkMode ? 'dark' : 'light'}`}>
      <div className="top-band">
        <header className={isMobile ? 'mobile-header' : 'desktop-header'}>
          <div className={`shell-width ${isMobile ? 'mobile-header-inner' : 'desktop-header-inner'}`}>
            <div className="header-left-group">
              <button
                className="icon-button"
                type="button"
                onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
              >
                <Menu size={20} />
              </button>
              <Brand compact />
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              >
                {state.darkMode ? <SunMedium size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        <div className="ticker-shell shell-width">
          <Ticker items={state.settings.announcements} />
        </div>
      </div>

      <main className={`shell-width ${isMobile ? 'mobile-page mobile-main' : 'desktop-page'}`}>
        <SectionHeader title="GALERİ" />
        <GalleryGrid images={gallery} />
      </main>

      {isMobile ? (
        <MobileBottomNav pathname={usePathname()} onNavigate={route => navigateToPath(route)} />
      ) : null}
      <MobileDrawer
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        onNavigate={route => navigateToPath(route)}
      />
      <WhatsAppButton />
    </div>
  );
}

function AutoScrollRail() {
  useEffect(() => {
    const rails = document.querySelectorAll('.services-scroll');
    if (!rails.length) return;
    const intervalId = window.setInterval(() => {
      const rail = rails[0];
      const maxLeft = rail.scrollWidth - rail.clientWidth;
      const nextLeft = rail.scrollLeft >= maxLeft - 2 ? 0 : rail.scrollLeft + 220;
      if (typeof rail.scrollTo === 'function') {
        rail.scrollTo({ left: nextLeft, behavior: 'smooth' });
      } else {
        rail.scrollLeft = nextLeft;
      }
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

const sidebarGroups = [
  {
    label: 'YÖNETİM',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'users', label: 'Kullanıcılar', icon: Users },
      { id: 'members', label: 'Üyelikler', icon: BadgeInfo },
      { id: 'packages-admin', label: 'Paketler', icon: Package },
      { id: 'services-admin', label: 'Hizmetler', icon: Dumbbell },
      { id: 'reservations', label: 'Rezervasyonlar', icon: LayoutDashboard },
      { id: 'classes', label: 'Dersler', icon: Video },
      { id: 'trainers', label: 'Eğitmenler', icon: Medal },
    ]
  },
  {
    label: 'İÇERİK YÖNETİMİ',
    items: [
      { id: 'banner', label: 'Banner Yönetimi', icon: Image },
      { id: 'gallery-admin', label: 'Galeri Yönetimi', icon: Image },
      { id: 'announcements-admin', label: 'Duyurular', icon: Megaphone },
      { id: 'ticker', label: 'Kayan Yazılar', icon: TrendingUp },
      { id: 'blog', label: 'Blog Yönetimi', icon: FileText },
      { id: 'pages', label: 'Sayfalar', icon: FileText },
      { id: 'comments', label: 'Yorumlar', icon: MessageCircle },
      { id: 'messages', label: 'Mesajlar', icon: MessageCircle },
    ]
  },
  {
    label: 'DİĞER',
    items: [
      { id: 'payments', label: 'Ödemeler', icon: CreditCard },
      { id: 'coupons', label: 'Kuponlar', icon: BadgeInfo },
      { id: 'whatsapp', label: 'WhatsApp Ayarları', icon: MessageCircle },
      { id: 'assistant', label: 'Asistan Ayarları', icon: Sparkles },
      { id: 'theme', label: 'Tema Ayarları', icon: Palette },
      { id: 'seo', label: 'SEO Ayarları', icon: Search },
      { id: 'backup', label: 'Yedekleme', icon: Save },
    ]
  }
];

function AdminSidebar({ activeTab, onTabChange, onClose }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <Brand compact />
      </div>
      <nav className="admin-sidebar-nav">
        {sidebarGroups.map((group, idx) => (
          <div key={idx} className="admin-sidebar-group">
            <div className="admin-sidebar-group-title">{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <button className="admin-sidebar-link" type="button" onClick={onClose}>
          <LogOut size={18} />
          <span>Sistemi Görüntüle</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({ onClose }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <Menu size={20} />
        <span className="admin-topbar-title">Dashboard</span>
        <span className="admin-topbar-dot" />
        <span className="admin-topbar-sub">Kontrol paneli özet bilgiler</span>
      </div>
      <div className="admin-topbar-right">
        <div className="admin-search">
          <Search size={16} />
          <input placeholder="Ara..." />
        </div>
        <button className="admin-topbar-icon" type="button"><Moon size={18} /></button>
        <button className="admin-topbar-icon" type="button"><Bell size={18} /></button>
        <button className="admin-topbar-icon" type="button"><Settings2 size={18} /></button>
        <div className="admin-avatar">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Admin" />
          <div>
            <strong>Admin</strong>
            <span>Süper Yönetici</span>
          </div>
          <ChevronRight size={14} />
        </div>
      </div>
    </header>
  );
}

function MiniSpark({ color = '#7CFF4F', data }) {
  const d = data || [12, 18, 14, 22, 28, 24, 32, 38, 34, 42, 48, 44, 52, 58, 54, 62, 68, 64, 72, 78];
  const max = Math.max(...d);
  const min = Math.min(...d);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const points = d.map((v, i) => {
    const x = (i / (d.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {d.map((v, i) => {
        const x = (i / (d.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 6) - 3;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}

function AdminDashboardHome({ state, setState }) {
  const incomeData = [
    { name: '1 May', gelir: 85000, gider: 45000 },
    { name: '8 May', gelir: 92000, gider: 48000 },
    { name: '15 May', gelir: 180000, gider: 65000 },
    { name: '22 May', gelir: 140000, gider: 55000 },
    { name: '29 May', gelir: 210000, gider: 70000 },
  ];
  const memberData = [
    { name: '1 May', yeni: 1800, aktif: 3200 },
    { name: '8 May', yeni: 2200, aktif: 3600 },
    { name: '15 May', yeni: 2800, aktif: 4200 },
    { name: '22 May', yeni: 3500, aktif: 4800 },
    { name: '29 May', yeni: 4200, aktif: 5200 },
  ];
  const rezData = [
    { name: '1 May', rez: 28 },
    { name: '8 May', rez: 42 },
    { name: '15 May', rez: 36 },
    { name: '22 May', rez: 58 },
    { name: '29 May', rez: 48 },
  ];

  const stats = [
    { label: 'Toplam Üye', value: '5.231', change: '+12.5% bu ay', color: '#7CFF4F', icon: Users, spark: '#7CFF4F' },
    { label: 'Aktif Üye', value: '4.892', change: '+9.3% bu ay', color: '#22C55E', icon: Users, spark: '#22C55E' },
    { label: 'Toplam Gelir', value: '₺1.250.000', change: '+18.7% bu ay', color: '#B8FF3B', icon: BarChart3, spark: '#B8FF3B' },
    { label: "Bugünkü Rezervasyon", value: '28', change: '+7.3% bugün', color: '#F59E0B', icon: LayoutDashboard, spark: '#F59E0B' },
    { label: 'Toplam Ders', value: '156', change: '+11.2% bu ay', color: '#7CFF4F', icon: Video, spark: '#7CFF4F' },
    { label: 'Eğitmen', value: '25', change: '+4.2% bu ay', color: '#EF4444', icon: Medal, spark: '#EF4444' },
  ];

  const recentMembers = [
    { name: 'Ahmet Yılmaz', email: 'ahmetyilmaz@gmail.com', status: 'Aktif', date: '25 May 2025 14:30', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { name: 'Mehmet Demir', email: 'mehmetdemir@gmail.com', status: 'Aktif', date: '25 May 2025 13:15', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=120&q=80' },
    { name: 'Zeynep Kaya', email: 'zeynepkaya@gmail.com', status: 'Aktif', date: '25 May 2025 11:45', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
    { name: 'Ayşe Şahin', email: 'aysesahin@gmail.com', status: 'Aktif', date: '24 May 2025 18:20', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
    { name: 'Emre Özdemir', email: 'emreozdemir@gmail.com', status: 'Aktif', date: '24 May 2025 16:10', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' },
  ];

  const recentReservations = [
    { service: 'Crossfit', member: 'Ahmet Yılmaz', date: '25 May 2025 15:00', status: 'Onaylandı' },
    { service: 'Yoga', member: 'Zeynep Kaya', date: '25 May 2025 16:00', status: 'Onaylandı' },
    { service: 'Fitness', member: 'Mehmet Demir', date: '25 May 2025 17:00', status: 'Beklemede' },
    { service: 'Pilates', member: 'Ayşe Şahin', date: '24 May 2025 18:20', status: 'Onaylandı' },
    { service: 'Body Building', member: 'Emre Özdemir', date: '24 May 2025 19:00', status: 'Onaylandı' },
  ];

  const quickActions = [
    { label: 'Yeni Üye Ekle', icon: Users },
    { label: 'Paket Ekle', icon: Package },
    { label: 'Ders Ekle', icon: Video },
    { label: 'Banner Ekle', icon: Image },
    { label: 'Duyuru Ekle', icon: Megaphone },
    { label: 'Kupon Ekle', icon: BadgeInfo },
    { label: 'Galeri Ekle', icon: Image },
    { label: 'Eğitmen Ekle', icon: Medal },
  ];

  const announcementsList = [
    { title: 'Yaz Kampanyası Başladı!', date: '20 May 2025', status: 'Aktif' },
    { title: 'Bayramda 09:00 - 18:00 Arası Hizmetinizdeyiz.', date: '18 May 2025', status: 'Aktif' },
    { title: 'Arkadaşını Getir %25 İndirim Kazan!', date: '15 May 2025', status: 'Aktif' },
  ];

  const tickerList = [
    { title: 'Yeni Pilates Grubu Başlıyor!', active: true },
    { title: 'Yaz Kampanyası %30 İndirim!', active: true },
    { title: 'Öğrencilere Özel %25 İndirim!', active: true },
  ];

  const activePackages = [
    { name: 'Başlangıç Paketi', price: '₺499 / Ay', status: 'Aktif' },
    { name: 'Orta Seviye Paket', price: '₺799 / Ay', status: 'Aktif' },
    { name: 'Premium Paket', price: '₺1199 / Ay', status: 'Aktif' },
  ];

  const topServices = [
    { name: 'Fitness', members: '2.350 üye' },
    { name: 'Personal Trainer', members: '1.420 üye' },
    { name: 'Pilates', members: '1.100 üye' },
    { name: 'Yoga', members: '950 üye' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-row">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
                  <Icon size={18} />
                </div>
                <div className="admin-stat-meta">
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-change" style={{ color: s.color }}>{s.change}</div>
                </div>
              </div>
              <MiniSpark color={s.spark} />
            </div>
          );
        })}
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <strong>Gelir Grafiği</strong>
            <span className="admin-chart-legend"><i style={{ background: '#7CFF4F' }} /> Gelir <i style={{ background: '#EF4444' }} /> Gider</span>
            <select><option>Bu Ay</option></select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="gelir" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7CFF4F" stopOpacity={0.3}/><stop offset="95%" stopColor="#7CFF4F" stopOpacity={0}/></linearGradient>
                <linearGradient id="gider" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="gelir" stroke="#7CFF4F" fill="url(#gelir)" strokeWidth={2} />
              <Area type="monotone" dataKey="gider" stroke="#EF4444" fill="url(#gider)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <strong>Üye Grafiği</strong>
            <span className="admin-chart-legend"><i style={{ background: '#7CFF4F' }} /> Yeni Üyeler <i style={{ background: '#3B82F6' }} /> Aktif Üyeler</span>
            <select><option>Bu Ay</option></select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={memberData}>
              <defs>
                <linearGradient id="yeni" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7CFF4F" stopOpacity={0.3}/><stop offset="95%" stopColor="#7CFF4F" stopOpacity={0}/></linearGradient>
                <linearGradient id="aktif" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="yeni" stroke="#7CFF4F" fill="url(#yeni)" strokeWidth={2} />
              <Area type="monotone" dataKey="aktif" stroke="#3B82F6" fill="url(#aktif)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <strong>Rezervasyon Grafiği</strong>
            <span className="admin-chart-legend"><i style={{ background: '#7CFF4F' }} /> Rezervasyon</span>
            <select><option>Bu Ay</option></select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rezData}>
              <defs>
                <linearGradient id="rez" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7CFF4F" stopOpacity={0.3}/><stop offset="95%" stopColor="#7CFF4F" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="rez" stroke="#7CFF4F" fill="url(#rez)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-mid-row">
        <div className="admin-table-card">
          <div className="admin-table-header"><strong>Son Kayıt Olan Üyeler</strong></div>
          <div className="admin-table">
            {recentMembers.map((m, i) => (
              <div className="admin-table-row" key={i}>
                <img src={m.avatar} alt="" />
                <div className="admin-table-info">
                  <strong>{m.name}</strong>
                  <span>{m.email}</span>
                </div>
                <span className="admin-table-status aktif">{m.status}</span>
                <span className="admin-table-date">{m.date}</span>
              </div>
            ))}
          </div>
          <button className="admin-table-more" type="button">Tüm Üyeleri Görüntüle</button>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-header"><strong>Son Rezervasyonlar</strong></div>
          <div className="admin-table">
            {recentReservations.map((r, i) => (
              <div className="admin-table-row" key={i}>
                <div className="admin-table-info">
                  <strong>{r.service}</strong>
                  <span>{r.member}</span>
                </div>
                <span className="admin-table-date">{r.date}</span>
                <span className={`admin-table-status ${r.status === 'Onaylandı' ? 'aktif' : 'bekleme'}`}>{r.status}</span>
              </div>
            ))}
          </div>
          <button className="admin-table-more" type="button">Tüm Rezervasyonları Görüntüle</button>
        </div>

        <div className="admin-quick-card">
          <div className="admin-table-header"><strong>Hızlı İşlemler</strong></div>
          <div className="admin-quick-grid">
            {quickActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} className="admin-quick-btn" type="button">
                  <Icon size={20} />
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-status-card">
          <div className="admin-table-header"><strong>Site Durumu</strong></div>
          <div className="admin-status-rings">
            <div className="admin-ring"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7CFF4F" strokeWidth={3} strokeDasharray="72, 100" /></svg><strong>72%</strong><span>Disk Alanı</span><small>72 GB / 100 GB</small></div>
            <div className="admin-ring"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth={3} strokeDasharray="66, 100" /></svg><strong>66%</strong><span>Veritabanı</span><small>680 MB / 1 GB</small></div>
            <div className="admin-ring"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7CFF4F" strokeWidth={3} strokeDasharray="90, 100" /></svg><strong>90%</strong><span>Yedekleme</span><small>Son yedekleme: Bugün 03:00</small></div>
          </div>
          <div className="admin-sysinfo">
            <div className="admin-sysinfo-title">Sistem Bilgileri</div>
            <div className="admin-sysinfo-row"><span>PHP Sürümü</span><span>8.2.1</span></div>
            <div className="admin-sysinfo-row"><span>MySQL Sürümü</span><span>8.0.32</span></div>
            <div className="admin-sysinfo-row"><span>Sunucu</span><span>Nginx</span></div>
            <div className="admin-sysinfo-row"><span>Sistem</span><span>Linux</span></div>
          </div>
        </div>
      </div>

      <div className="admin-bottom-row">
        <div className="admin-bottom-card">
          <div className="admin-bottom-header"><strong>Duyurular</strong><span>Tümü ›</span></div>
          {announcementsList.map((a, i) => (
            <div className="admin-bottom-item" key={i}>
              <div>
                <strong>{a.title}</strong>
                <span>{a.date}</span>
              </div>
              <span className="admin-table-status aktif">{a.status}</span>
            </div>
          ))}
        </div>

        <div className="admin-bottom-card">
          <div className="admin-bottom-header"><strong>Kayan Yazılar</strong></div>
          {tickerList.map((t, i) => (
            <div className="admin-bottom-item" key={i}>
              <div>
                <strong>{t.title}</strong>
              </div>
              <span className={`admin-toggle ${t.active ? 'on' : ''}`}><span /></span>
            </div>
          ))}
        </div>

        <div className="admin-bottom-card">
          <div className="admin-bottom-header"><strong>Aktif Paketler</strong><span>Tümü ›</span></div>
          {activePackages.map((p, i) => (
            <div className="admin-bottom-item" key={i}>
              <div>
                <strong>{p.name}</strong>
                <span>{p.price}</span>
              </div>
              <span className="admin-table-status aktif">{p.status}</span>
            </div>
          ))}
        </div>

        <div className="admin-bottom-card">
          <div className="admin-bottom-header"><strong>En Çok Tercih Edilen Hizmetler</strong><span>Tümü ›</span></div>
          {topServices.map((s, i) => (
            <div className="admin-bottom-item" key={i}>
              <div>
                <strong>{s.name}</strong>
              </div>
              <span className="admin-table-status aktif">{s.members}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminSettingsPage({ state, setState, activeTab }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-table-card" style={{ maxWidth: 900 }}>
        <div className="admin-table-header"><strong>{activeTab}</strong></div>
        <p style={{ color: 'rgba(255,255,255,0.6)', padding: '18px 20px' }}>Bu bölüm için içerik yönetimi yakında eklenecek.</p>
      </div>
    </div>
  );
}

function AdminDashboard({ state, setState }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginMode, setLoginMode] = useState('email');
  const [loginForm, setLoginForm] = useState({ email: '', username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const adminEmail = 'admin@peakspor.com';
  const adminUsername = 'admin';
  const adminPassword = 'peakspor123';

  const handleLogin = event => {
    event.preventDefault();
    setLoginPending(true);
    setLoginError('');
    const emailMatch = loginForm.email.trim().toLowerCase() === adminEmail;
    const usernameMatch = loginForm.username.trim().toLowerCase() === adminUsername;
    const passwordMatch = loginForm.password === adminPassword;
    const canLogin = passwordMatch && (emailMatch || usernameMatch);
    window.setTimeout(() => {
      setLoginPending(false);
      if (!canLogin) {
        setLoginError('E-posta, kullanıcı adı veya şifre hatalı.');
        return;
      }
      setUnlocked(true);
    }, 350);
  };

  if (!unlocked) {
    return (
      <div className="admin-fullscreen">
        <div className="admin-login-center">
          <div className="admin-login-brand">
            <Brand />
            <p>Yönetim paneline erişmek için kimlik bilgilerinizi girin.</p>
          </div>
          <div className="admin-login-card">
            <div className="admin-login-card-header">
              <button type="button" className={loginMode === 'email' ? 'active' : ''} onClick={() => setLoginMode('email')}>E-Posta</button>
              <button type="button" className={loginMode === 'username' ? 'active' : ''} onClick={() => setLoginMode('username')}>Kullanıcı Adı</button>
            </div>
            <form className="admin-login-form" onSubmit={handleLogin}>
              {loginMode === 'email' ? (
                <label>E-posta<input type="email" value={loginForm.email} onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))} placeholder="admin@peakspor.com" /></label>
              ) : (
                <label>Kullanıcı adı<input type="text" value={loginForm.username} onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))} placeholder="admin" /></label>
              )}
              <label>Şifre<input type="password" value={loginForm.password} onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" /></label>
              {loginError ? <div className="admin-login-error">{loginError}</div> : null}
              <button className="save-button" type="submit" disabled={loginPending}>
                <LayoutDashboard size={16} />
                {loginPending ? 'Giriş yapılıyor...' : 'Yetkili Giriş'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fullscreen">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onClose={() => setState(prev => ({ ...prev, adminOpen: false }))} />
      <div className="admin-main">
        <AdminTopbar onClose={() => setState(prev => ({ ...prev, adminOpen: false }))} />
        <div className="admin-content">
          {activeTab === 'dashboard' ? <AdminDashboardHome state={state} setState={setState} /> : <AdminSettingsPage state={state} setState={setState} activeTab={activeTab} />}
        </div>
      </div>
    </div>
  );
}

function AdminModal({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const drafts = state.adminDrafts;
  const [loginMode, setLoginMode] = useState('email');
  const [loginForm, setLoginForm] = useState({ email: '', username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const adminEmail = 'admin@peakspor.com';
  const adminUsername = 'admin';
  const adminPassword = 'peakspor123';

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

  const handleLogin = event => {
    event.preventDefault();
    setLoginPending(true);
    setLoginError('');

    const emailMatch = loginForm.email.trim().toLowerCase() === adminEmail;
    const usernameMatch = loginForm.username.trim().toLowerCase() === adminUsername;
    const passwordMatch = loginForm.password === adminPassword;
    const canLogin = passwordMatch && (emailMatch || usernameMatch);

    window.setTimeout(() => {
      setLoginPending(false);
      if (!canLogin) {
        setLoginError('E-posta, kullanıcı adı veya şifre hatalı.');
        return;
      }

      setUnlocked(true);
    }, 350);
  };

  if (!unlocked) {
    return (
      <div className="modal-backdrop">
        <div className="admin-login-shell">
          <div className="admin-login-shell-top">
            <div>
              <span>Yetkili Giriş</span>
              <h3>PEAKSPOR Kontrol Merkezi</h3>
              <p>Yönetim paneline erişmek için kimlik bilgilerinizi girin.</p>
            </div>
            <button className="icon-button" type="button" onClick={() => setState(prev => ({ ...prev, adminOpen: false }))}>
              <X size={18} />
            </button>
          </div>

          <div className="admin-login-card">
            <div className="admin-login-card-header">
              <button
                type="button"
                className={loginMode === 'email' ? 'active' : ''}
                onClick={() => setLoginMode('email')}
              >
                E-Posta
              </button>
              <button
                type="button"
                className={loginMode === 'username' ? 'active' : ''}
                onClick={() => setLoginMode('username')}
              >
                Kullanıcı Adı
              </button>
            </div>
            <form className="admin-login-form" onSubmit={handleLogin}>
              {loginMode === 'email' ? (
                <label>
                  E-posta
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@peakspor.com"
                  />
                </label>
              ) : (
                <label>
                  Kullanıcı adı
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin"
                  />
                </label>
              )}
              <label>
                Şifre
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </label>
              {loginError ? <div className="admin-login-error">{loginError}</div> : null}
              <button className="save-button" type="submit" disabled={loginPending}>
                <LayoutDashboard size={16} />
                {loginPending ? 'Giriş yapılıyor...' : 'Yetkili Giriş'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (state.adminOpen && unlocked) {
    return (
      <div className="modal-backdrop">
        <div className="admin-panel">
          <div className="admin-header">
            <div>
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

  return (
    <div className="modal-backdrop">
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <h3>PEAKSPOR Kontrol Merkezi</h3>
          </div>
          <button className="icon-button" type="button" onClick={() => setState(prev => ({ ...prev, adminOpen: false }))}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <button
              type="button"
              className={loginMode === 'email' ? 'active' : ''}
              onClick={() => setLoginMode('email')}
            >
              E-Posta
            </button>
            <button
              type="button"
              className={loginMode === 'username' ? 'active' : ''}
              onClick={() => setLoginMode('username')}
            >
              Kullanıcı Adı
            </button>
          </div>
          <form className="admin-login-form" onSubmit={handleLogin}>
            {loginMode === 'email' ? (
              <label>
                E-posta
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@peakspor.com"
                />
              </label>
            ) : (
              <label>
                Kullanıcı adı
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                />
              </label>
            )}
            <label>
              Şifre
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </label>
            {loginError ? <div className="admin-login-error">{loginError}</div> : null}
            <button className="save-button" type="submit" disabled={loginPending}>
              <LayoutDashboard size={16} />
              {loginPending ? 'Giriş yapılıyor...' : 'Yetkili Giriş'}
            </button>
          </form>
        </div>
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

  useEffect(() => {
    document.documentElement.style.background = '#050505';
    document.documentElement.style.minHeight = '100dvh';
    document.documentElement.style.width = '100%';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.background = '#050505';
    document.body.style.minHeight = '100dvh';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overscrollBehaviorY = 'auto';
    document.body.style.touchAction = 'pan-y';
    return () => {
      document.documentElement.style.minHeight = '';
      document.documentElement.style.width = '';
      document.documentElement.style.overflowX = '';
      document.body.style.minHeight = '';
      document.body.style.width = '';
      document.body.style.overflowX = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overscrollBehaviorY = '';
      document.body.style.touchAction = '';
    };
  }, []);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <Brand />
        <div className="loading-bar" />
      </div>
    );
  }

  if (state.adminOpen) {
    return <AdminDashboard state={state} setState={setState} />;
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