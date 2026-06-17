import React, { useEffect, useState } from 'react';
import { api } from './api';
import {
  Bell,
  CalendarDays,
  Circle,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  Package,
  Search,
  Settings,
  Sparkles,
  SunMedium,
  Users,
  Dumbbell,
  Target,
  PlayCircle,
  ShieldCheck,
  ChevronLeft,
  Clapperboard
} from 'lucide-react';

const sections = {
  home: 'Ana Sayfa',
  services: 'Hizmetler',
  booking: 'Rezervasyon',
  packages: 'Paketler',
  profile: 'Profil'
};

const initialState = {
  content: null,
  publicData: null,
  user: null,
  dashboard: null,
  mode: 'home',
  dark: true,
  mobileMenu: false,
  assistantOpen: false,
  adminOpen: false,
  loginOpen: false,
  adminTab: 'dashboard',
  loading: true,
  error: null
};

function useAppData() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([api.content(), api.publicData(), api.me()])
      .then(([content, publicData, me]) => {
        if (!mounted) return;
        setState(prev => ({
          ...prev,
          content: content.status === 'fulfilled' ? content.value : null,
          publicData: publicData.status === 'fulfilled' ? publicData.value : null,
          user: me.status === 'fulfilled' ? me.value.user : null,
          loading: false
        }));
      })
      .catch(error => {
        if (!mounted) return;
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      });
    return () => {
      mounted = false;
    };
  }, []);

  return [state, setState];
}

