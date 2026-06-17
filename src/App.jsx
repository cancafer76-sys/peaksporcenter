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

const fallbackPublicData = {
  services: defaultServices,
  packages: defaultPackages,
  gallery: defaultGallery,
  announcements: defaultAnnouncements,
  trainers: defaultTrainers,
  posts: defaultPosts
};

const navItems = [
  { id: 'showcase', label: 'Ana Sayfa', icon: Home },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'booking', label: 'Rezervasyon', icon: CalendarDays },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

const adminItems = [
  'Dashboard',
  'Kullanıcılar',
  'Paketler',
  'Hizmetler',
  'Rezervasyonlar',
  'Eğitmenler',
  'Galeri',
  'Duyurular',
  'Blog',
  'Mesajlar',
  'WhatsApp Ayarları',
  'PEAKSPOR Asistan',
  'Tema Ayarları',
  'SEO Ayarları'
];

function normalizeContent(payload) {
  if (!payload || typeof payload !== 'object') return defaultContent;
  if (payload.hero || payload.brand || payload.assistant) return payload;
  if (payload.content && typeof payload.content === 'object') return payload.content;
  return defaultContent;
}

function useAppData() {
  const [state, setState] = useState({
    content: defaultContent,
    publicData: fallbackPublicData,
    user: null,
    loading: true,
    error: null,
    dark: true,
    mobileMenu: false,
    assistantOpen: false,
    adminOpen: false
  });

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([api.content(), api.publicData(), api.me()]).then(([content, publicData, me]) => {
      if (!mounted) return;
      setState(prev => ({
        ...prev,
        content: content.status === 'fulfilled' ? normalizeContent(content.value) : defaultContent,
        publicData: publicData.status === 'fulfilled' ? publicData.value || fallbackPublicData : fallbackPublicData,
        user: me.status === 'fulfilled' ? me.value?.user || null : null,
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
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(value);
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

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="mini-stat">
      <div className="mini-stat-icon">
        <Icon size={16} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ShowcasePhone({ title, subtitle, children, accent = 'green', className = '' }) {
  return (
    <div className={`phone-shell ${accent} ${className}`}>
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-status">
          <span>0:41</span>
          <div className="phone-signal">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="phone-top">
          <div className="phone-brand">
            <span className="brand-mark">▲</span>
            <strong>PEAKSPOR</strong>
          </div>
          <div className="phone-chip">
            <Sparkles size={12} />
            Premium
          </div>
        </div>
        <div className="phone-hero">
          <span className="phone-eyebrow">{subtitle}</span>
          <h3>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function PhoneHome({ content }) {
  const hero = content?.hero || defaultContent.hero;
  return (
    <ShowcasePhone title="HOŞ GELDİNİZ" subtitle="Mobil deneyim">
      <div className="phone-card home-card">
        <div className="home-copy">
          <p>{hero.subtitle}</p>
          <div className="phone-actions">
            <button className="phone-action primary">Üye Ol</button>
            <button className="phone-action">Salonu Keşfet</button>
          </div>
        </div>
        <div className="home-athlete">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80"
            alt="Athlete"
          />
        </div>
      </div>
      <div className="phone-stack-grid">
        <MiniStat icon={Users} label="Üye" value="5.231" />
        <MiniStat icon={Target} label="Koç" value="18" />
      </div>
      <div className="phone-bubble">
        <MessageSquareMore size={14} />
        PEAKSPOR Asistan
      </div>
    </ShowcasePhone>
  );
}

function PhoneServices({ services }) {
  const cards = services.slice(0, 4);
  return (
    <ShowcasePhone title="HİZMETLERİMİZ" subtitle="Fitness / Body Building" accent="blue" className="phone-raise">
      <div className="phone-grid phone-services">
        {cards.map(service => (
          <article className="phone-service-card" key={service.title}>
            <img src={service.image} alt={service.title} />
            <div className="service-gradient" />
            <div className="phone-service-content">
              <strong>{service.title}</strong>
              <span>{service.category}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="phone-footer-strip">
        <Activity size={14} />
        Antrenman Planı
      </div>
    </ShowcasePhone>
  );
}

function PhonePackages({ packages }) {
  return (
    <ShowcasePhone title="PAKETLER" subtitle="Aylık planlar" accent="purple" className="phone-lift">
      <div className="phone-packages">
        {packages.slice(0, 3).map(pkg => (
          <article className="phone-package-card" key={pkg.title}>
            <div>
              <strong>{pkg.title}</strong>
              <span>{pkg.subtitle}</span>
            </div>
            <div className="phone-price">
              ₺{formatPrice(pkg.price)}
              <small>{pkg.period}</small>
            </div>
            <div className="phone-chip-row">
              {pkg.features.slice(0, 2).map(feature => (
                <span key={feature} className="phone-tag">
                  <CheckCircle2 size={12} />
                  {feature}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="phone-footer-strip neon">
        <Zap size={14} />
        VIP Üyelikler
      </div>
    </ShowcasePhone>
  );
}

function HeroShowcase({ content, onOpenAssistant, onOpenAdmin, dark, setDark }) {
  const hero = content?.hero || defaultContent.hero;
  const highlights = [
    { icon: ShieldCheck, title: 'Güvenli yapı', text: 'JWT, Prisma ve PostgreSQL ile çalışır.' },
    { icon: LayoutDashboard, title: 'Admin panel', text: 'Dashboard, içerik ve rezervasyon akışı.' },
    { icon: MessageSquareMore, title: 'Asistan desteği', text: 'WhatsApp ve hızlı aksiyon butonları.' }
  ];

  return (
    <section className="showcase-section" id="showcase">
      <div className="top-brand-row">
        <div className="brand-lockup">
          <span className="brand-mark">▲</span>
          <div>
            <strong>PEAKSPOR</strong>
            <span>Premium Fitness Platform</span>
          </div>
        </div>
        <button className="mode-pill" onClick={() => setDark(!dark)}>
          <div className="mode-pill-switch">
            <span className={dark ? 'active' : ''}>
              <Moon size={11} />
            </span>
            <span className={!dark ? 'active' : ''}>
              <SunMedium size={11} />
            </span>
          </div>
          <span>Gece / Gündüz Modu</span>
        </button>
      </div>

      <div className="showcase-grid">
        <div className="phone-canvas">
          <PhoneHome content={content} />
          <PhoneServices services={defaultServices} />
          <PhonePackages packages={defaultPackages} />
        </div>

        <div className="hero-panel">
          <div className="hero-badge">
            <Sparkles size={14} />
            Premium deneyim
          </div>
          <h1>{hero.title}</h1>
          <p>{hero.subtitle}</p>

          <div className="hero-actions">
            <button className="cta primary" onClick={() => scrollToSection('booking')}>
              Hemen Başla <ArrowRight size={16} />
            </button>
            <button className="cta ghost" onClick={() => scrollToSection('services')}>
              Salonu Keşfet
            </button>
          </div>

          <div className="hero-highlights">
            {highlights.map(item => (
              <div key={item.title} className="highlight-card">
                <div className="highlight-icon green">
                  <item.icon size={16} />
                </div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="hero-pills">
            {['Fitness', 'Body Building', 'Pilates', 'Yoga', 'Crossfit'].map(item => (
              <span key={item} className="hero-pill">
                {item}
              </span>
            ))}
          </div>

          <button className="assistant-launch" onClick={onOpenAssistant}>
            <span className="assistant-launch-mark">▲</span>
            <div>
              <strong>PEAKSPOR Asistan</strong>
              <span>Merhaba! Size nasıl yardımcı olabiliriz?</span>
            </div>
          </button>

          <button className="admin-open" onClick={onOpenAdmin}>
            <LayoutDashboard size={16} />
            Admin Panelini Aç
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureRail() {
  const items = [
    { icon: Dumbbell, label: 'Fitness' },
    { icon: Bike, label: 'Kardiyo' },
    { icon: Layers3, label: 'Kampanyalar' },
    { icon: CalendarDays, label: 'Rezervasyon' },
    { icon: MessageSquareMore, label: 'WhatsApp' },
    { icon: Zap, label: 'Gece / Gündüz' }
  ];

  return (
    <section className="feature-rail" id="highlights">
      {items.map(item => (
        <button key={item.label} className="feature-chip">
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section id="services" className="content-section">
      <SectionHeader
        title="Hizmetler"
        subtitle="Birebir ve grup antrenmanları, premium salon alanları ve uzman eğitmenler."
      />
      <div className="services-grid">
        {services.map(service => (
          <article className="service-card" key={service.title}>
            <div className="service-image">
              <img src={service.image} alt={service.title} />
              <div className="service-glow" style={{ background: service.accent }} />
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
    <section id="packages" className="content-section">
      <SectionHeader
        title="Paketler"
        subtitle="Başlangıçtan premium seviyeye kadar esnek üyelik seçenekleri."
      />
      <div className="package-grid">
        {packages.map(pkg => (
          <article className="package-card" key={pkg.title}>
            <div
              className="package-accent"
              style={{ borderColor: pkg.accent, boxShadow: `0 0 40px ${pkg.accent}55` }}
            />
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
            <button className="cta primary block">Seç</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrainersSection({ trainers }) {
  return (
    <section className="content-section">
      <SectionHeader
        title="Eğitmenler"
        subtitle="Uzman antrenör ekibiyle hedefe daha hızlı ulaşın."
      />
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
      <SectionHeader
        title="Galeri"
        subtitle="Salon atmosferi, dersler, ekipmanlar ve premium alanlardan kareler."
      />
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

function BookingSection() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', date: '', note: '' });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function submitForm(event) {
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
    <section id="booking" className="content-section">
      <SectionHeader
        title="Rezervasyon"
        subtitle="Ders ve salon ziyareti için hızlı rezervasyon oluşturun."
      />
      <form className="form-card" onSubmit={submitForm}>
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
          <button className="cta primary" disabled={saving}>
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

  async function submitMessage(event) {
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
      <SectionHeader title="Profil ve Destek" subtitle="Üyelik, yardım ve iletişim işlemleri tek yerde." />
      <div className="profile-grid">
        <article className="profile-card">
          <div className="profile-avatar">PK</div>
          <h3>PEAKSPOR Üyesi</h3>
          <p>Giriş yaparak rezervasyonları, profil bilgilerini ve admin ekranını kullanabilirsiniz.</p>
          <div className="profile-actions">
            <button className="cta primary" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Ana Sayfa
            </button>
            <button className="cta ghost" type="button" onClick={() => scrollToSection('booking')}>
              Rezervasyon
            </button>
          </div>
        </article>

        <form className="form-card" onSubmit={submitMessage}>
          <h3>Mesaj Gönder</h3>
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
            <button className="cta primary" disabled={saving}>
              {saving ? 'Gönderiliyor...' : 'Mesaj Gönder'}
            </button>
            {status && <span className="status-badge">{status}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}

function DashboardPanel({ dashboard }) {
  const stats = [
    { label: 'Toplam Üye', value: dashboard?.stats?.totalUsers ?? 0, icon: Users, tone: 'green' },
    { label: 'Aktif Üye', value: dashboard?.stats?.activeMembers ?? 0, icon: Target, tone: 'blue' },
    { label: 'Toplam Gelir', value: `₺${formatPrice(dashboard?.stats?.revenue ?? 0)}`, icon: BarChart3, tone: 'purple' },
    { label: 'Rezervasyon', value: dashboard?.stats?.reservations ?? 0, icon: CalendarDays, tone: 'orange' }
  ];

  return (
    <div className="dashboard-preview">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark">▲</span>
            <div>
              <strong>PEAKSPOR</strong>
              <span>Admin Panel</span>
            </div>
          </div>
          {adminItems.map(item => (
            <button key={item} className={`sidebar-item ${item === 'Dashboard' ? 'active' : ''}`}>
              {item}
            </button>
          ))}
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-topbar">
            <div>
              <span className="section-kicker">Dashboard</span>
              <h3>Admin Panel Genel Bakış</h3>
            </div>
            <div className="dashboard-top-actions">
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
              <article key={stat.label} className={`dashboard-stat ${stat.tone}`}>
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
                <h3>Son Üyeler</h3>
                <span>Canlı akış</span>
              </div>
              <div className="list-stack">
                {(dashboard?.recentUsers || []).slice(0, 5).map(user => (
                  <div className="list-row" key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <aside className="dashboard-right">
          <span className="section-kicker">Özellikler</span>
          <h3>Admin için hızlı erişim</h3>
          <ul className="feature-list">
            {[
              'Tüm içerikler tek panelden yönetilir.',
              'Rezervasyon ve mesajlar canlı görüntülenir.',
              'Üye ve paket verileri PostgreSQL’de saklanır.',
              'WhatsApp destek akışı hızlı açılır.',
              'Tema ve SEO ayarları korunur.'
            ].map(item => (
              <li key={item}>
                <CheckCircle2 size={14} />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function AdminModal({ open, onClose, user, onLogin }) {
  const [form, setForm] = useState({
    email: defaultContent.admin?.email || 'admin@peakspor.com',
    password: defaultContent.admin?.password || 'Admin1234!'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (!open || user?.role !== 'ADMIN') return;
    api.dashboard().then(setDashboard).catch(() => setDashboard(null));
  }, [open, user]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const response = await api.login(form);
      onLogin(response.user);
      setStatus('Giriş başarılı.');
      const nextDashboard = await api.dashboard();
      setDashboard(nextDashboard);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card admin-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div className="assistant-head">
            <span className="bubble-mark">▲</span>
            <div>
              <span className="section-kicker">Admin</span>
              <h3>PEAKSPOR Yönetim Ekranı</h3>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <ChevronRight size={18} />
          </button>
        </div>

        {user?.role === 'ADMIN' && dashboard ? (
          <DashboardPanel dashboard={dashboard} />
        ) : (
          <form className="login-panel" onSubmit={submit}>
            <div className="login-copy">
              <span className="section-kicker">Giriş</span>
              <h3>Admin hesabı ile oturum açın</h3>
              <p>Railway üzerinde seed edilen yönetici hesabı ile paneli açabilirsiniz.</p>
            </div>
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
              <button className="cta primary" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
              {status && <span className="status-badge">{status}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AssistantBubble({ onOpen }) {
  return (
    <button className="floating-bubble assistant" onClick={onOpen} aria-label="PEAKSPOR Asistan">
      <span className="bubble-mark">▲</span>
    </button>
  );
}

function WhatsappBubble() {
  const message = encodeURIComponent('Merhaba, PEAKSPOR hakkında bilgi almak istiyorum.');
  return (
    <a
      className="floating-bubble whatsapp"
      href={`https://wa.me/905555555555?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
    >
      <MessageSquareMore size={20} />
    </a>
  );
}

function AssistantModal({ open, onClose, content }) {
  if (!open) return null;
  const assistant = content?.assistant || defaultContent.assistant;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card assistant-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
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
          {assistant.buttons.map(button => (
            <button key={button} className="assistant-chip" type="button">
              {button}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose, onJump, onOpenAdmin }) {
  if (!open) return null;

  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu" onClick={event => event.stopPropagation()}>
        <div className="mobile-menu-head">
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

function BottomNav({ onJump, onOpenAdmin }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className="bottom-nav-item"
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

function AppShell({ state, setState }) {
  const services = state.publicData?.services || defaultServices;
  const packages = state.publicData?.packages || defaultPackages;
  const gallery = state.publicData?.gallery || defaultGallery;
  const trainers = state.publicData?.trainers || defaultTrainers;

  const dashboardPreview = useMemo(
    () => ({
      stats: {
        totalUsers: 5231,
        activeMembers: 4892,
        revenue: 125300,
        reservations: 128
      },
      recentUsers: (state.publicData?.posts || defaultPosts).slice(0, 5).map((post, index) => ({
        id: `${post.slug}-${index}`,
        name: post.title,
        email: post.excerpt
      }))
    }),
    [state.publicData]
  );

  return (
    <div className={`app-shell ${state.dark ? 'dark' : 'light'}`}>
      <header className="app-header">
        <button className="icon-button" onClick={() => setState(prev => ({ ...prev, mobileMenu: !prev.mobileMenu }))}>
          <Menu size={20} />
        </button>

        <div className="header-brand">
          <span className="brand-mark">▲</span>
          <div>
            <strong>{state.content?.brand?.name || 'PEAKSPOR'}</strong>
            <span>{state.content?.brand?.slogan || 'Premium Fitness Platform'}</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="mode-pill compact" onClick={() => setState(prev => ({ ...prev, dark: !prev.dark }))}>
            {state.dark ? <Moon size={14} /> : <SunMedium size={14} />}
            <span>{state.dark ? 'Koyu' : 'Açık'}</span>
          </button>
          <button className="icon-button" onClick={() => setState(prev => ({ ...prev, assistantOpen: true }))}>
            <Bell size={18} />
          </button>
          <button className="icon-button" onClick={() => setState(prev => ({ ...prev, adminOpen: true }))}>
            <LayoutDashboard size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        <HeroShowcase
          content={state.content}
          dark={state.dark}
          setDark={value => setState(prev => ({ ...prev, dark: value }))}
          onOpenAssistant={() => setState(prev => ({ ...prev, assistantOpen: true }))}
          onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
        />

        <FeatureRail />

        <section className="content-section" id="dashboard">
          <SectionHeader
            title="Canlı Dashboard Önizleme"
            subtitle="Sol menü, istatistik kartları, grafikler ve içerik bloklarıyla premium yönetim ekranı."
            action={
              <button className="cta ghost" onClick={() => setState(prev => ({ ...prev, adminOpen: true }))}>
                Admini Aç <ChevronRight size={16} />
              </button>
            }
          />
          <DashboardPanel dashboard={dashboardPreview} />
        </section>

        <ServicesSection services={services} />
        <PackagesSection packages={packages} />
        <TrainersSection trainers={trainers} />
        <GallerySection gallery={gallery} />
        <BookingSection />
        <ContactSection />
      </main>

      <BottomNav
        onJump={section => scrollToSection(section)}
        onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
      />
      <AssistantBubble onOpen={() => setState(prev => ({ ...prev, assistantOpen: true }))} />
      <WhatsappBubble />
      <AssistantModal
        open={state.assistantOpen}
        onClose={() => setState(prev => ({ ...prev, assistantOpen: false }))}
        content={state.content}
      />
      <AdminModal
        open={state.adminOpen}
        onClose={() => setState(prev => ({ ...prev, adminOpen: false }))}
        user={state.user}
        onLogin={user => setState(prev => ({ ...prev, user }))}
      />
      <MobileMenu
        open={state.mobileMenu}
        onClose={() => setState(prev => ({ ...prev, mobileMenu: false }))}
        onJump={section => scrollToSection(section)}
        onOpenAdmin={() => setState(prev => ({ ...prev, adminOpen: true }))}
      />

      {state.error && <div className="status-toast">{state.error}</div>}
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
        <div className="loading-mark">▲</div>
        <strong>PEAKSPOR yükleniyor...</strong>
      </div>
    );
  }

  return <AppShell state={state} setState={setState} />;
}