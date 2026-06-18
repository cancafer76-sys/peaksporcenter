import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import {
  defaultAnnouncements,
  defaultContent,
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
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'packages', label: 'Paketler' },
  { id: 'contact', label: 'İletişim' }
];

const mobileNav = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'packages', label: 'Paketler', icon: Package },
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

function Ticker({ items }) {
  const text = resolveAnnouncementText(items);
  return (
    <div className="ticker">
      <div className="ticker-label">
        <Megaphone size={14} />
        Duyurular
      </div>
      <div className="ticker-track">
        <span>{text}</span>
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

function DesktopShell({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
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
              <button key={item.id} type="button" className="desktop-nav-link" onClick={() => scrollToSection(item.id)}>
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
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const services = state.settings.services || defaultServices;
  const packages = state.settings.packages || defaultPackages;
  const selectedService = state.selectedService || services[0];
  const selectedPackage = state.selectedPackage || packages[0];

  return (
    <div className={`app-shell mobile-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <header className="mobile-header">
        <div className="mobile-header-inner shell-width">
          <button
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
            aria-label="Menü"
          >
            <Menu size={18} />
          </button>
          <Brand compact />
          <HeaderActions
            darkMode={state.darkMode}
            onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
          />
        </div>
      </header>

      <main className="shell-width mobile-page">
        <div className="mobile-top-appbar">
          <button type="button" className="mobile-top-appbar-chip active" onClick={() => setState(prev => ({ ...prev, drawerOpen: true }))}>
            <Menu size={14} />
            Menü
          </button>
          <button type="button" className="mobile-top-appbar-chip" onClick={() => scrollToSection('services')}>
            Hizmetler
          </button>
          <button type="button" className="mobile-top-appbar-chip" onClick={() => scrollToSection('packages')}>
            Paketler
          </button>
          <button type="button" className="mobile-top-appbar-chip" onClick={() => scrollToSection('contact')}>
            İletişim
          </button>
        </div>

        <Ticker items={state.settings.announcements} />

        <section className="mobile-hero" id="home">
          <img className="mobile-hero-image" src={content.hero?.image || defaultContent.hero.image} alt="Peakspor hero" />
          <div className="hero-overlay hero-overlay-mobile" />
          <div className="mobile-hero-content">
            <div className="hero-badge hero-badge-mobile">
              <Sparkles size={14} />
              Premium Fitness
            </div>
            <h1>
              <span>HEDEFİNE ULAŞ</span>
              <span className="hero-green">ZİRVEYİ YAŞA!</span>
            </h1>
            <p>{content.hero?.subtitle || defaultContent.hero.subtitle}</p>
            <HeroButtons
              compact
              onPrimary={() => scrollToSection('packages')}
              onSecondary={() => scrollToSection('services')}
            />
          </div>
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

        <section className="section-block" id="services">
          <SectionHeader
            title="HİZMETLER"
            action={<button className="text-button" type="button">Tümü <ChevronRight size={16} /></button>}
          />
          <div className="service-grid-mobile">
            {services.map(service => (
              <button
                key={service.title}
                type="button"
                className={`service-card service-card-mobile ${selectedService?.title === service.title ? 'selected' : ''}`}
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
        </section>

        <section className="section-block" id="packages">
          <SectionHeader
            title="PAKETLER"
            action={<button className="text-button" type="button">Tümü <ChevronRight size={16} /></button>}
          />
          <div className="package-rail-mobile">
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
        <button type="button" className="bottom-nav-item active" onClick={() => scrollToSection('home')}>
          <Home size={18} />
          <span>Ana Sayfa</span>
        </button>
        <button type="button" className="bottom-nav-item" onClick={() => scrollToSection('services')}>
          <Dumbbell size={18} />
          <span>Hizmetler</span>
        </button>
        <button
          type="button"
          className="bottom-nav-item menu-center"
          onClick={() => setState(prev => ({ ...prev, drawerOpen: true }))}
        >
          <Menu size={18} />
          <span>Menü</span>
        </button>
        <button type="button" className="bottom-nav-item" onClick={() => scrollToSection('packages')}>
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

export default function App() {
  const [state, setState] = useAppData();
  const isMobile = useMemo(() => state.viewportWidth < 980, [state.viewportWidth]);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <Brand />
        <div className="loading-bar" />
      </div>
    );
  }

  return isMobile ? <MobileShell state={state} setState={setState} /> : <DesktopShell state={state} setState={setState} />;
}