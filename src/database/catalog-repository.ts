import type { SQLiteDatabase } from 'expo-sqlite';

import type { ProductStock } from '@/types/domain';

type ProductRow = { payload: string };

export async function cacheProducts(
  db: SQLiteDatabase,
  outletId: string,
  products: ProductStock[],
) {
  const updatedAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const product of products) {
      await db.runAsync(
        `INSERT INTO products
          (id, outlet_id, search_name, barcode, sku, payload, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          outlet_id = excluded.outlet_id,
          search_name = excluded.search_name,
          barcode = excluded.barcode,
          sku = excluded.sku,
          payload = excluded.payload,
          updated_at = excluded.updated_at`,
        product.id,
        outletId,
        product.product.name.trim().toLocaleLowerCase('id-ID'),
        product.product.barcode ?? null,
        product.product.sku ?? null,
        JSON.stringify(product),
        updatedAt,
      );
    }
  });
}

export async function getCachedProducts(
  db: SQLiteDatabase,
  outletId: string,
  search: string,
  page: number,
  limit: number,
) {
  const normalized = search.trim().toLocaleLowerCase('id-ID');
  const pattern = `%${normalized}%`;
  const offset = Math.max(0, page - 1) * limit;
  const where = normalized
    ? `outlet_id = ? AND (
        search_name LIKE ? OR barcode LIKE ? OR sku LIKE ?
      )`
    : 'outlet_id = ?';
  const params = normalized
    ? [outletId, pattern, pattern, pattern]
    : [outletId];

  const rows = await db.getAllAsync<ProductRow>(
    `SELECT payload FROM products WHERE ${where}
     ORDER BY search_name ASC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
  const countRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM products WHERE ${where}`,
    ...params,
  );

  return {
    products: rows.map((row) => JSON.parse(row.payload) as ProductStock),
    totalCount: countRow?.total ?? 0,
    source: 'local' as const,
  };
}
