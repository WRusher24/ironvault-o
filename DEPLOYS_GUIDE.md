# IronVault — Deployment Guide

Production deployment guide for **IronVault** (آيرون فالت), a progressive-overload and personal-record tracking platform.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS · Drizzle ORM · Neon PostgreSQL · Vercel Blob

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.19+ (LTS recommended) | Runtime |
| npm | 10+ | Package manager |
| Neon account | — | Serverless PostgreSQL |
| Vercel account | — | Hosting + Blob storage |
| Vercel CLI (optional) | latest | Local Blob emulation |

---

## 2. Local Development

### 2.1 Install dependencies

```bash
git clone <your-repo-url> ironvault
cd ironvault
npm install
```

### 2.2 Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Neon PostgreSQL connection string (from your Neon dashboard)
DATABASE_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/ironvault?sslmode=require"

# Long random string for signing session JWTs (e.g. `openssl rand -base64 48`)
AUTH_SECRET="your-long-random-secret"

# Optional locally — leave empty to use the public/uploads dev fallback
BLOB_READ_WRITE_TOKEN=""
```

### 2.3 Create the database schema

Two options:

**Option A — Drizzle Kit push (recommended for a fresh project):**

```bash
npm run db:push
```

**Option B — Apply the SQL migration directly:**

```bash
psql "$DATABASE_URL" -f drizzle/0000_init.sql
```

### 2.4 Seed the starter vault

```bash
npm run db:seed
```

This creates the admin account and a realistic starter vault:

| Field | Value |
|-------|-------|
| Email | `admin@ironvault.app` |
| Password | `IronVault#2024` |

The seed inserts 6 muscle-group categories (Chest, Back, Shoulders, Arms, Legs, Core) and 12 exercises with months of progressive history (Wide Lat Pulldown, Seated Cable Row, Shoulder Press, Barbell Bench Press, Squat, Romanian Deadlift, Leg Press, and more) so the dashboard, charts, and timeline are instantly populated.

> The seed is **idempotent** — it skips if the admin account already exists.

### 2.5 Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the login page — sign in with the admin credentials above.

### 2.6 Image uploads in local dev

Without `BLOB_READ_WRITE_TOKEN`, uploaded exercise photos are written to `public/uploads/` and served locally. This keeps the full upload flow testable offline. On Vercel, uploads automatically switch to Vercel Blob.

---

## 3. Deploy to Vercel

### 3.1 Push to GitHub/GitLab and import

1. Push the project to a Git repository.
2. In the [Vercel dashboard](https://vercel.com), choose **Add New → Project** and import the repository.
3. Vercel auto-detects Next.js — no framework preset changes needed.

### 3.2 Set environment variables

In **Project → Settings → Environment Variables**, add:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon connection string with `?sslmode=require` |
| `AUTH_SECRET` | Yes | Long random string (min 16 chars) |
| `BLOB_READ_WRITE_TOKEN` | Auto | Set automatically when you connect Blob (see 3.3) |

### 3.3 Configure Vercel Blob

1. In the Vercel dashboard, go to **Storage → Create Database → Blob**.
2. Select the same project.
3. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically — no manual copy/paste.
4. Exercise photos are then stored in Blob under `exercises/<userId>/` and served from the Blob CDN.

### 3.4 Provision Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string from the Neon dashboard.
3. Set it as `DATABASE_URL` in Vercel environment variables.
4. Run the schema + seed against the production database:

```bash
# Point local tooling at the production DB
export DATABASE_URL="postgresql://user:password@host/ironvault?sslmode=require"
export AUTH_SECRET="your-production-secret"

npm run db:push
npm run db:seed
```

> For production, prefer generating migrations with `npm run db:generate` after schema changes and applying them with `npm run db:migrate`, rather than `db:push`.

### 3.5 Deploy

Click **Deploy** (or push to the production branch). Vercel builds and hosts the app with HTTPS by default.

### 3.6 Custom domain

1. Go to **Project → Settings → Domains**.
2. Add your domain (e.g. `ironvault.example.com`).
3. Follow the DNS instructions (A record `76.76.21.21` or CNAME `cname.vercel-dns.com`).
4. Vercel provisions a free SSL certificate automatically.

---

## 4. Post-Deployment Checklist

- [ ] Sign in with `admin@ironvault.app` / `IronVault#2024` and verify the seeded dashboard renders.
- [ ] Register a second account in an incognito window and confirm **strict data isolation** (the new account sees zero data from the admin account).
- [ ] Upload an exercise photo and confirm it loads from the Blob CDN.
- [ ] Log a new PR and confirm the celebration overlay fires.
- [ ] Export CSV from the Export page and verify Arabic text renders correctly in Excel.
- [ ] Change the admin password / delete the seed account if the app is public-facing.

---

## 5. Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly to the database (dev only) |
| `npm run db:seed` | Insert the admin account + starter vault (idempotent) |

---

## 6. Architecture Overview

```
src/
├── app/
│   ├── (auth)/            # Login + register (redirected away when signed in)
│   ├── (app)/             # Authenticated shell: bottom nav + FAB + log dialog
│   │   ├── dashboard/     # Stats header, search, category grid, exercise list
│   │   ├── exercises/[id]/# Detail: photo, PR chart, timeline, edit/delete
│   │   ├── export/        # CSV export landing page
│   │   └── profile/       # Account, privacy note, logout
│   └── api/               # REST endpoints (all require a valid session)
│       ├── auth/          # register / login / logout
│       ├── categories/    # CRUD
│       ├── exercises/     # CRUD
│       ├── logs/          # CRUD + PR detection
│       ├── upload/        # Vercel Blob (dev fallback: public/uploads)
│       └── export/        # CSV download (UTF-8 BOM)
├── components/            # UI: charts, dialogs, nav, modals
├── db/
│   ├── schema.ts          # Drizzle schema (users, categories, exercises, pr_logs)
│   ├── index.ts           # Connection pool (pg + drizzle)
│   └── seed.ts            # Admin account + realistic starter vault
└── lib/
    ├── auth.ts            # scrypt password hashing + jose JWT sessions
    ├── queries.ts         # Dashboard / detail / export data access
    ├── validations.ts     # Zod request schemas
    └── utils.ts           # Formatting, streaks, motivational copy
```

**Security model:** every API route calls `requireUser()`, which verifies the `ironvault_session` JWT (httpOnly cookie, HS256, 7-day expiry). All queries are scoped by `userId` — users can only ever read or mutate their own rows. Passwords are hashed with scrypt (salted, timing-safe comparison).
