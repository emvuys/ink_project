# INK Admin Database Schema Design

## Overview
PostgreSQL relational database for managing merchants, inventory, orders, and videos.

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└─────────────┘

┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  merchants  │──────<│ usage_records    │       │ merchant_videos │
│             │       └──────────────────┘       └─────────────────┘
│             │       ┌──────────────────┐
│             │──────<│ fulfillment_orders│
└─────────────┘       └──────────────────┘
```

---

## Tables

### 1. users
Admin users who can access the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | Display name |
| role | VARCHAR(50) | DEFAULT 'admin' | User role |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`

---

### 2. merchants
Retail partners who receive stickers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Merchant name |
| email | VARCHAR(255) | NOT NULL | Contact email |
| phone | VARCHAR(50) | | Contact phone |
| address | TEXT | | Shipping address |
| current_inventory | INTEGER | DEFAULT 0 | Current sticker count |
| alert_threshold | INTEGER | DEFAULT 5 | Low stock alert threshold |
| total_stickers_used | INTEGER | DEFAULT 0 | Lifetime usage counter |
| last_refill_date | DATE | | Most recent refill date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_merchants_name` on `name`
- `idx_merchants_current_inventory` on `current_inventory`

**Business Rules:**
- `current_inventory` >= 0
- `alert_threshold` > 0
- Trigger low stock alert when `current_inventory` < `alert_threshold`

---

### 3. usage_records
Track daily sticker usage by merchants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| merchant_id | UUID | FOREIGN KEY, NOT NULL | References merchants(id) |
| date | DATE | NOT NULL | Usage date |
| stickers_used | INTEGER | NOT NULL | Number of stickers used |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_usage_merchant_date` on `(merchant_id, date DESC)`

**Constraints:**
- `stickers_used` > 0
- UNIQUE `(merchant_id, date)` - one record per merchant per day

**On Delete:** CASCADE (delete usage records when merchant is deleted)

---

### 4. fulfillment_orders
Sticker refill orders and shipping tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Order number (e.g., FO001) |
| merchant_id | UUID | FOREIGN KEY, NOT NULL | References merchants(id) |
| order_date | DATE | NOT NULL | Order creation date |
| quantity | INTEGER | NOT NULL | Number of stickers ordered |
| shipping_address | TEXT | NOT NULL | Delivery address |
| status | VARCHAR(50) | NOT NULL | Order status |
| packed_at | TIMESTAMP | | When order was packed |
| shipped_at | TIMESTAMP | | When order was shipped |
| delivered_at | TIMESTAMP | | When order was delivered |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `pending` - Order created, awaiting processing
- `packed` - Order packed, ready to ship
- `shipped` - Order in transit
- `delivered` - Order received by merchant

**Indexes:**
- `idx_orders_merchant` on `merchant_id`
- `idx_orders_status` on `status`
- `idx_orders_date` on `order_date DESC`

**Constraints:**
- `quantity` > 0

**On Delete:** RESTRICT (cannot delete merchant with pending orders)

**Business Logic:**
- When status changes to `delivered`, update `merchants.current_inventory` += `quantity`
- When status changes to `delivered`, update `merchants.last_refill_date` = `delivered_at`

---

### 5. merchant_videos
Branded loading videos for merchants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| merchant_name | VARCHAR(255) | NOT NULL | Associated merchant name |
| video_url | TEXT | NOT NULL | Cloud Storage URL |
| thumbnail_url | TEXT | | Video thumbnail URL |
| file_size | INTEGER | | File size in bytes |
| format | VARCHAR(10) | | File format (MP4, GIF) |
| is_looping | BOOLEAN | DEFAULT true | Auto-loop setting |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_videos_merchant_name` on `merchant_name`

**Constraints:**
- `file_size` <= 1048576 (1MB limit)
- `format` IN ('MP4', 'GIF')

---

## Calculated Fields / Views

### merchant_stats_view
Real-time merchant statistics for dashboard.

```sql
CREATE VIEW merchant_stats_view AS
SELECT
  COUNT(*) as total_merchants,
  SUM(current_inventory) as total_stickers_in_circulation,
  COUNT(*) FILTER (WHERE current_inventory < alert_threshold) as low_stock_count
FROM merchants;
```

### order_stats_view
Order statistics for dashboard.

```sql
CREATE VIEW order_stats_view AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders_count,
  COUNT(*) FILTER (WHERE status = 'packed') as packed_orders_count,
  COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders_count
FROM fulfillment_orders;
```

---

## Data Migration Notes

### Initial Seed Data
- Create default admin user: `admin@in.ink` / `Admin123!`
- Import existing merchants from `mockData.ts`
- Import existing orders from `mockData.ts`
- Import existing videos from `videoMockData.ts`

### UUID Generation
Use PostgreSQL `gen_random_uuid()` for auto-generated UUIDs.

---

## Performance Considerations

1. **Indexes**: Created on frequently queried columns
2. **Partitioning**: Consider partitioning `usage_records` by date if data grows large
3. **Archiving**: Archive delivered orders older than 1 year
4. **Connection Pooling**: Use PgBouncer or Prisma connection pooling

---

## Security

1. **Row-Level Security**: Enable RLS for multi-tenant scenarios (future)
2. **Encryption**: Sensitive data encrypted at rest (Cloud SQL feature)
3. **Audit Trail**: `created_at` and `updated_at` on all tables
4. **Soft Deletes**: Consider adding `deleted_at` column for soft deletes (future)

---

## Metabase Integration

Metabase will connect directly to Cloud SQL with read-only credentials:

```sql
CREATE USER metabase_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ink_admin TO metabase_readonly;
GRANT USAGE ON SCHEMA public TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
```

This allows Metabase to query all tables without write access.
