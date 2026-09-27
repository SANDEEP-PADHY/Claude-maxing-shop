# Security Architecture

## Overview

claudemaxing.shop implements defence-in-depth security across authentication, data encryption, payment processing, and access control.

## Authentication

### Session Management

- **JWT-based sessions** using the `jose` library
- Tokens signed with `AUTH_SECRET` (HS256)
- Tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies
- Session expiry: configurable (default 7 days)
- No session data stored server-side (stateless JWT)

### Password Security

- Passwords hashed with **bcrypt** (cost factor 10)
- No plaintext passwords stored anywhere
- Seed script requires passwords via environment variables (`ADMIN_SEED_PASSWORD`)
- No hardcoded credentials in source code

### Admin Access

- Admin role is set in the `users` table (`role = "admin"`)
- All `/admin/*` routes verify `role === "admin"` before rendering
- All `/api/admin/*` routes verify admin JWT before processing

## Access Key Encryption

### Encryption at Rest

- Keys encrypted with **AES-256-GCM**
- Encryption key derived from `AUTH_SECRET` via SHA-256
- Each key uses a unique 12-byte IV (initialization vector)
- GCM mode provides both confidentiality and integrity (authenticated encryption)

### Storage Format

```
<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
```

### Access Controls

- Keys displayed **masked** by default (`cm_li••••••••••••21`)
- Full key reveal requires:
  1. Authenticated session
  2. Active `AccessAssignment` linking the user to the key
  3. Server-side decryption via `/api/access/reveal`
- **Tenant isolation**: users can only reveal keys assigned to their own account

## Payment Security

### Cashfree Integration

- **Server-side order creation** – orders created via Cashfree API from the backend
- **Server-side payment verification** – payment status verified via Cashfree API, not client
- **Webhook signature verification** – HMAC-SHA256 validation of Cashfree webhooks
- **Idempotent processing** – duplicate payment notifications handled gracefully

### Atomic Allocation

- Access key allocation uses an atomic SQL `UPDATE ... WHERE current_customers < max_customers`
- Prevents race conditions where two payments could over-allocate the same key
- Transaction wraps: order update + payment record + key assignment + subscription creation

## API Security

### Input Validation

- All API routes validate request bodies
- Phone numbers sanitised to 10-digit format
- Email format validated before processing
- SQL injection prevented by Prisma's parameterised queries

### Error Handling

- Sensitive error details never exposed to clients
- Structured error responses with safe messages
- Server-side error logging for debugging

## Environment Variables

### Secrets Management

| Variable               | Sensitivity | Notes                                |
| ---------------------- | ----------- | ------------------------------------ |
| `AUTH_SECRET`          | 🔴 Critical  | Must be unique, random, 32+ chars   |
| `CASHFREE_CLIENT_SECRET` | 🔴 Critical | Never expose in client-side code    |
| `DATABASE_URL`         | 🔴 Critical  | Contains database credentials        |
| `ADMIN_SEED_PASSWORD`  | 🟡 High     | Only needed during initial seed      |

### Never Commit

- `.env` files (enforced by `.gitignore`)
- Database files (`*.db`, `*.sqlite`)
- Private keys (`*.pem`, `*.key`)

## Data Protection

### Personal Data

- User emails, phones, and names stored in the database
- Password hashes (bcrypt) – cannot be reversed
- Access keys encrypted at rest

### Audit Trail

- All payment and allocation events logged to `audit_logs` table
- Includes: user ID, action, entity type, entity ID, metadata, timestamp
- Audit logs are append-only (no update/delete operations)

## Security Checklist

- [ ] `AUTH_SECRET` is unique and random (not the example value)
- [ ] `CASHFREE_ENV` is set to `production` for live payments
- [ ] No `.env` file committed to version control
- [ ] No hardcoded passwords in source code
- [ ] HTTPS enforced on production domain
- [ ] Database access restricted to application server
- [ ] Cashfree webhook URL uses HTTPS
- [ ] Admin account uses a strong, unique password
- [ ] Regular database backups configured
