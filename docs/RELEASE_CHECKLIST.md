# Release Checklist

Use this checklist before every production deployment.

## Pre-Release

### Code Quality

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] `node scripts/verify_all_tests.mjs` – all assertions pass

### Security Review

- [ ] No hardcoded passwords or secrets in source code
- [ ] `.env` is NOT tracked by git (`git status` shows no `.env`)
- [ ] `AUTH_SECRET` is a unique, random 32+ character string
- [ ] `CASHFREE_ENV` is set correctly (`sandbox` for staging, `production` for live)
- [ ] No development database files (`dev.db`) in the commit
- [ ] `prisma/seed.mjs` does not contain hardcoded passwords

### Database

- [ ] Schema matches production database provider (PostgreSQL)
- [ ] All schema changes tested with `prisma db push` on staging
- [ ] Database backup taken before deploying schema changes
- [ ] Seed data verified (plans, access keys configured correctly)

### Payment Gateway

- [ ] Cashfree API keys are for the correct environment
- [ ] Webhook URL is configured: `https://claudemaxing.shop/api/webhooks/cashfree`
- [ ] Webhook signature verification is enabled
- [ ] Test payment completed successfully in sandbox
- [ ] Return URL points to production domain

### Access Key Inventory

- [ ] At least one ACTIVE access key exists for each plan (5X, 20X)
- [ ] Key capacity (`max_customers`) is set appropriately
- [ ] Keys are encrypted in the database

## Deployment

### Build & Deploy

- [ ] `npm run build` on clean checkout succeeds
- [ ] Environment variables set in hosting provider
- [ ] `prisma generate` runs during build (via `postinstall`)
- [ ] Node.js version matches (≥ 20.x)

### DNS & SSL

- [ ] Domain `claudemaxing.shop` resolves to hosting provider
- [ ] HTTPS/TLS certificate is valid
- [ ] WWW subdomain redirects to apex (or vice versa)

## Post-Deployment

### Smoke Tests

- [ ] Landing page loads at `https://claudemaxing.shop`
- [ ] Plan cards display correct pricing (₹999, ₹1,999)
- [ ] Registration flow works end-to-end
- [ ] Login flow works for both customer and admin
- [ ] Admin dashboard loads at `/admin`
- [ ] Payment flow initiates correctly (sandbox or production)
- [ ] Customer dashboard shows order history

### Monitoring

- [ ] Application logs are being captured
- [ ] Error tracking is active (if configured)
- [ ] Database connection is stable
- [ ] Cashfree webhooks are being received

## Rollback Plan

If issues are detected post-deployment:

1. **Revert to previous deployment** via hosting provider
2. **Restore database backup** if schema changes caused issues
3. **Verify** all smoke tests pass on the rolled-back version
4. **Investigate** root cause before re-attempting deployment
