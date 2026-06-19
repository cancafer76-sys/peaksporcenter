import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  ExternalLink,
  FileText,
  GalleryHorizontal,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  LayoutGrid,
  Palette,
  Phone,
  Save,
  Settings2,
  Star,
  Users,
  X
} from 'lucide-react';
import { api } from '../api';
import {
  defaultAnnouncements,
  defaultAbout,
  defaultContent,
  defaultGalleryCategories,
  defaultTestimonials
} from '../../shared/defaults.js';
import { applySiteTheme, hexToRgbString, themePresets } from '../../shared/theme.js';
import {
  AnnouncementsEditor,
  AboutEditor,
  CardsEditor,
  DashboardStats,
  GalleryEditor,
  PackagesEditor,
  ServicesEditor,
  TestimonialsEditor,
  TrainersEditor
} from './editors.jsx';
import './admin.css';

const NAV = [
  { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'gallery', label: 'Galeri', icon: GalleryHorizontal },
  { id: 'trainers', label: 'Hocalarımız', icon: Users },
  { id: 'about', label: 'Hakkımızda', icon: FileText },
  { id: 'testimonials', label: 'Yorumlar', icon: Star },
  { id: 'announcements', label: 'Duyurular', icon: Megaphone },
  { id: 'cards', label: 'Kartlar', icon: LayoutGrid },
  { id: 'settings', label: 'Ayarlar', icon: Settings2 }
];

const TITLES = {
  dashboard: 'Özet',
  services: 'Hizmetler',
  packages: 'Paketler',
  gallery: 'Galeri',
  trainers: 'Hocalarımız',
  about: 'Hakkımızda',
  testimonials: 'Müşteri Yorumları',
  announcements: 'Duyurular',
  cards: 'Kartlar',
  settings: 'Ayarlar'
};

