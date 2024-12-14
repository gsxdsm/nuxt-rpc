import { vi } from 'vitest';

export const useRequestFetch = vi.fn(() => vi.fn());
export const useNuxtApp = vi.fn(() => ({
  payload: {},
  __server_fn__: {
    promiseMap: new Map(),
  },
}));

// Default export for module replacement
export default {
  useRequestFetch,
  useNuxtApp,
};
