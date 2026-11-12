import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { fetchProducts } from '@/api/catalog';
import {
  cacheProducts,
  getCachedProducts,
} from '@/database/catalog-repository';
import { useConnectivityStore } from '@/stores/connectivity-store';

type UseProductsOptions = {
  outletId?: string | number;
  search: string;
  page: number;
  limit: number;
};

export function useProducts({
  outletId,
  search,
  page,
  limit,
}: UseProductsOptions) {
  const db = useSQLiteContext();
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const normalizedOutletId = outletId ? String(outletId) : 'unassigned';

  return useQuery({
    queryKey: ['products', normalizedOutletId, search, page, limit],
    networkMode: 'always',
    queryFn: async () => {
      let remoteError: unknown = null;

      if (outletId && isOnline) {
        try {
          const remote = await fetchProducts(
            normalizedOutletId,
            search,
            page,
            limit,
          );
          await cacheProducts(db, normalizedOutletId, remote.products);
          return remote;
        } catch (error) {
          remoteError = error;
        }
      }

      const local = await getCachedProducts(
        db,
        normalizedOutletId,
        search,
        page,
        limit,
      );
      if (local.totalCount > 0 || !isOnline || !outletId) return local;
      throw remoteError instanceof Error
        ? remoteError
        : new Error('Produk belum tersedia di perangkat ini');
    },
  });
}
