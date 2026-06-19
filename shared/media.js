export function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const match = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?/]+)/i);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export function getYoutubeThumbnail(url) {
  const embed = getYoutubeEmbedUrl(url);
  const id = embed.split('/embed/')[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
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
    accentColor: item.accentColor || '#7CFF4F',
    bgColor: item.bgColor || '#111827',
    valueColor: item.valueColor || '#FFFFFF',
    labelColor: item.labelColor || '#9CA3AF',
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
      accent: cards.selectedService?.accent || '#7CFF4F',
      background: cards.selectedService?.background || '#111827',
      text: cards.selectedService?.text || '#FFFFFF',
      muted: cards.selectedService?.muted || '#9CA3AF'
    },
    selectedPackage: {
      visible: cards.selectedPackage?.visible !== false,
      label: cards.selectedPackage?.label || 'Seçili Paket',
      accent: cards.selectedPackage?.accent || '#7CFF4F',
      background: cards.selectedPackage?.background || '#111827',
      text: cards.selectedPackage?.text || '#FFFFFF',
      muted: cards.selectedPackage?.muted || '#9CA3AF',
      showPrice: cards.selectedPackage?.showPrice !== false
    },
    heroFloating: {
      visible: cards.heroFloating?.visible !== false,
      statIndex: Number.isFinite(cards.heroFloating?.statIndex) ? cards.heroFloating.statIndex : 0
    }
  };
}

export function normalizeService(item = {}) {
  return {
    title: item.title || 'Yeni Hizmet',
    category: item.category || 'Salon',
    description: item.description || '',
    image: item.image || '',
    accent: item.accent || '#7CFF4F',
    imageFit: item.imageFit === 'contain' ? 'contain' : 'cover',
    featured: Boolean(item.featured)
  };
}

export function normalizePackage(item = {}) {
  return {
    title: item.title || 'Yeni Paket',
    subtitle: item.subtitle || '',
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    discountLabel: item.discountLabel || '',
    period: item.period || '/ay',
    accent: item.accent || '#7CFF4F',
    features: Array.isArray(item.features) ? item.features : [],
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
    image: item.image || (type === 'video' ? getYoutubeThumbnail(videoUrl) : ''),
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
