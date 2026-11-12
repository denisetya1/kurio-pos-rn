import type { SQLiteDatabase } from 'expo-sqlite';

export type SyncQueueItem = {
  id: number;
  entity_type: string;
  entity_id: string;
  method: string;
  path: string;
  payload: string;
  attempts: number;
};

export async function getPendingSyncCount(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM sync_queue',
  );
  return row?.total ?? 0;
}

export async function getSyncQueue(db: SQLiteDatabase) {
  return db.getAllAsync<SyncQueueItem>(
    'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 50',
  );
}

export async function markSyncSuccess(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
}

export async function markSyncFailed(
  db: SQLiteDatabase,
  id: number,
  message: string,
) {
  await db.runAsync(
    `UPDATE sync_queue
     SET attempts = attempts + 1, last_error = ?
     WHERE id = ?`,
    message,
    id,
  );
}
