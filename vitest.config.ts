import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '#app': fileURLToPath(new URL('./test/mocks/nuxt.ts', import.meta.url)),
    },
  },
});
