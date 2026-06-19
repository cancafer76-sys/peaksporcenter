import React, { useMemo, useState } from 'react';
import { Eye, Plus, Star, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  normalizeAbout,
  normalizeGalleryItem,
  normalizePackage,
  normalizePackageFeature,
  normalizeService,
  normalizeAnnouncement,
  normalizeStat,
  normalizeStats,
  normalizeHomeCards,
  normalizeTestimonial,
  normalizeTrainer,
  packageCardVars,
  serviceCardVars,
  STAT_ICON_OPTIONS
} from '../../shared/media.js';
import { defaultContent, defaultGalleryCategories, defaultAbout } from '../../shared/defaults.js';

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
      <input type="color" value={value || '#FFFFFF'} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

export function ServicePreviewCard({ service }) {
  const data = normalizeService(service);
  return (
    <article className="preview-service-card" style={serviceCardVars(data)}>
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
    <article className="preview-package-card package-card-luxury" style={packageCardVars(data)}>
      {data.discountLabel ? <span className="package-badge">{data.discountLabel}</span> : null}
      <div className="package-card-head">
        <h3 className="package-card-title">{data.title}</h3>
        {data.subtitle ? <p className="package-card-subtitle">{data.subtitle}</p> : null}
      </div>
      <div className="package-card-price-block">
        {data.originalPrice ? <s className="package-old-price">₺{data.originalPrice}</s> : null}
        <div className="package-price">
          <span className="package-price-value">₺{data.price}</span>
          <small className="package-price-period">{data.period}</small>
        </div>
      </div>
      <ul className="package-feature-list">
        {data.features.slice(0, 6).map((feature, index) => (
          <li key={`${feature.text}-${index}`} className={feature.included ? 'is-included' : 'is-excluded'}>
            <span className="package-feature-icon" aria-hidden="true">{feature.included ? '✓' : '✗'}</span>
            <span className="package-feature-text">{feature.text}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="package-cta package-cta-luxury preview-package-cta">{data.cta}</button>
    </article>
  );
}

function PackageFeaturesEditor({ features, onChange }) {
  const items = (features || []).map(normalizePackageFeature).filter(Boolean);

  const updateFeature = (index, patch) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const addFeature = () => onChange([...items, { text: 'Yeni madde', included: true }]);

  const removeFeature = index => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="admin-feature-list">
      <span className="admin-feature-list-label">Özellik maddeleri (✓ dahil / ✗ hariç)</span>
      {items.map((feature, index) => (
        <div key={`${feature.text}-${index}`} className="admin-feature-row">
          <button
            type="button"
            className={`admin-feature-toggle ${feature.included ? 'is-included' : 'is-excluded'}`}
            onClick={() => updateFeature(index, { included: !feature.included })}
            title={feature.included ? 'Dahil — tıkla hariç yap' : 'Hariç — tıkla dahil yap'}
          >
            {feature.included ? '✓' : '✗'}
          </button>
          <input
            value={feature.text}
            onChange={e => updateFeature(index, { text: e.target.value })}
            placeholder="Özellik maddesi"
          />
          <button type="button" className="admin-feature-remove" onClick={() => removeFeature(index)} aria-label="Maddeyi sil">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="admin-mini-btn" onClick={addFeature}>
        <Plus size={14} /> Madde Ekle
      </button>
    </div>
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
            <ColorField label="Kenarlık / Vurgu" value={current.accent} onChange={v => update('accent', v)} />
            <ColorField label="Başlık Rengi" value={current.titleColor} onChange={v => update('titleColor', v)} />
            <ColorField label="Yazı Rengi" value={current.textColor} onChange={v => update('textColor', v)} />
            <ColorField label="Alt Yazı Rengi" value={current.mutedColor} onChange={v => update('mutedColor', v)} />
            <ColorField label="Arka Plan" value={current.bgColor} onChange={v => update('bgColor', v)} />
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

  const updateFeatures = next => update('features', next);

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
            <ColorField label="Kenarlık / Buton" value={current.accent} onChange={v => update('accent', v)} />
            <ColorField label="Fiyat Rengi" value={current.priceColor} onChange={v => update('priceColor', v)} />
            <ColorField label="Başlık Rengi" value={current.titleColor} onChange={v => update('titleColor', v)} />
            <ColorField label="Yazı Rengi" value={current.textColor} onChange={v => update('textColor', v)} />
            <ColorField label="Alt Yazı Rengi" value={current.mutedColor} onChange={v => update('mutedColor', v)} />
            <ColorField label="Arka Plan" value={current.bgColor} onChange={v => update('bgColor', v)} />
            <ColorField label="Kenarlık Rengi" value={current.borderColor} onChange={v => update('borderColor', v)} />
            <label className="admin-field">Buton Metni<input value={current.cta} onChange={e => update('cta', e.target.value)} /></label>
          </div>
          <PackageFeaturesEditor features={current.features} onChange={updateFeatures} />
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
    onChange(list.map(item => (item.category === cat ? { ...item, category: cats[0] || 'Salon' } : item)));
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
          <ColorField label="Renk" value={item.color || '#FFFFFF'} onChange={value => update(index, { color: value })} />
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

export function CardsEditor({ content, onChange }) {
  const data = content || defaultContent;
  const stats = normalizeStats(data.stats || defaultContent.stats);
  const homeCards = normalizeHomeCards(data.homeCards);

  const patch = next => onChange({ ...data, ...next });
  const patchHome = key => next => patch({ homeCards: { ...homeCards, [key]: { ...homeCards[key], ...next } } });

  const updateStat = (index, patchStat) => {
    const next = clone(stats);
    next[index] = { ...next[index], ...patchStat };
    patch({ stats: next });
  };

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Ana Sayfa Kartları</h2>
          <p className="admin-page-sub">İstatistik kartlarını ve seçili hizmet/paket kartlarını yönetin.</p>
        </div>
        <button
          type="button"
          className="admin-mini-btn primary"
          onClick={() => patch({ stats: [...stats, normalizeStat({ label: 'Yeni Kart', value: '0' }, stats.length)] })}
        >
          <Plus size={14} /> Kart Ekle
        </button>
      </div>

      <div className="admin-form-card">
        <h4>İstatistik Kartları</h4>
        <p className="admin-hint">5.000+ Aktif Üye gibi rakam kartları. Gizle, sil veya renkleri değiştir.</p>
        {stats.map((item, index) => (
          <div key={item.id} className="admin-form-card admin-card-row">
            <div className="admin-card-row-head">
              <Toggle checked={item.visible} onChange={v => updateStat(index, { visible: v })} label={item.visible ? 'Görünür' : 'Gizli'} />
              <button type="button" className="admin-mini-btn danger" onClick={() => patch({ stats: stats.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">Etiket<input value={item.label} onChange={e => updateStat(index, { label: e.target.value })} /></label>
              <label className="admin-field">Rakam / Değer<input value={item.value} onChange={e => updateStat(index, { value: e.target.value })} /></label>
              <label className="admin-field">İkon
                <select value={item.icon} onChange={e => updateStat(index, { icon: e.target.value })}>
                  {STAT_ICON_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </label>
              <ColorField label="İkon Rengi" value={item.accentColor} onChange={v => updateStat(index, { accentColor: v })} />
              <ColorField label="Arka Plan" value={item.bgColor} onChange={v => updateStat(index, { bgColor: v })} />
              <ColorField label="Rakam Rengi" value={item.valueColor} onChange={v => updateStat(index, { valueColor: v })} />
              <ColorField label="Etiket Rengi" value={item.labelColor} onChange={v => updateStat(index, { labelColor: v })} />
            </div>
            <article className="preview-stat-card" style={{ background: item.bgColor, borderColor: `${item.accentColor}44` }}>
              <strong style={{ color: item.valueColor }}>{item.value}</strong>
              <span style={{ color: item.labelColor }}>{item.label}</span>
            </article>
          </div>
        ))}
      </div>

      <div className="admin-form-card">
        <h4>Seçili Hizmet Kartı</h4>
        <Toggle checked={homeCards.selectedService.visible} onChange={v => patchHome('selectedService')({ visible: v })} label="Kartı göster" />
        <div className="admin-form-grid">
          <label className="admin-field">Başlık<input value={homeCards.selectedService.label} onChange={e => patchHome('selectedService')({ label: e.target.value })} /></label>
          <label className="admin-field">Buton Yazısı<input value={homeCards.selectedService.buttonText} onChange={e => patchHome('selectedService')({ buttonText: e.target.value })} /></label>
          <ColorField label="Vurgu Rengi" value={homeCards.selectedService.accent} onChange={v => patchHome('selectedService')({ accent: v })} />
          <ColorField label="Arka Plan" value={homeCards.selectedService.background} onChange={v => patchHome('selectedService')({ background: v })} />
          <ColorField label="Metin Rengi" value={homeCards.selectedService.text} onChange={v => patchHome('selectedService')({ text: v })} />
          <ColorField label="Açıklama Rengi" value={homeCards.selectedService.muted} onChange={v => patchHome('selectedService')({ muted: v })} />
        </div>
      </div>

      <div className="admin-form-card">
        <h4>Seçili Paket Kartı</h4>
        <Toggle checked={homeCards.selectedPackage.visible} onChange={v => patchHome('selectedPackage')({ visible: v })} label="Kartı göster" />
        <Toggle checked={homeCards.selectedPackage.showPrice} onChange={v => patchHome('selectedPackage')({ showPrice: v })} label="Fiyat göster" />
        <div className="admin-form-grid">
          <label className="admin-field">Başlık<input value={homeCards.selectedPackage.label} onChange={e => patchHome('selectedPackage')({ label: e.target.value })} /></label>
          <ColorField label="Vurgu Rengi" value={homeCards.selectedPackage.accent} onChange={v => patchHome('selectedPackage')({ accent: v })} />
          <ColorField label="Arka Plan" value={homeCards.selectedPackage.background} onChange={v => patchHome('selectedPackage')({ background: v })} />
          <ColorField label="Metin Rengi" value={homeCards.selectedPackage.text} onChange={v => patchHome('selectedPackage')({ text: v })} />
          <ColorField label="Alt Metin Rengi" value={homeCards.selectedPackage.muted} onChange={v => patchHome('selectedPackage')({ muted: v })} />
        </div>
      </div>

      <div className="admin-form-card">
        <h4>Hero Rozet (5.000+ Aktif Üye)</h4>
        <Toggle checked={homeCards.heroFloating.visible} onChange={v => patchHome('heroFloating')({ visible: v })} label="Hero üzerinde göster" />
        <label className="admin-field">Hangi istatistik kartı?
          <select value={homeCards.heroFloating.statIndex} onChange={e => patchHome('heroFloating')({ statIndex: Number(e.target.value) })}>
            {stats.map((item, index) => (
              <option key={item.id} value={index}>{item.label} — {item.value}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}

export function TrainersEditor({ items, onChange }) {
  const [active, setActive] = useState(0);
  const list = (items || []).map(normalizeTrainer);
  const current = list[active] || normalizeTrainer({});

  const update = (key, value) => {
    const next = clone(list);
    next[active] = { ...next[active], [key]: value };
    onChange(next);
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Hocalarımız</h2>
            <p className="admin-page-sub">Hoca adı, uzmanlık alanı, deneyim açıklaması ve fotoğraf.</p>
          </div>
          <button type="button" className="admin-mini-btn primary" onClick={() => { onChange([...list, normalizeTrainer({ name: 'Yeni Hoca' })]); setActive(list.length); }}><Plus size={14} /> Ekle</button>
        </div>
        <div className="admin-chip-row">
          {list.map((item, index) => (
            <button key={`${item.id}-${index}`} type="button" className={`admin-chip ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}>{item.name}</button>
          ))}
        </div>
        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Hoca Adı<input value={current.name} onChange={e => update('name', e.target.value)} /></label>
            <label className="admin-field">Uzmanlık Alanı<input value={current.specialty} onChange={e => update('specialty', e.target.value)} placeholder="Crossfit, Pilates..." /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Deneyim Açıklaması<textarea rows={3} value={current.experience} onChange={e => update('experience', e.target.value)} placeholder="Yıllık deneyim ve uzmanlık detayı..." /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Fotoğraf URL<input value={current.image} onChange={e => update('image', e.target.value)} placeholder="https://..." /></label>
          </div>
          <Toggle checked={current.featured} onChange={v => update('featured', v)} label="Ana sayfada göster" />
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <article className="coach-card preview-coach-card">
          <div className="coach-card-media">{current.image ? <img src={current.image} alt={current.name} /> : <div className="preview-empty">Fotoğraf ekleyin</div>}</div>
          <div className="coach-card-body">
            <strong>{current.name}</strong>
            <span className="coach-card-specialty">{current.specialty}</span>
            <p>{current.experience || 'Deneyim açıklaması...'}</p>
          </div>
        </article>
      </aside>
    </div>
  );
}

export function AboutEditor({ data, onChange }) {
  const about = normalizeAbout(data || defaultAbout);

  const patch = next => onChange({ ...about, ...next });

  const updateParagraph = (index, value) => {
    const paragraphs = [...about.paragraphs];
    paragraphs[index] = value;
    patch({ paragraphs });
  };

  const updateHighlight = (index, key, value) => {
    const highlights = about.highlights.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    patch({ highlights });
  };

  return (
    <div className="admin-editor-main">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-page-title">Hakkımızda</h2>
          <p className="admin-page-sub">Hakkımızda sayfası metinleri ve görselleri.</p>
        </div>
      </div>
      <div className="admin-form-card">
        <div className="admin-form-grid">
          <label className="admin-field">Başlık<input value={about.title} onChange={e => patch({ title: e.target.value })} /></label>
          <label className="admin-field">Alt Başlık<input value={about.subtitle} onChange={e => patch({ subtitle: e.target.value })} /></label>
          <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Kapak Görseli URL<input value={about.heroImage} onChange={e => patch({ heroImage: e.target.value })} /></label>
        </div>
      </div>
      <div className="admin-form-card">
        <h4>Paragraflar</h4>
        {about.paragraphs.map((paragraph, index) => (
          <div key={`p-${index}`} className="admin-feature-row" style={{ gridTemplateColumns: '1fr auto', marginBottom: 10 }}>
            <textarea rows={2} value={paragraph} onChange={e => updateParagraph(index, e.target.value)} />
            <button type="button" className="admin-feature-remove" onClick={() => patch({ paragraphs: about.paragraphs.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" className="admin-mini-btn" onClick={() => patch({ paragraphs: [...about.paragraphs, 'Yeni paragraf'] })}><Plus size={14} /> Paragraf Ekle</button>
      </div>
      <div className="admin-form-card">
        <h4>Öne Çıkan Maddeler</h4>
        {about.highlights.map((item, index) => (
          <div key={`h-${index}`} className="admin-form-grid" style={{ marginBottom: 12 }}>
            <label className="admin-field">Başlık<input value={item.title} onChange={e => updateHighlight(index, 'title', e.target.value)} /></label>
            <label className="admin-field">Açıklama<input value={item.text} onChange={e => updateHighlight(index, 'text', e.target.value)} /></label>
            <button type="button" className="admin-mini-btn danger" onClick={() => patch({ highlights: about.highlights.filter((_, i) => i !== index) })}><Trash2 size={14} /> Sil</button>
          </div>
        ))}
        <button type="button" className="admin-mini-btn" onClick={() => patch({ highlights: [...about.highlights, { title: 'Yeni Madde', text: '' }] })}><Plus size={14} /> Madde Ekle</button>
      </div>
    </div>
  );
}

export function TestimonialsEditor({ items, onChange }) {
  const [active, setActive] = useState(0);
  const list = (items || []).map(normalizeTestimonial);
  const current = list[active] || normalizeTestimonial({});

  const update = (key, value) => {
    const next = clone(list);
    next[active] = { ...next[active], [key]: value };
    onChange(next);
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Müşteri Yorumları</h2>
            <p className="admin-page-sub">Ana sayfa alt bölümünde görünen üye yorumları.</p>
          </div>
          <button type="button" className="admin-mini-btn primary" onClick={() => { onChange([...list, normalizeTestimonial({ name: 'Yeni Üye' })]); setActive(list.length); }}><Plus size={14} /> Ekle</button>
        </div>
        <div className="admin-chip-row">
          {list.map((item, index) => (
            <button key={`${item.id}-${index}`} type="button" className={`admin-chip ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}>{item.name}</button>
          ))}
        </div>
        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">İsim<input value={current.name} onChange={e => update('name', e.target.value)} /></label>
            <label className="admin-field">Ünvan / Paket<input value={current.role} onChange={e => update('role', e.target.value)} placeholder="Premium Üye · 6 ay" /></label>
            <label className="admin-field">Puan (1-5)<input type="number" min={1} max={5} value={current.rating} onChange={e => update('rating', Number(e.target.value))} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Yorum<textarea rows={3} value={current.text} onChange={e => update('text', e.target.value)} /></label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Fotoğraf URL (opsiyonel)<input value={current.image} onChange={e => update('image', e.target.value)} placeholder="https://..." /></label>
          </div>
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <article className="testimonial-card preview-testimonial-card">
          <div className="testimonial-stars">{'★'.repeat(current.rating)}{'☆'.repeat(5 - current.rating)}</div>
          <p>{current.text || 'Yorum metni...'}</p>
          <div className="testimonial-author">
            <span className="testimonial-avatar">{current.name.charAt(0)}</span>
            <div><strong>{current.name}</strong><span>{current.role}</span></div>
          </div>
        </article>
      </aside>
    </div>
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
