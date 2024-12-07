import { useRequestFetch } from '#app'
export interface RpcClientOptions {
  fetchOptions: Parameters<typeof globalThis.$fetch>[1]
  apiRoute?: string
}

export function createClient<T>(options?: RpcClientOptions) {
  function generateAPI(baseUrl = options?.apiRoute || '/api/__rpc'): T {
    const noop = () => {}
    noop.url = baseUrl

    return new Proxy(noop, {
      get({ url }, path: string) {
        return generateAPI(`${url}/${path}`)
      },
      apply({ url }, _thisArg, args) {
        return useRequestFetch()(url, {
          ...options?.fetchOptions,
          method: 'POST',
          body: {
            args
          },
        })
      },
    }) as unknown as T
  }

  return generateAPI()
}
