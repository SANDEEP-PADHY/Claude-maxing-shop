# Deployment Guide

## Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **PostgreSQL** 15+ (production)
- **Cashfree** merchant account with API keys

## Environment Configuration

### 1. Create `.env` from template

```bash
cp .env.example .env
```

### 2. Required variables

| Variable                  | Required | Description                                          |
| ------------------------- | -------- | ---------------------------------------------------- |
| `DATABASE_URL`            | ✅       | PostgreSQL connection string for production           |
| `AUTH_SECRET`             | ✅       | Random 32+ char string for JWT signing                |
| `CASHFREE_CLIENT_ID`      | ✅       | Cashfree merchant API client ID                      |
| `CASHFREE_CLIENT_SECRET`  | ✅       | Cashfree merchant API client secret                  |
| `CASHFREE_ENV`            | ✅       | `sandbox` or `production`                            |
| `NEXT_PUBLIC_APP_URL`     | ✅       | Public URL (e.g., `https://claudemaxing.shop`)        |
| `MERCHANT_NAME`           | ✅       | Merchant display name                                |
| `MERCHANT_EMAIL`          | ✅       | Support email                                        |
| `MERCHANT_PHONE`          | ✅       | Support phone                                        |

### 3. Generate AUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### Production (PostgreSQL)

1. Update `prisma/schema.prisma` – change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Or use the pre-configured `prisma/schema.postgresql.prisma`:

```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

2. Run migrations:

```bash
npx prisma db push
```

3. Seed the database:

```bash
# Set admin credentials in .env first:
# ADMIN_SEED_EMAIL="admin@claudemaxing.shop"
# ADMIN_SEED_PASSWORD="<your-secure-password>"
# ADMIN_SEED_PHONE="+91 XXXXX XXXXX"

npm run db:seed
```

## Build & Run

### Production build

```bash
npm run build
npm run start
```

### Vercel deployment

1. Connect the repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Ensure `postinstall` script runs `prisma generate`

### Docker (optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## Cashfree Webhook Configuration

1. Go to Cashfree Merchant Dashboard → Payment Gateway → Webhooks
2. Add webhook URL: `https://claudemaxing.shop/api/webhooks/cashfree`
3. Select events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `PAYMENT_USER_DROPPED`
4. Save – Cashfree will start sending webhook events

## Post-Deployment Verification

```bash
# Verify the site is live
curl -I https://claudemaxing.shop

# Verify API health
curl https://claudemaxing.shop/api/auth/me

# Test admin login via browser
# Navigate to /login and use admin credentials
```

## DNS Configuration

Point your domain `claudemaxing.shop` to your hosting provider:

| Record Type | Name | Value                     |
| ----------- | ---- | ------------------------- |
| A           | @    | `<hosting-provider-ip>`   |
| CNAME       | www  | `claudemaxing.shop`       |

Ensure HTTPS/TLS is enabled (automatic on Vercel, configure via Let's Encrypt elsewhere).
