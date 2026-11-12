import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CartItem, HeldTransaction, Member, ProductStock } from '@/types/domain';

const newLocalId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

type PosState = {
  cart: CartItem[];
  selectedMember: Member | null;
  memberSearchPhone: string;
  heldTransactions: HeldTransaction[];
  addProduct: (product: ProductStock) => void;
  changeQuantity: (productStockId: string, delta: number) => void;
  removeProduct: (productStockId: string) => void;
  selectMember: (member: Member | null) => void;
  setMemberSearchPhone: (phone: string) => void;
  holdTransaction: () => void;
  loadHeldTransaction: (id: string) => void;
  cancelTransaction: () => void;
  completeTransaction: () => void;
};

const emptyTransaction = {
  cart: [] as CartItem[],
  selectedMember: null as Member | null,
  memberSearchPhone: '',
};

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      ...emptyTransaction,
      heldTransactions: [],
      addProduct: (product) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productStockId === product.id,
          );
          if (existing) {
            if (existing.quantity >= existing.maxQuantity) return state;
            return {
              cart: state.cart.map((item) =>
                item.productStockId === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                      total: (item.quantity + 1) * item.unitPrice,
                    }
                  : item,
              ),
            };
          }

          if (product.quantity <= 0 || product.finalPrice <= 0) return state;
          return {
            cart: [
              ...state.cart,
              {
                productStockId: product.id,
                productId: product.product.id,
                name: product.product.name.trim(),
                barcode: product.product.barcode,
                quantity: 1,
                maxQuantity: product.quantity,
                unitPrice: product.finalPrice,
                total: product.finalPrice,
              },
            ],
          };
        }),
      changeQuantity: (productStockId, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.productStockId !== productStockId) return item;
              const quantity = Math.min(
                item.maxQuantity,
                Math.max(0, item.quantity + delta),
              );
              return { ...item, quantity, total: quantity * item.unitPrice };
            })
            .filter((item) => item.quantity > 0),
        })),
      removeProduct: (productStockId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.productStockId !== productStockId,
          ),
        })),
      selectMember: (selectedMember) => set({ selectedMember }),
      setMemberSearchPhone: (memberSearchPhone) => set({ memberSearchPhone }),
      holdTransaction: () => {
        const state = get();
        if (state.cart.length === 0) return;
        set({
          ...emptyTransaction,
          heldTransactions: [
            ...state.heldTransactions,
            {
              id: newLocalId(),
              cart: state.cart,
              selectedMember: state.selectedMember,
              memberSearchPhone: state.memberSearchPhone,
              heldAt: new Date().toISOString(),
            },
          ],
        });
      },
      loadHeldTransaction: (id) => {
        const held = get().heldTransactions.find((item) => item.id === id);
        if (!held) return;
        set((state) => ({
          cart: held.cart,
          selectedMember: held.selectedMember,
          memberSearchPhone: held.memberSearchPhone,
          heldTransactions: state.heldTransactions.filter(
            (item) => item.id !== id,
          ),
        }));
      },
      cancelTransaction: () => set(emptyTransaction),
      completeTransaction: () => set(emptyTransaction),
    }),
    {
      name: 'kurio-pos-transaction-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
