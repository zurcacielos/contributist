import React, { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";
import { devtools, redux } from "zustand/middleware";
import { appReducer, AppState, AppAction } from "./appReducer";

export type AppStoreState = AppState & {
  dispatch: (action: AppAction) => void;
};

// Create a function to instantiate a new store
export const createAppStore = (initialState: AppState) => {
  return createStore<AppStoreState>(
    devtools(redux(appReducer, initialState) as any, { name: "ContributistStore" })
  );
};

// Create the Context
const StoreContext = createContext<ReturnType<typeof createAppStore> | null>(null);

export interface StoreProviderProps {
  children: React.ReactNode;
  initialState: AppState;
}

export function StoreProvider({ children, initialState }: StoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof createAppStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to access the store
export function useAppStore<T>(selector: (state: AppStoreState) => T): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useAppStore must be used within a StoreProvider");
  }
  return useStore(store, selector);
}

// Hook to get dispatch directly
export function useAppDispatch() {
  return useAppStore((state) => state.dispatch);
}
