export function resolveMediaUrl(url) {
  let value = String(url || '').trim().replace(/\\/g, '/');
  if (!value) return '';
  if (value.startsWith('blob:') || value.startsWith('file:')) return '';
  if (/^data:image\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (!value.startsWith('/') && value.startsWith('uploads/')) value = `/${value}`;
  if (value.startsWith('/')) {
    if (/\/uploads\/[^?#]+\.(heic|heif)(\?.*)?$/i.test(value)) {
      value = value.replace(/\.(heic|heif)(\?.*)?$/i, '.jpg$2');
    }
    return encodeURI(value);
  }
  return encodeURI(value);
}

export function isDirectMediaVideoUrl(url) {
  const value = String(url || '');
  return value.startsWith('/uploads/') || /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(value);
}

export function parseVideoUrl(url) {
  const value = String(url || '').trim();
  if (!value) return null;

  const youtubeMatch = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i
  );
  if (youtubeMatch) {
    const id = youtubeMatch[1];
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  const vimeoMatch = value.match(/vimeo\.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/|video\/)?(\d+)/i);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${id}`,
      thumbnail: ''
    };
  }

  const resolved = resolveMediaUrl(value);
  if (
    isDirectMediaVideoUrl(resolved) ||
    /^https?:\/\/.+\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(resolved)
  ) {
    return { kind: 'file', src: resolved, thumbnail: '' };
  }

  if (/youtube\.com\/embed\//i.test(value)) {
    const id = value.split('/embed/')[1]?.split(/[?&]/)[0];
    return {
      kind: 'youtube',
      src: value.startsWith('http') ? value : `https:${value}`,
      thumbnail: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
    };
  }

  return null;
}

export function getYoutubeEmbedUrl(url) {
  const parsed = parseVideoUrl(url);
  if (parsed && (parsed.kind === 'youtube' || parsed.kind === 'vimeo')) return parsed.src;
  return String(url || '');
}

export function getYoutubeThumbnail(url) {
  const parsed = parseVideoUrl(url);
  return parsed?.thumbnail || '';
}

export function normalizeAnnouncement(item = {}, index = 0) {
  if (typeof item === 'string') {
    return { id: `announcement-${index}`, message: item, color: '', weight: '600' };
  }
  return {
    id: item.id || `announcement-${index}`,
    message: item.message || '',
    color: item.color || '',
    weight: item.weight || '600'
  };
}

export function normalizeAnnouncements(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map((item, index) => normalizeAnnouncement(item, index));
}

export const STAT_ICON_OPTIONS = [
  { id: 'users', label: 'Üyeler' },
  { id: 'coach', label: 'Eğitmen' },
  { id: 'class', label: 'Ders' },
  { id: 'years', label: 'Deneyim' },
  { id: 'medal', label: 'Madalya' },
  { id: 'dumbbell', label: 'Fitness' },
  { id: 'video', label: 'Video' }
];

export function normalizeStat(item = {}, index = 0) {
  return {
    id: item.id || `stat-${index}`,
    label: item.label || 'Yeni Kart',
    value: item.value || '0',
    icon: item.icon || 'users',
    accentColor: item.accentColor || '',
    bgColor: item.bgColor || '',
    valueColor: item.valueColor || '',
    labelColor: item.labelColor || '',
    visible: item.visible !== false
  };
}

export function normalizeStats(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map((item, index) => normalizeStat(item, index));
}

export function getVisibleStats(items) {
  return normalizeStats(items).filter(item => item.visible);
}

export function normalizeHomeCards(cards = {}) {
  return {
    selectedService: {
      visible: cards.selectedService?.visible !== false,
      label: cards.selectedService?.label || 'Seçili Hizmet',
      buttonText: cards.selectedService?.buttonText || 'Paketleri Gör',
      accent: cards.selectedService?.accent || '',
      background: cards.selectedService?.background || '',
      text: cards.selectedService?.text || '',
      muted: cards.selectedService?.muted || ''
    },
    selectedPackage: {
      visible: cards.selectedPackage?.visible !== false,
      label: cards.selectedPackage?.label || 'Seçili Paket',
      accent: cards.selectedPackage?.accent || '',
      background: cards.selectedPackage?.background || '',
      text: cards.selectedPackage?.text || '',
      muted: cards.selectedPackage?.muted || '',
      showPrice: cards.selectedPackage?.showPrice !== false
    },
    heroFloating: {
      visible: cards.heroFloating?.visible !== false,
      statIndex: Number.isFinite(cards.heroFloating?.statIndex) ? cards.heroFloating.statIndex : 0
    }
  };
}

export function packageCardVars(pkg = {}) {
  const style = {};
  [
    ['--pkg-accent', pkg.accent],
    ['--pkg-price-color', pkg.priceColor],
    ['--pkg-text-color', pkg.textColor],
    ['--pkg-title-color', pkg.titleColor],
    ['--pkg-muted-color', pkg.mutedColor],
    ['--pkg-bg', pkg.bgColor],
    ['--pkg-border', pkg.borderColor]
  ].forEach(([key, value]) => {
    if (value) style[key] = value;
  });
  return Object.keys(style).length ? style : undefined;
}

export function serviceCardVars(service = {}) {
  const style = {};
  [
    ['--service-accent', service.accent],
    ['--service-title-color', service.titleColor],
    ['--service-text-color', service.textColor],
    ['--service-muted-color', service.mutedColor],
    ['--service-bg', service.bgColor],
    ['--service-border', service.borderColor]
  ].forEach(([key, value]) => {
    if (value) style[key] = value;
  });
  return Object.keys(style).length ? style : undefined;
}

export function normalizeService(item = {}) {
  return {
    title: item.title || 'Yeni Hizmet',
    category: item.category || 'Salon',
    description: item.description || '',
    image: resolveMediaUrl(item.image || ''),
    accent: item.accent || '',
    titleColor: item.titleColor || '',
    textColor: item.textColor || '',
    mutedColor: item.mutedColor || '',
    bgColor: item.bgColor || '',
    borderColor: item.borderColor || '',
    imageFit: item.imageFit === 'contain' ? 'contain' : 'cover',
    featured: Boolean(item.featured)
  };
}

export function normalizePackageFeature(feature, index = 0) {
  if (typeof feature === 'string') {
    const text = feature.trim();
    if (!text) return null;
    return { id: `feature-${index}`, text, included: true };
  }
  if (feature && typeof feature === 'object') {
    const text = String(feature.text || feature.label || '').trim();
    if (!text) return null;
    return {
      id: feature.id || `feature-${index}`,
      text,
      included: feature.included !== false
    };
  }
  return null;
}

export function normalizePackage(item = {}) {
  return {
    title: item.title || 'Yeni Paket',
    subtitle: item.subtitle || '',
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    discountLabel: item.discountLabel || '',
    period: item.period || '/ay',
    accent: item.accent || '',
    priceColor: item.priceColor || '',
    textColor: item.textColor || '',
    titleColor: item.titleColor || '',
    mutedColor: item.mutedColor || '',
    bgColor: item.bgColor || '',
    borderColor: item.borderColor || '',
    features: (Array.isArray(item.features) ? item.features : [])
      .map((feature, index) => normalizePackageFeature(feature, index))
      .filter(Boolean),
    cta: item.cta || 'Seç',
    featured: Boolean(item.featured)
  };
}

export function normalizeGalleryItem(item = {}, index = 0) {
  const type = item.type === 'video' || item.videoUrl ? 'video' : 'image';
  const videoUrl = item.videoUrl || '';
  return {
    id: item.id || `gallery-${index}-${item.title || 'item'}`,
    title: item.title || 'Yeni İçerik',
    category: item.category || 'Görseller',
    type,
    image: resolveMediaUrl(item.image || (type === 'video' ? getYoutubeThumbnail(videoUrl) : '')),
    videoUrl,
    featured: Boolean(item.featured)
  };
}

export function featuredOrAll(items, limit = 6) {
  const list = Array.isArray(items) ? items : [];
  const featured = list.filter(item => item.featured);
  const source = featured.length ? featured : list;
  return source.slice(0, limit);
}

export function normalizeTrainer(item = {}, index = 0) {
  const specialty = item.specialty || item.role || 'Fitness';
  let expertise = [];
  if (Array.isArray(item.expertise)) {
    expertise = item.expertise.filter(Boolean);
  } else if (typeof item.expertise === 'string' && item.expertise.trim()) {
    expertise = item.expertise.split(',').map(entry => entry.trim()).filter(Boolean);
  } else if (Array.isArray(item.expertiseAreas)) {
    expertise = item.expertiseAreas.filter(Boolean);
  }

  if (!expertise.length) {
    const pool = [
      specialty,
      'Personal Training',
      'Kilo Verme',
      'Yağ Yakımı',
      'Kas Gelişimi',
      'Fonksiyonel Antrenman',
      'Performans Artırımı'
    ];
    expertise = [...new Set(pool.map(entry => entry.trim()).filter(Boolean))].slice(0, 6);
  }

  return {
    id: item.id || `coach-${index}`,
    name: item.name || 'Yeni Hoca',
    specialty,
    experience: item.experience || item.description || item.about || '',
    image: resolveMediaUrl(item.image || ''),
    featured: item.featured !== false,
    instagram: item.instagram || '',
    email: item.email || '',
    expertise
  };
}

export function normalizeTrainers(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map((item, index) => normalizeTrainer(item, index));
}

export function normalizeAbout(item = {}) {
  const base = item && typeof item === 'object' ? item : {};
  return {
    title: base.title || 'Hakkımızda',
    subtitle: base.subtitle || '',
    heroImage: resolveMediaUrl(base.heroImage || ''),
    paragraphs: Array.isArray(base.paragraphs) ? base.paragraphs.filter(Boolean) : [],
    highlights: Array.isArray(base.highlights)
      ? base.highlights.map((h, i) => ({
          title: h?.title || `Madde ${i + 1}`,
          text: h?.text || ''
        }))
      : []
  };
}

export function normalizeBannerSlide(item = {}, index = 0) {
  return {
    id: item.id || `banner-${index}`,
    title: item.title || 'Yeni Banner',
    subtitle: item.subtitle || '',
    image: resolveMediaUrl(item.image || '')
  };
}

export function normalizeBannerSlides(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map((item, index) => normalizeBannerSlide(item, index));
}

export function normalizeTestimonial(item = {}, index = 0) {
  const rawRating = Number(item.rating);
  const rating = Number.isFinite(rawRating)
    ? Math.min(5, Math.max(0.5, Math.round(rawRating * 2) / 2))
    : 5;
  return {
    id: item.id || `review-${index}`,
    name: item.name || 'Üye',
    role: item.role || 'Üye',
    text: item.text || item.message || '',
    rating,
    image: resolveMediaUrl(item.image || '')
  };
}

export function getTestimonialStarTypes(rating) {
  const value = Math.min(5, Math.max(0, Number(rating) || 5));
  return Array.from({ length: 5 }, (_, index) => {
    const star = index + 1;
    if (value >= star) return 'full';
    if (value >= star - 0.5) return 'half';
    return 'empty';
  });
}

export function normalizeOnlineCounter(config = {}) {
  const min = Math.max(1, Number(config.min) || 10);
  const max = Math.max(min, Number(config.max) || 50);
  return {
    enabled: config.enabled !== false,
    min,
    max,
    label: config.label || 'kişi online',
    intervalMs: Math.max(2000, Number(config.intervalMs) || 3500)
  };
}

export function normalizeContact(config = {}, defaults = {}) {
  const address = config.address || defaults.address || '';
  const city = config.city || defaults.city || 'Kocaeli';
  const email = config.email || defaults.email || '';
  const mapQuery = config.mapQuery || [address, city, 'PEAKSPORTS CENTER'].filter(Boolean).join(', ');
  return { email, address, city, mapQuery };
}

export function normalizeFacilityArea(item = {}) {
  return {
    title: item.title || 'Alan',
    description: item.description || '',
    image: resolveMediaUrl(item.image || ''),
    video: item.video || null,
    tag: item.tag || 'Görsel'
  };
}

export function normalizeFacilityAreas(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map(item => normalizeFacilityArea(item));
}

export function buildMapEmbedUrl(query) {
  if (!query) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=tr&z=16&output=embed`;
}

export function buildMapSearchUrl(query) {
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGalleryVideoSource(url) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;
  if (parsed.kind === 'file') return { kind: 'file', src: parsed.src };
  return { kind: 'embed', src: parsed.src };
}

export function normalizeTestimonials(items) {
  const list = Array.isArray(items) && items.length ? items : [];
  return list.map((item, index) => normalizeTestimonial(item, index));
}

export function groupGalleryByCategory(items, categories) {
  const groups = {};
  (categories || []).forEach(cat => {
    groups[cat] = [];
  });
  (items || []).forEach(item => {
    const key = item.category || 'Diğer';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}
