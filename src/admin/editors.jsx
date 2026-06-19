import React, { useMemo, useState } from 'react';
import { Eye, Plus, Star, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  normalizeGalleryItem,
  normalizePackage,
  normalizeService,
  normalizeAnnouncement
} from '../../shared/media.js';
import { defaultGalleryCategories } from '../../shared/defaults.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="admin-field admin-color-field">
      {label}
      <input type="color" value={value || '#7CFF4F'} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

export function ServicePreviewCard({ service }) {
  const data = normalizeService(service);
  return (
    <article className="preview-service-card" style={{ '--card-accent': data.accent }}>
      <div className="preview-service-media">
        {data.image ? (
          <img src={data.image} alt={data.title} style={{ objectFit: data.imageFit }} />
        ) : (
          <div className="preview-empty">Görsel URL ekleyin</div>
        )}
        {data.featured ? <span className="preview-featured">Ana Sayfa</span> : null}
      </div>
      <div className="preview-service-body">
        <span>{data.category}</span>
        <strong>{data.title}</strong>
        <p>{data.description}</p>
      </div>
    </article>
  );
}

export function PackagePreviewCard({ pkg }) {
  const data = normalizePackage(pkg);
  return (
    <article className="preview-package-card" style={{ '--pkg-accent': data.accent }}>
      {data.discountLabel ? <span className="preview-discount">{data.discountLabel}</span> : null}
      {data.featured ? <span className="preview-featured">Ana Sayfa</span> : null}
      <div className="preview-package-top">
        <div>
          <small>{data.subtitle}</small>
          <strong>{data.title}</strong>
        </div>
        <div className="preview-package-price">
          {data.originalPrice ? <s>₺{data.originalPrice}</s> : null}
          <span>₺{data.price}</span>
          <em>{data.period}</em>
        </div>
      </div>
      <ul>
        {data.features.slice(0, 4).map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" className="preview-package-cta">{data.cta}</button>
    </article>
  );
}

export function GalleryPreviewCard({ item }) {
  const data = normalizeGalleryItem(item);
  const thumb = data.type === 'video' ? data.image || getYoutubeThumbnail(data.videoUrl) : data.image;
  return (
    <article className="preview-gallery-card">
      <div className="preview-gallery-media">
        {thumb ? <img src={thumb} alt={data.title} /> : <div className="preview-empty">Medya yok</div>}
        {data.type === 'video' ? <span className="preview-video-badge"><Video size={14} /></span> : null}
        {data.featured ? <span className="preview-featured">Ana Sayfa</span> : null}
      </div>
      <div className="preview-gallery-body">
        <span>{data.category}</span>
        <strong>{data.title}</strong>
      </div>
    </article>
  );
}

export function ServicesEditor({ items, onChange }) {
  const [active, setActive] = useState(0);
  const list = (items || []).map(normalizeService);
  const current = list[active] || normalizeService({});

  const update = (key, value) => {
    const next = clone(list);
    next[active] = { ...next[active], [key]: value };
    onChange(next);
  };

  const addItem = () => {
    onChange([...list, normalizeService({ title: 'Yeni Hizmet', featured: false })]);
    setActive(list.length);
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Hizmetler</h2>
            <p className="admin-page-sub">Kart rengi, görsel ve ana sayfa öne çıkarma.</p>
          </div>
          <button type="button" className="admin-mini-btn primary" onClick={addItem}><Plus size={14} /> Ekle</button>
        </div>

        <div className="admin-chip-row">
          {list.map((item, index) => (
            <button key={`${item.title}-${index}`} type="button" className={`admin-chip ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}>
              {item.title}
            </button>
          ))}
        </div>

        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Başlık<input value={current.title} onChange={e => update('title', e.target.value)} /></label>
            <label className="admin-field">Kategori<input value={current.category} onChange={e => update('category', e.target.value)} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Açıklama<textarea rows={2} value={current.description} onChange={e => update('description', e.target.value)} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Görsel URL<input value={current.image} onChange={e => update('image', e.target.value)} placeholder="https://..." /></label>
            <ColorField label="Kart Rengi" value={current.accent} onChange={v => update('accent', v)} />
            <label className="admin-field">Görsel Yerleşimi
              <select value={current.imageFit} onChange={e => update('imageFit', e.target.value)}>
                <option value="cover">Karta sığdır (cover)</option>
                <option value="contain">Tam göster (contain)</option>
              </select>
            </label>
          </div>
          <Toggle checked={current.featured} onChange={v => update('featured', v)} label="Ana sayfada öne çıkar" />
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <ServicePreviewCard service={current} />
      </aside>
    </div>
  );
}

export function PackagesEditor({ items, onChange }) {
  const [active, setActive] = useState(0);
  const list = (items || []).map(normalizePackage);
  const current = list[active] || normalizePackage({});

  const update = (key, value) => {
    const next = clone(list);
    next[active] = { ...next[active], [key]: value };
    onChange(next);
  };

  const updateFeatures = text => update('features', text.split('\n').map(v => v.trim()).filter(Boolean));

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Paketler</h2>
            <p className="admin-page-sub">Fiyat, indirim etiketi, özellik listesi ve renk.</p>
          </div>
          <button type="button" className="admin-mini-btn primary" onClick={() => { onChange([...list, normalizePackage({ title: 'Yeni Paket' })]); setActive(list.length); }}><Plus size={14} /> Ekle</button>
        </div>

        <div className="admin-chip-row">
          {list.map((item, index) => (
            <button key={`${item.title}-${index}`} type="button" className={`admin-chip ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}>{item.title}</button>
          ))}
        </div>

        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Paket Adı<input value={current.title} onChange={e => update('title', e.target.value)} /></label>
            <label className="admin-field">Alt Başlık<input value={current.subtitle} onChange={e => update('subtitle', e.target.value)} /></label>
            <label className="admin-field">Fiyat<input type="number" value={current.price} onChange={e => update('price', Number(e.target.value))} /></label>
            <label className="admin-field">Eski Fiyat (opsiyonel)<input type="number" value={current.originalPrice || ''} onChange={e => update('originalPrice', e.target.value ? Number(e.target.value) : null)} /></label>
            <label className="admin-field">İndirim Etiketi<input value={current.discountLabel} onChange={e => update('discountLabel', e.target.value)} placeholder="%30 İndirim" /></label>
            <label className="admin-field">Dönem<input value={current.period} onChange={e => update('period', e.target.value)} /></label>
            <ColorField label="Kart Rengi" value={current.accent} onChange={v => update('accent', v)} />
            <label className="admin-field">Buton Metni<input value={current.cta} onChange={e => update('cta', e.target.value)} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Özellik Listesi (her satır bir madde)<textarea rows={5} value={(current.features || []).join('\n')} onChange={e => updateFeatures(e.target.value)} /></label>
          </div>
          <Toggle checked={current.featured} onChange={v => update('featured', v)} label="Ana sayfada öne çıkar" />
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <PackagePreviewCard pkg={current} />
      </aside>
    </div>
  );
}

export function GalleryEditor({ items, categories, onChange, onCategoriesChange }) {
  const [active, setActive] = useState(0);
  const cats = categories?.length ? categories : defaultGalleryCategories;
  const list = (items || []).map((item, index) => normalizeGalleryItem(item, index));
  const current = list[active] || normalizeGalleryItem({});

  const update = (key, value) => {
    const next = clone(list);
    next[active] = { ...next[active], [key]: value };
    if (key === 'videoUrl' && next[active].type === 'video') {
      next[active].image = next[active].image || getYoutubeThumbnail(value);
    }
    if (key === 'type' && value === 'video' && next[active].videoUrl) {
      next[active].image = next[active].image || getYoutubeThumbnail(next[active].videoUrl);
    }
    onChange(next);
  };

  const addCategory = () => {
    const name = window.prompt('Yeni bölüm adı');
    if (!name?.trim()) return;
    onCategoriesChange([...cats, name.trim()]);
  };

  const removeCategory = cat => {
    if (!window.confirm(`"${cat}" bölümünü silmek istiyor musunuz?`)) return;
    onCategoriesChange(cats.filter(c => c !== cat));
    onChange(list.map(item => (item.category === cat ? { ...item, category: cats[0] || 'Görseller' } : item)));
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Galeri</h2>
            <p className="admin-page-sub">Görsel, YouTube video ve bölüm yönetimi.</p>
          </div>
          <button type="button" className="admin-mini-btn primary" onClick={() => { onChange([...list, normalizeGalleryItem({ id: `g-${Date.now()}`, category: cats[0] }, list.length)]); setActive(list.length); }}><Plus size={14} /> İçerik Ekle</button>
        </div>

        <div className="admin-form-card">
          <h4>Galeri Bölümleri</h4>
          <div className="admin-chip-row">
            {cats.map(cat => (
              <span key={cat} className="admin-category-chip">
                {cat}
                <button type="button" onClick={() => removeCategory(cat)} aria-label="Sil">×</button>
              </span>
            ))}
            <button type="button" className="admin-mini-btn" onClick={addCategory}>+ Bölüm</button>
          </div>
        </div>

        <div className="admin-chip-row">
          {list.map((item, index) => (
            <button key={item.id} type="button" className={`admin-chip ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}>
              {item.type === 'video' ? '▶ ' : ''}{item.title}
            </button>
          ))}
        </div>

        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Başlık<input value={current.title} onChange={e => update('title', e.target.value)} /></label>
            <label className="admin-field">Bölüm
              <select value={current.category} onChange={e => update('category', e.target.value)}>
                {cats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
            <label className="admin-field">Tür
              <select value={current.type} onChange={e => update('type', e.target.value)}>
                <option value="image">Görsel</option>
                <option value="video">YouTube Video</option>
              </select>
            </label>
            {current.type === 'image' ? (
              <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Görsel URL<input value={current.image} onChange={e => update('image', e.target.value)} /></label>
            ) : (
              <>
                <label className="admin-field" style={{ gridColumn: '1 / -1' }}>YouTube URL<input value={current.videoUrl} onChange={e => update('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></label>
                <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Kapak Görseli (opsiyonel)<input value={current.image} onChange={e => update('image', e.target.value)} /></label>
              </>
            )}
          </div>
          <Toggle checked={current.featured} onChange={v => update('featured', v)} label="Ana sayfada öne çıkar" />
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <GalleryPreviewCard item={current} />
        {current.type === 'video' && current.videoUrl ? (
          <div className="preview-video-frame">
            <iframe src={getYoutubeEmbedUrl(current.videoUrl)} title={current.title} allowFullScreen />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function AnnouncementsEditor({ items, onChange }) {
  const list = (items || []).map((item, index) => normalizeAnnouncement(item, index));

  const update = (index, patch) => {
    const next = clone(list);
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Duyuru Bandı</h2>
          <p className="admin-page-sub">Üstte kayan duyuru yazılarını, renklerini ve kalınlığını düzenleyin.</p>
        </div>
        <button type="button" className="admin-mini-btn primary" onClick={() => onChange([...list, normalizeAnnouncement({ message: 'Yeni duyuru' }, list.length)])}><Plus size={14} /> Duyuru Ekle</button>
      </div>
      <div className="admin-ticker-preview">
        <span className="admin-ticker-label">Önizleme</span>
        <div className="admin-ticker-text">
          {list.length ? list.map((item, index) => (
            <span key={item.id || index} style={{ color: item.color || undefined, fontWeight: item.weight || 600 }}>
              {index > 0 ? ' • ' : ''}{item.message}
            </span>
          )) : 'Duyuru metni ekleyin'}
        </div>
      </div>
      {list.map((item, index) => (
        <div key={item.id || index} className="admin-form-card admin-announce-row">
          <label className="admin-field">Duyuru #{index + 1}<input value={item.message || ''} onChange={e => update(index, { message: e.target.value })} /></label>
          <ColorField label="Renk" value={item.color || '#7CFF4F'} onChange={value => update(index, { color: value })} />
          <label className="admin-field">Kalınlık
            <select value={item.weight || '600'} onChange={e => update(index, { weight: e.target.value })}>
              <option value="500">Normal</option>
              <option value="600">Orta</option>
              <option value="700">Kalın</option>
              <option value="800">Çok Kalın</option>
            </select>
          </label>
          <button type="button" className="admin-mini-btn danger" onClick={() => onChange(list.filter((_, i) => i !== index))}><Trash2 size={14} /></button>
        </div>
      ))}
    </>
  );
}

export function DashboardStats({ analytics, settings }) {
  const visitsToday = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    return analytics?.visitsByDay?.[day] || 0;
  }, [analytics]);

  const topPages = useMemo(() => {
    const entries = Object.entries(analytics?.pageViews || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return entries;
  }, [analytics]);

  const topClicks = useMemo(() => {
    return Object.entries(analytics?.clicksByTarget || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [analytics]);

  const cards = [
    { label: 'Toplam Ziyaret', value: analytics?.totalVisits || 0 },
    { label: 'Benzersiz Ziyaretçi', value: analytics?.uniqueVisitors || 0 },
    { label: 'Bugünkü Ziyaret', value: visitsToday },
    { label: 'Toplam Tıklama', value: analytics?.totalClicks || 0 },
    { label: 'Hizmet', value: settings?.services?.length || 0 },
    { label: 'Paket', value: settings?.packages?.length || 0 }
  ];

  return (
    <>
      <h2 className="admin-page-title">Özet</h2>
      <p className="admin-page-sub">Gerçek site istatistikleri — grafik yok, sadece veri.</p>
      <div className="admin-stats-row admin-stats-simple">
        {cards.map(card => (
          <article key={card.label} className="admin-stat-card admin-stat-minimal">
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </article>
        ))}
      </div>
      <div className="admin-stats-panels">
        <div className="admin-panel-card">
          <h4>En Çok Görüntülenen Sayfalar</h4>
          <div className="admin-list-stack">
            {topPages.length ? topPages.map(([path, count]) => (
              <div key={path} className="admin-list-item"><strong>{path}</strong><span>{count} görüntüleme</span></div>
            )) : <div className="admin-list-item"><span>Henüz veri yok</span></div>}
          </div>
        </div>
        <div className="admin-panel-card">
          <h4>En Çok Tıklanan Alanlar</h4>
          <div className="admin-list-stack">
            {topClicks.length ? topClicks.map(([target, count]) => (
              <div key={target} className="admin-list-item"><strong>{target}</strong><span>{count} tıklama</span></div>
            )) : <div className="admin-list-item"><span>Henüz tıklama yok</span></div>}
          </div>
        </div>
        <div className="admin-panel-card">
          <h4>Ana Sayfa Öne Çıkanlar</h4>
          <div className="admin-list-stack">
            <div className="admin-list-item"><strong>Hizmetler</strong><span>{(settings?.services || []).filter(s => s.featured).length} adet</span></div>
            <div className="admin-list-item"><strong>Paketler</strong><span>{(settings?.packages || []).filter(p => p.featured).length} adet</span></div>
            <div className="admin-list-item"><strong>Galeri</strong><span>{(settings?.gallery || []).filter(g => g.featured).length} adet</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
