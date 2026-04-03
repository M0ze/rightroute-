# RightRoute - Transport & Delivery SaaS for Mubende District, Uganda

## Overview

RightRoute is a hyper-local, production-ready Transport and Delivery SaaS platform designed specifically for Mubende District, Uganda. It connects customers needing reliable delivery with drivers offering transport services. The platform is built with a mobile-first, offline-resilient architecture optimized for 3G/4G networks common in rural Uganda.

### Vision
Start as an MVP in Mubende District with 500 daily orders within 6 months, scale to 10,000 orders/day nationally across Uganda and East Africa, targeting $2M+ ARR within 24 months.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL (Supabase)
- **Real-time:** Supabase Realtime + Pusher fallback
- **Maps:** Leaflet + OpenStreetMap (free) + Mapbox GL JS
- **Authentication:** Supabase Auth (phone + OTP via Africa's Talking / Termii)
- **Payments:** Flutterwave, MTN MoMo, Airtel Money
- **Storage:** Supabase Storage (driver IDs, vehicle photos, POD images)
- **i18n:** i18next (English, Luganda, Swahili)
- **PWA:** Service Worker for offline support
- **Analytics:** Recharts + role-based dashboards

## Project Structure

```
rightroute/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (customer)/         # Customer-facing pages
│   │   ├── (driver)/           # Driver-facing pages
│   │   ├── (admin)/            # Admin dashboard
│   │   ├── api/                # Backend API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities, database, Supabase clients
│   ├── context/                # React contexts (Auth, Theme, Language)
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic services
│   ├── types/                  # TypeScript type definitions
│   └── tests/                  # Jest unit and integration tests
├── prisma/
│   └── schema.prisma           # Database schema
├── public/
│   ├── locales/                # i18n translation files
│   └── manifest.json           # PWA manifest
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

## Core Features

### Customer App
- Register/login with phone number (Uganda +256)
- Browse map with live driver locations
- Place delivery order with real-time pricing
- Live tracking with ETA and driver details
- Proof-of-delivery photo + rating
- Wallet system with Mobile Money top-up
- Order history + receipts (PDF)

### Driver App
- Driver onboarding with vehicle and document verification
- Accept/reject jobs with one-tap
- Turn-by-turn navigation (Leaflet)
- Earnings dashboard
- Weekly payout requests to Mobile Money
- Online/offline toggle
- Heatmap of high-demand zones

### Admin Dashboard
- User, order, and driver management
- District heatmaps & analytics
- Dispute resolution & refunds
- Driver verification queue
- Bulk SMS campaigns for promotions

## Revenue Streams (Built-in from Day 1)

- **15-20% commission** per successful delivery
- **Driver subscription tiers** (Basic free, Pro UGX 15,000/month)
- **Premium customer features** (express delivery, scheduled bulk, insurance)
- **White-label API** for local shops & cooperatives
- **Advertising slots** for local businesses on the map

## Getting Started

### Prerequisites
- Node.js 18+ (with npm or pnpm)
- PostgreSQL database (Supabase free tier to start)
- Supabase account for Auth and Real-time
- Mapbox account for routing (free tier available)
- Africa's Talking or Termii account for SMS OTP

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rightroute.git
   cd rightroute
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase, Mapbox, and payment gateway credentials
   ```

4. **Push database schema to Supabase:**
   ```bash
   npx prisma db push
   ```

5. **Run development server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
vercel deploy
```

### Alternative: Railway, Render, or Fly.io

Follow their respective documentation for Node.js deployments.

## Phases Breakdown

- **Phase 1:** Architecture, Database Schema, Folder Structure (✅ Complete)
- **Phase 2:** Next.js + Supabase Setup, Authentication, Middleware (✅ Complete)
- **Phase 3:** Customer Pages + Map Integration + Order Placement
- **Phase 4:** Driver Pages + Real-time Matching + Live Tracking
- **Phase 5:** Admin Dashboard + Analytics + Payment Integration
- **Phase 6:** PWA, Offline Support, Testing, Deployment
- **Phase 7:** Monetization & Scaling Roadmap

## Security Best Practices

- **HTTPS** enforced
- **JWT** for session management
- **Row Level Security (RLS)** on Supabase
- **Input validation** with Zod
- **Rate limiting** on API routes
- **GDPR-style consent** for Uganda data laws
- **OWASP** compliance

## Scalability

Designed from day 1 for 10,000+ concurrent users:
- Redis caching placeholders
- BullMQ for background job processing
- Horizontal scaling with Vercel/Railway
- Database optimization with Prisma
- CDN for static assets

## Support

For issues, questions, or feature requests, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for Mubende District and beyond.**
