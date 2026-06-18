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
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Home,
  LayoutDashboard,
  Layers3,
  Menu,
  MessageSquareMore,
  Moon,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  UserRound,
  Users,
  Zap
} from 'lucide-react';

const fallbackSettings = {
  content: defaultContent,
  services: defaultServices,
  packages: defaultPackages,
  gallery: defaultGallery,
  trainers: defaultTrainers,
  announcements: defaultAnnouncements
};

const navItems = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'booking', label: 'Rezervasyon', icon: CalendarDays },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

const adminMenu = [
  { id: 'content', label: 'Ana Sayfa / Duyuru' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'packages', label: 'Paketler' },
  { id: 'gallery', label: 'Galeri' },
  { id: 'trainers', label: 'Eğitmenler' },
  { id: 'seo', label: 'Tema / SEO' }
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
    dark: true,
    mobileMenu: false,
    assistantOpen: false,
    adminOpen: false,
    error: null
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

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Ticker({ items }) {
  const list = items && items.length ? items : defaultAnnouncements;
  return (
    <div className="ticker-bar">
      <span className="ticker-label">Duyurular</span>
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

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div className="stat-badge">
      <div className="stat-badge-icon">
        <Icon size={16} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <span className="section-kicker">PEAKSPOR</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function PhoneShell({ accent = 'green', className = '', children }) {
  return (
    <div className={`phone-shell ${accent} ${className}`}>
      <div className="phone-notch" />
      <div className="phone-screen">{children}</div>
    </div>
  );
}

function PhoneHome({ content }) {
  const hero = content.hero || defaultContent.hero;
  const stats = content.stats || defaultContent.stats;
  return (
    <PhoneShell accent="green" className="phone-rise">
      <div className="phone-topbar">
        <span className="phone-time">0:41</span>
        <div className="phone-status">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="phone-brand-row">
        <span className="brand-mark">▲</span>
        <strong>PEAKSPOR</strong>
        <span className="phone-pill">Premium</span>
      </div>
      <div className="phone-hero">
        <span className="phone-eyebrow">HOŞ GELDİNİZ</span>
        <h3>{hero.title}</h3>
        <p>{hero.subtitle}</p>
      </div>
      <div className="phone-home-media">
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80"
          alt="Fitness athlete"
        />
      </div>
      <div className="phone-actions">
        <button className="phone-btn primary" type="button">
          {hero.primaryCta}
        </button>
        <button className="phone-btn" type="button">
          {hero.secondaryCta}
        </button>
      </div>
      <div className="phone-stats">
        {stats.slice(0, 4).map(item => (
          <StatBadge key={item.label} icon={Users} label={item.label} value={item.value} />
        ))}
      </div>
      <div className="phone-bottom-nav">
        <span className="active">Ana Sayfa</span>
        <span>Hizmet</span>
        <span>Plan</span>
        <span>Profil</span>
      </div>
    </PhoneShell>
  );
}

function PhoneServices({ services }) {
  return (
    <PhoneShell accent="blue" className="phone-drop">
      <div className="phone-topbar">
        <span className="phone-back">←</span>
        <strong>HİZMETLERİMİZ</strong>
        <span className="phone-pill small">4</span>
      </div>
      <div className="phone-grid">
        {services.slice(0, 4).map(service => (
          <article className="phone-card" key={service.title}>
            <img src={service.image} alt={service.title} />
            <div className="phone-card-overlay" />
            <div className="phone-card-text">
              <strong>{service.title}</strong>
              <span>{service.category}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="phone-bottom-nav">
        <span>Ana Sayfa</span>
        <span className="active">Hizmet</span>
        <span>Plan</span>
        <span>Profil</span>
      </div>
    </PhoneShell>
  );
}

function PhonePackages({ packages }) {
  return (
    <PhoneShell accent="purple" className="phone-lift">
      <div className="phone-topbar">
        <span className="phone-back">←</span>
        <strong>PAKETLERİMİZ</strong>
        <span className="phone-pill small">3</span>
      </div>
      <div className="phone-package-stack">
        {packages.slice(0, 3).map(pkg => (
          <article className="phone-package-card" key={pkg.title} style={{ '--accent': pkg.accent }}>
            <div className="phone-package-head">
              <div>
                <strong>{pkg.title}</strong>
                <span>{pkg.subtitle}</span>
              </div>
              <div className="phone-package-price">
                ₺{formatPrice(pkg.price)}
                <small>{pkg.period}</small>
              </div>
            </div>
            <ul>
              {pkg.features.slice(0, 5).map(feature => (
                <li key={feature}>
                  <CheckCircle2 size={12} />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="package-cta">{pkg.cta}</div>
          </article>
        ))}
      </div>
      <div className="phone-bottom-nav">
        <span>Ana Sayfa</span>
        <span>Hizmet</span>
        <span className="active">Plan</span>
        <span>Profil</span>
      </div>
    </PhoneShell>
  );
}

function HeroSection({ content, onOpenAdmin, onJump }) {
  const hero = content.hero || defaultContent.hero;
  return (
    <section className="hero-section" id="home">
      <div className="hero-topline">
        <div className="brand-lockup">
          <span className="brand-mark">▲</span>
          <div>
            <strong>{content.brand?.name || 'PEAKSPOR'}</strong>
            <span>{content.brand?.slogan || 'Premium Fitness Platform'}</span>
          </div>
        </div>
        <button className="icon-button dashboard-fab" type="button" onClick={onOpenAdmin} aria-label="Admin Panel">
          <LayoutDashboard size={18} />
        </button>
      </div>

      <div className="hero-layout">
        <div className="phone-stage">
          <PhoneHome content={content} />
          <PhoneServices services={content.services || defaultServices} />
          <PhonePackages packages={content.packages || defaultPackages} />
        </div>

        <div className="hero-panel">
          <div className="hero-head">
            <div className="hero-badge">
              <Sparkles size={14} />
              Premium Fitness Deneyimi
            </div>
            <div className="hero-controls">
              <button className="icon-button" type="button" aria-label="Bildirimler">
                <Bell size={18} />
              </button>
              <button className="icon-button" type="button" aria-label="Açık / Koyu">
                <Moon size={18} />
              </button>
            </div>
          </div>

          <h1>{hero.title}</h1>
          <p>{hero.subtitle}</p>

          <div className="hero-actions">
            <button className="cta primary" type="button" onClick={() => onJump('booking')}>
              Hemen Başla <ArrowRight size={16} />
            </button>
            <button className="cta ghost" type="button" onClick={() => onJump('services')}>
              Salonu Keşfet
            </button>
          </div>

          <div className="highlight-grid">
            {[
              { icon: ShieldCheck, label: 'Güvenli yapı', value: 'JWT + PostgreSQL' },
              { icon: LayoutDashboard, label: 'Admin panel', value: 'Tüm içerik yönetimi' },
              { icon: MessageSquareMore, label: 'Destek', value: 'WhatsApp + asistan' }
            ].map(item => (
              <div className="highlight-card" key={item.label}>
                <div className="highlight-icon">
                  <item.icon size={16} />
                </div>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="hero-tags">
            {['Fitness', 'Body Building', 'Pilates', 'Yoga', 'Crossfit'].map(tag => (
              <span className="tag-pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <button className="assistant-launch" type="button" onClick={() => onJump('profile')}>
            <span className="assistant-mark">▲</span>
            <div>
              <strong>{content.assistant?.welcome || defaultContent.assistant.welcome}</strong>
              <span>{content.assistant?.message || defaultContent.assistant.message}</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section className="content-section" id="services">
      <SectionHeader
        title="Hizmetler"
        subtitle="Salonun tüm premium alanlarını ve antrenman seçeneklerini buradan yönetebilirsiniz."
      />
      <div className="service-grid">
        {services.map(service => (
          <article className="service-card" key={service.title}>
            <div className="service-image">
              <img src={service.image} alt={service.title} />
              <div className="service-accent" style={{ background: service.accent }} />
            </div>
            <div className="service-body">
              <span className="service-tag">{service.category}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PackagesSection({ packages }) {
  return (
    <section className="content-section" id="packages">
      <SectionHeader title="Paketler" subtitle="Başlangıçtan VIP seviyesine kadar tüm üyelikler burada." />
      <div className="package-grid">
        {packages.map(pkg => (
          <article className="package-card" key={pkg.title}>
            <div className="package-glow" style={{ boxShadow: `0 0 40px ${pkg.accent}55` }} />
            <div className="package-head">
              <div>
                <span className="service-tag">Üyelik</span>
                <h3>{pkg.title}</h3>
                <p>{pkg.subtitle}</p>
              </div>
              <div className="package-price">
                ₺{formatPrice(pkg.price)}
                <small>{pkg.period}</small>
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
            <button className="cta primary block" type="button">
              {pkg.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrainersSection({ trainers }) {
  return (
    <section className="content-section">
      <SectionHeader title="Eğitmenler" subtitle="Uzman koçlarınız ve özel programlarınız bu alanda gösterilir." />
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

function GallerySection({ gallery }) {
  return (
    <section className="content-section">
      <SectionHeader title="Galeri" subtitle="Salon atmosferi, ekipmanlar ve etkinlik kareleri." />
      <div className="gallery-grid">
        {gallery.map(item => (
          <article className="gallery-card" key={item.title}>
            <img src={item.image} alt={item.title} />
            <div className="gallery-overlay">
              <span>{item.category}</span>
              <h3>{item.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardPanel({ dashboard }) {
  const stats = [
    { label: 'Toplam Üye', value: dashboard?.stats?.totalUsers ?? 5231, icon: Users, tone: 'green' },
    { label: 'Aktif Üye', value: dashboard?.stats?.activeMembers ?? 4892, icon: Target, tone: 'blue' },
    { label: 'Toplam Gelir', value: `₺${formatPrice(dashboard?.stats?.revenue ?? 125300)}`, icon: BarChart3, tone: 'purple' },
    { label: 'Rezervasyon', value: dashboard?.stats?.reservations ?? 128, icon: CalendarDays, tone: 'orange' }
  ];

  const recentRows =
    dashboard?.recentUsers?.length
      ? dashboard.recentUsers.slice(0, 5).map(user => ({
          title: user.name,
          subtitle: user.email
        }))
      : defaultPosts.slice(0, 5).map(post => ({
          title: post.title,
          subtitle: post.excerpt
        }));

  return (
    <div className="dashboard-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">▲</span>
          <div>
            <strong>PEAKSPOR</strong>
            <span>Admin Panel</span>
          </div>
        </div>
        {adminMenu.map(item => (
          <button key={item.id} className={`sidebar-item ${item.id === 'content' ? 'active' : ''}`} type="button">
            {item.label}
          </button>
        ))}
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <span className="section-kicker">Dashboard</span>
            <h3>Admin Panel Genel Bakış</h3>
          </div>
          <div className="dashboard-actions">
            <button className="icon-button" type="button">
              <Search size={18} />
            </button>
            <button className="icon-button" type="button">
              <Bell size={18} />
            </button>
            <button className="icon-button" type="button">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          {stats.map(stat => (
            <article className={`dashboard-stat ${stat.tone}`} key={stat.label}>
              <div className="dashboard-stat-icon">
                <stat.icon size={16} />
              </div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>

        <div className="dashboard-panels">
          <article className="panel chart-panel">
            <div className="panel-head">
              <h3>Gelir Grafiği</h3>
              <span>Son 30 gün</span>
            </div>
            <div className="chart-area">
              <div className="chart-grid" />
              <div className="chart-line chart-line-one" />
              <div className="chart-line chart-line-two" />
              <div className="chart-line chart-line-three" />
            </div>
          </article>

          <article className="panel list-panel">
            <div className="panel-head">
              <h3>Son İşlemler</h3>
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

      <aside className="right-panel">
        <span className="section-kicker">Admin Panel Özellikleri</span>
        <h3>Hızlı yönetim</h3>
        <ul>
          <li>Sayfa içeriklerini, duyuru akışını ve kahraman alanını düzenleyin.</li>
          <li>Hizmetler, paketler, galeri ve eğitmenleri JSON ile güncelleyin.</li>
          <li>Rezervasyonlar, mesajlar ve üyeleri tek panelden yönetin.</li>
          <li>Tema ve SEO ayarları içeriğin bir parçası olarak saklanır.</li>
        </ul>
      </aside>
    </div>
  );
}

function BookingSection() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', note: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
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
    <section className="content-section" id="booking">
      <SectionHeader title="Rezervasyon" subtitle="Salon ziyareti, ders veya özel görüşme için hızlı kayıt alın." />
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            className="input"
            placeholder="Ad Soyad"
            value={form.name}
            onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Telefon"
            value={form.phone}
            onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Hizmet"
            value={form.service}
            onChange={event => setForm(prev => ({ ...prev, service: event.target.value }))}
          />
          <input
            className="input"
            type="datetime-local"
            value={form.date}
            onChange={event => setForm(prev => ({ ...prev, date: event.target.value }))}
          />
        </div>
        <textarea
          className="input textarea"
          placeholder="Not"
          value={form.note}
          onChange={event => setForm(prev => ({ ...prev, note: event.target.value }))}
        />
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

  async function handleSubmit(event) {
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
    <section className="content-section" id="profile">
      <SectionHeader title="İletişim" subtitle="Üyelik, destek ve teklif taleplerinizi buradan bırakın." />
      <div className="profile-grid">
        <article className="profile-card">
          <div className="profile-avatar">PK</div>
          <h3>PEAKSPOR</h3>
          <p>Premium deneyim, güçlü ekip ve mobil öncelikli tasarım tek yerde.</p>
          <div className="profile-actions">
            <button className="cta primary" type="button" onClick={() => scrollToSection('home')}>
              Ana Sayfa
            </button>
            <button className="cta ghost" type="button" onClick={() => scrollToSection('booking')}>
              Rezervasyon
            </button>
          </div>
        </article>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              className="input"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="input"
              placeholder="E-posta"
              value={form.email}
              onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <textarea
            className="input textarea"
            placeholder="Mesaj"
            value={form.content}
            onChange={event => setForm(prev => ({ ...prev, content: event.target.value }))}
          />
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
        <button className="cta primary small" type="button" onClick={onSave} disabled={saving}>
          Kaydet
        </button>
      </div>
      <textarea className="input editor-input" value={value} onChange={event => onChange(event.target.value)} />
    </div>
  );
}

function ContentEditor({ settings, onSave, saving }) {
  const [draft, setDraft] = useState(jsonPretty(settings.content));

  useEffect(() => {
    setDraft(jsonPretty(settings.content));
  }, [settings.content]);

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

  useEffect(() => {
    setDraft(jsonPretty(data));
  }, [data]);

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
      const nextDashboard = await api.dashboard();
      if (typeof onSaveSetting === 'function') {
        onSaveSetting('__dashboard__', nextDashboard);
      }
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
            <div className="assistant-head">
              <span className="bubble-mark">▲</span>
              <div>
                <span className="section-kicker">Admin Girişi</span>
                <h3>PEAKSPOR Yönetim Paneli</h3>
              </div>
            </div>
            <button className="icon-button" type="button" onClick={onClose}>
              <ChevronRight size={18} />
            </button>
          </div>
          <form className="login-form" onSubmit={login}>
            <input
              className="input"
              placeholder="E-posta"
              value={form.email}
              onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Şifre"
              type="password"
              value={form.password}
              onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
            />
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
          <div className="assistant-head">
            <span className="bubble-mark">▲</span>
            <div>
              <span className="section-kicker">Admin</span>
              <h3>İçerik Yönetimi</h3>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-brand">
              <span className="brand-mark">▲</span>
              <div>
                <strong>PEAKSPOR</strong>
                <span>Admin Panel</span>
              </div>
            </div>
            {adminMenu.map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${tab === item.id ? 'active' : ''}`}
                type="button"
                onClick={() => setTab(item.id)}
              >
                {item.label}
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

            {tab === 'content' && (
              <ContentEditor settings={settings} onSave={saveSetting} saving={saving} />
            )}
            {tab === 'services' && (
              <SimpleJsonEditor
                label="Hizmetler JSON"
                hint="Her hizmet için title, category, description, image ve accent alanlarını düzenleyin."
                data={settings.services}
                onSave={value => saveSetting('services', value)}
                saving={saving}
              />
            )}
            {tab === 'packages' && (
              <SimpleJsonEditor
                label="Paketler JSON"
                hint="Üyelik kartları, fiyatlar, dönemler ve özellik listeleri burada."
                data={settings.packages}
                onSave={value => saveSetting('packages', value)}
                saving={saving}
              />
            )}
            {tab === 'gallery' && (
              <SimpleJsonEditor
                label="Galeri JSON"
                hint="Galeri kartlarını dilediğiniz gibi güncelleyebilirsiniz."
                data={settings.gallery}
                onSave={value => saveSetting('gallery', value)}
                saving={saving}
              />
            )}
            {tab === 'trainers' && (
              <SimpleJsonEditor
                label="Eğitmenler JSON"
                hint="Koç kartları, rol ve uzmanlık bilgileri burada."
                data={settings.trainers}
                onSave={value => saveSetting('trainers', value)}
                saving={saving}
              />
            )}
            {tab === 'seo' && (
              <JsonEditor
                label="SEO / Tema"
                hint="SEO ve tema ayarlarını content JSON içinden düzenleyin."
                value={jsonPretty(settings.content)}
                onChange={() => {}}
                onSave={() => saveSetting('content', settings.content)}
                saving={saving}
              />
            )}

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
    <button className="floating-bubble assistant" type="button" onClick={onAssistant} aria-label="Asistan">
      <span className="bubble-mark">▲</span>
    </button>
  );
}

function BottomNav({ onJump, onOpenAdmin }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className="bottom-nav-item"
          type="button"
          onClick={() => {
            if (item.id === 'profile') {
              onOpenAdmin();
              return;
            }
            onJump(item.id);
          }}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileMenu({ open, onClose, onJump, onOpenAdmin }) {
  if (!open) return null;
  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu" onClick={event => event.stopPropagation()}>
        <div className="mobile-menu-top">
          <div>
            <strong>PEAKSPOR</strong>
            <span>Menü</span>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>
        {navItems.map(item => (
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
    if (key === '__dashboard__') {
      setState(prev => ({ ...prev, dashboard: value }));
      return;
    }
    setState(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  }

  useEffect(() => {
    if (state.adminOpen && state.user?.role === 'ADMIN' && !state.dashboard) {
      api.dashboard().then(dashboard => updateSetting('__dashboard__', dashboard)).catch(() => {});
    }
  }, [state.adminOpen, state.user]);

  const content = settings.content || defaultContent;
  const services = settings.services || defaultServices;
  const packages = settings.packages || defaultPackages;
  const gallery = settings.gallery || defaultGallery;
  const trainers = settings.trainers || defaultTrainers;

  return (
    <div className={`app-shell ${state.dark ? 'dark' : 'light'}`}>
      <header className="top-header">
        <div className="header-left">
          <button className="icon-button" type="button" onClick={() => setState(prev => ({ ...prev, mobileMenu: true }))}>
            <Menu size={20} />
          </button>

          <div className="header-brand">
            <span className="brand-mark">▲</span>
            <div>
              <strong>{content.brand?.name || 'PEAKSPOR'}</strong>
              <span>{content.brand?.slogan || 'Premium Fitness Platform'}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Bildirimler">
            <Bell size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Açık / Koyu">
            <Moon size={18} />
          </button>
        </div>
      </header>

      <main className="page">
        <Ticker items={announcements} />

        <HeroSection
          content={{ ...content, services, packages }}
          onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
          onJump={section => scrollToSection(section)}
        />

        <div className="feature-strip">
          {[
            { icon: Dumbbell, label: 'Fitness' },
            { icon: Bike, label: 'Kardiyo' },
            { icon: Layers3, label: 'Kampanyalar' },
            { icon: CalendarDays, label: 'Rezervasyon' },
            { icon: MessageSquareMore, label: 'WhatsApp' },
            { icon: Zap, label: 'Gece / Gündüz' }
          ].map(item => (
            <button className="feature-chip" type="button" key={item.label} onClick={() => scrollToSection('services')}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <ServicesSection services={services} />
        <PackagesSection packages={packages} />
        <section className="content-section">
          <SectionHeader
            title="Admin Panel Önizleme"
            subtitle="Sol menü, stat kartları, grafik ve son işlemler ile tam yönetim alanı."
            action={
              <button className="cta ghost" type="button" onClick={() => setState(prev => ({ ...prev, adminOpen: true }))}>
                Admini Aç <ChevronRight size={16} />
              </button>
            }
          />
          <DashboardPanel dashboard={state.dashboard} />
        </section>
        <TrainersSection trainers={trainers} />
        <GallerySection gallery={gallery} />
        <BookingSection />
        <ContactSection />
      </main>

      <FloatingActions onAssistant={() => setState(prev => ({ ...prev, assistantOpen: true }))} />
      <BottomNav
        onJump={section => scrollToSection(section)}
        onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
      />
      <MobileMenu
        open={state.mobileMenu}
        onClose={() => setState(prev => ({ ...prev, mobileMenu: false }))}
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
        onSaveSetting={(key, value) => updateSetting(key, value)}
        dashboard={state.dashboard}
      />
      {state.error && <div className="status-toast">{state.error}</div>}
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
          <div className="assistant-head">
            <span className="bubble-mark">▲</span>
            <div>
              <span className="section-kicker">Asistan</span>
              <h3>{assistant.welcome}</h3>
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

function App() {
  const [state, setState] = useAppData();

  useEffect(() => {
    document.body.className = state.dark ? 'theme-dark' : 'theme-light';
  }, [state.dark]);

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