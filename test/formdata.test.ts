import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
const encode = (str: string) => str.replace(/['"]/g, `&quot;`)

describe('formdata e2e', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('should handle formdata submissions', async () => {
    const html = await $fetch('/formdata')

    // Test single FormData

    expect(html).toContain(encode('"name": "John"'))
    expect(html).toContain(encode('"age": "30"'))

    // Test FormData with parameter
    expect(html).toContain(encode('"name": "John"'))
    expect(html).toContain(encode('"title": "Engineer"'))
    expect(html).toContain(encode('"level": "Senior"'))

    // Test FormData with file
    expect(html).toContain(encode('"fileName": "test.txt"'))
    expect(html).toContain(encode('"fileType": "text/plain"'))
    expect(html).toContain(encode('"description": "Test upload"'))
  })

  it('should handle cached formdata submissions', async () => {
    const html = await $fetch('/formdata')

    // Test cached FormData results
    expect(html).toContain(encode('"name": "John-Cached"'))
    expect(html).toContain(encode('"age": "31"'))

    // Should contain the cache hit indicator
    expect(html).toContain('Cache hit: true')

    // Should handle cached call with file
    expect(html).toContain(encode('"fileName": "test-cached.txt"'))
  })
})
