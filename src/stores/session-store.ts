import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Outlet, SessionUser, Shift } from '@/types/domain';

type SessionState = {
  user: SessionUser | null;
  outlet: Outlet | null;
  shift: Shift | null;
  setSession: (session: Pick<SessionState, 'user' | 'outlet' | 'shift'>) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      outlet: null,
      shift: null,
      setSession: (session) => set(session),
      clearSession: () => set({ user: null, outlet: null, shift: null }),
    }),
    {
      name: 'kurio-pos-session-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
