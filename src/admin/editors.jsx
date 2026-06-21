import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Star, Trash2, Video, Image as ImageIcon, UserCog, Download, Upload, Archive, RotateCcw } from 'lucide-react';
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  getGalleryVideoSource,
  parseVideoUrl,
  normalizeAbout,
  normalizeGalleryItem,
  normalizePackage,
  normalizePackageFeature,
  normalizeService,
  normalizeAnnouncement,
  normalizeStat,
  normalizeStats,
  normalizeHomeCards,
  normalizeBannerSlide,
  normalizeBannerSlides,
  normalizeTestimonial,
  normalizeCeo,
  getTestimonialStarTypes,
  normalizeTrainer,
  packageCardVars,
  serviceCardVars,
  STAT_ICON_OPTIONS
} from '../../shared/media.js';
import { defaultContent, defaultGalleryCategories, defaultAbout, defaultBannerSlides } from '../../shared/defaults.js';
import {
  SITE_BACKUP_EXTENSION,
  MAX_STORED_SITE_BACKUPS,
  buildSiteBackupFilename,
  createSiteBackupEnvelope,
  parseSiteBackupPayload,
  summarizeSiteBackup
} from '../../shared/site-backup.js';
import { api } from '../api';

function isVideoCategory(category) {
  return String(category || '').toLowerCase().includes('video');
}

const GALLERY_IMAGE_ACCEPT = 'image/*,.heic,.heif,.webp,.png,.jpg,.jpeg,.gif,.bmp,.avif,.tif,.tiff';

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

