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
