import { describe, it, expect, beforeEach } from 'vitest';
import { createRpcHandler } from '../src/runtime/server';

describe('Advanced Server RPC Handler', () => {
  const mockFunctions = {
    test: {
      delay: async (ms: number) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        return 'done';
      },
      error: () => {
        throw new Error('Intentional error');
      },
      query: (_input: string, event: any) => {
        return event.query || {};
      },
    },
  };

  let handler: ReturnType<typeof createRpcHandler>;

  beforeEach(() => {
    handler = createRpcHandler(mockFunctions);
  });

  it('handles unsupported content-type', async () => {
    const event = {
      headers: {
        get: (name: string) => (name === 'content-type' ? 'text/plain' : null),
      },
      node: { req: {} },
      method: 'POST',
      url: '/api/rpc/test/delay',
      body: 'invalid body',
      context: {
        params: {
          moduleId: 'test',
          functionName: 'delay',
        },
      },
    };

    await expect(handler(event)).rejects.toThrow('Unsupported content type');
  });

  it('rejects non-POST requests', async () => {
    const event = {
      headers: {
        get: (name: string) => null,
      },
      node: { req: {} },
      method: 'GET',
      url: '/api/rpc/test/delay',
      context: {
        params: {
          moduleId: 'test',
          functionName: 'delay',
        },
      },
    };

    await expect(handler(event)).rejects.toThrow('Method not allowed');
  });
});
