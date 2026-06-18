import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import {
  defaultAnnouncements,
  defaultContent,
  defaultGallery,
  defaultPackages,
  defaultPosts,
  defaultServices,
  defaultTrainers
} from '../shared/defaults.js';
import {
  Bell,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  LayoutDashboard,
  Layers3,
  Menu,
  MessageSquareMore,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  Zap,
  Moon,
  SunMedium,
  Activity
} from 'lucide-react';

const fallbackSettings = {
  content: defaultContent,
  services: defaultServices,
  packages: defaultPackages,
  gallery: defaultGallery,
  trainers: defaultTrainers,
  announcements: defaultAnnouncements
};

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

const mobileNav = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'booking', label: 'Rezervasyon', icon: CalendarDays },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

const adminMenu = [
  'Ana Sayfa',
  'Duyuru Çubuğu',
  'Hizmetler',
  'Paketler',
  'Eğitmenler',
  'Galeri',
  'Blog',
  'SEO / Tema'
];

function normalizeSettings(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  return {
    content: source.content && typeof source.content === 'object' ? source.content : defaultContent,
    services: Array.isArray(source.services) && source.services.length ? source.services : defaultServices,
    packages: Array.isArray(source.packages) && source.packages.length ? source.packages : defaultPackages,
    gallery: Array.isArray(source.gallery) && source.gallery.length ? source.gallery : defaultGallery,
    trainers: Array.isArray(source.trainers) && source.trainers.length ? source.trainers : defaultTrainers,
    announcements:
      Array.isArray(source.announcements) && source.announcements.length
        ? source.announcements
        : defaultAnnouncements
  };
}

function jsonPretty(value) {
  return JSON.stringify(value, null, 2);
}

function safeParseJson(text, fallbackValue) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: fallbackValue };
  }
}

