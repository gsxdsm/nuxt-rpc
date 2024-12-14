import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { setup, $fetch } from '@nuxt/test-utils/e2e';

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  });

  it('receives result from server function', async () => {
    const html = await $fetch('/test');
    expect(html).toContain('<div>Hello Evan</div>');
  });

  it('has the same value for a cached result from the server', async () => {
    const html = await $fetch('/test');
    expect(html).toContain('<div>cached times are equal</div>');
  });

  it('has a different value for an uncached result from the server', async () => {
    const html = await $fetch('/test');
    expect(html).toContain('<div>uncached times are not equal</div>');
  });

  it('has a different value for a function called with cache but different arguments', async () => {
    const html = await $fetch('/test');
    expect(html).toContain(
      '<div>cached times with different args are not equal</div>'
    );
  });
});