function IconBadge({ icon: Icon, label, value }) {
  return (
    <div className="stat-card glass">
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <div className="muted">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Hero({ content, onReserve, onExplore }) {
  const hero = content?.hero;
  return (
    <div className="hero">
      <div className="hero-image">
        <img src={hero?.image} alt="Fitness athlete" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} /> Premium Fitness App
          </div>
          <h1>{hero?.title?.split('\n').map((line, index) => <span key={index}>{line}</span>)}</h1>
          <p>{hero?.subtitle}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onReserve}>{hero?.primaryCta}</button>
            <button className="btn btn-ghost" onClick={onExplore}>{hero?.secondaryCta}</button>
          </div>
          <div className="slider-dots">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesGrid({ services }) {
  return (
    <div className="service-grid">
      {services?.map(service => (
        <article className="service-card" key={service.title}>
          <div className="service-media">
            <img src={service.image} alt={service.title} />
            <div className="service-glow" style={{ background: service.accent }} />
          </div>
          <div className="service-body">
            <div className="service-category">{service.category}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Packages({ packages }) {
  return (
    <div className="package-grid">
      {packages?.map(pkg => (
        <article className="package-card" key={pkg.title}>
          <div className="package-accent" style={{ boxShadow: `0 0 40px ${pkg.accent}55`, borderColor: pkg.accent }} />
          <div className="package-head">
            <div>
              <div className="package-title">{pkg.title}</div>
              <div className="muted">{pkg.subtitle}</div>
            </div>
            <div className="package-price">
              <span>₺</span>{pkg.price}<small>{pkg.period}</small>
            </div>
          </div>
          <ul>
            {pkg.features?.map(feature => <li key={feature}><Circle size={10} /> {feature}</li>)}
          </ul>
          <button className="btn btn-primary">{pkg.cta}</button>
        </article>
      ))}
    </div>
  );
}

function Gallery({ items }) {
  return (
    <div className="masonry">
      {items?.map(item => (
        <article className="gallery-card" key={item.title}>
          <img src={item.image} alt={item.title} />
          <div className="gallery-overlay">
            <span>{item.category}</span>
            <h4>{item.title}</h4>
          </div>
        </article>
      ))}
    </div>
  );
}

function Ticker({ items }) {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...(items || []), ...(items || [])].map((item, index) => (
          <div className="ticker-item" key={`${item}-${index}`}>
            <span className="dot" /> {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ mode, setMode }) {
  const navItems = [
    ['home', Home, sections.home],
    ['services', Dumbbell, sections.services],
    ['booking', CalendarDays, sections.booking],
    ['packages', Package, sections.packages],
    ['profile', Users, sections.profile]
  ];
  return (
    <nav className="bottom-nav">
      {navItems.map(([key, Icon, label]) => (
        <button key={key} className={`bottom-nav-item ${mode === key ? 'active' : ''}`} onClick={() => setMode(key)}>
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function AssistantBubble({ onOpen }) {
  return (
    <button className="floating-bubble assistant" onClick={onOpen} aria-label="PEAKSPOR Assistant">
      <span className="logo-mark">▲</span>
    </button>
  );
}

function WhatsappBubble() {
  return (
    <a
      className="floating-bubble whatsapp"
      href={`https://wa.me/905555555555?text=${encodeURIComponent('Merhaba, PEAKSPOR hakkında bilgi almak istiyorum.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
    >
      <MessageSquare size={18} />
    </a>
  );
}

function AssistantModal({ open, onClose, content }) {
  if (!open) return null;
  const assistant = content?.assistant;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="assistant-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-top">
          <div className="modal-logo">▲</div>
          <div>
            <h3>{assistant?.welcome}</h3>
            <p>{assistant?.message}</p>
          </div>
          <button className="icon-btn" onClick={onClose}><ChevronLeft size={18} /></button>
        </div>
        <div className="assistant-grid">
          {assistant?.buttons?.map(button => <button key={button} className="assistant-chip">{button}</button>)}
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ tab, setTab }) {
  const items = [
    'Dashboard',
    'Kullanıcılar',
    'Paketler',
    'Hizmetler',
    'Rezervasyonlar',
    'Dersler',
    'Eğitmenler',
    'Galeri',
    'Duyurular',
    'Kayan Yazılar',
    'Blog',
    'Mesajlar',
    'Ödemeler',
    'Kuponlar',
    'WhatsApp Ayarları',
    'PEAKSPOR Asistan Ayarları',
    'Tema Ayarları',
    'SEO Ayarları',
    'Yedekleme',
    'Çıkış'
  ];
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-mark">▲</div>
        <div>
          <strong>PEAKSPOR</strong>
          <span>Admin Panel</span>
        </div>
      </div>
      {items.map(item => (
        <button
          key={item}
          className={`admin-item ${tab === item.toLowerCase() ? 'active' : ''}`}
          onClick={() => setTab(item.toLowerCase())}
        >
          {item}
        </button>
      ))}
    </aside>
  );
}

function AdminDashboard({ dashboard }) {
  return (
    <div className="admin-content">
      <div className="admin-stats">
        <div className="admin-stat neon">
          <span>Toplam Üye</span>
          <strong>{dashboard?.stats?.totalUsers ?? 0}</strong>
        </div>
        <div className="admin-stat blue">
          <span>Aktif Üye</span>
          <strong>{dashboard?.stats?.activeMembers ?? 0}</strong>
        </div>
        <div className="admin-stat green">
          <span>Toplam Gelir</span>
          <strong>₺{dashboard?.stats?.revenue ?? 0}</strong>
        </div>
        <div className="admin-stat orange">
          <span>Bugünkü Rezervasyon</span>
          <strong>{dashboard?.stats?.reservations ?? 0}</strong>
        </div>
      </div>
      <div className="admin-panels">
        <div className="panel chart-panel">
          <h3>Gelir Grafiği</h3>
          <div className="chart-placeholder" />
        </div>
        <div className="panel">
          <h3>Recent Users</h3>
          <div className="table-list">
            {dashboard?.recentUsers?.map(user => (
              <div key={user.id} className="table-row">
                <span>{user.name}</span>
                <span>{user.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ content, setContent }) {
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.dashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  return (
    <div className="admin-shell">
      <AdminSidebar tab={tab} setTab={setTab} />
      <main className="admin-main">
        <div className="admin-topbar">
          <h2>Dashboard</h2>
          <div className="admin-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <button className="icon-btn"><Bell size={18} /></button>
            <button className="icon-btn"><Settings size={18} /></button>
          </div>
        </div>
        <AdminDashboard dashboard={dashboard} />
        <div className="panel form-panel">
          <h3>İçerik Yönetimi</h3>
          <p>Logo, hero, paketler, hizmetler ve asistan metinleri yönetilebilir.</p>
          <div className="editor-grid">
            <button className="btn btn-primary" onClick={async () => {
              const next = { ...content, brand: { ...content.brand, name: 'PEAKSPOR' } };
              await api.saveSetting('content', next);
              setContent(next);
              setStatus('Kaydedildi');
            }}>Kaydet</button>
            <div className="status-text">{status}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ toggleMenu, content, mode, setDark, dark, onOpenAdmin }) {
  return (
    <header className="top-header glass">
      <button className="icon-btn" onClick={toggleMenu}><Menu size={20} /></button>
      <div className="brand">
        <span className="brand-mark">{content?.brand?.logoMark || '▲'}</span>
        <span className="brand-name">{content?.brand?.name || 'PEAKSPOR'}</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn"><Bell size={18} /></button>
        <button className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? <Moon size={14} /> : <SunMedium size={14} />}
          <span>{dark ? 'Koyu' : 'Açık'}</span>
        </button>
        <button className="icon-btn" onClick={onOpenAdmin}><LayoutDashboard size={18} /></button>
      </div>
    </header>
  );
}

function AppShell({ state, setState }) {
  const content = state.content || {};
  const publicData = state.publicData || {};
  const mode = state.mode;

  const visibleServices = publicData.services || [];
  const visiblePackages = publicData.packages || [];
  const visibleGallery = publicData.gallery || [];

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className={`app-shell ${state.dark ? 'dark' : 'light'}`}>
      <Header
        toggleMenu={() => setState(prev => ({ ...prev, mobileMenu: !prev.mobileMenu }))}
        content={content}
        mode={mode}
        dark={state.dark}
        setDark={dark => setState(prev => ({ ...prev, dark }))}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <main className="page">
        {mode === 'home' && (
          <>
            <Hero
              content={content}
              onReserve={() => setState(prev => ({ ...prev, mode: 'booking' }))}
              onExplore={() => setState(prev => ({ ...prev, mode: 'services' }))}
            />
            <div className="stats-grid">
              <IconBadge icon={Users} label="Aktif Üye" value={content.stats?.[0]?.value || '5.231'} />
              <IconBadge icon={Target} label="Uzman Eğitmen" value={content.stats?.[1]?.value || '18'} />
              <IconBadge icon={PlayCircle} label="Grup Dersi" value={content.stats?.[2]?.value || '42'} />
              <IconBadge icon={ShieldCheck} label="Yıllık Deneyim" value={content.stats?.[3]?.value || '14'} />
            </div>
            <Ticker items={content.ticker} />
            <SectionTitle title="Hizmetler" subtitle="Premium alanlar ve modern çalışma seçenekleri" />
            <ServicesGrid services={visibleServices.slice(0, 4)} />
            <SectionTitle title="Paketler" subtitle="Mobil uygulama kalitesinde üyelik seçenekleri" />
            <Packages packages={visiblePackages.slice(0, 3)} />
            <SectionTitle title="Galeri" subtitle="Salon, dersler, ekipmanlar ve etkinlikler" />
            <Gallery items={visibleGallery.slice(0, 6)} />
          </>
        )}

        {mode === 'services' && (
          <>
            <SectionTitle title="Hizmetler" subtitle="Tüm premium servisler" />
            <ServicesGrid services={visibleServices} />
          </>
        )}

        {mode === 'booking' && (
          <BookingSection />
        )}

        {mode === 'packages' && (
          <>
            <SectionTitle title="Paketler" subtitle="Başlangıç, Orta Seviye ve Premium seçenekler" />
            <Packages packages={visiblePackages} />
          </>
        )}

        {mode === 'profile' && (
          <ProfileSection content={content} onLogin={() => setState(prev => ({ ...prev, loginOpen: true }))} />
        )}
      </main>

      <BottomNav mode={mode} setMode={newMode => setState(prev => ({ ...prev, mode: newMode }))} />
      <AssistantBubble onOpen={() => setAssistantOpen(true)} />
      <WhatsappBubble />
      <AssistantModal
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        content={content}
      />
      {adminOpen && <AdminOverlay content={content} setState={setState} setAdminOpen={setAdminOpen} />}
    </div>
  );
}

function BookingSection() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', note: '' });
  const [status, setStatus] = useState('');
  return (
    <div className="card-stack">
      <SectionTitle title="Rezervasyon" subtitle="Salon ziyareti veya ders için randevu oluşturun" />
      <div className="panel form-panel">
        <div className="form-grid">
          {['name', 'phone', 'service', 'date', 'note'].map(field => (
            <input
              key={field}
              className="input"
              placeholder={field}
              value={form[field]}
              onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={async () => {
          await api.reserve(form);
          setStatus('Rezervasyon alındı');
        }}>Gönder</button>
        {status && <div className="status-text">{status}</div>}
      </div>
    </div>
  );
}

function ProfileSection({ content, onLogin }) {
  return (
    <div className="card-stack">
      <SectionTitle title="Profil" subtitle="Üyelik ve hesap yönetimi" />
      <div className="profile-card panel">
        <div className="profile-avatar">{content?.brand?.shortName || 'PK'}</div>
        <h3>PEAKSPOR Üyesi</h3>
        <p>Giriş yaparak rezervasyonlarınızı ve üyelik bilgilerinizi yönetin.</p>
        <div className="profile-actions">
          <button className="btn btn-primary" onClick={onLogin}>Giriş Yap</button>
          <button className="btn btn-ghost">Üye Ol</button>
        </div>
      </div>
    </div>
  );
}

function AdminOverlay({ content, setState, setAdminOpen }) {
  return (
    <div className="modal-backdrop" onClick={() => setAdminOpen(false)}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <AdminPanel content={content} setContent={next => setState(prev => ({ ...prev, content: next }))} />
        <button className="icon-btn admin-close" onClick={() => setAdminOpen(false)}>
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useAppData();

  useEffect(() => {
    document.body.className = state.dark ? 'theme-dark' : 'theme-light';
  }, [state.dark]);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <div className="loader-mark">▲</div>
        <div>PEAKSPOR yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <AppShell state={state} setState={setState} />
      {state.error && <div className="error-toast">{state.error}</div>}
    </>
  );
}