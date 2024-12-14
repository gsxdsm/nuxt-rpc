import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('#app', () => {
  return {
    useRequestFetch: () => mockFetch,
    useNuxtApp: () => ({
      payload: {},
      __server_fn__: {
        promiseMap: new Map(),
      },
    }),
  };
});

const mockFetch = vi.fn();

import { createClient } from '../src/runtime/client';

describe('RPC Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles request timeout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('timeout'));

    const client = createClient({
      fetchOptions: {
        baseURL: 'http://localhost',
        timeout: 100,
      },
    });

    await expect(client.test.delay(1000)).rejects.toThrow('timeout');
  });

  it('retries failed requests', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('success');

    const client = createClient({
      retry: 1,
      fetchOptions: {
        baseURL: 'http://localhost',
      },
    });

    const result = await client.test.echo('test');
    expect(result).toBe('success');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles custom headers', async () => {
    mockFetch.mockResolvedValue('success');

    const client = createClient({
      fetchOptions: {
        baseURL: 'http://localhost',
        headers: {
          'X-Custom-Header': 'test',
        },
      },
    });

    await client.test.echo('test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'test',
        }),
      })
    );
  });

  it('properly encodes URL parameters', async () => {
    mockFetch.mockResolvedValue('success');

    const client = createClient({
      fetchOptions: {
        baseURL: 'http://localhost',
      },
    });

    await client.test.echo('test?with=special&chars');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test/echo'),
      expect.objectContaining({
        method: 'POST',
        body: {
          args: ['test?with=special&chars'],
        },
      })
    );
  });
});
