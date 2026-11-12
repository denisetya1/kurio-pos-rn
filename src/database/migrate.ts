import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        outlet_id TEXT NOT NULL,
        search_name TEXT NOT NULL,
        barcode TEXT,
        sku TEXT,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_products_outlet_search
      ON products(outlet_id, search_name);

      CREATE INDEX IF NOT EXISTS idx_products_barcode
      ON products(outlet_id, barcode);

      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY NOT NULL,
        outlet_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_members_outlet_phone
      ON members(outlet_id, phone);

      CREATE TABLE IF NOT EXISTS local_transactions (
        client_id TEXT PRIMARY KEY NOT NULL,
        outlet_id TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        payload TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at
      ON sync_queue(created_at);
    `);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