function AdminLogin({ onSuccess, onClose }) {
  const [loginMode, setLoginMode] = useState('email');
  const [form, setForm] = useState({ email: '', username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const email = loginMode === 'email' ? form.email.trim() : form.username.trim();
      const result = await api.login({ email, password: form.password });
      if (result.user?.role !== 'ADMIN') throw new Error('Bu hesap yönetici yetkisine sahip değil.');
      onSuccess(result.user);
    } catch (loginError) {
      const message = loginError.message || 'Giriş başarısız';
      setError(/failed|fetch|network|bağlan/i.test(message) ? 'Sunucuya bağlanılamadı.' : message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-login-wrap">
        <div className="admin-login-card-v2">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="admin-login-kicker">PEAKSPOR</div>
              <h2>Yetkili Giriş</h2>
            </div>
            <button className="admin-icon-btn" type="button" onClick={onClose}><X size={16} /></button>
          </div>
          <form className="admin-login-form-v2" onSubmit={handleSubmit}>
            <div className="admin-login-tabs">
              <button type="button" className={loginMode === 'email' ? 'active' : ''} onClick={() => setLoginMode('email')}>E-Posta</button>
              <button type="button" className={loginMode === 'username' ? 'active' : ''} onClick={() => setLoginMode('username')}>Kullanıcı Adı</button>
            </div>
            {loginMode === 'email' ? (
              <label>E-posta<input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></label>
            ) : (
              <label>Kullanıcı adı<input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required /></label>
            )}
            <label>Şifre<input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></label>
            {error ? <div className="admin-login-error-v2">{error}</div> : null}
            <button className="admin-save-btn" type="submit" disabled={pending}><LayoutDashboard size={16} />{pending ? 'Giriş...' : 'Giriş Yap'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ content, onChange }) {
  const data = content || defaultContent;
  const theme = { ...defaultContent.theme, ...(data.theme || {}) };
  const whatsapp = { ...defaultContent.whatsapp, ...(data.whatsapp || {}) };
  const seo = { ...defaultContent.seo, ...(data.seo || {}) };

  const patch = next => onChange({ ...data, ...next });
  const patchTheme = next => {
    const merged = { ...theme, ...next };
    patch({ theme: merged });
    applySiteTheme(merged, { darkMode: true });
  };

  const colorFields = [
    ['primary', 'Ana Renk (Yeşil/Kırmızı vb.)'],
    ['secondary', 'İkincil Renk'],
    ['accentLight', 'Açık Vurgu'],
    ['background', 'Arka Plan (Siyah)'],
    ['surface', 'Yüzey'],
    ['panel', 'Panel / Kart'],
    ['text', 'Metin'],
    ['muted', 'Soluk Metin']
  ];

  return (
    <>
      <h2 className="admin-page-title">Ayarlar</h2>
      <p className="admin-page-sub">Tek tuşla tema değiştirin veya renkleri tek tek ayarlayın.</p>

      <div className="admin-form-card">
        <h4>Hazır Temalar</h4>
        <p className="admin-hint">Tüm site renklerini (yeşil, siyah arka plan vb.) tek tıkla değiştirir.</p>
        <div className="admin-preset-grid">
          {Object.entries(themePresets).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className="admin-preset-btn"
              onClick={() => patchTheme(preset.theme)}
            >
              <span className="admin-preset-swatch" style={{ background: preset.theme.primary }} />
              <span className="admin-preset-swatch admin-preset-swatch-dark" style={{ background: preset.theme.background }} />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-form-card">
        <h4>Tema Renkleri</h4>
        <div className="admin-color-grid">
          {colorFields.map(([key, label]) => (
            <label key={key} className="admin-field admin-color-field">
              {label}
              <input type="color" value={theme[key] || '#000000'} onChange={e => patchTheme({ [key]: e.target.value })} />
            </label>
          ))}
        </div>
        <div className="admin-theme-preview" style={{
          background: theme.background,
          color: theme.text,
          borderColor: `rgba(${hexToRgbString(theme.primary)}, 0.35)`
        }}>
          <span style={{ color: theme.primary }}>Önizleme</span>
          <button type="button" style={{ background: theme.primary, color: theme.background }}>Buton</button>
        </div>
      </div>
      <div className="admin-form-card">
        <h4>WhatsApp</h4>
        <div className="admin-form-grid single">
          <label className="admin-field">Telefon<input value={whatsapp.number} onChange={e => patch({ whatsapp: { ...whatsapp, number: e.target.value } })} /></label>
          <label className="admin-field">Mesaj<textarea rows={2} value={whatsapp.text} onChange={e => patch({ whatsapp: { ...whatsapp, text: e.target.value } })} /></label>
        </div>
      </div>
      <div className="admin-form-card">
        <h4>SEO (Google & Arama)</h4>
        <p className="admin-hint">Kocaeli, fitness ve spor salonu anahtar kelimeleri Google aramalarında görünürlüğü artırır.</p>
        <div className="admin-form-grid single">
          <label className="admin-field">Site Başlığı<input value={seo.title} onChange={e => patch({ seo: { ...seo, title: e.target.value } })} /></label>
          <label className="admin-field">Meta Açıklama<textarea rows={3} value={seo.description} onChange={e => patch({ seo: { ...seo, description: e.target.value } })} /></label>
          <label className="admin-field">Anahtar Kelimeler<textarea rows={2} value={seo.keywords} onChange={e => patch({ seo: { ...seo, keywords: e.target.value } })} /></label>
          <label className="admin-field">Site URL (Google için)<input value={seo.siteUrl || ''} placeholder="https://siteniz.com" onChange={e => patch({ seo: { ...seo, siteUrl: e.target.value } })} /></label>
          <label className="admin-field">Şehir<input value={seo.city || 'Kocaeli'} onChange={e => patch({ seo: { ...seo, city: e.target.value } })} /></label>
        </div>
      </div>
    </>
  );
}

function SaveBar({ onSave, saving, message }) {
  return (
    <div className="admin-save-bar">
      <span className="admin-toast">{message || 'Değişiklikleri kaydetmeyi unutmayın.'}</span>
      <button className="admin-save-btn" type="button" onClick={onSave} disabled={saving}><Save size={16} />{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
    </div>
  );
}

export default function AdminDashboard({ state, setState, onClose }) {
  const [section, setSection] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(state.user?.role === 'ADMIN' ? state.user : null);
  const [draft, setDraft] = useState(state.settings);
  const [analytics, setAnalytics] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setDraft(state.settings); }, [state.settings]);

  useEffect(() => {
    if (!user) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api.analytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, [user, section]);

  const selectSection = id => {
    setSection(id);
    setMenuOpen(false);
    setMessage('');
  };

  const persist = async (key, value, label) => {
    setSaving(true);
    setMessage('');
    try {
      await api.saveSetting(key, value);
      const next = { ...draft, [key]: value };
      setDraft(next);
      setState(prev => ({ ...prev, settings: next }));
      setMessage(`${label} kaydedildi.`);
    } catch (error) {
      setMessage(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (section === 'services') return persist('services', draft.services, 'Hizmetler');
    if (section === 'packages') return persist('packages', draft.packages, 'Paketler');
    if (section === 'gallery') {
      setSaving(true);
      setMessage('');
      try {
        await api.saveSetting('gallery', draft.gallery);
        await api.saveSetting('galleryCategories', draft.galleryCategories || defaultGalleryCategories);
        const next = {
          ...draft,
          gallery: draft.gallery,
          galleryCategories: draft.galleryCategories || defaultGalleryCategories
        };
        setDraft(next);
        setState(prev => ({ ...prev, settings: next }));
        setMessage('Galeri kaydedildi.');
      } catch (error) {
        setMessage(error.message || 'Kaydetme başarısız');
      } finally {
        setSaving(false);
      }
      return;
    }
    if (section === 'trainers') return persist('trainers', draft.trainers, 'Hocalarımız');
    if (section === 'about') return persist('about', draft.about || defaultAbout, 'Hakkımızda');
    if (section === 'testimonials') return persist('testimonials', draft.testimonials || defaultTestimonials, 'Müşteri Yorumları');
    if (section === 'announcements') return persist('announcements', draft.announcements, 'Duyurular');
    if (section === 'cards') return persist('content', draft.content, 'Kartlar');
    if (section === 'settings') return persist('content', draft.content, 'Ayarlar');
    return null;
  };

  if (!user) {
    return <AdminLogin onClose={onClose} onSuccess={u => { setUser(u); setState(prev => ({ ...prev, user: u })); }} />;
  }

  const showSave = section !== 'dashboard';

  return (
    <div className="admin-overlay">
      <div className="admin-shell admin-shell-modern">
        {menuOpen ? (
          <button
            type="button"
            className="admin-mobile-backdrop"
            aria-label="Menüyü kapat"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <aside className={`admin-sidebar-v2 ${menuOpen ? 'is-open' : ''}`}>
          <div className="admin-brand-row">
            <div className="admin-brand-mark">▲</div>
            <div><strong>PEAKSPOR</strong><span>Admin</span></div>
            <button type="button" className="admin-sidebar-close" aria-label="Menüyü kapat" onClick={() => setMenuOpen(false)}>
              <X size={18} />
            </button>
          </div>
          {NAV.map(item => (
            <button key={item.id} type="button" className={`admin-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => selectSection(item.id)}>
              <item.icon size={16} />{item.label}
            </button>
          ))}
          <div className="admin-sidebar-footer">
            <button type="button" className="admin-view-site" onClick={onClose}><ExternalLink size={14} /> Siteye Dön</button>
          </div>
        </aside>

        <div className="admin-main-v2">
          <header className="admin-topbar-v2 admin-topbar-minimal">
            <div className="admin-topbar-left">
              <button type="button" className="admin-icon-btn admin-menu-btn" aria-label="Menüyü aç" onClick={() => setMenuOpen(true)}>
                <Menu size={18} />
              </button>
              <strong className="admin-topbar-title">{TITLES[section]}</strong>
            </div>
            <div className="admin-topbar-actions">
              <div className="admin-user-chip">
                <div className="admin-user-avatar">A</div>
                <div className="admin-user-chip-text"><strong>{user.name || 'Admin'}</strong></div>
              </div>
              <button className="admin-icon-btn" type="button" aria-label="Çıkış yap" onClick={async () => { await api.logout(); setUser(null); }}><LogOut size={16} /></button>
              <button className="admin-icon-btn" type="button" aria-label="Kapat" onClick={onClose}><X size={16} /></button>
            </div>
          </header>

          <main className="admin-content-v2">
            {section === 'dashboard' ? <DashboardStats analytics={analytics} settings={draft} /> : null}
            {section === 'services' ? <ServicesEditor items={draft.services} onChange={v => setDraft(p => ({ ...p, services: v }))} /> : null}
            {section === 'packages' ? <PackagesEditor items={draft.packages} onChange={v => setDraft(p => ({ ...p, packages: v }))} /> : null}
            {section === 'gallery' ? (
              <GalleryEditor
                items={draft.gallery}
                categories={draft.galleryCategories || defaultGalleryCategories}
                onChange={v => setDraft(p => ({ ...p, gallery: v }))}
                onCategoriesChange={v => setDraft(p => ({ ...p, galleryCategories: v }))}
              />
            ) : null}
            {section === 'trainers' ? <TrainersEditor items={draft.trainers} onChange={v => setDraft(p => ({ ...p, trainers: v }))} /> : null}
            {section === 'about' ? <AboutEditor data={draft.about || defaultAbout} onChange={v => setDraft(p => ({ ...p, about: v }))} /> : null}
            {section === 'testimonials' ? <TestimonialsEditor items={draft.testimonials || defaultTestimonials} onChange={v => setDraft(p => ({ ...p, testimonials: v }))} /> : null}
            {section === 'announcements' ? <AnnouncementsEditor items={draft.announcements} onChange={v => setDraft(p => ({ ...p, announcements: v }))} /> : null}
            {section === 'cards' ? <CardsEditor content={draft.content} onChange={v => setDraft(p => ({ ...p, content: v }))} /> : null}
            {section === 'settings' ? <SettingsSection content={draft.content} onChange={v => setDraft(p => ({ ...p, content: v }))} /> : null}
          </main>
          {showSave ? <SaveBar onSave={handleSave} saving={saving} message={message} /> : null}
        </div>
      </div>
    </div>
  );
}
