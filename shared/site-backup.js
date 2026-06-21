export const SITE_BACKUP_FORMAT = 'peakspor-site-backup';
export const SITE_BACKUP_VERSION = 2;
export const SITE_BACKUP_EXTENSION = '.peakspor';
export const SITE_BACKUP_MIME = 'application/x-peakspor-backup+json';
export const MAX_STORED_SITE_BACKUPS = 3;
export const MAX_AUTO_SITE_BACKUPS = 3;
export const MAX_MANUAL_SITE_BACKUPS = 3;

export const SITE_BACKUP_KEYS = [
  'content',
  'services',
  'packages',
  'gallery',
  'galleryCategories',
  'trainers',
  'about',
  'testimonials',
  'announcements',
  'facilityAreas',
  'posts',
  'staffUsers'
];

export function pickSiteBackupData(source = {}) {
  const data = {};
  for (const key of SITE_BACKUP_KEYS) {
    if (source[key] !== undefined) data[key] = source[key];
  }
  return data;
}

export function createSiteBackupEnvelope(settings = {}, meta = {}, files = {}) {
  return {
    format: SITE_BACKUP_FORMAT,
    version: SITE_BACKUP_VERSION,
    extension: SITE_BACKUP_EXTENSION,
    createdAt: new Date().toISOString(),
    label: meta.label || '',
    kind: meta.kind || 'manual',
    site: 'PEAKSPOR CENTER',
    data: pickSiteBackupData(settings),
    files: files && typeof files === 'object' ? files : {}
  };
}

export function collectUploadFilenamesFromValue(value, found = new Set()) {
  if (value == null) return found;
  if (typeof value === 'string') {
    const re = /\/uploads\/([^"'\\s?#]+)/g;
    let match;
    while ((match = re.exec(value))) {
      try {
        found.add(decodeURIComponent(match[1]));
      } catch {
        found.add(match[1]);
      }
    }
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectUploadFilenamesFromValue(item, found));
    return found;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach(item => collectUploadFilenamesFromValue(item, found));
  }
  return found;
}

export function parseSiteBackupPayload(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) throw new Error('Boş yedek dosyası');
    parsed = JSON.parse(trimmed);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Geçersiz yedek dosyası');
  }

  if (parsed.format === SITE_BACKUP_FORMAT && parsed.data && typeof parsed.data === 'object') {
    const data = pickSiteBackupData(parsed.data);
    if (!Object.keys(data).length && !Object.keys(parsed.files || {}).length) {
      throw new Error('Yedek dosyasında site verisi bulunamadı');
    }
    return { envelope: parsed, data, files: parsed.files || {} };
  }

  if (parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)) {
    const data = pickSiteBackupData(parsed.data);
    if (Object.keys(data).length || Object.keys(parsed.files || {}).length) {
      return { envelope: parsed, data, files: parsed.files || {} };
    }
  }

  const direct = pickSiteBackupData(parsed);
  if (Object.keys(direct).length) {
    return { envelope: null, data: direct, files: parsed.files || {} };
  }

  throw new Error('Tanımlanamayan yedek formatı. .peakspor veya uyumlu JSON kullanın.');
}

export function buildSiteBackupFilename(prefix = 'peakspor-yedek') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${stamp}${SITE_BACKUP_EXTENSION}`;
}

export function isSiteBackupFilename(name = '') {
  const lower = String(name).toLowerCase();
  return lower.endsWith(SITE_BACKUP_EXTENSION) || lower.endsWith('.json');
}

export function summarizeSiteBackup(data = {}, files = {}) {
  return {
    sections: Object.keys(pickSiteBackupData(data)).length,
    galleryItems: Array.isArray(data.gallery) ? data.gallery.length : 0,
    services: Array.isArray(data.services) ? data.services.length : 0,
    packages: Array.isArray(data.packages) ? data.packages.length : 0,
    trainers: Array.isArray(data.trainers) ? data.trainers.length : 0,
    staffUsers: Array.isArray(data.staffUsers) ? data.staffUsers.length : 0,
    announcements: Array.isArray(data.announcements) ? data.announcements.length : 0,
    mediaFiles: Object.keys(files || {}).length
  };
}
