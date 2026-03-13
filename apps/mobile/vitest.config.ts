import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', '.expo', 'ios', 'android'],
    passWithNoTests: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname,
      'expo-crypto': new URL('./__mocks__/expo-crypto.ts', import.meta.url).pathname,
    },
  },
});
