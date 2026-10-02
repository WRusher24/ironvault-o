# IronVault — آيرون فالت

A production-ready, mobile-first progressive overload and personal record (PR) tracking platform for strength trainers. Fully Arabic RTL interface with dark mode, neon accents, and one-thumb logging between sets.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS** with logical properties (RTL-safe)
- **Drizzle ORM** + **Neon PostgreSQL**
- **Vercel Blob** for exercise photos
- **jose** JWT sessions (httpOnly cookies) + **scrypt** password hashing

## Features

- Instant email/phone registration — no admin gate
- Strict per-user data isolation
- Dashboard: PR counter, training streak, featured exercise, motivational copy, instant search, muscle-group grid
- Custom categories (add / edit / delete) with colors and icons
- Exercise photos via Vercel Blob (local dev fallback to `public/uploads`)
- Lightning-fast PR logging with full-screen PR celebration
- Exercise detail: SVG progress graph with PR star badges + chronological timeline with edit/delete
- CSV export (UTF-8 BOM, Excel-compatible Arabic)
- Seeded admin account with realistic starter vault

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL + AUTH_SECRET
npm run db:push              # create tables
npm run db:seed              # admin@ironvault.app / IronVault#2024
npm run dev                  # http://localhost:3000
```

## Documentation

- **[DEPLOYS_GUIDE.md](./DEPLOYS_GUIDE.md)** — local setup, Neon, Vercel deployment, Blob, custom domains
- **[USER_GUIDE.md](./USER_GUIDE.md)** — signup, logging PRs, photos, graphs, CSV export
