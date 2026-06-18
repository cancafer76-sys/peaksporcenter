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
  Bell,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  LayoutDashboard,
  Megaphone,
  Menu,
  Moon,
  Package,
  Pause,
  Play,
  Search,
  SunMedium,
  UserRound,
  Users,
  Video,
  Zap,
  MessageCircle,
  BadgeInfo,
  Waves,
  Medal,
  TimerReset,
  SquareStack,
  Sparkles,
  ArrowRight,
  Bot,
  BarChart3
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

const mobileNav = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'booking', label: 'Rezervasyon', icon: LayoutDashboard },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

const statIcons = [Users, Users, Video, Medal];
const desktopNav = [
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'services', label: 'Hizmetlerimiz' },
  { id: 'booking', label: 'Rezervasyon' },
  { id: 'packages', label: 'Paketler' },
  { id: 'trainers', label: 'Eğitmenler' },
  { id: 'gallery', label: 'Galeri' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'İletişim' }
];

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

function useAppData() {
  const [state, setState] = useState({
    settings: fallbackSettings,
    user: null,
    loading: true,
    drawerOpen: false,
    assistantOpen: false,
    adminOpen: false,
    darkMode: true
  });

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([api.content(), api.me()]).then(([contentResult, meResult]) => {
      if (!mounted) return;
      setState(prev => ({
        ...prev,
        settings:
          contentResult.status === 'fulfilled' ? normalizeSettings(contentResult.value) : fallbackSettings,
        user: meResult.status === 'fulfilled' ? meResult.value?.user || null : null,
        loading: false
      }));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return [state, setState];
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function DesktopHeader({ onMenu, onToggleTheme, darkMode }) {
  return (
    <header className="desktop-header">
      <div className="desktop-header-inner">
        <button className="desktop-brand" type="button" onClick={() => scrollToSection('home')}>
          <span className="brand-mark brand-mark-desktop">▲</span>
          <span className="brand-text brand-text-desktop">
            <strong>
              <span>PEAK</span>
              <span className="brand-accent">SPOR</span>
            </strong>
          </span>
        </button>

        <nav className="desktop-menu" aria-label="Ana menü">
          {desktopNav.map(item => (
            <button key={item.id} type="button" className={`desktop-menu-item ${item.id === 'home' ? 'active' : ''}`} onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="desktop-header-actions">
          <button className="desktop-header-icon" type="button" aria-label="Bildirimler">
            <Bell size={18} />
            <span className="badge-dot desktop-badge-dot" />
          </button>
          <button className="desktop-header-toggle" type="button" onClick={onToggleTheme} aria-label="Tema değiştir">
            {darkMode ? <Moon size={14} /> : <SunMedium size={14} />}
          </button>
          <button className="desktop-header-icon desktop-menu-button" type="button" onClick={onMenu} aria-label="Menü">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

function DesktopHero({ content, onCta }) {
  const hero = content.hero || defaultContent.hero;
  return (
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
        <p>
          Profesyonel ekipmanlar, uzman eğitmenler ve modern tesislerle hedeflerine ulaş.
        </p>
        <div className="hero-actions hero-actions-desktop">
          <button className="primary-button" type="button" onClick={() => onCta('booking')}>
            ÜYE OL
          </button>
          <button className="secondary-button" type="button" onClick={() => onCta('services')}>
            SALONU KEŞFET
          </button>
        </div>
      </div>

      <div className="desktop-hero-media">
        <img src={hero.image} alt="Peakspor hero athlete" />
        <div className="desktop-hero-overlay" />
        <button className="hero-arrow hero-arrow-left" type="button" aria-label="Önceki">
          <ChevronRight size={18} />
        </button>
        <button className="hero-arrow hero-arrow-right" type="button" aria-label="Sonraki">
          <ChevronRight size={18} />
        </button>
        <div className="desktop-indicators">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </section>
  );
}

function DesktopStats({ stats }) {
  return (
    <section className="desktop-stats">
      {stats.map((stat, index) => {
        const Icon = statIcons[index] || Users;
        return (
          <article key={stat.label} className="desktop-stat-card">
            <Icon size={22} />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        );
      })}
    </section>
  );
}

function DesktopTicker({ items, paused, onToggle }) {
  const list = items && items.length ? items : defaultAnnouncements;
  const text = [...list, ...list].map(item => (typeof item === 'string' ? item : item.message)).join(' • ');
  return (
    <section className="desktop-ticker">
      <div className="desktop-ticker-left">
        <Megaphone size={16} />
      </div>
      <div className={`desktop-ticker-track ${paused ? 'paused' : ''}`}>
        <span>{text}</span>
      </div>
      <button className="desktop-ticker-toggle" type="button" onClick={onToggle} aria-label="Duyuru duraklat">
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </section>
  );
}

function DesktopServices({ services }) {
  const list = services && services.length ? services : defaultServices;
  return (
    <section className="desktop-section" id="services">
      <div className="section-heading desktop-section-heading">
        <h2>HİZMETLERİMİZ</h2>
        <button className="text-link" type="button">TÜM HİZMETLER <ChevronRight size={16} /></button>
      </div>
      <div className="desktop-services-row">
        {list.map(service => (
          <article key={service.title} className="desktop-service-card">
            <img src={service.image} alt={service.title} />
            <div className="service-shade" />
            <div className="desktop-service-footer">
              <div className="service-icon">
                <Dumbbell size={15} />
              </div>
              <strong>{service.title}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopPackages({ packages: packageList }) {
  const packages = packageList && packageList.length ? packageList : defaultPackages;
  return (
    <section className="desktop-section" id="packages">
      <div className="section-heading desktop-section-heading">
        <h2>PAKETLERİMİZ</h2>
        <button className="text-link" type="button">TÜM PAKETLER <ChevronRight size={16} /></button>
      </div>
      <div className="desktop-packages-grid">
        {packages.slice(0, 3).map((packageItem, index) => (
          <article key={packageItem.title} className={`desktop-package-card theme-${index}`}>
            <div className="package-graphic" />
            <div className="package-top">
              <div>
                <span>{index === 0 ? 'BAŞLANGIÇ PAKETİ' : index === 1 ? 'ORTA SEVİYE PAKETİ' : 'PREMIUM PAKET'}</span>
                <h3>{packageItem.title}</h3>
              </div>
              <div className="package-price">
                ₺{formatPrice(packageItem.price)} <small>{packageItem.period}</small>
              </div>
            </div>
            <ul>
              {packageItem.features.slice(0, 5).map(feature => (
                <li key={feature}>
                  <CheckMark />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="package-button desktop-package-button" type="button">
              {packageItem.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopBottomFeatures() {
  const items = [
    'Esnek Üyelik',
    '%100 Memnuniyet',
    '7/24 Destek',
    'Güvenli Ödeme'
  ];
  return (
    <section className="desktop-bottom-features">
      {items.map(item => (
        <span key={item}>
          <Zap size={14} />
          {item}
        </span>
      ))}
    </section>
  );
}

function DesktopAssistant({ open, onToggle, content }) {
  const assistant = content.assistant || defaultContent.assistant;
  return (
    <>
      {open ? (
        <div className="assistant-panel desktop-assistant-panel">
          <div className="assistant-panel-header">
            <div>
              <strong>PEAKSPOR ASİSTAN</strong>
              <span>{assistant.message}</span>
            </div>
            <button type="button" className="panel-close" onClick={onToggle} aria-label="Kapat">
              ×
            </button>
          </div>
          <div className="assistant-actions">
            {assistant.buttons.map(button => (
              <button key={button} type="button" className="assistant-chip">
                {button}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="floating-stack desktop-floating-stack">
        <button className="floating-assistant" type="button" onClick={onToggle} aria-label="Asistan">
          <Bot size={20} />
        </button>
        <a className="desktop-whatsapp-button" href={`https://wa.me/${(content.whatsapp?.number || '+905555555555').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <MessageCircle size={18} />
          WHATSAPP HATTINA KATIL
        </a>
      </div>
    </>
  );
}

function DesktopPage({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const announcements = state.settings.announcements || defaultAnnouncements;

  return (
    <div className={`desktop-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <DesktopHeader
        onMenu={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
        onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
        darkMode={state.darkMode}
      />

      <main className="desktop-page">
        <DesktopHero content={content} onCta={scrollToSection} />
        <DesktopStats stats={stats} />
        <DesktopTicker
          items={announcements}
          paused={state.announcementPaused}
          onToggle={() => setState(prev => ({ ...prev, announcementPaused: !prev.announcementPaused }))}
        />
        <DesktopServices services={state.settings.services} />
        <DesktopPackages packages={state.settings.packages} />
        <DesktopBottomFeatures />
      </main>

      {state.drawerOpen ? (
        <aside className="drawer desktop-drawer">
          <div className="drawer-head">
            <strong>Menü</strong>
            <button type="button" className="panel-close" onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}>×</button>
          </div>
          <div className="drawer-list">
            {desktopNav.map(item => (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <DesktopAssistant
        open={state.assistantOpen}
        onToggle={() => setState(prev => ({ ...prev, assistantOpen: !prev.assistantOpen }))}
        content={content}
      />
    </div>
  );
}

function MobileHeader({ onMenu, onAdmin, darkMode, onToggleTheme, content }) {
  return (
    <header className="mobile-status-shell">
      <div className="status-bar">
        <span>09:41</span>
        <div className="status-icons">
          <span>5G</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>
      <div className="mobile-topbar">
        <button className="glass-icon-button" type="button" onClick={onMenu} aria-label="Menü">
          <Menu size={19} />
        </button>
        <button className="brand-lockup" type="button" onClick={() => scrollToSection('home')}>
          <span className="brand-mark brand-mark-small">▲</span>
          <span className="brand-text">
            <strong>
              <span>PEAK</span>
              <span className="brand-accent">SPOR</span>
            </strong>
            <small>Premium Fitness</small>
          </span>
        </button>
        <div className="mobile-header-actions">
          <button className="glass-icon-button" type="button" aria-label="Bildirimler">
            <Bell size={17} />
            <span className="badge-dot" />
          </button>
          <button className="glass-icon-button theme-toggle" type="button" onClick={onToggleTheme} aria-label="Tema değiştir">
            {darkMode ? <Moon size={16} /> : <SunMedium size={16} />}
          </button>
          <button className="glass-icon-button" type="button" onClick={onAdmin} aria-label="Admin panel">
            <LayoutDashboard size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ content, onCta }) {
  const hero = content.hero || defaultContent.hero;
  return (
    <section className="mobile-hero" id="home">
      <div className="hero-overlay" />
      <img className="hero-image" src={hero.image} alt="Peakspor hero" />
      <div className="hero-content">
        <div className="hero-pill">
          <Sparkles size={13} />
          Premium Fitness App
        </div>
        <h1>
          <span>HEDEFİNE ULAŞ</span>
          <span className="hero-green">ZİRVEYİ YAŞA!</span>
        </h1>
        <p>
          Profesyonel ekipmanlar, uzman eğitmenler ve modern tesislerle hedeflerine ulaş.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => onCta('booking')}>
            ÜYE OL
          </button>
          <button className="secondary-button" type="button" onClick={() => onCta('services')}>
            SALONU KEŞFET
          </button>
        </div>
      </div>
      <div className="slider-dots" aria-hidden="true">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </section>
  );
}

function StatCards({ stats }) {
  return (
    <section className="section-stack stats-grid">
      {stats.map((stat, index) => {
        const Icon = statIcons[index] || Users;
        return (
          <article key={stat.label} className="stat-card">
            <Icon size={16} />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        );
      })}
    </section>
  );
}

function AnnouncementBar({ items, paused, onToggle }) {
  const list = items && items.length ? items : defaultAnnouncements;
  const text = [...list, ...list].map(item => (typeof item === 'string' ? item : item.message)).join(' • ');
  return (
    <section className="announcement-shell">
      <div className="announcement-card">
        <div className="announcement-left">
          <Megaphone size={16} />
        </div>
        <div className={`announcement-track ${paused ? 'paused' : ''}`}>
          <span>{text}</span>
        </div>
        <button className="announcement-toggle" type="button" onClick={onToggle} aria-label="Duyuru duraklat">
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}

function ServicesGrid({ services }) {
  return (
    <section className="section-stack" id="services">
      <div className="section-heading">
        <h2>HİZMETLERİMİZ</h2>
        <button className="text-link" type="button">Tümü <ChevronRight size={16} /></button>
      </div>
      <div className="services-grid">
        {(services && services.length ? services : defaultServices).slice(0, 8).map(service => (
          <article key={service.title} className="service-card">
            <img src={service.image} alt={service.title} />
            <div className="service-shade" />
            <div className="service-meta">
              <div className="service-icon">
                <Dumbbell size={15} />
              </div>
              <div>
                <strong>{service.title}</strong>
                <span>{service.category}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PackagesRail({ packages: packageList }) {
  return (
    <section className="section-stack" id="packages">
      <div className="section-heading">
        <h2>PAKETLER</h2>
        <button className="text-link" type="button">Tümü <ChevronRight size={16} /></button>
      </div>
      <div className="package-rail">
        {(packageList && packageList.length ? packageList : defaultPackages).map(packageItem => (
          <article key={packageItem.title} className="package-card-mobile" style={{ '--accent': packageItem.accent }}>
            <div className="package-badge" />
            <div className="package-top">
              <div>
                <span>{packageItem.subtitle}</span>
                <h3>{packageItem.title}</h3>
              </div>
              <div className="package-price">
                ₺{formatPrice(packageItem.price)}
                <small>{packageItem.period}</small>
              </div>
            </div>
            <ul>
              {packageItem.features.slice(0, 4).map(feature => (
                <li key={feature}>
                  <CheckMark />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="package-button" type="button">
              {packageItem.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function CheckMark() {
  return <span className="check-mark">✓</span>;
}

function AssistantWidget({ open, onToggle, content }) {
  const assistant = content.assistant || defaultContent.assistant;
  return (
    <>
      {open ? (
        <div className="assistant-panel">
          <div className="assistant-panel-header">
            <div>
              <strong>👋 Hoş Geldiniz</strong>
              <span>{assistant.message}</span>
            </div>
            <button type="button" className="panel-close" onClick={onToggle} aria-label="Kapat">
              ×
            </button>
          </div>
          <div className="assistant-actions">
            {assistant.buttons.map(button => (
              <button key={button} type="button" className="assistant-chip">
                {button}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="floating-stack">
        <button className="floating-assistant" type="button" onClick={onToggle} aria-label="Asistan">
          <Bot size={20} />
        </button>
        <a className="floating-whatsapp" href={`https://wa.me/${(content.whatsapp?.number || '+905555555555').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <MessageCircle size={20} />
        </a>
      </div>
    </>
  );
}

function BottomNav({ onJump }) {
  return (
    <nav className="bottom-nav" aria-label="Alt menü">
      {mobileNav.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.id} type="button" className={`bottom-nav-item ${item.id === 'home' ? 'active' : ''}`} onClick={() => onJump(item.id)}>
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileApp({ state, setState }) {
  const content = state.settings.content || defaultContent;
  const stats = content.stats || defaultContent.stats;
  const announcements = state.settings.announcements || defaultAnnouncements;

  return (
    <div className={`mobile-shell ${state.darkMode ? 'dark' : 'light'}`}>
      <MobileHeader
        content={content}
        onMenu={() => setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }))}
        onAdmin={() => setState(prev => ({ ...prev, adminOpen: !prev.adminOpen }))}
        darkMode={state.darkMode}
        onToggleTheme={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
      />

      {state.drawerOpen ? (
        <aside className="drawer">
          <div className="drawer-head">
            <strong>Menü</strong>
            <button type="button" className="panel-close" onClick={() => setState(prev => ({ ...prev, drawerOpen: false }))}>×</button>
          </div>
          <div className="drawer-list">
            {mobileNav.map(item => (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}>
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <main className="mobile-main">
        <HeroSection content={content} onCta={scrollToSection} />
        <StatCards stats={stats} />
        <TickerBand items={announcements} />
        <ServicesGrid services={state.settings.services} />
        <PackagesRail packages={state.settings.packages} />
        <TrainersBlock trainers={state.settings.trainers} />
      </main>

      <AnnouncementBar
        items={announcements}
        paused={state.announcementPaused}
        onToggle={() => setState(prev => ({ ...prev, announcementPaused: !prev.announcementPaused }))}
      />
      <AssistantWidget
        open={state.assistantOpen}
        onToggle={() => setState(prev => ({ ...prev, assistantOpen: !prev.assistantOpen }))}
        content={content}
      />
      <BottomNav onJump={scrollToSection} />

      {state.adminOpen ? <AdminSheet onClose={() => setState(prev => ({ ...prev, adminOpen: false }))} user={state.user} /> : null}
    </div>
  );
}

function TickerBand({ items }) {
  const list = items && items.length ? items : defaultAnnouncements;
  return (
    <div className="ticker-band">
      <div className="ticker-track-mobile">
        {[...list, ...list].map((item, index) => (
          <span key={`${index}-${typeof item === 'string' ? item : item.message}`}>
            {typeof item === 'string' ? item : item.message}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrainersBlock({ trainers }) {
  const items = trainers && trainers.length ? trainers : defaultTrainers;
  return (
    <section className="section-stack" id="trainers">
      <div className="section-heading">
        <h2>EĞİTMENLER</h2>
        <button className="text-link" type="button">Tümü <ChevronRight size={16} /></button>
      </div>
      <div className="trainer-list">
        {items.slice(0, 4).map(trainer => (
          <article key={trainer.name} className="trainer-card">
            <img src={trainer.image} alt={trainer.name} />
            <div>
              <strong>{trainer.name}</strong>
              <span>{trainer.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminSheet({ onClose, user }) {
  return (
    <div className="admin-sheet">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <strong>Dashboard</strong>
            <span>{user ? user.email : 'admin@peakspor.com'}</span>
          </div>
          <button className="panel-close" type="button" onClick={onClose}>×</button>
        </div>
        <div className="admin-grid">
          <div className="admin-box"><BadgeInfo size={16} /> Ana Sayfa kontrolleri</div>
          <div className="admin-box"><Megaphone size={16} /> Duyuru yazısı</div>
          <div className="admin-box"><SquareStack size={16} /> Hizmetler</div>
          <div className="admin-box"><Package size={16} /> Paketler</div>
          <div className="admin-box"><BarChart3 size={16} /> İstatistikler</div>
          <div className="admin-box"><Waves size={16} /> Tema & SEO</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useAppData();
  const isMobile = useMemo(() => window.innerWidth < 980, []);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <strong>PEAKSPOR yükleniyor...</strong>
      </div>
    );
  }

  return isMobile ? (
    <MobileApp state={state} setState={setState} />
  ) : (
    <DesktopPage state={state} setState={setState} />
  );
}