function useAppData() {
  const [state, setState] = useState({
    settings: fallbackSettings,
    user: null,
    dashboard: null,
    loading: true,
    drawerOpen: false,
    assistantOpen: false,
    adminOpen: false,
    status: null
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
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function Ticker({ items }) {
  const list = items && items.length ? items : defaultAnnouncements;
  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <Flame size={14} />
        Duyurular
      </div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {[...list, ...list].map((item, index) => (
            <span key={`${index}-${typeof item === 'string' ? item : item.message}`} className="ticker-item">
              <span className="ticker-dot" />
              {typeof item === 'string' ? item : item.message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div className="section-title-row">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

function DesktopHero({ content, onJump }) {
  const hero = content.hero || defaultContent.hero;
  return (
    <section className="desktop-hero" id="home">
      <div className="top-header-hero">
        <div className="desktop-brand">
          <span className="brand-mark">▲</span>
          <strong>{content.brand?.name || 'PEAKSPOR'}</strong>
        </div>
        <nav className="desktop-menu">
          {desktopNav.map(item => (
            <button key={item.id} type="button" className={`desktop-menu-item ${item.id === 'home' ? 'active' : ''}`} onClick={() => onJump(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Bildirimler">
            <Bell size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Açık/Koyu">
            <Moon size={18} />
          </button>
        </div>
      </div>

      <div className="desktop-hero-body">
        <div className="desktop-hero-copy">
          <div className="hero-badge">
            <Sparkles size={14} />
            Premium Fitness Deneyimi
          </div>
          <h1>{hero.title}</h1>
          <p>{hero.subtitle}</p>
          <div className="hero-actions">
            <button className="cta primary" type="button" onClick={() => onJump('booking')}>
              ÜYE OL
            </button>
            <button className="cta ghost" type="button" onClick={() => onJump('services')}>
              SALONU KEŞFET
            </button>
          </div>
          <div className="hero-stats">
            {[
              { icon: Users, label: '5.000+', sub: 'AKTİF ÜYE' },
              { icon: Target, label: '25', sub: 'UZMAN EĞİTMEN' },
              { icon: Activity, label: '100+', sub: 'GRUP DERSİ' },
              { icon: ShieldCheck, label: '10+', sub: 'YILLIK DENEYİM' }
            ].map(item => (
              <div className="stat-box" key={item.sub}>
                <item.icon size={20} />
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="desktop-hero-image">
          <img src={hero.image} alt="Peakspor hero" />
        </div>
      </div>

      <Ticker items={content.announcements || defaultAnnouncements} />
    </section>
  );
}

function MobileHero({ content, onJump }) {
  const hero = content.hero || defaultContent.hero;
  const services = content.services || defaultServices;
  const packages = content.packages || defaultPackages;

  return (
    <section className="mobile-shell" id="home">
      <div className="mobile-topbar">
        <button className="icon-button" type="button" onClick={() => {}} aria-label="Menü">
          <Menu size={20} />
        </button>
        <div className="mobile-brand">
          <span className="brand-mark">▲</span>
          <strong>{content.brand?.name || 'PEAKSPOR'}</strong>
        </div>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Bildirimler">
            <Bell size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Açık/Koyu">
            <Moon size={18} />
          </button>
        </div>
      </div>

      <div className="mobile-hero-body">
        <div className="mobile-copy">
          <h1>{hero.title}</h1>
          <p>{hero.subtitle}</p>
          <div className="hero-actions">
            <button className="cta primary" type="button" onClick={() => onJump('booking')}>
              ÜYE OL
            </button>
            <button className="cta ghost" type="button" onClick={() => onJump('services')}>
              SALONU KEŞFET
            </button>
          </div>
          <div className="hero-dots">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
        <div className="mobile-image">
          <img src={hero.image} alt="Peakspor mobile hero" />
        </div>
      </div>

      <div className="hero-stats mobile-stats">
        {[
          { icon: Users, label: '5.000+', sub: 'AKTİF ÜYE' },
          { icon: Target, label: '25', sub: 'UZMAN EĞİTMEN' },
          { icon: Activity, label: '100+', sub: 'GRUP DERSİ' },
          { icon: ShieldCheck, label: '10+', sub: 'YILLIK DENEYİM' }
        ].map(item => (
          <div className="stat-box" key={item.sub}>
            <item.icon size={18} />
            <strong>{item.label}</strong>
            <span>{item.sub}</span>
          </div>
        ))}
      </div>

      <Ticker items={content.announcements || defaultAnnouncements} />

      <section className="section-block">
        <SectionTitle title="Hizmetlerimiz" action={<button className="mini-link">Tümü</button>} />
        <div className="service-row mobile-service-row">
          {services.slice(0, 8).map(service => (
            <article className="service-tile mobile-service-tile" key={service.title}>
              <img src={service.image} alt={service.title} />
              <div className="service-overlay" />
              <div className="service-label">
                <span>{service.title}</span>
                <small>{service.category}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle title="Paketlerimiz" action={<button className="mini-link">Tümü</button>} />
        <div className="mobile-package-list">
          {packages.slice(0, 3).map(pkg => (
            <article className="package-card mobile-package-card" key={pkg.title}>
              <div className="package-ribbon" style={{ '--accent': pkg.accent }} />
              <div className="package-head">
                <h3>{pkg.title}</h3>
                <div className="package-price">
                  ₺{formatPrice(pkg.price)} <small>{pkg.period}</small>
                </div>
              </div>
              <ul>
                {pkg.features.slice(0, 5).map(feature => (
                  <li key={feature}>
                    <CheckCircle2 size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="mobile-whatsapp-row">
        <button className="mobile-assistant-bubble" type="button">
          <span className="brand-mark">▲</span>
        </button>
        <button className="whatsapp-fab mobile-wa" type="button">
          <MessageSquareMore size={18} />
        </button>
      </div>

      <nav className="mobile-bottom-nav">
        {mobileNav.map(item => (
          <button key={item.id} type="button" className={`mobile-bottom-item ${item.id === 'home' ? 'active' : ''}`} onClick={() => onJump(item.id === 'profile' ? 'contact' : item.id)}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section className="section-block" id="services">
      <SectionTitle title="Hizmetlerimiz" action={<button className="mini-link">Tümü</button>} />
      <div className="service-row">
        {services.slice(0, 8).map(service => (
          <article className="service-tile" key={service.title}>
            <img src={service.image} alt={service.title} />
            <div className="service-overlay" />
            <div className="service-label">
              <span>{service.title}</span>
              <small>{service.category}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PackagesSection({ packages }) {
  return (
    <section className="section-block" id="packages">
      <SectionTitle title="Paketlerimiz" action={<button className="mini-link">Tümü</button>} />
      <div className="package-grid">
        {packages.map(pkg => (
          <article className="package-card" key={pkg.title}>
            <div className="package-ribbon" style={{ '--accent': pkg.accent }} />
            <div className="package-head">
              <h3>{pkg.title}</h3>
              <div className="package-price">
                ₺{formatPrice(pkg.price)} <small>{pkg.period}</small>
              </div>
            </div>
            <ul>
              {pkg.features.map(feature => (
                <li key={feature}>
                  <CheckCircle2 size={14} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function BottomFeatures() {
  return (
    <div className="bottom-features">
      {['Esnek Üyelik', '%100 Memnuniyet', '7/24 Destek', 'Güvenli Ödeme'].map(item => (
        <span key={item}>
          <ShieldCheck size={14} />
          {item}
        </span>
      ))}
    </div>
  );
}

function DashboardPanel({ dashboard }) {
  const stats = [
    { label: 'Toplam Üye', value: dashboard?.stats?.totalUsers ?? 5231, icon: Users, tone: 'green' },
    { label: 'Aktif Üye', value: dashboard?.stats?.activeMembers ?? 4892, icon: Target, tone: 'blue' },
    { label: 'Toplam Gelir', value: `₺${formatPrice(dashboard?.stats?.revenue ?? 125300)}`, icon: LayoutDashboard, tone: 'purple' },
    { label: 'Rezervasyon', value: dashboard?.stats?.reservations ?? 128, icon: CalendarDays, tone: 'orange' }
  ];

  const recentRows = (
    dashboard?.recentUsers?.length
      ? dashboard.recentUsers.slice(0, 5).map(user => ({ title: user.name, subtitle: user.email }))
      : defaultPosts.slice(0, 5).map(post => ({ title: post.title, subtitle: post.excerpt }))
  );

  return (
    <div className="dashboard-panel">
      <aside className="admin-side">
        <div className="side-brand">
          <span className="brand-mark">▲</span>
          <div>
            <strong>PEAKSPOR</strong>
            <span>Admin Panel</span>
          </div>
        </div>
        {adminMenu.map(item => (
          <button key={item} className={`side-item ${item === 'Ana Sayfa' ? 'active' : ''}`} type="button">
            {item}
          </button>
        ))}
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-title">
            <span>Dashboard</span>
            <h3>Admin Panel Genel Bakış</h3>
          </div>
          <div className="dashboard-icons">
            <button className="icon-button" type="button"><Search size={18} /></button>
            <button className="icon-button" type="button"><Bell size={18} /></button>
            <button className="icon-button" type="button"><Settings size={18} /></button>
          </div>
        </div>

        <div className="dashboard-stats">
          {stats.map(stat => (
            <article className={`dashboard-stat ${stat.tone}`} key={stat.label}>
              <stat.icon size={16} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <article className="chart-card">
            <div className="card-head">
              <h4>Gelir Grafiği</h4>
              <span>Son 30 gün</span>
            </div>
            <div className="chart-area">
              <div className="chart-grid" />
              <div className="chart-line chart-line-one" />
              <div className="chart-line chart-line-two" />
              <div className="chart-line chart-line-three" />
            </div>
          </article>

          <article className="list-card">
            <div className="card-head">
              <h4>Son İşlemler</h4>
              <span>Canlı akış</span>
            </div>
            <div className="list-stack">
              {recentRows.map((row, index) => (
                <div className="list-row" key={`${row.title}-${index}`}>
                  <div>
                    <strong>{row.title}</strong>
                    <span>{row.subtitle}</span>
                  </div>
                  <ChevronRight size={16} />
                </div>
              ))}
            </div>
          </article>
        </div>
      </main>

      <aside className="dashboard-side-info">
        <h3>Admin Panel Özellikleri</h3>
        <ul>
          <li>Ana sayfa ve duyuru çubuğu düzenlenir.</li>
          <li>Hizmetler, paketler, galeri ve eğitmenler yönetilir.</li>
          <li>Rezervasyonlar ve mesajlar canlı görünür.</li>
          <li>SEO ve tema ayarları içerikten ayrılmaz.</li>
        </ul>
      </aside>
    </div>
  );
}

function BookingSection() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', note: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.reserve(form);
      setStatus('Rezervasyon alındı.');
      setForm({ name: '', phone: '', service: '', date: '', note: '' });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section-block" id="booking">
      <SectionTitle title="Rezervasyon" />
      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <input className="input" placeholder="Ad Soyad" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          <input className="input" placeholder="Telefon" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
          <input className="input" placeholder="Hizmet" value={form.service} onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))} />
          <input className="input" type="datetime-local" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} />
        </div>
        <textarea className="input textarea" placeholder="Not" value={form.note} onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))} />
        <div className="form-actions">
          <button className="cta primary" type="submit" disabled={saving}>
            {saving ? 'Gönderiliyor...' : 'Rezervasyon Gönder'}
          </button>
          {status && <span className="status-badge">{status}</span>}
        </div>
      </form>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.message(form);
      setStatus('Mesaj gönderildi.');
      setForm({ name: '', email: '', content: '' });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section-block" id="contact">
      <SectionTitle title="İletişim" />
      <div className="contact-grid">
        <article className="contact-card">
          <div className="profile-avatar">PK</div>
          <h3>PEAKSPOR</h3>
          <p>Premium deneyim, güçlü ekip ve mobil öncelikli tasarım tek yerde.</p>
          <div className="contact-actions">
            <button className="cta primary" type="button" onClick={() => scrollToSection('home')}>Ana Sayfa</button>
            <button className="cta ghost" type="button" onClick={() => scrollToSection('booking')}>Rezervasyon</button>
          </div>
        </article>

        <form className="form-card" onSubmit={submit}>
          <div className="form-grid">
            <input className="input" placeholder="Ad Soyad" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            <input className="input" placeholder="E-posta" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <textarea className="input textarea" placeholder="Mesaj" value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} />
          <div className="form-actions">
            <button className="cta primary" type="submit" disabled={saving}>
              {saving ? 'Gönderiliyor...' : 'Mesaj Gönder'}
            </button>
            {status && <span className="status-badge">{status}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}

function JsonEditor({ label, value, onChange, onSave, hint, saving }) {
  return (
    <div className="editor-card">
      <div className="editor-head">
        <div>
          <strong>{label}</strong>
          {hint && <p>{hint}</p>}
        </div>
        <button className="cta primary small" type="button" onClick={onSave} disabled={saving}>Kaydet</button>
      </div>
      <textarea className="input editor-input" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ContentEditor({ settings, onSave, saving }) {
  const [draft, setDraft] = useState(jsonPretty(settings.content));
  useEffect(() => setDraft(jsonPretty(settings.content)), [settings.content]);
  async function save() {
    const parsed = safeParseJson(draft, settings.content);
    if (!parsed.ok) return false;
    await onSave('content', parsed.value);
    return true;
  }
  return (
    <JsonEditor
      label="Ana Sayfa / Duyuru / Tema JSON"
      hint="Hero, asistan, SEO, tema, istatistikler ve kayan duyuru tek JSON içinde saklanır."
      value={draft}
      onChange={setDraft}
      onSave={save}
      saving={saving}
    />
  );
}

function SimpleJsonEditor({ label, hint, data, onSave, saving }) {
  const [draft, setDraft] = useState(jsonPretty(data));
  useEffect(() => setDraft(jsonPretty(data)), [data]);
  async function save() {
    const parsed = safeParseJson(draft, data);
    if (!parsed.ok) return false;
    await onSave(parsed.value);
    return true;
  }
  return (
    <JsonEditor
      label={label}
      hint={hint}
      value={draft}
      onChange={setDraft}
      onSave={save}
      saving={saving}
    />
  );
}

function AdminModal({ open, onClose, user, onLogin, settings, onSaveSetting, dashboard }) {
  const [form, setForm] = useState({
    email: defaultContent.admin?.email || 'admin@peakspor.com',
    password: defaultContent.admin?.password || 'Admin1234!'
  });
  const [tab, setTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (open) {
      setStatus('');
      setTab('content');
    }
  }, [open]);

  async function login(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const response = await api.login(form);
      onLogin(response.user);
      setStatus('Giriş başarılı.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveSetting(key, value) {
    setSaving(true);
    setStatus('');
    try {
      await api.saveSetting(key, value);
      onSaveSetting(key, value);
      setStatus('Kaydedildi.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="admin-modal login-modal" onClick={event => event.stopPropagation()}>
          <div className="modal-top">
            <div className="brand-lockup">
              <span className="brand-mark">▲</span>
              <div>
                <strong>PEAKSPOR Admin</strong>
              </div>
            </div>
            <button className="icon-button" type="button" onClick={onClose}>
              <ChevronRight size={18} />
            </button>
          </div>
          <form className="login-form" onSubmit={login}>
            <input className="input" placeholder="E-posta" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
            <input className="input" placeholder="Şifre" type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} />
            <div className="form-actions">
              <button className="cta primary" type="submit" disabled={saving}>
                {saving ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
              {status && <span className="status-badge">{status}</span>}
            </div>
          </form>
          <div className="login-tip">
            <strong>Varsayılan hesap</strong>
            <span>admin@peakspor.com / Admin1234!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-wide" onClick={event => event.stopPropagation()}>
        <div className="modal-top">
          <div className="brand-lockup">
            <span className="brand-mark">▲</span>
            <div>
              <strong>PEAKSPOR Admin</strong>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-side-brand">
              <span className="brand-mark">▲</span>
              <div>
                <strong>PEAKSPOR</strong>
                <span>Admin Panel</span>
              </div>
            </div>
            {adminMenu.map(item => (
              <button
                key={item}
                className={`sidebar-item ${tab === 'content' && item === 'Ana Sayfa' ? 'active' : ''}`}
                type="button"
                onClick={() => setTab(item === 'Ana Sayfa' ? 'content' : item.toLowerCase())}
              >
                {item}
              </button>
            ))}
          </aside>

          <main className="admin-content">
            <div className="admin-content-head">
              <div>
                <span className="section-kicker">Canlı Önizleme</span>
                <h4>{tab === 'content' ? 'Ana Sayfa ve Duyuru' : tab}</h4>
              </div>
              <div className="admin-badge">Rol: ADMIN</div>
            </div>

            {tab === 'content' && <ContentEditor settings={settings} onSave={saveSetting} saving={saving} />}
            {tab === 'hizmetler' || tab === 'services' ? (
              <SimpleJsonEditor
                label="Hizmetler JSON"
                hint="Her hizmet için title, category, description, image ve accent alanlarını düzenleyin."
                data={settings.services}
                onSave={value => saveSetting('services', value)}
                saving={saving}
              />
            ) : null}
            {tab === 'paketler' || tab === 'packages' ? (
              <SimpleJsonEditor
                label="Paketler JSON"
                hint="Üyelik kartları, fiyatlar, dönemler ve özellik listeleri burada."
                data={settings.packages}
                onSave={value => saveSetting('packages', value)}
                saving={saving}
              />
            ) : null}
            {tab === 'galeri' || tab === 'gallery' ? (
              <SimpleJsonEditor
                label="Galeri JSON"
                hint="Galeri kartlarını dilediğiniz gibi güncelleyebilirsiniz."
                data={settings.gallery}
                onSave={value => saveSetting('gallery', value)}
                saving={saving}
              />
            ) : null}
            {tab === 'eğitmenler' || tab === 'trainers' ? (
              <SimpleJsonEditor
                label="Eğitmenler JSON"
                hint="Koç kartları, rol ve uzmanlık bilgileri burada."
                data={settings.trainers}
                onSave={value => saveSetting('trainers', value)}
                saving={saving}
              />
            ) : null}
            {tab === 'seo / tema' || tab === 'seo' ? (
              <JsonEditor
                label="SEO / Tema"
                hint="SEO ve tema ayarlarını content JSON içinden düzenleyin."
                value={jsonPretty(settings.content)}
                onChange={() => {}}
                onSave={() => saveSetting('content', settings.content)}
                saving={saving}
              />
            ) : null}

            {status && <div className="editor-status">{status}</div>}
            <DashboardPanel dashboard={dashboard} />
          </main>
        </div>
      </div>
    </div>
  );
}

function FloatingActions({ onAssistant }) {
  return (
    <button className="floating-bubble" type="button" onClick={onAssistant} aria-label="Asistan">
      <span className="brand-mark">▲</span>
    </button>
  );
}

function MobileMenu({ open, onClose, onJump, onOpenAdmin }) {
  if (!open) return null;
  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu" onClick={event => event.stopPropagation()}>
        <div className="mobile-menu-top">
          <div className="brand-lockup">
            <span className="brand-mark">▲</span>
            <div>
              <strong>PEAKSPOR</strong>
              <span>Menü</span>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>
        {mobileNav.map(item => (
          <button
            key={item.id}
            className="mobile-menu-item"
            type="button"
            onClick={() => {
              if (item.id === 'profile') {
                onOpenAdmin();
              } else {
                onJump(item.id);
              }
              onClose();
            }}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AppShell({ state, setState }) {
  const settings = state.settings;
  const announcements = settings.content?.ticker || settings.announcements || defaultAnnouncements;

  function updateSetting(key, value) {
    setState(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  }

  useEffect(() => {
    if (state.adminOpen && state.user?.role === 'ADMIN' && !state.dashboard) {
      api.dashboard().then(dashboard => setState(prev => ({ ...prev, dashboard }))).catch(() => {});
    }
  }, [state.adminOpen, state.user, state.dashboard, setState]);

  const content = settings.content || defaultContent;
  const services = settings.services || defaultServices;
  const packages = settings.packages || defaultPackages;
  const gallery = settings.gallery || defaultGallery;
  const trainers = settings.trainers || defaultTrainers;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 980;

  return (
    <div className={`app-shell ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? (
        <MobileHero
          content={{ ...content, services, packages, announcements }}
          onJump={section => scrollToSection(section)}
        />
      ) : (
        <main className="page">
          <DesktopHero
            content={{ ...content, services, packages, announcements }}
            onJump={section => scrollToSection(section)}
          />
          <ServicesSection services={services} />
          <PackagesSection packages={packages} />
          <BottomFeatures />
          <DashboardPanel dashboard={state.dashboard} />
          <TrainersSection trainers={trainers} />
          <GallerySection gallery={gallery} />
          <BookingSection />
          <ContactSection />
        </main>
      )}

      <FloatingActions onAssistant={() => setState(prev => ({ ...prev, assistantOpen: true }))} />
      <button className="whatsapp-fab" type="button" onClick={() => {}}>
        <MessageSquareMore size={18} />
        WHATSAPP HATTINA KATIL
      </button>
      <MobileMenu
        open={state.drawerOpen}
        onClose={() => setState(prev => ({ ...prev, drawerOpen: false }))}
        onJump={section => scrollToSection(section)}
        onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
      />
      <AssistantModal
        open={state.assistantOpen}
        onClose={() => setState(prev => ({ ...prev, assistantOpen: false }))}
        content={content}
      />
      <AdminModal
        open={state.adminOpen}
        onClose={() => setState(prev => ({ ...prev, adminOpen: false }))}
        user={state.user}
        onLogin={user => setState(prev => ({ ...prev, user }))}
        settings={settings}
        onSaveSetting={updateSetting}
        dashboard={state.dashboard}
      />
      {state.status && <div className="status-toast">{state.status}</div>}
    </div>
  );
}

function AssistantModal({ open, onClose, content }) {
  if (!open) return null;
  const assistant = content.assistant || defaultContent.assistant;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="assistant-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-top">
          <div className="brand-lockup">
            <span className="brand-mark">▲</span>
            <div>
              <strong>{assistant.welcome}</strong>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="assistant-copy">{assistant.message}</p>
        <div className="assistant-grid">
          {(assistant.buttons || []).map(button => (
            <button key={button} className="assistant-chip" type="button">
              {button}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroCard({ image, title, category }) {
  return (
    <article className="service-tile">
      <img src={image} alt={title} />
      <div className="service-overlay" />
      <div className="service-label">
        <span>{title}</span>
        <small>{category}</small>
      </div>
    </article>
  );
}

function GallerySection({ gallery }) {
  return (
    <section className="section-block" id="gallery">
      <SectionTitle title="Galeri" action={<button className="mini-link">Tümü</button>} />
      <div className="gallery-grid">
        {gallery.slice(0, 6).map(item => (
          <HeroCard key={item.title} image={item.image} title={item.title} category={item.category} />
        ))}
      </div>
    </section>
  );
}

function TrainersSection({ trainers }) {
  return (
    <section className="section-block" id="trainers">
      <SectionTitle title="Eğitmenler" />
      <div className="trainer-grid">
        {trainers.map(trainer => (
          <article className="trainer-card" key={trainer.name}>
            <img src={trainer.image} alt={trainer.name} />
            <div className="trainer-body">
              <span>{trainer.role}</span>
              <h3>{trainer.name}</h3>
              <p>{trainer.specialty}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [state, setState] = useAppData();

  useEffect(() => {
    document.body.className = 'theme-light';
  }, []);

  if (state.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">▲</div>
        <strong>PEAKSPOR yükleniyor...</strong>
      </div>
    );
  }

  return <AppShell state={state} setState={setState} />;
}

export default App;