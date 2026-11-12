import { create } from 'zustand';

type ConnectivityState = {
  isOnline: boolean;
  pendingSyncCount: number;
  setOnline: (isOnline: boolean) => void;
  setPendingSyncCount: (count: number) => void;
};

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isOnline: true,
  pendingSyncCount: 0,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
}));
