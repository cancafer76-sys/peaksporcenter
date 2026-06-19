# PEAKSPOR

PEAKSPOR is a premium mobile-first fitness platform built with Node.js, React, Vite, Prisma, and PostgreSQL.

## Features

- Mobile-app style landing experience
- Dark/light theme
- Bottom navigation
- Floating PEAKSPOR assistant
- WhatsApp bubble
- Admin panel shell
- PostgreSQL-backed content model
- Authentication-ready backend

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database and set environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/peakspor"
JWT_SECRET="change-me-in-production"
ADMIN_EMAIL="admin@peakspor.com"
ADMIN_PASSWORD="Admin1234!"
NODE_ENV="development"
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push schema to PostgreSQL:

```bash
npx prisma db push
```

5. Run the app:

```bash
npm run dev
```

## Railway deployment

### 1) Prepare the database

- In Railway, create a **PostgreSQL** service.
- Copy the `DATABASE_URL` from Railway and add it to your app environment variables.

### 2) Prepare the Node.js service

- Create a new Railway service for this repository.
- Set the following environment variables:

```env
DATABASE_URL=your-railway-postgres-url
JWT_SECRET=your-strong-secret
ADMIN_EMAIL=admin@peakspor.com
ADMIN_PASSWORD=your-strong-password
NODE_ENV=production
```

### 3) Build/start commands

Use these Railway commands:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4) Database migration

After the service is deployed, run one of these:

```bash
npm run db:push
```

or use Prisma migrations if you add them later.

### 5) Admin login

Login with:

- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

## Notes

- The UI is intentionally mobile-first and premium dark-themed.
- All content is designed to be managed from the admin layer.
- Media uploads are stored locally in `server/uploads` in development; on Railway you should switch to object storage if you need persistent file storage.
