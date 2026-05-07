/* eslint-disable react-refresh/only-export-components */
import { ReactNode, createContext, useContext, useMemo } from "react";
import { RootStoreInstance, createScoreStore } from "./models/scoreStore";

const StoreContext = createContext<RootStoreInstance | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => createScoreStore(), []);
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
};
