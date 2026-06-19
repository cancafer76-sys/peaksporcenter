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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const prisma = new PrismaClient();
const execFileAsync = promisify(execFile);
const app = express();
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || 'peakspor-secret';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

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

async function ensureAdminUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    create: {
      name: 'Peakspor Admin',
      email,
      passwordHash,
      role: 'ADMIN'
    },
    update: {
      name: 'Peakspor Admin',
      passwordHash,
      role: 'ADMIN'
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

const upload = multer({ storage });

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

async function adminRequired(req, res, next) {
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

async function pushDatabaseSchema(retries = 8) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await execFileAsync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
        cwd: rootDir,
        env: process.env
      });
      console.log('Database schema synced');
      return;
    } catch (error) {
      const message = error.stderr || error.message || 'unknown error';
      console.warn(`Database push attempt ${attempt}/${retries} failed:`, message);
      if (attempt === retries) throw error;
      await wait(2500 * attempt);
    }
  }
}

async function ensureSeedData() {
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();
  await ensureAdminUser(adminEmail, adminPassword);

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
    await prisma.service.createMany({ data: defaultServices });
  }
  if (!(await prisma.package.count())) {
    await prisma.package.createMany({ data: defaultPackages.map(item => ({
      ...item,
      features: item.features
    })) });
  }
  if (!(await prisma.galleryItem.count())) {
    await prisma.galleryItem.createMany({ data: defaultGallery });
  }
  if (!(await prisma.announcement.count())) {
    await prisma.announcement.createMany({
      data: defaultAnnouncements.map(message => ({ message }))
    });
  }
  if (!(await prisma.trainer.count())) {
    await prisma.trainer.createMany({ data: defaultTrainers });
  }
  if (!(await prisma.blogPost.count())) {
    await prisma.blogPost.createMany({ data: defaultPosts });
  }
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'peakspor', env: process.env.NODE_ENV || 'development' });
});

app.get('/api/me', authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json({ user });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const lookupEmail = resolveAdminEmail(email);
    const { email: adminEmail, password: adminPassword } = getAdminCredentials();
    const inputPassword = password || '';
    const isKnownAdminLogin = lookupEmail === adminEmail && inputPassword === adminPassword;

    let user;
    if (isKnownAdminLogin) {
      user = await ensureAdminUser(adminEmail, adminPassword);
    } else {
      user = await prisma.user.findUnique({ where: { email: lookupEmail } });
      if (!user || !(await bcrypt.compare(inputPassword, user.passwordHash))) {
        return res.status(400).json({ message: 'E-posta veya şifre hatalı' });
      }
    }

    const token = signToken(user);
    res.cookie('token', token, authCookieOptions);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
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
  const entries = await prisma.setting.findMany();
  const content = Object.fromEntries(entries.map(item => [item.key, item.value]));
  res.json(content);
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

app.get('/api/admin/analytics', adminRequired, async (_, res) => {
  res.json(await readAnalytics());
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

app.get('/api/admin/dashboard', adminRequired, async (_, res) => {
  const [users, reservations, revenue, activeMembers] = await Promise.all([
    prisma.user.count(),
    prisma.reservation.count(),
    prisma.package.aggregate({ _sum: { price: true } }),
    prisma.user.count({ where: { role: 'USER' } })
  ]);
  res.json({
    stats: {
      totalUsers: users,
      activeMembers,
      revenue: revenue._sum.price || 0,
      reservations
    },
    recentUsers: await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    }),
    recentReservations: await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  });
});

app.get('/api/admin/:resource', adminRequired, async (req, res) => {
  const map = {
    services: prisma.service,
    packages: prisma.package,
    gallery: prisma.galleryItem,
    announcements: prisma.announcement,
    trainers: prisma.trainer,
    posts: prisma.blogPost,
    users: prisma.user,
    reservations: prisma.reservation,
    media: prisma.media,
    settings: prisma.setting
  };
  const resource = map[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Bulunamadı' });
  const data = await resource.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ data });
});

app.post('/api/admin/upload', adminRequired, upload.single('file'), async (req, res) => {
  res.json({
    id: crypto.randomUUID(),
    title: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype
  });
});

app.put('/api/admin/settings/:key', adminRequired, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const setting = await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  });
  res.json(setting);
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

app.use(express.static(path.join(rootDir, 'dist')));
app.use((req, res) => {
  const indexPath = path.join(rootDir, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ message: 'Build bulunamadı' });
});

async function start() {
  try {
    await connectDatabase();
    await pushDatabaseSchema();
    await ensureSeedData();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database startup failed:', error);
    throw error;
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PEAKSPOR server listening on ${port}`);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});