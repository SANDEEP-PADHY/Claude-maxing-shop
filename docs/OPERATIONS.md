# Operations Manual

## Day-to-Day Operations

### Customer Order Flow

1. Customer selects a plan (5X or 20X Access)
2. Customer registers/logs in
3. Customer selects delivery method (Email or WhatsApp)
4. Customer completes payment via Cashfree
5. Server verifies payment → automatically allocates an access key
6. Customer sees assigned key in dashboard immediately
7. **Admin manually delivers** the key using the customer's selected method

### Admin: Manual Key Delivery

1. Navigate to **Admin → Orders**
2. Find orders with `delivery_status = PENDING`
3. Click **Manage** on the order
4. Copy the pre-formatted delivery template (Email or WhatsApp)
5. Send the key to the customer via the chosen channel
6. Mark the order as **DELIVERED** in the admin panel

### Admin: Managing Access Keys

1. Navigate to **Admin → Access Keys**
2. **Add new keys**: provide the encrypted key value, plan, and max customers
3. **Monitor capacity**: see `current_customers / max_customers` for each key
4. **Disable keys**: set status to `DISABLED` when a key should no longer be allocated
5. Keys auto-transition to `FULL` when capacity is reached

### Admin: Dashboard Metrics

The admin dashboard at `/admin` shows:

- Total revenue
- Active orders count
- Pending deliveries count
- Customer count
- Plan breakdown

## Access Key Lifecycle

```
ACTIVE → (customers fill up) → FULL
ACTIVE → (admin disables) → DISABLED
```

- **ACTIVE**: Available for new allocations (current_customers < max_customers)
- **FULL**: Capacity reached; no new allocations until capacity is freed
- **DISABLED**: Manually disabled by admin; never allocated

## Order Status Flow

```
CREATED → PAYMENT_PENDING → PAID → (delivered) → COMPLETED
                          ↘ PAYMENT_FAILED
                          ↘ CANCELLED
```

## Delivery Status Flow

```
PENDING → DELIVERED
        ↘ FAILED
```

> Both Email and WhatsApp delivery are **manual**. The system only tracks the status.

## Database Management

### Prisma Studio

```bash
npm run db:studio
```

Opens a web GUI at `http://localhost:5555` to browse and edit data.

### Backup (PostgreSQL)

```bash
pg_dump -Fc $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore

```bash
pg_restore -d $DATABASE_URL backup_file.dump
```

## Monitoring & Logs

### Application logs

Next.js logs to stdout/stderr. In production, pipe to your log aggregator:

```bash
npm run start 2>&1 | tee -a /var/log/claudemaxing.log
```

### Key events to monitor

| Event                          | Where to check                    |
| ------------------------------ | --------------------------------- |
| Payment received               | `audit_logs` (action: `PAYMENT_AND_ACCESS_ALLOCATED`) |
| Key capacity exhausted         | `access_keys` table (status: `FULL`) |
| Delivery pending               | `orders` table (delivery_status: `PENDING`) |
| Failed payments                | `payments` table (status: `FAILED`) |

### Alerts to configure

- **All access keys at capacity**: No keys with `status = ACTIVE` for a plan
- **High pending delivery count**: Orders with `delivery_status = PENDING` for > 24 hours
- **Payment failures spike**: > 3 consecutive failures

## Troubleshooting

### "No access key available" after payment

**Cause**: All keys for the plan are at full capacity or disabled.

**Fix**: Add a new access key via Admin → Access Keys with available capacity.

### Customer can't see their key

**Cause**: Payment verification may not have completed, or the key wasn't allocated.

**Fix**: Check `orders` table for the order status. If `PAID` but no `AccessAssignment`, manually trigger reprocessing or add an assignment.

### Cashfree webhook not received

**Cause**: Webhook URL misconfigured or network issue.

**Fix**:
1. Verify webhook URL in Cashfree dashboard
2. Check server logs for incoming webhook requests
3. Use Cashfree's webhook replay feature

### Build fails on deployment

**Cause**: Usually missing environment variables or Prisma client not generated.

**Fix**: Ensure `postinstall` script runs `prisma generate` and all env vars are set.
