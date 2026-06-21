import fs from 'fs';
import path from 'path';
import { SITE_BACKUP_KEYS } from './site-backup.js';

export function resolveDataRoot(rootDir) {
  const candidates = [
    process.env.PEAKSPOR_DATA_DIR,
    process.env.RAILWAY_VOLUME_MOUNT_PATH,
    process.env.DATA_DIR
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) fs.mkdirSync(candidate, { recursive: true });
      return path.resolve(candidate);
    } catch {
      // try next candidate
    }
  }

  const fallback = path.join(rootDir, 'data');
  if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

export function createPersistencePaths(rootDir) {
  const dataRoot = resolveDataRoot(rootDir);
  return {
    dataRoot,
    uploadDir: path.join(dataRoot, 'uploads'),
    settingsBackupPath: path.join(dataRoot, 'settings-backup.json'),
    siteBackupsDir: path.join(dataRoot, 'backups'),
    staffUsersBackupPath: path.join(dataRoot, 'staff-users-backup.json'),
    uploadManifestPath: path.join(dataRoot, 'upload-manifest.json'),
    legacyUploadDir: path.join(rootDir, 'server', 'uploads')
  };
}

export function ensurePersistenceDirs(paths) {
  [paths.dataRoot, paths.uploadDir, paths.siteBackupsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

export function readJsonFile(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJsonFile(filePath, value) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

export function countSettingsSections(settings = {}) {
  return SITE_BACKUP_KEYS.filter(key => settings[key] !== undefined).length;
}

export function isSettingsEmpty(settings = {}) {
  return countSettingsSections(settings) === 0;
}

export function mergeSettingsPreferExisting(primary = {}, secondary = {}) {
  const merged = { ...secondary };
  for (const key of SITE_BACKUP_KEYS) {
    if (primary[key] !== undefined) merged[key] = primary[key];
  }
  return merged;
}