function MediaUploadField({ label, value, onChange, accept = 'image/*', hint = 'URL yapıştırın veya dosya yükleyin' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await api.upload(file);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const isImage = value && !/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(value);

  return (
    <div className="admin-field admin-media-upload" style={{ gridColumn: '1 / -1' }}>
      <span>{label}</span>
      <div className="admin-media-upload-row">
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={hint} />
        <label className="admin-upload-btn">
          {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
          <input type="file" accept={accept} onChange={handleFile} hidden disabled={uploading} />
        </label>
      </div>
      {isImage ? <img src={value} alt="" className="admin-upload-preview" /> : null}
      {error ? <span className="admin-hint admin-upload-error">{error}</span> : null}
    </div>
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
  const items = (features || []).map((feature, index) => normalizePackageFeature(feature, index)).filter(Boolean);

  const updateFeature = (index, patch) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const addFeature = () => onChange([...items, { id: `feature-${Date.now()}`, text: 'Yeni madde', included: true }]);

  const removeFeature = index => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="admin-feature-list">
      <span className="admin-feature-list-label">Özellik maddeleri (✓ dahil / ✗ hariç)</span>
      {items.map((feature, index) => (
        <div key={feature.id || `feature-row-${index}`} className="admin-feature-row">
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
            <MediaUploadField label="Görsel" value={current.image} onChange={v => update('image', v)} accept="image/*" />
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
  const GALLERY_CATEGORY_LIMIT = 10;
  const cats = categories?.length ? categories : defaultGalleryCategories;
  const list = (items || []).map((item, index) => normalizeGalleryItem(item, index));
  const [activeId, setActiveId] = useState(list[0]?.id || null);
  const activeIndex = Math.max(0, list.findIndex(item => item.id === activeId));
  const current = list[activeIndex] || normalizeGalleryItem({ category: cats[0] });

  const itemsByCategory = useMemo(() => {
    const grouped = {};
    cats.forEach(cat => {
      grouped[cat] = [];
    });
    list.forEach(item => {
      const key = item.category || cats[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [list, cats]);

  const update = (key, value) => {
    const next = clone(list);
    next[activeIndex] = { ...next[activeIndex], [key]: value };
    if (key === 'videoUrl' && next[activeIndex].type === 'video') {
      const parsed = parseVideoUrl(value);
      next[activeIndex].image = next[activeIndex].image || parsed?.thumbnail || '';
    }
    if (key === 'type' && value === 'video' && next[activeIndex].videoUrl) {
      next[activeIndex].image = next[activeIndex].image || getYoutubeThumbnail(next[activeIndex].videoUrl);
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

  const addVideoToCategory = category => {
    const count = itemsByCategory[category]?.length || 0;
    if (count >= GALLERY_CATEGORY_LIMIT) {
      window.alert(`"${category}" bölümüne en fazla ${GALLERY_CATEGORY_LIMIT} içerik eklenebilir.`);
      return;
    }

    const videoUrl = window.prompt(
      'Video bağlantısı yapıştırın:\n\n• YouTube: https://youtube.com/watch?v=...\n• YouTube kısa: https://youtu.be/...\n• Vimeo: https://vimeo.com/123456789\n• Doğrudan video: https://.../video.mp4'
    );
    if (!videoUrl?.trim()) return;

    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) {
      window.alert('Geçerli bir video bağlantısı girin (YouTube, Vimeo veya .mp4/.webm).');
      return;
    }

    const defaultTitle = parsed.kind === 'youtube' ? 'YouTube Video' : parsed.kind === 'vimeo' ? 'Vimeo Video' : 'Video';
    const title = window.prompt('Video başlığı', defaultTitle)?.trim() || defaultTitle;

    const nextItem = normalizeGalleryItem(
      {
        id: `g-${Date.now()}`,
        title,
        category,
        type: 'video',
        videoUrl: videoUrl.trim(),
        image: parsed.thumbnail || '',
        featured: false
      },
      list.length
    );

    onChange([...list, nextItem]);
    setActiveId(nextItem.id);
  };

  const removeItem = id => {
    if (!window.confirm('Bu içerik silinsin mi?')) return;
    const next = list.filter(item => item.id !== id);
    onChange(next);
    if (activeId === id) setActiveId(next[0]?.id || null);
  };

  const uploadCategoryImages = async (category, event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const existing = itemsByCategory[category]?.length || 0;
    const remaining = GALLERY_CATEGORY_LIMIT - existing;
    if (remaining <= 0) {
      window.alert(`"${category}" bölümüne en fazla ${GALLERY_CATEGORY_LIMIT} içerik eklenebilir.`);
      return;
    }

    const selected = files.slice(0, remaining);
    if (files.length > remaining) {
      window.alert(`En fazla ${remaining} görsel daha eklenebilir. İlk ${remaining} dosya yüklenecek.`);
    }

    const uploaded = [];
    try {
      for (const [index, file] of selected.entries()) {
        const result = await api.upload(file);
        const title = file.name.replace(/\.[^.]+$/, '') || `Görsel ${existing + index + 1}`;
        uploaded.push(
          normalizeGalleryItem(
            {
              id: `g-${Date.now()}-${index}`,
              title,
              category,
              type: 'image',
              image: result.url,
              featured: false
            },
            list.length + index
          )
        );
      }
      onChange([...list, ...uploaded]);
      if (uploaded[0]) setActiveId(uploaded[0].id);
    } catch (uploadError) {
      window.alert(uploadError.message || 'Görseller yüklenemedi');
    }
  };

  const removeCurrent = () => {
    if (!current?.id) return;
    removeItem(current.id);
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Galeri</h2>
            <p className="admin-page-sub">Görseller tüm cihazlarda görünür (JPG, PNG, HEIC vb.). Videolar bağlantı ile eklenir.</p>
          </div>
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

        {cats.map(category => {
          const categoryItems = itemsByCategory[category] || [];
          const remaining = GALLERY_CATEGORY_LIMIT - categoryItems.length;
          const videoSection = isVideoCategory(category);
          return (
            <section key={category} className="admin-gallery-category-block">
              <div className="admin-gallery-category-head">
                <div>
                  <h4>{category}</h4>
                  <p className="admin-page-sub">
                    {categoryItems.length}/{GALLERY_CATEGORY_LIMIT} içerik
                    {videoSection ? ' · YouTube / Vimeo / video URL' : ' · Görsel yükleme'}
                  </p>
                </div>
                <div className="admin-gallery-category-actions">
                  {!videoSection ? (
                    <label className={`admin-mini-btn ${remaining <= 0 ? 'is-disabled' : ''}`}>
                      <ImageIcon size={14} /> Görsel Ekle
                      <input
                        type="file"
                        accept={GALLERY_IMAGE_ACCEPT}
                        multiple
                        hidden
                        disabled={remaining <= 0}
                        onChange={event => uploadCategoryImages(category, event)}
                      />
                    </label>
                  ) : (
                    <button
                      type="button"
                      className="admin-mini-btn primary"
                      disabled={remaining <= 0}
                      onClick={() => addVideoToCategory(category)}
                    >
                      <Video size={14} /> Video Ekle
                    </button>
                  )}
                </div>
              </div>

              {categoryItems.length ? (
                <div className="admin-gallery-category-grid">
                  {categoryItems.map(item => {
                    const thumb = item.type === 'video' ? item.image || getYoutubeThumbnail(item.videoUrl) : item.image;
                    return (
                      <div
                        key={item.id}
                        className={`admin-gallery-thumb-card ${activeId === item.id ? 'active' : ''}`}
                        onClick={() => setActiveId(item.id)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveId(item.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="admin-gallery-thumb-media">
                          {thumb ? <img src={thumb} alt={item.title} /> : <span className="preview-empty">Medya yok</span>}
                          {item.type === 'video' ? <span className="admin-gallery-thumb-badge">▶</span> : null}
                          <button
                            type="button"
                            className="admin-gallery-thumb-remove"
                            aria-label={`${item.title} sil`}
                            onClick={event => {
                              event.stopPropagation();
                              removeItem(item.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <span className="admin-gallery-thumb-title">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="admin-hint">
                  {videoSection
                    ? 'Video Ekle ile YouTube, Vimeo veya doğrudan video bağlantısı ekleyin.'
                    : 'Görsel Ekle ile birden fazla fotoğraf seçip yükleyebilirsiniz.'}
                </p>
              )}
            </section>
          );
        })}

        {activeId ? (
          <div className="admin-form-card">
            <h4>Seçili İçerik</h4>
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
                  <option value="video">Video / YouTube</option>
                </select>
              </label>
              {current.type === 'image' ? (
                <MediaUploadField label="Görsel" value={current.image} onChange={v => update('image', v)} accept={GALLERY_IMAGE_ACCEPT} />
              ) : (
                <>
                  <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
                    Video URL
                    <input
                      value={current.videoUrl}
                      onChange={e => update('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/... veya .mp4 bağlantısı"
                    />
                  </label>
                  <p className="admin-hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
                    YouTube, Vimeo veya doğrudan video bağlantısı desteklenir. Cihazdan video yüklemesi yapılmaz.
                  </p>
                  <MediaUploadField label="Kapak Görseli (opsiyonel)" value={current.image} onChange={v => update('image', v)} accept={GALLERY_IMAGE_ACCEPT} />
                </>
              )}
            </div>
            <Toggle checked={current.featured} onChange={v => update('featured', v)} label="Ana sayfada öne çıkar" />
            <button type="button" className="admin-mini-btn danger" onClick={removeCurrent}><Trash2 size={14} /> Sil</button>
          </div>
        ) : null}
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <GalleryPreviewCard item={current} />
        {current.type === 'video' && current.videoUrl ? (
          <div className="preview-video-frame">
            {(() => {
              const source = getGalleryVideoSource(current.videoUrl);
              if (!source) return null;
              if (source.kind === 'file') {
                return <video src={source.src} controls className="media-lightbox-video" />;
              }
              return <iframe src={source.src} title={current.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />;
            })()}
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

export function BannerEditor({ content, onChange }) {
  const data = content || defaultContent;
  const slides = normalizeBannerSlides(
    Array.isArray(data.bannerSlides) && data.bannerSlides.length ? data.bannerSlides : defaultBannerSlides
  );
  const [active, setActive] = useState(0);
  const current = slides[active] || normalizeBannerSlide({});

  const patchSlides = next => onChange({ ...data, bannerSlides: next });
  const update = (key, value) => {
    const next = clone(slides);
    next[active] = { ...next[active], [key]: value };
    patchSlides(next);
  };

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <div className="admin-toolbar">
          <div>
            <h2 className="admin-page-title">Ana Sayfa Banner</h2>
            <p className="admin-page-sub">Hero alanındaki kaydırmalı banner görselleri ve metinleri.</p>
          </div>
          <button
            type="button"
            className="admin-mini-btn primary"
            onClick={() => {
              patchSlides([...slides, normalizeBannerSlide({ title: 'Yeni Banner' }, slides.length)]);
              setActive(slides.length);
            }}
          >
            <Plus size={14} /> Ekle
          </button>
        </div>

        <div className="admin-chip-row">
          {slides.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              type="button"
              className={`admin-chip ${active === index ? 'active' : ''}`}
              onClick={() => setActive(index)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="admin-form-card">
          <div className="admin-form-grid">
            <label className="admin-field">Başlık<input value={current.title} onChange={e => update('title', e.target.value)} /></label>
            <label className="admin-field">Alt Başlık<input value={current.subtitle} onChange={e => update('subtitle', e.target.value)} /></label>
            <MediaUploadField label="Banner Görseli" value={current.image} onChange={v => update('image', v)} accept="image/*" />
          </div>
          <button
            type="button"
            className="admin-mini-btn danger"
            onClick={() => {
              const next = slides.filter((_, i) => i !== active);
              patchSlides(next.length ? next : [normalizeBannerSlide({ title: 'Yeni Banner' })]);
              setActive(0);
            }}
          >
            <Trash2 size={14} /> Sil
          </button>
        </div>
      </div>

      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <div className="preview-banner-card">
          {current.image ? <img src={current.image} alt={current.title} /> : <div className="preview-empty">Görsel yok</div>}
          <div className="preview-banner-copy">
            <strong>{current.title || 'Banner başlığı'}</strong>
            <p>{current.subtitle || 'Alt başlık'}</p>
          </div>
        </div>
      </aside>
    </div>
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
            <MediaUploadField label="Fotoğraf" value={current.image} onChange={v => update('image', v)} accept="image/*" />
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
          <MediaUploadField label="Kapak Görseli" value={about.heroImage} onChange={v => patch({ heroImage: v })} accept="image/*" />
        </div>
      </div>
      <div className="admin-form-card">
        <h4>Paragraflar</h4>
        {about.paragraphs.map((paragraph, index) => (
          <div key={`p-${index}`} className="admin-feature-row admin-text-row">
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
            <label className="admin-field">
              Puan
              <select value={current.rating} onChange={e => update('rating', Number(e.target.value))}>
                <option value={5}>5 yıldız</option>
                <option value={4.5}>4.5 yıldız</option>
                <option value={4}>4 yıldız</option>
                <option value={3.5}>3.5 yıldız</option>
                <option value={3}>3 yıldız</option>
              </select>
            </label>
            <label className="admin-field" style={{ gridColumn: '1 / -1' }}>Yorum<textarea rows={3} value={current.text} onChange={e => update('text', e.target.value)} /></label>
            <MediaUploadField label="Fotoğraf" value={current.image} onChange={v => update('image', v)} accept="image/*" />
          </div>
          <button type="button" className="admin-mini-btn danger" onClick={() => { onChange(list.filter((_, i) => i !== active)); setActive(0); }}><Trash2 size={14} /> Sil</button>
        </div>
      </div>
      <aside className="admin-editor-preview">
        <div className="admin-preview-head"><Eye size={16} /> Canlı Önizleme</div>
        <article className="testimonial-card preview-testimonial-card">
          <div className="testimonial-stars testimonial-stars-gold">
            {getTestimonialStarTypes(current.rating).map((type, index) => (
              <span key={index} className={`testimonial-star testimonial-star-${type}`}>★</span>
            ))}
          </div>
          <p>{current.text || 'Yorum metni...'}</p>
          <div className="testimonial-author">
            {current.image ? (
              <img src={current.image} alt={current.name} className="testimonial-photo" />
            ) : (
              <span className="testimonial-avatar">{current.name.charAt(0)}</span>
            )}
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

export function AccountEditor({ user, onUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || ''
    }));
  }, [user]);

  const handleSubmit = async event => {
    event.preventDefault();
    setMessage('');
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage('Yeni şifreler eşleşmiyor.');
      return;
    }
    setPending(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim() || null
      };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const result = await api.updateProfile(payload);
      onUpdated?.({ ...result.user, passwordPlain: form.newPassword || user?.passwordPlain });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage('Hesap bilgileri güncellendi.');
    } catch (error) {
      setMessage(error.message || 'Güncelleme başarısız');
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <h2 className="admin-page-title">Hesabım</h2>
      <p className="admin-page-sub">Ad, e-posta, kullanıcı adı ve şifrenizi güncelleyin.</p>
      {user?.passwordPlain ? (
        <p className="admin-hint">Mevcut şifreniz: <code>{user.passwordPlain}</code></p>
      ) : null}
      <form className="admin-form-card" onSubmit={handleSubmit}>
        <div className="admin-form-grid single">
          <label className="admin-field">
            Ad Soyad
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </label>
          <label className="admin-field">
            E-posta
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </label>
          <label className="admin-field">
            Kullanıcı Adı
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Giriş için kullanılır" />
          </label>
        </div>
        <h4 style={{ marginTop: 20 }}>Şifre Değiştir</h4>
        <p className="admin-hint">Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.</p>
        <div className="admin-form-grid single">
          <label className="admin-field">
            Mevcut Şifre
            <input type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} />
          </label>
          <label className="admin-field">
            Yeni Şifre
            <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} />
          </label>
          <label className="admin-field">
            Yeni Şifre (Tekrar)
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          </label>
        </div>
        {message ? <p className="admin-hint">{message}</p> : null}
        <button className="admin-save-btn" type="submit" disabled={pending} style={{ marginTop: 16 }}>
          {pending ? 'Kaydediliyor...' : 'Hesabı Güncelle'}
        </button>
      </form>
    </>
  );
}

export function UsersEditor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'MODERATOR'
  });
  const [editId, setEditId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', password: '', role: 'MODERATOR' });

  const loadUsers = () => {
    setLoading(true);
    api.staffUsers()
      .then(result => setUsers(result.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async event => {
    event.preventDefault();
    setMessage('');
    try {
      await api.createStaffUser({
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim() || null,
        password: form.password,
        role: form.role
      });
      setForm({ name: '', email: '', username: '', password: '', role: 'MODERATOR' });
      setMessage('Kullanıcı oluşturuldu.');
      loadUsers();
    } catch (error) {
      setMessage(error.message || 'Oluşturma başarısız');
    }
  };

  const startEdit = user => {
    setEditId(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      password: user.passwordPlain || '',
      role: user.role || 'MODERATOR'
    });
  };

  const handleUpdate = async event => {
    event.preventDefault();
    if (!editId) return;
    setMessage('');
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        username: editForm.username.trim() || null,
        role: editForm.role,
        password: editForm.password
      };
      await api.updateStaffUser(editId, payload);
      setEditId('');
      setMessage('Kullanıcı güncellendi.');
      loadUsers();
    } catch (error) {
      setMessage(error.message || 'Güncelleme başarısız');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bu kullanıcı silinsin mi?')) return;
    setMessage('');
    try {
      await api.deleteStaffUser(id);
      setMessage('Kullanıcı silindi.');
      loadUsers();
    } catch (error) {
      setMessage(error.message || 'Silme başarısız');
    }
  };

  return (
    <>
      <h2 className="admin-page-title">Kullanıcı Yönetimi</h2>
      <p className="admin-page-sub">Sadece admin yeni moderatör veya admin hesabı oluşturabilir. Moderatörler site içeriğini düzenler, kullanıcı yönetimine erişemez.</p>
      {message ? <p className="admin-hint">{message}</p> : null}

      <div className="admin-form-card">
        <h4>Yeni Moderatör / Admin</h4>
        <form onSubmit={handleCreate}>
          <div className="admin-form-grid">
            <label className="admin-field">Ad Soyad<input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></label>
            <label className="admin-field">E-posta<input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></label>
            <label className="admin-field">Kullanıcı Adı<input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></label>
            <label className="admin-field">Şifre<input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></label>
            <label className="admin-field">
              Yetki
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="MODERATOR">Moderatör</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </div>
          <button className="admin-save-btn" type="submit" style={{ marginTop: 12 }}><Plus size={16} />Moderatör Ekle</button>
        </form>
      </div>

      <div className="admin-form-card">
        <h4>Mevcut Kullanıcılar</h4>
        {loading ? <p className="admin-hint">Yükleniyor...</p> : null}
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>E-posta</th>
                <th>Kullanıcı Adı</th>
                <th>Şifre</th>
                <th>Yetki</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username || '—'}</td>
                  <td><code>{user.passwordPlain || '—'}</code></td>
                  <td>{user.role === 'ADMIN' ? 'Admin' : 'Moderatör'}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button type="button" className="admin-icon-btn" onClick={() => startEdit(user)} aria-label="Düzenle"><UserCog size={14} /></button>
                      <button type="button" className="admin-icon-btn" onClick={() => handleDelete(user.id)} aria-label="Sil"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !users.length ? <p className="admin-hint">Henüz kullanıcı yok.</p> : null}
        </div>
      </div>

      {editId ? (
        <div className="admin-form-card">
          <h4>Kullanıcıyı Düzenle</h4>
          <form onSubmit={handleUpdate}>
            <div className="admin-form-grid">
              <label className="admin-field">Ad Soyad<input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></label>
              <label className="admin-field">E-posta<input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} required /></label>
              <label className="admin-field">Kullanıcı Adı<input value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} /></label>
              <label className="admin-field">Şifre<input type="text" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} /></label>
              <label className="admin-field">
                Yetki
                <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="MODERATOR">Moderatör</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="admin-save-btn" type="submit">Kaydet</button>
              <button className="admin-icon-btn" type="button" onClick={() => setEditId('')}>İptal</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export function CeoEditor({ content, onChange }) {
  const data = content || defaultContent;
  const ceo = normalizeCeo(data.ceo, defaultContent.ceo);
  const patch = next => onChange({ ...data, ceo: { ...ceo, ...next } });

  return (
    <>
      <h2 className="admin-page-title">CEO Bilgileri</h2>
      <p className="admin-page-sub">Hamburger menünün en altında görünen CEO fotoğrafı, unvan ve isim.</p>

      <div className="admin-form-card">
        <Toggle checked={ceo.visible} onChange={v => patch({ visible: v })} label="Hamburger menüde göster" />
        <div className="admin-form-grid single">
          <label className="admin-field">
            Unvan / Başlık
            <input
              value={ceo.title}
              placeholder="Kurucu & CEO"
              onChange={e => patch({ title: e.target.value })}
            />
          </label>
          <label className="admin-field">
            İsim
            <input
              value={ceo.name}
              placeholder="Ad Soyad"
              onChange={e => patch({ name: e.target.value })}
            />
          </label>
          <MediaUploadField
            label="CEO Fotoğrafı"
            value={ceo.image}
            onChange={v => patch({ image: v })}
            hint="Kare veya dikey portre önerilir"
          />
        </div>
      </div>
    </>
  );
}

function formatBackupDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

function downloadBackupBlob(envelope, filename) {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function BackupEditor({ onRestored, onMessage }) {
  const [backups, setBackups] = useState([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState('');

  const refreshBackups = async () => {
    const result = await api.listSiteBackups();
    setBackups(result.backups || []);
  };

  useEffect(() => {
    refreshBackups().catch(() => setBackups([]));
  }, []);

  const handleTakeBackup = async () => {
    setPendingAction('take');
    setLoading(true);
    try {
      const result = await api.saveSiteBackup(label.trim() || 'Manuel yedek');
      setBackups(result.backups || []);
      onMessage?.('Yedek sunucuya kaydedildi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek alınamadı');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  const handleDownload = async () => {
    setPendingAction('download');
    setLoading(true);
    try {
      const envelope = await api.exportSiteBackup();
      downloadBackupBlob(envelope, buildSiteBackupFilename('peakspor-yedek'));
      onMessage?.('Yedek bilgisayarınıza indirildi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek indirilemedi');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPendingAction('upload');
    setLoading(true);
    try {
      const text = await file.text();
      const parsed = parseSiteBackupPayload(text);
      const summary = summarizeSiteBackup(parsed.data, parsed.files);
      const ok = window.confirm(
        `${file.name} dosyası yüklensin mi?\n\nBölüm: ${summary.sections}\nGörsel/Dosya: ${summary.mediaFiles}\nGaleri: ${summary.galleryItems}\nHizmet: ${summary.services}\nPaket: ${summary.packages}\nDuyuru: ${summary.announcements}\nHoca: ${summary.trainers}\nYetkili: ${summary.staffUsers}\n\nMevcut site içeriğinin üzerine yazılır.`
      );
      if (!ok) return;

      const payload = parsed.envelope || { format: 'peakspor-site-backup', data: parsed.data, files: parsed.files || {} };
      const result = await api.restoreSiteBackup({ payload });
      setBackups(result.backups || []);
      await onRestored?.();
      onMessage?.('Yedek başarıyla yüklendi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek yüklenemedi');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  const handleRestoreStored = async item => {
    const ok = window.confirm(`${item.filename} yedeği geri yüklensin mi?\n\nMevcut site içeriğinin üzerine yazılır.`);
    if (!ok) return;

    setPendingAction(`restore-${item.id}`);
    setLoading(true);
    try {
      const result = await api.restoreSiteBackup({ filename: item.filename });
      setBackups(result.backups || []);
      await onRestored?.();
      onMessage?.('Sunucu yedeği geri yüklendi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek geri yüklenemedi');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  const handleDownloadStored = async item => {
    setPendingAction(`download-${item.id}`);
    setLoading(true);
    try {
      const blob = await api.downloadSiteBackup(item.filename);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.filename.endsWith(SITE_BACKUP_EXTENSION) ? item.filename : `${item.filename}${SITE_BACKUP_EXTENSION}`;
      link.click();
      URL.revokeObjectURL(url);
      onMessage?.('Yedek indirildi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek indirilemedi');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  const handleDeleteStored = async item => {
    const ok = window.confirm(`${item.filename} yedeği silinsin mi?`);
    if (!ok) return;

    setPendingAction(`delete-${item.id}`);
    setLoading(true);
    try {
      const result = await api.deleteSiteBackup(item.filename);
      setBackups(result.backups || []);
      onMessage?.('Yedek silindi.');
    } catch (error) {
      onMessage?.(error.message || 'Yedek silinemedi');
    } finally {
      setLoading(false);
      setPendingAction('');
    }
  };

  return (
    <>
      <h2 className="admin-page-title">Yedekleme</h2>
      <p className="admin-page-sub">
        Tam yedek; tüm sayfalar, yazılar, duyurular, kartlar, galeri, yüklenen görseller ve yetkili kullanıcıları `{SITE_BACKUP_EXTENSION}` dosyasında saklar. Sunucuda en son {MAX_STORED_SITE_BACKUPS} yedek tutulur.
      </p>

      <div className="admin-form-card">
        <h4>Yedekleme İşlemleri</h4>
        <p className="admin-hint">
          Yedek Al veya İndir ile görseller dahil tam site yedeği oluşur. Bilgisayardan Yükle ile geri yükleyebilirsiniz.
        </p>
        <label className="admin-field">
          Yedek Notu (isteğe bağlı)
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Örn: Kampanya öncesi yedek" />
        </label>
        <div className="admin-backup-actions">
          <button className="admin-save-btn" type="button" onClick={handleTakeBackup} disabled={loading}>
            <Archive size={16} />
            {pendingAction === 'take' ? 'Kaydediliyor...' : 'Yedek Al'}
          </button>
          <button className="admin-save-btn" type="button" onClick={handleDownload} disabled={loading}>
            <Download size={16} />
            {pendingAction === 'download' ? 'Hazırlanıyor...' : 'İndir'}
          </button>
          <label className="admin-upload-btn admin-backup-upload-btn">
            <Upload size={16} />
            {pendingAction === 'upload' ? 'Yükleniyor...' : 'Bilgisayardan Yükle'}
            <input
              type="file"
              accept={`.peakspor,.json,application/json,${SITE_BACKUP_EXTENSION}`}
              onChange={handleUpload}
              hidden
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <div className="admin-form-card">
        <div className="admin-gallery-category-head">
          <h4>Sunucu Yedekleri (son {MAX_STORED_SITE_BACKUPS})</h4>
          <button className="admin-mini-btn" type="button" onClick={() => refreshBackups()} disabled={loading}>
            Yenile
          </button>
        </div>
        {backups.length ? (
          <div className="admin-backup-list">
            {backups.map(item => (
              <div key={item.id} className="admin-backup-item">
                <div className="admin-backup-item-main">
                  <strong>{item.label || item.filename}</strong>
                  <span>{formatBackupDate(item.createdAt)}</span>
                  <span className="admin-backup-meta">
                    {item.kind === 'auto' ? 'Otomatik' : 'Manuel'} · {item.sections} bölüm · {item.mediaFiles || 0} dosya · {(item.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="admin-backup-item-actions">
                  <button
                    className="admin-mini-btn"
                    type="button"
                    onClick={() => handleDownloadStored(item)}
                    disabled={loading}
                  >
                    <Download size={14} /> İndir
                  </button>
                  <button
                    className="admin-mini-btn"
                    type="button"
                    onClick={() => handleRestoreStored(item)}
                    disabled={loading}
                  >
                    <RotateCcw size={14} />
                    {pendingAction === `restore-${item.id}` ? '...' : 'Geri Yükle'}
                  </button>
                  <button
                    className="admin-mini-btn admin-mini-btn-danger"
                    type="button"
                    onClick={() => handleDeleteStored(item)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                    {pendingAction === `delete-${item.id}` ? '...' : 'Sil'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-hint">Henüz sunucu yedeği yok. Yedek Al butonuna basın; en fazla {MAX_STORED_SITE_BACKUPS} yedek tutulur, eskiler otomatik silinir.</p>
        )}
      </div>
    </>
  );
}
