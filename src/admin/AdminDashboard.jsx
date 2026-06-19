import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgePercent,
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  Dumbbell,
  ExternalLink,
  FileText,
  GalleryHorizontal,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Moon,
  Package,
  Palette,
  Phone,
  Save,
  Search,
  Settings2,
  Sparkles,
  SunMedium,
  Trash2,
  Users,
  Video,
  X
} from 'lucide-react';
import { api } from '../api';
import {
  defaultAnnouncements,
  defaultContent,
  defaultFacilityAreas,
  defaultGallery,
  defaultPackages,
  defaultServices,
  defaultTrainers
} from '../../shared/defaults.js';
import './admin.css';

const NAV_GROUPS = [
  {
    label: null,
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Yönetim',
    items: [
      { id: 'packages', label: 'Paketler', icon: Package },
      { id: 'services', label: 'Hizmetler', icon: Dumbbell },
      { id: 'trainers', label: 'Eğitmenler', icon: Users },
      { id: 'reservations', label: 'Rezervasyonlar', icon: Calendar }
    ]
  },
  {
    label: 'İçerik Yönetimi',
    items: [
      { id: 'content', label: 'Ana İçerik', icon: Home },
      { id: 'banners', label: 'Banner Yönetimi', icon: Image },
      { id: 'gallery', label: 'Galeri', icon: GalleryHorizontal },
      { id: 'announcements', label: 'Duyurular / Kayan Yazı', icon: Megaphone },
      { id: 'explore', label: 'Salonu Keşfet', icon: Video }
    ]
  },
  {
    label: 'Diğer',
    items: [
      { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
      { id: 'assistant', label: 'Asistan', icon: Sparkles },
      { id: 'theme', label: 'Tema Ayarları', icon: Palette },
      { id: 'seo', label: 'SEO', icon: FileText }
    ]
  }
];

const SECTION_TITLES = {
  dashboard: 'Kontrol Paneli',
  packages: 'Paket Yönetimi',
  services: 'Hizmet Yönetimi',
  trainers: 'Eğitmen Yönetimi',
  reservations: 'Rezervasyonlar',
  content: 'Ana İçerik',
  banners: 'Banner Yönetimi',
  gallery: 'Galeri Yönetimi',
  announcements: 'Duyurular ve Kayan Yazılar',
  explore: 'Salonu Keşfet Alanları',
  whatsapp: 'WhatsApp Ayarları',
  assistant: 'AI Asistan',
  theme: 'Tema Ayarları',
  seo: 'SEO Ayarları'
};

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR').format(Number(value) || 0);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function AdminLogin({ onSuccess, onClose }) {
  const [loginMode, setLoginMode] = useState('email');
  const [form, setForm] = useState({ email: 'admin@peakspor.com', username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const email = loginMode === 'email' ? form.email.trim() : form.username.trim();
      const result = await api.login({ email, password: form.password });
      if (result.user?.role !== 'ADMIN') {
        throw new Error('Bu hesap yönetici yetkisine sahip değil.');
      }
      onSuccess(result.user);
    } catch (loginError) {
      setError(loginError.message || 'Giriş başarısız');
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
              <p>Yönetim paneline erişmek için kimlik bilgilerinizi girin.</p>
            </div>
            <button className="admin-icon-btn" type="button" onClick={onClose} aria-label="Kapat">
              <X size={16} />
            </button>
          </div>
          <form className="admin-login-form-v2" onSubmit={handleSubmit}>
            <div className="admin-login-tabs">
              <button type="button" className={loginMode === 'email' ? 'active' : ''} onClick={() => setLoginMode('email')}>
                E-Posta
              </button>
              <button type="button" className={loginMode === 'username' ? 'active' : ''} onClick={() => setLoginMode('username')}>
                Kullanıcı Adı
              </button>
            </div>
            {loginMode === 'email' ? (
              <label>
                E-posta
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@peakspor.com"
                  required
                />
              </label>
            ) : (
              <label>
                Kullanıcı adı
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  required
                />
              </label>
            )}
            <label>
              Şifre
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </label>
            {error ? <div className="admin-login-error-v2">{error}</div> : null}
            <button className="admin-save-btn" type="submit" disabled={pending}>
              <LayoutDashboard size={16} />
              {pending ? 'Giriş yapılıyor...' : 'Panele Giriş Yap'}
            </button>
          </form>
          <div className="admin-login-tip-v2">
            Giriş: admin@peakspor.com veya kullanıcı adı <strong>admin</strong> — şifre <strong>Admin1234!</strong>
            <br />
            Sunucuyu yeniden başlattıktan sonra tekrar deneyin.
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ settings, dashboardData, onNavigate }) {
  const services = settings.services || [];
  const packages = settings.packages || [];
  const announcements = settings.announcements || [];
  const stats = dashboardData?.stats;

  const cards = [
    { label: 'Toplam Üye', value: stats?.totalUsers || 0, delta: '+12.5%', icon: Users },
    { label: 'Aktif Üye', value: stats?.activeMembers || 0, delta: '+9.3%', icon: Users },
    { label: 'Toplam Gelir', value: `₺${formatPrice(stats?.revenue || packages.reduce((sum, item) => sum + (item.price || 0), 0))}`, delta: '+18.7%', icon: CreditCard },
    { label: 'Rezervasyon', value: stats?.reservations || 0, delta: '+7.3%', icon: Calendar },
    { label: 'Hizmet', value: services.length, delta: '+11.2%', icon: Dumbbell },
    { label: 'Eğitmen', value: (settings.trainers || []).length, delta: '+4.2%', icon: MedalIcon }
  ];

  return (
    <>
      <h2 className="admin-page-title">Kontrol Paneli</h2>
      <p className="admin-page-sub">Site özet bilgileri ve hızlı yönetim araçları</p>

      <div className="admin-stats-row">
        {cards.map(card => (
          <article key={card.label} className="admin-stat-card">
            <div className="admin-stat-card-top">
              <div className="admin-stat-icon"><card.icon size={16} /></div>
              <span className="admin-stat-delta">{card.delta}</span>
            </div>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
            <div className="admin-spark" />
          </article>
        ))}
      </div>

      <div className="admin-charts-row">
        {['Gelir Grafiği', 'Üye Grafiği', 'Rezervasyon Grafiği'].map(title => (
          <div key={title} className="admin-chart-card">
            <div className="admin-card-head">
              <h4>{title}</h4>
              <select className="admin-card-filter"><option>Bu Ay</option></select>
            </div>
            <div className="admin-chart-area-v2">
              <div className="admin-chart-gridlines" />
              <div className="admin-chart-line-v2 green" />
              <div className="admin-chart-line-v2 red" />
              <div className="admin-chart-line-v2 blue" />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-bottom-grid">
        <div className="admin-panel-card">
          <div className="admin-card-head"><h4>Son Kayıt Olan Üyeler</h4></div>
          <div className="admin-list-stack">
            {(dashboardData?.recentUsers || []).slice(0, 4).map(user => (
              <div key={user.id} className="admin-list-item">
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <span className="admin-badge-pill">Aktif</span>
              </div>
            ))}
            {!dashboardData?.recentUsers?.length ? (
              <div className="admin-list-item"><span>Henüz üye kaydı yok</span></div>
            ) : null}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-card-head"><h4>Son Rezervasyonlar</h4></div>
          <div className="admin-list-stack">
            {(dashboardData?.recentReservations || []).slice(0, 4).map(item => (
              <div key={item.id} className="admin-list-item">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.service} • {item.phone}</span>
                </div>
                <span className={`admin-badge-pill ${item.status === 'PENDING' ? 'orange' : ''}`}>
                  {item.status || 'Onaylandı'}
                </span>
              </div>
            ))}
            {!dashboardData?.recentReservations?.length ? (
              <div className="admin-list-item"><span>Henüz rezervasyon yok</span></div>
            ) : null}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-card-head"><h4>Hızlı İşlemler</h4></div>
          <div className="admin-quick-grid">
            {[
              ['packages', 'Yeni Paket Ekle'],
              ['services', 'Hizmet Düzenle'],
              ['announcements', 'Duyuru Ekle'],
              ['theme', 'Renkleri Düzenle'],
              ['gallery', 'Galeri Güncelle'],
              ['explore', 'Salon Alanları']
            ].map(([id, label]) => (
              <button key={id} type="button" className="admin-quick-btn" onClick={() => onNavigate(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel-card">
          <div className="admin-card-head"><h4>Site Durumu</h4></div>
          <div className="admin-ring-row">
            <div><div className="admin-ring" style={{ '--pct': '72%' }}>72%</div><span>Disk</span></div>
            <div><div className="admin-ring" style={{ '--pct': '68%' }}>68%</div><span>Veritabanı</span></div>
            <div><div className="admin-ring" style={{ '--pct': '90%' }}>90%</div><span>Yedek</span></div>
          </div>
          <div style={{ marginTop: 14, color: '#9ca3af', fontSize: 12 }}>
            {announcements.length} duyuru • {packages.length} paket • {services.length} hizmet aktif
          </div>
        </div>
      </div>
    </>
  );
}

function MedalIcon(props) {
  return <Users {...props} />;
}

function SaveBar({ onSave, saving, message }) {
  return (
    <div className="admin-save-bar">
      <span className="admin-toast">{message || 'Değişiklikleri kaydetmeyi unutmayın.'}</span>
      <button className="admin-save-btn" type="button" onClick={onSave} disabled={saving}>
        <Save size={16} />
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  );
}

function PackagesSection({ items, onChange }) {
  const updateItem = (index, key, value) => {
    const next = clone(items);
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        title: 'Yeni Paket',
        subtitle: 'Açıklama',
        price: 599,
        period: '/ay',
        accent: '#7CFF4F',
        features: ['Özellik 1', 'Özellik 2'],
        cta: 'Seç'
      }
    ]);
  };

  const removeItem = index => onChange(items.filter((_, i) => i !== index));

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Paket Yönetimi</h2>
          <p className="admin-page-sub">Fiyatları, özellikleri ve kart metinlerini düzenleyin.</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={addItem}>+ Paket Ekle</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Alt Başlık</th>
              <th>Fiyat</th>
              <th>Dönem</th>
              <th>CTA</th>
              <th>Özellikler</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.title}-${index}`}>
                <td><input value={item.title} onChange={e => updateItem(index, 'title', e.target.value)} /></td>
                <td><input value={item.subtitle} onChange={e => updateItem(index, 'subtitle', e.target.value)} /></td>
                <td><input type="number" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} /></td>
                <td><input value={item.period} onChange={e => updateItem(index, 'period', e.target.value)} /></td>
                <td><input value={item.cta} onChange={e => updateItem(index, 'cta', e.target.value)} /></td>
                <td><input value={(item.features || []).join(', ')} onChange={e => updateItem(index, 'features', e.target.value.split(',').map(v => v.trim()).filter(Boolean))} /></td>
                <td>
                  <button type="button" className="admin-mini-btn danger" onClick={() => removeItem(index)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ServicesSection({ items, onChange }) {
  const updateItem = (index, key, value) => {
    const next = clone(items);
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      { title: 'Yeni Hizmet', category: 'Salon', description: 'Açıklama', image: '', accent: '#7CFF4F' }
    ]);
  };

  const removeItem = index => onChange(items.filter((_, i) => i !== index));

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Hizmet Yönetimi</h2>
          <p className="admin-page-sub">Ana sayfadaki hizmet kartlarını düzenleyin.</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={addItem}>+ Hizmet Ekle</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Görsel URL</th>
              <th>Renk</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.title}-${index}`}>
                <td><input value={item.title} onChange={e => updateItem(index, 'title', e.target.value)} /></td>
                <td><input value={item.category} onChange={e => updateItem(index, 'category', e.target.value)} /></td>
                <td><input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} /></td>
                <td><input value={item.image} onChange={e => updateItem(index, 'image', e.target.value)} /></td>
                <td><input value={item.accent} onChange={e => updateItem(index, 'accent', e.target.value)} /></td>
                <td>
                  <button type="button" className="admin-mini-btn danger" onClick={() => removeItem(index)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SimpleListSection({ title, subtitle, items, fields, onChange, emptyItem }) {
  const updateItem = (index, key, value) => {
    const next = clone(items);
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">{title}</h2>
          <p className="admin-page-sub">{subtitle}</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={() => onChange([...items, clone(emptyItem)])}>
          + Ekle
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="admin-form-card">
          <div className="admin-form-grid">
            {fields.map(field => (
              <label key={field.key} className="admin-field">
                {field.label}
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={item[field.key] || ''}
                    onChange={e => updateItem(index, field.key, e.target.value)}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={item[field.key] ?? ''}
                    onChange={e => updateItem(index, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="admin-row-actions" style={{ marginTop: 12 }}>
            <button type="button" className="admin-mini-btn danger" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <Trash2 size={14} /> Sil
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function AnnouncementsSection({ items, onChange }) {
  const normalized = items.map(item => (typeof item === 'string' ? { message: item } : item));

  const updateMessage = (index, message) => {
    const next = normalized.map((item, i) => (i === index ? { ...item, message } : item));
    onChange(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Duyurular ve Kayan Yazılar</h2>
          <p className="admin-page-sub">Üst banttaki kayan duyuru metinlerini düzenleyin.</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={() => onChange([...normalized, { message: 'Yeni duyuru' }])}>
          + Duyuru Ekle
        </button>
      </div>
      {normalized.map((item, index) => (
        <div key={index} className="admin-form-card">
          <label className="admin-field">
            Duyuru Metni
            <input value={item.message || ''} onChange={e => updateMessage(index, e.target.value)} />
          </label>
          <button type="button" className="admin-mini-btn danger" style={{ marginTop: 10 }} onClick={() => onChange(normalized.filter((_, i) => i !== index))}>
            <Trash2 size={14} /> Sil
          </button>
        </div>
      ))}
    </>
  );
}

function ContentSection({ content, onChange }) {
  const update = (section, key, value) => {
    onChange({
      ...content,
      [section]: {
        ...(content[section] || {}),
        [key]: value
      }
    });
  };

  const updateStat = (index, key, value) => {
    const stats = [...(content.stats || defaultContent.stats)];
    stats[index] = { ...stats[index], [key]: value };
    onChange({ ...content, stats });
  };

  return (
    <>
      <h2 className="admin-page-title">Ana İçerik</h2>
      <p className="admin-page-sub">Marka, hero alanı ve istatistik kartlarını düzenleyin.</p>

      <div className="admin-form-card">
        <h4>Marka</h4>
        <div className="admin-form-grid">
          <label className="admin-field">Marka Adı<input value={content.brand?.name || ''} onChange={e => update('brand', 'name', e.target.value)} /></label>
          <label className="admin-field">Slogan<input value={content.brand?.slogan || ''} onChange={e => update('brand', 'slogan', e.target.value)} /></label>
        </div>
      </div>

      <div className="admin-form-card">
        <h4>Hero Alanı</h4>
        <div className="admin-form-grid single">
          <label className="admin-field">Başlık<textarea rows={2} value={content.hero?.title || ''} onChange={e => update('hero', 'title', e.target.value)} /></label>
          <label className="admin-field">Açıklama<textarea rows={2} value={content.hero?.subtitle || ''} onChange={e => update('hero', 'subtitle', e.target.value)} /></label>
          <label className="admin-field">Görsel URL<input value={content.hero?.image || ''} onChange={e => update('hero', 'image', e.target.value)} /></label>
          <label className="admin-field">Birincil Buton<input value={content.hero?.primaryCta || ''} onChange={e => update('hero', 'primaryCta', e.target.value)} /></label>
          <label className="admin-field">İkincil Buton<input value={content.hero?.secondaryCta || ''} onChange={e => update('hero', 'secondaryCta', e.target.value)} /></label>
        </div>
      </div>

      <div className="admin-form-card">
        <h4>İstatistik Kartları</h4>
        {(content.stats || defaultContent.stats).map((stat, index) => (
          <div key={index} className="admin-form-grid" style={{ marginBottom: 12 }}>
            <label className="admin-field">Etiket<input value={stat.label} onChange={e => updateStat(index, 'label', e.target.value)} /></label>
            <label className="admin-field">Değer<input value={stat.value} onChange={e => updateStat(index, 'value', e.target.value)} /></label>
          </div>
        ))}
      </div>
    </>
  );
}

function BannersSection({ slides, onChange }) {
  const updateItem = (index, key, value) => {
    const next = clone(slides);
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Banner Yönetimi</h2>
          <p className="admin-page-sub">Ana sayfa kaydırıcı görsellerini düzenleyin.</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={() => onChange([...slides, { title: 'Yeni Banner', subtitle: 'Alt metin', image: '' }])}>
          + Banner Ekle
        </button>
      </div>
      {slides.map((slide, index) => (
        <div key={index} className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Başlık<input value={slide.title} onChange={e => updateItem(index, 'title', e.target.value)} /></label>
            <label className="admin-field">Alt Başlık<input value={slide.subtitle} onChange={e => updateItem(index, 'subtitle', e.target.value)} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Görsel URL<input value={slide.image} onChange={e => updateItem(index, 'image', e.target.value)} /></label>
          </div>
          <button type="button" className="admin-mini-btn danger" style={{ marginTop: 10 }} onClick={() => onChange(slides.filter((_, i) => i !== index))}>
            <Trash2 size={14} /> Sil
          </button>
        </div>
      ))}
    </>
  );
}

function ThemeSection({ theme, onChange }) {
  const colors = { ...defaultContent.theme, ...(theme || {}) };
  const update = (key, value) => onChange({ ...colors, [key]: value });

  return (
    <>
      <h2 className="admin-page-title">Tema Ayarları</h2>
      <p className="admin-page-sub">Site renklerini canlı olarak güncelleyin.</p>
      <div className="admin-form-card">
        <div className="admin-color-grid">
          {[
            ['primary', 'Ana Renk (Yeşil)'],
            ['secondary', 'İkincil Renk'],
            ['background', 'Arka Plan'],
            ['surface', 'Yüzey'],
            ['panel', 'Panel'],
            ['text', 'Metin'],
            ['muted', 'Soluk Metin']
          ].map(([key, label]) => (
            <label key={key} className="admin-field admin-color-field">
              {label}
              <input type="color" value={colors[key]} onChange={e => update(key, e.target.value)} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

function WhatsAppSection({ whatsapp, onChange }) {
  const data = { ...defaultContent.whatsapp, ...(whatsapp || {}) };
  const update = (key, value) => onChange({ ...data, [key]: value });

  return (
    <>
      <h2 className="admin-page-title">WhatsApp Ayarları</h2>
      <p className="admin-page-sub">Üyelik ve iletişim yönlendirmeleri için WhatsApp bilgileri.</p>
      <div className="admin-form-card">
        <div className="admin-form-grid single">
          <label className="admin-field">Telefon<input value={data.number} onChange={e => update('number', e.target.value)} /></label>
          <label className="admin-field">Varsayılan Mesaj<textarea rows={3} value={data.text} onChange={e => update('text', e.target.value)} /></label>
          <label className="admin-field">Buton Etiketi<input value={data.label} onChange={e => update('label', e.target.value)} /></label>
        </div>
      </div>
    </>
  );
}

function SeoSection({ seo, onChange }) {
  const data = { ...defaultContent.seo, ...(seo || {}) };
  const update = (key, value) => onChange({ ...data, [key]: value });

  return (
    <>
      <h2 className="admin-page-title">SEO Ayarları</h2>
      <p className="admin-page-sub">Arama motoru başlık ve açıklamaları.</p>
      <div className="admin-form-card">
        <div className="admin-form-grid single">
          <label className="admin-field">Sayfa Başlığı<input value={data.title} onChange={e => update('title', e.target.value)} /></label>
          <label className="admin-field">Açıklama<textarea rows={3} value={data.description} onChange={e => update('description', e.target.value)} /></label>
          <label className="admin-field">Anahtar Kelimeler<input value={data.keywords} onChange={e => update('keywords', e.target.value)} /></label>
        </div>
      </div>
    </>
  );
}

function AssistantSection({ assistant, onChange }) {
  const data = { ...defaultContent.assistant, ...(assistant || {}) };
  const update = (key, value) => onChange({ ...data, [key]: value });

  return (
    <>
      <h2 className="admin-page-title">AI Asistan</h2>
      <p className="admin-page-sub">Sohbet balonu karşılama metni ve hızlı butonlar.</p>
      <div className="admin-form-card">
        <div className="admin-form-grid single">
          <label className="admin-field">Karşılama Başlığı<input value={data.welcome} onChange={e => update('welcome', e.target.value)} /></label>
          <label className="admin-field">Karşılama Mesajı<textarea rows={3} value={data.message} onChange={e => update('message', e.target.value)} /></label>
          <label className="admin-field">Hızlı Butonlar (virgülle)<input value={(data.buttons || []).join(', ')} onChange={e => update('buttons', e.target.value.split(',').map(v => v.trim()).filter(Boolean))} /></label>
        </div>
      </div>
    </>
  );
}

function ReservationsSection({ items }) {
  return (
    <>
      <h2 className="admin-page-title">Rezervasyonlar</h2>
      <p className="admin-page-sub">Gelen rezervasyon talepleri.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Ad</th><th>Telefon</th><th>Hizmet</th><th>Tarih</th><th>Durum</th></tr>
          </thead>
          <tbody>
            {(items || []).map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.service}</td>
                <td>{item.date ? new Date(item.date).toLocaleString('tr-TR') : '-'}</td>
                <td>{item.status || 'Onaylandı'}</td>
              </tr>
            ))}
            {!items?.length ? <tr><td colSpan={5}>Henüz rezervasyon yok</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminDashboard({ state, setState, onClose }) {
  const [section, setSection] = useState('dashboard');
  const [user, setUser] = useState(state.user?.role === 'ADMIN' ? state.user : null);
  const [draft, setDraft] = useState(state.settings);
  const [dashboardData, setDashboardData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (!user) return undefined;
    Promise.allSettled([api.dashboard(), api.resource('reservations')]).then(([dashResult, resResult]) => {
      if (dashResult.status === 'fulfilled') setDashboardData(dashResult.value);
      if (resResult.status === 'fulfilled') setReservations(resResult.value.data || []);
    });
  }, [user]);

  const persist = async (key, value, label) => {
    setSaving(true);
    setMessage('');
    try {
      await api.saveSetting(key, value);
      const nextSettings = { ...draft, [key]: value };
      setDraft(nextSettings);
      setState(prev => ({ ...prev, settings: nextSettings }));
      setMessage(`${label} kaydedildi.`);
    } catch (error) {
      setMessage(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const persistContent = async patch => {
    const nextContent = { ...draft.content, ...patch };
    await persist('content', nextContent, 'İçerik');
  };

  const handleSaveSection = async () => {
    if (section === 'packages') return persist('packages', draft.packages, 'Paketler');
    if (section === 'services') return persist('services', draft.services, 'Hizmetler');
    if (section === 'trainers') return persist('trainers', draft.trainers, 'Eğitmenler');
    if (section === 'gallery') return persist('gallery', draft.gallery, 'Galeri');
    if (section === 'announcements') return persist('announcements', draft.announcements, 'Duyurular');
    if (section === 'explore') return persist('facilityAreas', draft.facilityAreas, 'Salon alanları');
    if (section === 'content') return persist('content', draft.content, 'Ana içerik');
    if (section === 'banners') {
      return persistContent({ bannerSlides: draft.content.bannerSlides });
    }
    if (section === 'theme') {
      return persistContent({ theme: draft.content.theme });
    }
    if (section === 'whatsapp') {
      return persistContent({ whatsapp: draft.content.whatsapp });
    }
    if (section === 'seo') {
      return persistContent({ seo: draft.content.seo });
    }
    if (section === 'assistant') {
      return persistContent({ assistant: draft.content.assistant });
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const showSaveBar = !['dashboard', 'reservations'].includes(section);

  if (!user) {
    return (
      <AdminLogin
        onClose={onClose}
        onSuccess={loggedInUser => {
          setUser(loggedInUser);
          setState(prev => ({ ...prev, user: loggedInUser }));
        }}
      />
    );
  }

  const content = draft.content || defaultContent;

  return (
    <div className="admin-overlay">
      <div className="admin-shell">
        <aside className="admin-sidebar-v2">
          <div className="admin-brand-row">
            <div className="admin-brand-mark">▲</div>
            <div>
              <strong>PEAKSPOR</strong>
              <span>Yönetim Paneli</span>
            </div>
          </div>

          {NAV_GROUPS.map(group => (
            <div key={group.label || 'root'} className="admin-nav-group">
              {group.label ? <div className="admin-nav-label">{group.label}</div> : null}
              {group.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-nav-item ${section === item.id ? 'active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          <div className="admin-sidebar-footer">
            <button type="button" className="admin-view-site" onClick={onClose}>
              <ExternalLink size={14} />
              Siteyi Görüntüle
            </button>
          </div>
        </aside>

        <div className="admin-main-v2">
          <header className="admin-topbar-v2">
            <div className="admin-breadcrumb">
              Dashboard &gt; <strong>{SECTION_TITLES[section]}</strong>
            </div>
            <div className="admin-topbar-actions">
              <input className="admin-search" placeholder="Ara..." />
              <button className="admin-icon-btn" type="button" aria-label="Bildirimler"><Bell size={16} /></button>
              <button className="admin-icon-btn" type="button" aria-label="Tema"><SunMedium size={16} /></button>
              <div className="admin-user-chip">
                <div className="admin-user-avatar">A</div>
                <div>
                  <strong>{user.name || 'Admin'}</strong>
                  <span>Süper Yönetici</span>
                </div>
              </div>
              <button className="admin-icon-btn" type="button" onClick={handleLogout} aria-label="Çıkış"><LogOut size={16} /></button>
              <button className="admin-icon-btn" type="button" onClick={onClose} aria-label="Kapat"><X size={16} /></button>
            </div>
          </header>

          <main className="admin-content-v2">
            {section === 'dashboard' ? (
              <DashboardHome settings={draft} dashboardData={dashboardData} onNavigate={setSection} />
            ) : null}

            {section === 'packages' ? (
              <PackagesSection items={draft.packages || []} onChange={value => setDraft(prev => ({ ...prev, packages: value }))} />
            ) : null}

            {section === 'services' ? (
              <ServicesSection items={draft.services || []} onChange={value => setDraft(prev => ({ ...prev, services: value }))} />
            ) : null}

            {section === 'trainers' ? (
              <SimpleListSection
                title="Eğitmen Yönetimi"
                subtitle="Eğitmen kartlarını düzenleyin."
                items={draft.trainers || []}
                emptyItem={{ name: 'Yeni Eğitmen', role: 'Rol', specialty: 'Uzmanlık', image: '' }}
                fields={[
                  { key: 'name', label: 'Ad Soyad' },
                  { key: 'role', label: 'Rol' },
                  { key: 'specialty', label: 'Uzmanlık' },
                  { key: 'image', label: 'Görsel URL' }
                ]}
                onChange={value => setDraft(prev => ({ ...prev, trainers: value }))}
              />
            ) : null}

            {section === 'gallery' ? (
              <SimpleListSection
                title="Galeri Yönetimi"
                subtitle="Galeri görsellerini düzenleyin."
                items={draft.gallery || []}
                emptyItem={{ title: 'Yeni Görsel', category: 'Kategori', image: '' }}
                fields={[
                  { key: 'title', label: 'Başlık' },
                  { key: 'category', label: 'Kategori' },
                  { key: 'image', label: 'Görsel URL' }
                ]}
                onChange={value => setDraft(prev => ({ ...prev, gallery: value }))}
              />
            ) : null}

            {section === 'explore' ? (
              <SimpleListSection
                title="Salonu Keşfet"
                subtitle="Keşfet sayfasındaki alanları düzenleyin."
                items={draft.facilityAreas || []}
                emptyItem={{ title: 'Yeni Alan', description: 'Açıklama', image: '', video: '', tag: 'Görsel' }}
                fields={[
                  { key: 'title', label: 'Başlık' },
                  { key: 'description', label: 'Açıklama', type: 'textarea' },
                  { key: 'image', label: 'Görsel URL' },
                  { key: 'video', label: 'Video URL (YouTube embed)' },
                  { key: 'tag', label: 'Etiket' }
                ]}
                onChange={value => setDraft(prev => ({ ...prev, facilityAreas: value }))}
              />
            ) : null}

            {section === 'announcements' ? (
              <AnnouncementsSection
                items={draft.announcements || []}
                onChange={value => setDraft(prev => ({ ...prev, announcements: value }))}
              />
            ) : null}

            {section === 'content' ? (
              <ContentSection content={content} onChange={value => setDraft(prev => ({ ...prev, content: value }))} />
            ) : null}

            {section === 'banners' ? (
              <BannersSection
                slides={content.bannerSlides || defaultContent.bannerSlides}
                onChange={value => setDraft(prev => ({ ...prev, content: { ...prev.content, bannerSlides: value } }))}
              />
            ) : null}

            {section === 'theme' ? (
              <ThemeSection
                theme={content.theme}
                onChange={value => setDraft(prev => ({ ...prev, content: { ...prev.content, theme: value } }))}
              />
            ) : null}

            {section === 'whatsapp' ? (
              <WhatsAppSection
                whatsapp={content.whatsapp}
                onChange={value => setDraft(prev => ({ ...prev, content: { ...prev.content, whatsapp: value } }))}
              />
            ) : null}

            {section === 'seo' ? (
              <SeoSection
                seo={content.seo}
                onChange={value => setDraft(prev => ({ ...prev, content: { ...prev.content, seo: value } }))}
              />
            ) : null}

            {section === 'assistant' ? (
              <AssistantSection
                assistant={content.assistant}
                onChange={value => setDraft(prev => ({ ...prev, content: { ...prev.content, assistant: value } }))}
              />
            ) : null}

            {section === 'reservations' ? <ReservationsSection items={reservations} /> : null}

            {showSaveBar ? <SaveBar onSave={handleSaveSection} saving={saving} message={message} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
