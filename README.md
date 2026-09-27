# claudemaxing.shop

A production-ready storefront for selling managed Claude-powered API access plans. Built with Next.js 16, React 19, Prisma, and Cashfree Payment Gateway.

## Features

- **Two plans**: 5X Access (₹999/mo) and 20X Access (₹1,999/mo)
- **Cashfree PG integration** with server-side payment verification
- **Atomic access key allocation** – keys are auto-assigned immediately after verified payment
- **Manual fulfilment** – admin manually delivers keys via Email or WhatsApp
- **Capacity management** – each access key supports configurable concurrent customers
- **Encrypted key storage** – AES-256-GCM encryption at rest, masked display, secure reveal
- **Admin console** – dashboard, orders, access keys, customers, delivery management
- **Customer dashboard** – order history, access key reveal, delivery status
- **Legal compliance** – refund, cancellation, privacy, and terms pages

## Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Framework   | Next.js 16 (App Router)       |
| UI          | React 19, Tailwind CSS 4      |
| Database    | Prisma ORM (SQLite dev / PostgreSQL prod) |
| Auth        | JWT sessions via `jose` + `bcryptjs` |
| Payments    | Cashfree Payment Gateway      |
| Encryption  | Node.js `crypto` (AES-256-GCM)|

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/<your-org>/claudemaxing.shop.git
cd claudemaxing.shop
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env – set AUTH_SECRET, Cashfree credentials, admin seed password

# 3. Initialize database
npx prisma db push
npm run db:seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (SQLite)
│   ├── schema.postgresql.prisma  # Production schema (PostgreSQL)
│   └── seed.mjs               # Database seeder
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── admin/             # Admin console pages
│   │   ├── api/               # REST API endpoints
│   │   ├── checkout/          # Checkout flow
│   │   ├── dashboard/         # Customer dashboard
│   │   └── ...                # Public pages (plans, legal, etc.)
│   ├── components/            # Reusable UI components
│   │   └── ui/                # Primitive components (Button, Card, etc.)
│   └── lib/                   # Core logic
│       ├── auth.ts            # JWT session management
│       ├── cashfree.ts        # Payment gateway + atomic allocation
│       ├── config.ts          # Site configuration
│       ├── encryption.ts      # AES-256-GCM key encryption
│       ├── email.ts           # Email utilities (manual only)
│       └── prisma.ts          # Prisma client singleton
├── scripts/
│   └── verify_all_tests.mjs   # Automated test suite
├── docs/                      # Deployment & operations docs
└── .env.example               # Environment template
```

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start development server                 |
| `npm run build`    | Production build                         |
| `npm run start`    | Start production server                  |
| `npm run lint`     | Run ESLint                               |
| `npm run typecheck`| TypeScript type checking                 |
| `npm run db:push`  | Push Prisma schema to database           |
| `npm run db:seed`  | Seed plans, access keys, and admin user  |
| `npm run db:studio`| Open Prisma Studio GUI                   |

## Documentation

- [DEPLOYMENT.md](docs/DEPLOYMENT.md) – Production deployment guide
- [OPERATIONS.md](docs/OPERATIONS.md) – Day-to-day operations manual
- [SECURITY.md](docs/SECURITY.md) – Security architecture & practices
- [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) – Pre-release verification

## Support

- **Email**: support@claudemaxing.shop
- **WhatsApp**: +91 96646 50235

## License

Private. All rights reserved.
