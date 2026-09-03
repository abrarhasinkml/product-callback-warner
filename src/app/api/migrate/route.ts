import { NextResponse } from "next/server";
import { Pool } from "pg";

const MIGRATIONS = [
  {
    name: "001_initial_schema.sql",
    sql: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  manufacturer TEXT,
  lot_numbers TEXT[],
  grund VARCHAR(100) NOT NULL,
  risk_description TEXT,
  affected_states TEXT[],
  published_at DATE,
  updated_at DATE,
  urgency_tier VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_grund ON warnings(grund);
CREATE INDEX IF NOT EXISTS idx_warnings_product_name ON warnings(product_name);
CREATE INDEX IF NOT EXISTS idx_warnings_lot_numbers ON warnings USING GIN(lot_numbers);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_path TEXT NOT NULL,
  raw_ocr_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  lot_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_receipt_id ON products(receipt_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warning_id UUID NOT NULL REFERENCES warnings(id) ON DELETE CASCADE,
  match_score DECIMAL(5,4) NOT NULL,
  urgency_tier VARCHAR(20) NOT NULL,
  risk_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, warning_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_product_id ON matches(product_id);
CREATE INDEX IF NOT EXISTS idx_matches_warning_id ON matches(warning_id);
CREATE INDEX IF NOT EXISTS idx_matches_urgency_tier ON matches(urgency_tier);
    `,
  },
  {
    name: "002_auth_and_notifications.sql",
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts("userId");

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId");

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(identifier, token)
);

CREATE TABLE IF NOT EXISTS most_bought_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  barcode TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, manufacturer)
);

CREATE INDEX IF NOT EXISTS idx_most_bought_user_id ON most_bought_products(user_id);

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  warning_id UUID NOT NULL REFERENCES warnings(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, warning_id, product_name)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, read) WHERE read = FALSE;

ALTER TABLE receipts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `,
  },
];

export async function POST() {
  try {
    // Create a dedicated pool for migration with SSL bypass
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      "postgresql://postgres:postgres@localhost:5432/product_callback_warner";

    const isLocal =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1");

    const migratePool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });

    const results: string[] = [];

    // Ensure migrations tracking table exists first
    await migratePool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    for (const migration of MIGRATIONS) {
      // Check if already executed
      const existing = await migratePool.query(
        "SELECT name FROM migrations WHERE name = $1",
        [migration.name]
      );

      if (existing.rows.length > 0) {
        results.push(`Skipped (already run): ${migration.name}`);
        continue;
      }

      // Run migration
      await migratePool.query(migration.sql);
      await migratePool.query("INSERT INTO migrations (name) VALUES ($1)", [
        migration.name,
      ]);
      results.push(`Executed: ${migration.name}`);
    }

    await migratePool.end();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
