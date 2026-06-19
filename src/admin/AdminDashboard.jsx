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
  Package,
  Palette,
  Phone,
  Save,
  Settings2,
  X
} from 'lucide-react';
import { api } from '../api';
import {
  defaultAnnouncements,
  defaultContent,
  defaultGalleryCategories
} from '../../shared/defaults.js';
import {
  AnnouncementsEditor,
  DashboardStats,
  GalleryEditor,
  PackagesEditor,
  ServicesEditor
} from './editors.jsx';
import './admin.css';

const NAV = [
  { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
  { id: 'services', label: 'Hizmetler', icon: Dumbbell },
  { id: 'packages', label: 'Paketler', icon: Package },
  { id: 'gallery', label: 'Galeri', icon: GalleryHorizontal },
  { id: 'announcements', label: 'Duyurular', icon: Megaphone },
  { id: 'settings', label: 'Ayarlar', icon: Settings2 }
];

const TITLES = {
  dashboard: 'Özet',
  services: 'Hizmetler',
  packages: 'Paketler',
  gallery: 'Galeri',
  announcements: 'Duyurular',
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

  return (
    <>
      <h2 className="admin-page-title">Ayarlar</h2>
      <p className="admin-page-sub">Tema renkleri, WhatsApp ve SEO.</p>
      <div className="admin-form-card">
        <h4>Tema Renkleri</h4>
        <div className="admin-color-grid">
          {[['primary', 'Ana Renk'], ['secondary', 'İkincil'], ['background', 'Arka Plan'], ['text', 'Metin']].map(([key, label]) => (
            <label key={key} className="admin-field admin-color-field">{label}<input type="color" value={theme[key]} onChange={e => patch({ theme: { ...theme, [key]: e.target.value } })} /></label>
          ))}
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
        <h4>SEO</h4>
        <div className="admin-form-grid single">
          <label className="admin-field">Başlık<input value={seo.title} onChange={e => patch({ seo: { ...seo, title: e.target.value } })} /></label>
          <label className="admin-field">Açıklama<textarea rows={2} value={seo.description} onChange={e => patch({ seo: { ...seo, description: e.target.value } })} /></label>
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
  const [user, setUser] = useState(state.user?.role === 'ADMIN' ? state.user : null);
  const [draft, setDraft] = useState(state.settings);
  const [analytics, setAnalytics] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setDraft(state.settings); }, [state.settings]);

  useEffect(() => {
    if (!user) return;
    api.analytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, [user, section]);

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
    if (section === 'announcements') return persist('announcements', draft.announcements, 'Duyurular');
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
        <aside className="admin-sidebar-v2">
          <div className="admin-brand-row">
            <div className="admin-brand-mark">▲</div>
            <div><strong>PEAKSPOR</strong><span>Admin</span></div>
          </div>
          {NAV.map(item => (
            <button key={item.id} type="button" className={`admin-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}>
              <item.icon size={16} />{item.label}
            </button>
          ))}
          <div className="admin-sidebar-footer">
            <button type="button" className="admin-view-site" onClick={onClose}><ExternalLink size={14} /> Siteye Dön</button>
          </div>
        </aside>

        <div className="admin-main-v2">
          <header className="admin-topbar-v2 admin-topbar-minimal">
            <strong>{TITLES[section]}</strong>
            <div className="admin-topbar-actions">
              <div className="admin-user-chip"><div className="admin-user-avatar">A</div><div><strong>{user.name || 'Admin'}</strong></div></div>
              <button className="admin-icon-btn" type="button" onClick={async () => { await api.logout(); setUser(null); }}><LogOut size={16} /></button>
              <button className="admin-icon-btn" type="button" onClick={onClose}><X size={16} /></button>
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
            {section === 'announcements' ? <AnnouncementsEditor items={draft.announcements} onChange={v => setDraft(p => ({ ...p, announcements: v }))} /> : null}
            {section === 'settings' ? <SettingsSection content={draft.content} onChange={v => setDraft(p => ({ ...p, content: v }))} /> : null}
            {showSave ? <SaveBar onSave={handleSave} saving={saving} message={message} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
