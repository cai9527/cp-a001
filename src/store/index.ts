import { useAuthStore } from './authStore';
import { useDeviceStore } from './deviceStore';
import { useDataStore } from './dataStore';
import { useStatsStore } from './statsStore';

export { useAuthStore, useDeviceStore, useDataStore, useStatsStore };

type CombinedState = ReturnType<typeof useAuthStore.getState>
  & ReturnType<typeof useDeviceStore.getState>
  & ReturnType<typeof useDataStore.getState>
  & ReturnType<typeof useStatsStore.getState>;

type AppStore = {
  (): CombinedState;
  <T>(selector: (state: CombinedState) => T): T;
  getState: () => CombinedState;
  setState: (partial: Partial<CombinedState>) => void;
  subscribe: (listener: (state: CombinedState) => void) => () => void;
};

function useCombinedStore<T>(selector?: (state: CombinedState) => T): T {
  const authState = useAuthStore();
  const deviceState = useDeviceStore();
  const dataState = useDataStore();
  const statsState = useStatsStore();
  const combined = {
    ...authState,
    ...deviceState,
    ...dataState,
    ...statsState,
  } as CombinedState;
  return (selector ? selector(combined) : combined) as unknown as T;
}

useCombinedStore.getState = (): CombinedState => ({
  ...useAuthStore.getState(),
  ...useDeviceStore.getState(),
  ...useDataStore.getState(),
  ...useStatsStore.getState(),
});

useCombinedStore.setState = (partial: Partial<CombinedState>) => {
  useAuthStore.setState(partial);
  useDeviceStore.setState(partial);
  useDataStore.setState(partial);
  useStatsStore.setState(partial);
};

useCombinedStore.subscribe = (listener: (state: CombinedState) => void) => {
  const unsub1 = useAuthStore.subscribe(listener);
  const unsub2 = useDeviceStore.subscribe(listener);
  const unsub3 = useDataStore.subscribe(listener);
  const unsub4 = useStatsStore.subscribe(listener);
  return () => {
    unsub1();
    unsub2();
    unsub3();
    unsub4();
  };
};

export const useAppStore = useCombinedStore as unknown as AppStore;
