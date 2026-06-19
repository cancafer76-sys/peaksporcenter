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
import { PrismaClient } from '@prisma/client';
import {
  defaultAnnouncements,
  defaultContent,
  defaultFacilityAreas,
  defaultGallery,
  defaultPackages,
  defaultPosts,
  defaultServices,
  defaultTrainers
} from '../shared/defaults.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const prisma = new PrismaClient();
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
  secure: process.env.COOKIE_SECURE === 'true'
};

function resolveAdminEmail(value) {
  const input = (value || '').trim().toLowerCase();
  if (!input || input === 'admin') return 'admin@peakspor.com';
  return input;
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

async function ensureSeedData() {
  const adminEmail = resolveAdminEmail(process.env.ADMIN_EMAIL || 'admin@peakspor.com');
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: 'Peakspor Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    },
    update: {
      name: 'Peakspor Admin',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const settings = [
    ['content', defaultContent],
    ['services', defaultServices],
    ['packages', defaultPackages],
    ['gallery', defaultGallery],
    ['announcements', defaultAnnouncements],
    ['trainers', defaultTrainers],
    ['facilityAreas', defaultFacilityAreas]
  ];

  for (const [key, value] of settings) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value }
    });
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
  const { email, password } = req.body;
  const lookupEmail = resolveAdminEmail(email);
  const user = await prisma.user.findUnique({ where: { email: lookupEmail } });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(400).json({ message: 'E-posta veya şifre hatalı' });
  }
  const token = signToken(user);
  res.cookie('token', token, authCookieOptions);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
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
  await ensureSeedData();
  app.listen(port, () => {
    console.log(`PEAKSPOR server listening on ${port}`);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});