import { hash as ohash } from 'ohash';
import { useRequestFetch } from '#app';

export interface RpcClientOptions {
  fetchOptions?: Parameters<typeof globalThis.$fetch>[1];
  apiRoute?: string;
  cache?: boolean;
}
interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>;
}

export function createClient<T>(options?: RpcClientOptions) {
  function generateAPI(baseUrl = options?.apiRoute || '/api/__rpc'): T {
    const noop = () => {};
    noop.url = baseUrl;

    return new Proxy(noop, {
      get({ url }, path: string) {
        return generateAPI(`${url}/${path}`);
      },
      apply({ url }, _thisArg, args) {
        const { cache = false } = options || {};
        const nuxt = useNuxtApp();
        const payloadCache: Record<string, any> = (nuxt.payload.functions =
          nuxt.payload.functions || {});

        const state = (nuxt.__server_fn__ || {}) as InternalState<T>;
        const promiseMap: InternalState<T>['promiseMap'] = (state.promiseMap =
          state.promiseMap || new Map());
        if (cache) {
          const body = { url, args };
          const key = args.length === 0 ? url : `${url}-${ohash(args)}`;

          if (key in payloadCache) return payloadCache[key];

          if (promiseMap.has(key)) return promiseMap.get(key);

          const request = useRequestFetch()(url, {
            method: 'POST',
            body,
          }).then((r) => {
            payloadCache[key] = r;
            promiseMap.delete(key);
            return r;
          });

          promiseMap.set(key, request as Promise<T>);

          return request;
        }
        return useRequestFetch()(url, {
          ...options?.fetchOptions,
          method: 'POST',
          body: {
            args,
          },
        });
      },
    }) as unknown as T;
  }

  return generateAPI();
}
