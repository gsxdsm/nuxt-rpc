import { hash as ohash } from 'ohash';
import { useRequestFetch, useNuxtApp } from '#app';
import {
  RPC_ENCODED_FLAG,
  RPC_FORMDATA_PREFIX,
  RPC_ARG_PREFIX,
} from './constants';

export interface RpcClientOptions {
  fetchOptions?: Parameters<typeof globalThis.$fetch>[1];
  apiRoute?: string;
  cache?: boolean;
  retry?: number;
}
interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>;
}

export function createClient<T>(options?: RpcClientOptions) {
  async function fetchWithRetry(url: string, fetchOptions: any) {
    const retries = options?.retry || 0;
    for (let i = 0; i <= retries; i++) {
      try {
        return await useRequestFetch()(url, fetchOptions);
      } catch (error) {
        if (i === retries) throw error;
      }
    }
  }

  function generateAPI(baseUrl = options?.apiRoute || '/api/__rpc'): T {
    const noop = () => {};
    noop.url = baseUrl;

    return new Proxy(noop, {
      get({ url }, path: string) {
        return generateAPI(`${url}/${path}`);
      },
      apply({ url }, _thisArg, args) {
        const { cache = false } = options || {};

        if (cache) {
          const nuxt = useNuxtApp();
          const payloadCache: Record<string, any> = (nuxt.payload.functions =
            nuxt.payload.functions || {});

          const state = (nuxt.__rpc__ || {}) as InternalState<T>;
          const promiseMap: InternalState<T>['promiseMap'] = (state.promiseMap =
            state.promiseMap || new Map());
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

        const fetchOptions = {
          ...options?.fetchOptions,
          method: 'POST',
        };

        if (
          args.length > 0 &&
          args.some(
            (arg) =>
              arg instanceof FormData ||
              arg instanceof File ||
              arg instanceof Blob
          )
        ) {
          const formData = new FormData();
          formData.append(RPC_ENCODED_FLAG, 'true');
          args.forEach((arg, index) => {
            if (arg instanceof FormData) {
              // Handle nested formdata
              // add each entry in the formdata to the main formdata
              for (const [key, value] of arg.entries()) {
                formData.append(`${RPC_FORMDATA_PREFIX}${index}_${key}`, value);
              }
            } else {
              formData.append(`${RPC_ARG_PREFIX}${index}`, arg);
            }
          });
          fetchOptions.body = formData;
          return fetchWithRetry(url, fetchOptions);
        }

        fetchOptions.body = { args };
        return fetchWithRetry(url, fetchOptions);
      },
    }) as unknown as T;
  }

  return generateAPI();
}
