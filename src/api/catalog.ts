import type { ProductStock } from '@/types/domain';

import { apiRequest } from './client';

type ProductsResponse = {
  data: [ProductStock[], number];
};

export async function fetchProducts(
  outletId: string,
  search: string,
  page: number,
  limit: number,
) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });
  const response = await apiRequest<ProductsResponse>(
    `/api/pos/${outletId}/products?${params.toString()}`,
  );
  const [rawProducts, totalCount] = response.data;
  const products = rawProducts.map((product) => ({
    ...product,
    id: String(product.id),
    product: {
      ...product.product,
      id: String(product.product.id),
    },
  }));
  return { products, totalCount, source: 'remote' as const };
}
