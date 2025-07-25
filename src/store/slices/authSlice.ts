// src/store/slices/authSlice.ts
// This slice manages the state for user authentication.

import type { StateCreator } from 'zustand';
import type { StoreState } from '../usePavementStore';
import type { User } from '../../types';

export interface AuthSlice {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
});
