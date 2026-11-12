import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Network from 'expo-network';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { apiRequest } from '@/api/client';
import { migrateDatabase } from '@/database/migrate';
import {
  getPendingSyncCount,
  getSyncQueue,
  markSyncFailed,
  markSyncSuccess,
} from '@/database/sync-repository';
import { useConnectivityStore } from '@/stores/connectivity-store';

const CACHE_TIME = 7 * 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_TIME,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'kurio-pos-query-cache-v2',
});

function RuntimeBridge() {
  const db = useSQLiteContext();
  const syncingRef = useRef(false);
  const setOnline = useConnectivityStore((state) => state.setOnline);
  const setPendingSyncCount = useConnectivityStore(
    (state) => state.setPendingSyncCount,
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const refreshPendingCount = async () => {
      setPendingSyncCount(await getPendingSyncCount(db));
    };

    const synchronize = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const queue = await getSyncQueue(db);
        for (const item of queue) {
          try {
            await apiRequest(item.path, {
              method: item.method,
              body: JSON.parse(item.payload),
            });
            await markSyncSuccess(db, item.id);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Sinkronisasi gagal';
            await markSyncFailed(db, item.id, message);
            break;
          }
        }
      } finally {
        syncingRef.current = false;
        await refreshPendingCount();
      }
    };

    const applyNetworkState = (state: Network.NetworkState) => {
      const isOnline = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      setOnline(isOnline);
      onlineManager.setOnline(isOnline);
      if (isOnline) void synchronize();
    };

    void Network.getNetworkStateAsync().then(applyNetworkState);
    void refreshPendingCount();
    const subscription = Network.addNetworkStateListener(applyNetworkState);
    return () => subscription.remove();
  }, [db, setOnline, setPendingSyncCount]);

  return null;
}

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="kurio-pos-v2.db" onInit={migrateDatabase}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: CACHE_TIME }}
        onSuccess={() => queryClient.resumePausedMutations()}
      >
        <RuntimeBridge />
        {children}
      </PersistQueryClientProvider>
    </SQLiteProvider>
  );
}
