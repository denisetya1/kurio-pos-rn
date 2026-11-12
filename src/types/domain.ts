export type ProductStock = {
  id: string;
  quantity: number;
  sellPrice: number;
  finalPrice: number;
  discountPercentage: number;
  markupPercentage: number;
  product: {
    id: string;
    name: string;
    barcode?: string | null;
    sku?: string | null;
    productType?: string;
    categoryId?: string | number;
    brandId?: string | number;
  };
};

export type Member = {
  id: string | number;
  name: string;
  phone: string;
  point?: number;
};

export type CartItem = {
  productStockId: string;
  productId: string;
  name: string;
  barcode?: string | null;
  quantity: number;
  maxQuantity: number;
  unitPrice: number;
  total: number;
};

export type HeldTransaction = {
  id: string;
  cart: CartItem[];
  selectedMember: Member | null;
  memberSearchPhone: string;
  heldAt: string;
};

export type SessionUser = {
  id: string | number;
  name: string;
};

export type Outlet = {
  id: string | number;
  name: string;
  sequence?: number;
};

export type Shift = {
  id: string | number;
  name?: string;
};
